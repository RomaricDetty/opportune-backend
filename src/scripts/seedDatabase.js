const { SiteCategory, Category, Marque, DemandeDevis, DemandeDevisItems, sequelize } = require('../models'); // ✅ ajout de sequelize
const { Admin } = require('../models');

const seedDatabase = async () => {
    try {
        console.log('Démarrage du seeding...');

        // ... tout ton code existant sans modification ...

        // ✅ Remplacer les deux .sync() par queryInterface
        console.log('\n--- Synchronisation des nouvelles tables ---');

        const queryInterface = sequelize.getQueryInterface();

        const tables = await queryInterface.showAllTables();

        if (!tables.includes('demande_devis')) {
            await queryInterface.createTable('demande_devis', {
                id:           { type: 'VARCHAR(36)', primaryKey: true },
                nomClient:    { type: 'VARCHAR(255)', allowNull: false },
                prenomClient: { type: 'VARCHAR(255)', allowNull: true },
                telephone:    { type: 'VARCHAR(255)', allowNull: false },
                email:        { type: 'VARCHAR(255)', allowNull: true },
                adresse:      { type: 'TEXT', allowNull: true },
                message:      { type: 'TEXT', allowNull: true },
                statut:       { type: "ENUM('en_attente','en_cours','validee','annulee')", defaultValue: 'en_attente' },
                montantTotal: { type: 'DECIMAL(10,2)', allowNull: true },
                reference:    { type: 'VARCHAR(255)', unique: true, allowNull: true },
                createdAt:    { type: 'DATETIME', allowNull: false },
                updatedAt:    { type: 'DATETIME', allowNull: false },
                deletedAt:    { type: 'DATETIME', allowNull: true }
            });
            console.log('✅ Table demande_devis créée');
        } else {
            console.log('⏭️  Table demande_devis déjà existante');
        }

        if (!tables.includes('demande_devis_items')) {
            await queryInterface.createTable('demande_devis_items', {
                id:              { type: 'VARCHAR(36)', primaryKey: true },
                idDemandeDevis:  { type: 'VARCHAR(36)', allowNull: false},
                idProduit:       { type: 'VARCHAR(36)', allowNull: false},
                quantite:        { type: 'INTEGER', allowNull: false, defaultValue: 1 },
                prixUnitaire:    { type: 'DECIMAL(10,2)', allowNull: true },
                createdAt:       { type: 'DATETIME', allowNull: false },
                updatedAt:       { type: 'DATETIME', allowNull: false }
            });
            console.log('✅ Table demande_devis_items créée');
        } else {
            console.log('⏭️  Table demande_devis_items déjà existante');
        }

        console.log('\nSeeding terminé avec succès !');
        if (require.main === module) process.exit(0);

    } catch (error) {
        console.error('Erreur lors du seeding:', error);
        if (require.main === module) {
            process.exit(1);
        } else {
            throw error;
        }
    }
};

module.exports = seedDatabase;
if (require.main === module) seedDatabase();