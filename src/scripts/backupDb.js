const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { pipeline } = require('stream/promises');
require('dotenv').config();

const BACKUP_DIR = path.resolve(process.env.BACKUP_DIR || 'backups');
const KEEP = Number(process.env.BACKUP_KEEP) || 14;

/** Connexion MySQL : le mot de passe passe par l'environnement, jamais par la ligne de commande. */
const connection = (database) => ({
    args: [
        `-h${process.env.DB_HOST || 'localhost'}`,
        `-P${process.env.DB_PORT || 3306}`,
        `-u${process.env.DB_USER || 'root'}`,
        database,
    ],
    env: { ...process.env, MYSQL_PWD: process.env.DB_PASSWORD || '' },
});

/**
 * Attend la fin d'un programme externe.
 * @param {import('child_process').ChildProcess} child
 * @param {string} name
 */
const finished = (child, name) =>
    new Promise((resolve, reject) => {
        child.on('error', reject);
        child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${name} a échoué (code ${code})`))));
    });

/**
 * Exporte la base dans un fichier compressé et ne garde que les plus récents.
 * @returns {Promise<string>} Chemin de la sauvegarde
 */
async function backup() {
    const database = process.env.DB_NAME;
    if (!database) throw new Error('DB_NAME manquant');
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const file = path.join(BACKUP_DIR, `${database}-${stamp}.sql.gz`);

    const { args, env } = connection(database);
    const dump = spawn(
        'mysqldump',
        ['--single-transaction', '--no-tablespaces', '--set-gtid-purged=OFF', ...args],
        { env, stdio: ['ignore', 'pipe', 'inherit'] },
    );
    await Promise.all([
        finished(dump, 'mysqldump'),
        pipeline(dump.stdout, zlib.createGzip(), fs.createWriteStream(file, { mode: 0o600 })),
    ]);

    fs.readdirSync(BACKUP_DIR)
        .filter((name) => name.startsWith(`${database}-`) && name.endsWith('.sql.gz'))
        .sort()
        .reverse()
        .slice(KEEP)
        .forEach((name) => fs.unlinkSync(path.join(BACKUP_DIR, name)));
    return file;
}

/**
 * Recharge une sauvegarde dans une base temporaire pour prouver qu'elle est exploitable.
 * @param {string} file
 * @returns {Promise<void>}
 */
async function verifyRestore(file) {
    const scratch = `${process.env.DB_NAME}_restore_check`;
    const { args, env } = connection(scratch);
    const adminArgs = args.slice(0, -1);
    const sql = async (statement, extra = []) =>
        finished(spawn('mysql', [...adminArgs, ...extra, '-e', statement], { env, stdio: 'inherit' }), 'mysql');

    await sql(`DROP DATABASE IF EXISTS \`${scratch}\`; CREATE DATABASE \`${scratch}\``);
    try {
        const restore = spawn('mysql', args, { env, stdio: ['pipe', 'inherit', 'inherit'] });
        await Promise.all([
            finished(restore, 'mysql'),
            pipeline(fs.createReadStream(file), zlib.createGunzip(), restore.stdin),
        ]);
        await sql('SELECT COUNT(*) AS produits_restaures FROM produits', [scratch]);
    } finally {
        await sql(`DROP DATABASE IF EXISTS \`${scratch}\``);
    }
}

if (require.main === module) {
    backup()
        .then(async (file) => {
            console.log(`Sauvegarde créée : ${file}`);
            if (process.argv.includes('--verify')) {
                await verifyRestore(file);
                console.log('Restauration vérifiée sur une base temporaire.');
            }
        })
        .catch((error) => {
            console.error('Échec de la sauvegarde :', error.message);
            process.exitCode = 1;
        });
}

module.exports = { backup, verifyRestore };
