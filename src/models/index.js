const sequelize = require('../config/database');
const SiteCategory = require('./SiteCategory');
const Category = require('./Category');
const Marque = require('./Marque');
const Produit = require('./Produit');
const Admin = require('./Admin');
const DemandeDevis = require('./DemandeDevis');
const DemandeDevisItems = require('./DemandeDevisItems');
const Publicite = require('./Publicite');
const Client = require('./Client');
const Wishlist = require('./Wishlist');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const SiteSetting = require('./SiteSetting');
const ContactMessage = require('./ContactMessage');

// ─── DemandeDevis (legacy)
DemandeDevis.hasMany(DemandeDevisItems, { as: 'items', foreignKey: 'idDemandeDevis', constraints: false });
DemandeDevisItems.belongsTo(DemandeDevis, { as: 'demandeDevis', foreignKey: 'idDemandeDevis', constraints: false });
DemandeDevisItems.belongsTo(Produit, { as: 'produit', foreignKey: 'idProduit', constraints: false });
Produit.hasMany(DemandeDevisItems, { as: 'devisItems', foreignKey: 'idProduit', constraints: false });

// ─── Publicite
Publicite.belongsTo(Category, { foreignKey: 'idCategory', as: 'category' });
Category.hasMany(Publicite, { foreignKey: 'idCategory', as: 'publicites' });
Publicite.belongsTo(Produit, { foreignKey: 'idProduit', as: 'produit' });
Produit.hasMany(Publicite, { foreignKey: 'idProduit', as: 'publicites' });

// ─── Wishlist
Client.hasMany(Wishlist, { foreignKey: 'idClient', as: 'wishlists' });
Wishlist.belongsTo(Client, { foreignKey: 'idClient', as: 'client' });
Produit.hasMany(Wishlist, { foreignKey: 'idProduit', as: 'wishlists' });
Wishlist.belongsTo(Produit, { foreignKey: 'idProduit', as: 'produit' });

// ─── Orders
Client.hasMany(Order, { foreignKey: 'idClient', as: 'orders' });
Order.belongsTo(Client, { foreignKey: 'idClient', as: 'client' });
Order.hasMany(OrderItem, { foreignKey: 'idOrder', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'idOrder', as: 'order' });
OrderItem.belongsTo(Produit, { foreignKey: 'idProduit', as: 'produit' });
Produit.hasMany(OrderItem, { foreignKey: 'idProduit', as: 'orderItems' });

const models = {
    SiteCategory,
    Category,
    Marque,
    Produit,
    Admin,
    DemandeDevis,
    DemandeDevisItems,
    Publicite,
    Client,
    Wishlist,
    Order,
    OrderItem,
    SiteSetting,
    ContactMessage,
};

/**
 * Synchronise toutes les tables selon les modèles.
 * @param {boolean} [force=false] - Recrée les tables si true
 */
const syncModels = async (force = false) => {
    try {
        await sequelize.sync({ force, alter: !force });
        console.log(`Tables synchronisées ${force ? '(recréées)' : '(mise à jour)'}`);
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
