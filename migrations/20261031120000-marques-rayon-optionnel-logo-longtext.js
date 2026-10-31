'use strict';

const { QueryTypes } = require('sequelize');

/**
 * Liste les contraintes FK MySQL portant sur `marques.idSiteCategory`.
 * @param {import('sequelize').Sequelize} sequelize
 * @returns {Promise<string[]>}
 */
async function listForeignKeys(sequelize) {
  const rows = await sequelize.query(
    `
    SELECT DISTINCT k.CONSTRAINT_NAME AS constraintName
    FROM information_schema.KEY_COLUMN_USAGE k
    WHERE k.TABLE_SCHEMA = DATABASE()
      AND k.TABLE_NAME = 'marques'
      AND k.COLUMN_NAME = 'idSiteCategory'
      AND k.REFERENCED_TABLE_NAME IS NOT NULL
    `,
    { type: QueryTypes.SELECT }
  );
  return rows.map((r) => r.constraintName);
}

/**
 * Définition SQL de `site_categories.id`, nécessaire pour rester compatible avec la FK.
 * @param {import('sequelize').Sequelize} sequelize
 * @returns {Promise<string>}
 */
async function getRayonIdDefinition(sequelize) {
  const [r] = await sequelize.query(
    `
    SELECT COLUMN_TYPE AS columnType,
           CHARACTER_SET_NAME AS charsetName,
           COLLATION_NAME AS collationName
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'site_categories'
      AND COLUMN_NAME = 'id'
    `,
    { type: QueryTypes.SELECT }
  );
  return r.charsetName && r.collationName
    ? `${r.columnType} CHARACTER SET ${r.charsetName} COLLATE ${r.collationName}`
    : r.columnType;
}

/**
 * Remplace la FK de `marques.idSiteCategory` et applique la nullabilité demandée.
 * @param {import('sequelize').Sequelize} sequelize
 * @param {{ nullable: boolean, onDelete: string }} options
 */
async function rebuildForeignKey(sequelize, { nullable, onDelete }) {
  const columnDefinition = await getRayonIdDefinition(sequelize);
  for (const name of await listForeignKeys(sequelize)) {
    await sequelize.query(`ALTER TABLE \`marques\` DROP FOREIGN KEY \`${name}\``);
  }
  await sequelize.query(
    `ALTER TABLE \`marques\` MODIFY \`idSiteCategory\` ${columnDefinition} ${nullable ? 'NULL' : 'NOT NULL'}`
  );
  await sequelize.query(`
    ALTER TABLE \`marques\`
    ADD CONSTRAINT \`marques_idSiteCategory_fk\`
    FOREIGN KEY (\`idSiteCategory\`) REFERENCES \`site_categories\` (\`id\`)
    ON UPDATE CASCADE ON DELETE ${onDelete}
  `);
}

/**
 * Une marque n'est plus rattachée obligatoirement à un rayon (Samsung vend dans plusieurs rayons),
 * et le logo est stocké en base64 : 255 caractères ne suffisent pas.
 * Rejouable sans risque : voir `npm run db:fix-marques`.
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface) {
    const { sequelize } = queryInterface;
    await rebuildForeignKey(sequelize, { nullable: true, onDelete: 'SET NULL' });
    await sequelize.query('ALTER TABLE `marques` MODIFY `logo` LONGTEXT NULL');
  },

  async down(queryInterface) {
    const { sequelize } = queryInterface;
    const [{ blocking }] = await sequelize.query(
      'SELECT COUNT(*) AS blocking FROM `marques` WHERE `idSiteCategory` IS NULL OR CHAR_LENGTH(`logo`) > 255',
      { type: QueryTypes.SELECT }
    );
    if (Number(blocking) > 0) {
      throw new Error(
        `Retour arrière impossible : ${blocking} marque(s) sans rayon ou avec un logo de plus de 255 caractères.`
      );
    }
    await sequelize.query('ALTER TABLE `marques` MODIFY `logo` VARCHAR(255) NULL');
    await rebuildForeignKey(sequelize, { nullable: false, onDelete: 'CASCADE' });
  },
};
