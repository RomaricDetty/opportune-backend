/**
 * Script pour modifier la colonne imagePrincipale de TEXT à LONGTEXT
 * Permet de stocker des images base64 de grande taille
 */
const sequelize = require('../config/database');

/**
 * Modifier le type de la colonne imagePrincipale
 */
const fixImageColumn = async () => {
    try {
        console.log('Modification de la colonne imagePrincipale...');
        
        // Modifier la colonne imagePrincipale de TEXT à LONGTEXT
        await sequelize.query(`
            ALTER TABLE produits 
            MODIFY COLUMN imagePrincipale LONGTEXT
        `);
        
        console.log('✓ Colonne imagePrincipale modifiée avec succès (TEXT -> LONGTEXT)');
        
        // Vérifier que la modification a bien été appliquée
        const [results] = await sequelize.query(`
            SHOW COLUMNS FROM produits WHERE Field = 'imagePrincipale'
        `);
        
        if (results.length > 0) {
            console.log('Type de colonne actuel:', results[0].Type);
        }
        
        console.log('Modification terminée avec succès !');
        process.exit(0);
    } catch (error) {
        console.error('Erreur lors de la modification de la colonne:', error);
        process.exit(1);
    }
};

// Exécuter le script
fixImageColumn();
