const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * Script pour supprimer l'ancienne contrainte unique sur libelle
 * et s'assurer que seule la contrainte composite existe
 */
const fixMarqueConstraint = async () => {
    try {
        // Configuration avec valeurs par défaut
        const dbConfig = {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'root'
        };

        const password = process.env.DB_PASSWORD;
        if (password !== undefined && password !== '') {
            dbConfig.password = password;
        }

        const dbName = process.env.DB_NAME || 'ecommerce_db';

        console.log(`Connexion à MySQL sur ${dbConfig.host}:${dbConfig.port}...`);

        const connection = await mysql.createConnection({
            ...dbConfig,
            database: dbName
        });

        console.log('Connecté à la base de données');

        // Vérifier et supprimer l'ancienne contrainte unique sur libelle
        console.log('\nVérification des contraintes existantes...');
        
        const [constraints] = await connection.query(`
            SELECT CONSTRAINT_NAME, COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_SCHEMA = ?
            AND TABLE_NAME = 'marques'
            AND CONSTRAINT_NAME != 'PRIMARY'
        `, [dbName]);

        console.log('Contraintes trouvées:', constraints);

        // Chercher la contrainte unique sur libelle seule
        const libelleUniqueConstraint = constraints.find(
            c => c.COLUMN_NAME === 'libelle' && 
            !constraints.some(c2 => c2.CONSTRAINT_NAME === c.CONSTRAINT_NAME && c2.COLUMN_NAME === 'idSiteCategory')
        );

        if (libelleUniqueConstraint) {
            console.log(`\nSuppression de la contrainte unique sur libelle: ${libelleUniqueConstraint.CONSTRAINT_NAME}`);
            await connection.query(`
                ALTER TABLE \`marques\` 
                DROP INDEX \`${libelleUniqueConstraint.CONSTRAINT_NAME}\`
            `);
            console.log('Contrainte supprimée avec succès');
        } else {
            console.log('\nAucune contrainte unique sur libelle seule trouvée');
        }

        // Vérifier que la contrainte composite existe
        const compositeConstraint = constraints.find(
            c => c.COLUMN_NAME === 'libelle' && 
            constraints.some(c2 => c2.CONSTRAINT_NAME === c.CONSTRAINT_NAME && c2.COLUMN_NAME === 'idSiteCategory')
        );

        if (!compositeConstraint) {
            console.log('\nCréation de la contrainte composite unique sur (libelle, idSiteCategory)...');
            await connection.query(`
                ALTER TABLE \`marques\` 
                ADD UNIQUE KEY \`unique_libelle_site_category\` (\`libelle\`, \`idSiteCategory\`)
            `);
            console.log('Contrainte composite créée avec succès');
        } else {
            console.log('\nContrainte composite unique déjà présente');
        }

        await connection.end();
        console.log('\n✅ Correction terminée avec succès !');
        process.exit(0);
    } catch (error) {
        console.error('Erreur lors de la correction:', error);
        process.exit(1);
    }
};

fixMarqueConstraint();

