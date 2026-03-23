const sequelize         = require('../config/database');
const SiteCategory      = require('./SiteCategory');
const Category          = require('./Category');
const Marque            = require('./Marque');
const Produit           = require('./Produit');
const Admin             = require('./Admin');
const DemandeDevis      = require('./DemandeDevis');
const DemandeDevisItems = require('./DemandeDevisItems');
const Publicite         = require('./Publicite');

// ─── DemandeDevis 
DemandeDevis.hasMany(DemandeDevisItems, { as: 'items',        foreignKey: 'idDemandeDevis', constraints: false });
DemandeDevisItems.belongsTo(DemandeDevis, { as: 'demandeDevis', foreignKey: 'idDemandeDevis', constraints: false });

// ─── DemandeDevisItems → Produit 
DemandeDevisItems.belongsTo(Produit, { as: 'produit',    foreignKey: 'idProduit', constraints: false });
Produit.hasMany(DemandeDevisItems,   { as: 'devisItems', foreignKey: 'idProduit', constraints: false });

// ─── Publicite → Category 
Publicite.belongsTo(Category, { foreignKey: 'idCategory', as: 'category'   });
Category.hasMany(Publicite,   { foreignKey: 'idCategory', as: 'publicites' });

// ─── Publicite → Produit 
Publicite.belongsTo(Produit, { foreignKey: 'idProduit',  as: 'produit'    });
Produit.hasMany(Publicite,   { foreignKey: 'idProduit',  as: 'publicites' });

// ─── Modèles 
const models = {
    SiteCategory,
    Category,
    Marque,
    Produit,
    Admin,
    DemandeDevis,
    DemandeDevisItems,
    Publicite
};

// ─── Sync ─────────────────────────────────────────────────────────────────────
const syncModels = async (force = false) => {
    try {
        await Publicite.sync({ force, alter: !force });
        console.log(`Table publicites synchronisée ${force ? '(recréée)' : '(mise à jour)'}`);
    } catch (error) {
        console.error('Erreur lors de la synchronisation:', error);
        throw error;
    }
};

module.exports = {
    sequelize,
    ...models,
    syncModels
};