'use strict';

const { QueryTypes } = require('sequelize');

/**
 * Liste les noms des contraintes FK MySQL sur `categories.idSiteCategory`.
 * @param {import('sequelize').Sequelize} sequelize
 * @returns {Promise<string[]>}
 */
async function listIdSiteCategoryForeignKeys(sequelize) {
  const rows = await sequelize.query(
    `
    SELECT DISTINCT k.CONSTRAINT_NAME AS constraintName
    FROM information_schema.KEY_COLUMN_USAGE k
    INNER JOIN information_schema.TABLE_CONSTRAINTS t
      ON k.CONSTRAINT_SCHEMA = t.CONSTRAINT_SCHEMA
      AND k.CONSTRAINT_NAME = t.CONSTRAINT_NAME
      AND k.TABLE_SCHEMA = t.TABLE_SCHEMA
    WHERE k.TABLE_SCHEMA = DATABASE()
      AND k.TABLE_NAME = 'categories'
      AND k.COLUMN_NAME = 'idSiteCategory'
      AND t.TABLE_NAME = 'categories'
      AND t.CONSTRAINT_TYPE = 'FOREIGN KEY'
    `,
    { type: QueryTypes.SELECT }
  );
  return rows.map((r) => r.constraintName);
}

/**
 * Définition SQL MySQL d’une colonne (type + charset + collation) pour un MODIFY compatible FK.
 * @param {import('sequelize').Sequelize} sequelize
 * @param {string} tableName
 * @param {string} columnName
 * @returns {Promise<string>}
 */
async function getMysqlColumnDefinition(sequelize, tableName, columnName) {
  const rows = await sequelize.query(
    `
    SELECT COLUMN_TYPE AS columnType,
           CHARACTER_SET_NAME AS charsetName,
           COLLATION_NAME AS collationName
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = :tableName
      AND COLUMN_NAME = :columnName
    `,
    {
      replacements: { tableName, columnName },
      type: QueryTypes.SELECT
    }
  );
  const r = rows[0];
  if (!r) {
    return 'CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin';
  }
  if (r.charsetName && r.collationName) {
    return `${r.columnType} CHARACTER SET ${r.charsetName} COLLATE ${r.collationName}`;
  }
  return r.columnType;
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * MySQL : changeColumn + references échoue souvent si une FK existe déjà.
   * On supprime la FK, aligne le type sur `site_categories.id`, autorise NULL, puis recrée la FK.
   */
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize;
    const dialect = sequelize.getDialect();
    if (dialect !== 'mysql') {
      await queryInterface.changeColumn('categories', 'idSiteCategory', {
        type: require('sequelize').UUID,
        allowNull: true
      });
      return;
    }

    const refType = await getMysqlColumnDefinition(sequelize, 'site_categories', 'id');
    const fkNames = await listIdSiteCategoryForeignKeys(sequelize);
    for (const name of fkNames) {
      await sequelize.query(`ALTER TABLE \`categories\` DROP FOREIGN KEY \`${name}\``);
    }

    await sequelize.query(
      `ALTER TABLE \`categories\` MODIFY \`idSiteCategory\` ${refType} NULL`
    );

    await sequelize.query(`
      ALTER TABLE \`categories\`
      ADD CONSTRAINT \`categories_idSiteCategory_fk\`
      FOREIGN KEY (\`idSiteCategory\`) REFERENCES \`site_categories\` (\`id\`)
      ON UPDATE CASCADE ON DELETE CASCADE
    `);
  },

  async down(queryInterface) {
    const sequelize = queryInterface.sequelize;
    const dialect = sequelize.getDialect();
    if (dialect !== 'mysql') {
      await queryInterface.changeColumn('categories', 'idSiteCategory', {
        type: require('sequelize').UUID,
        allowNull: false
      });
      return;
    }

    const refType = await getMysqlColumnDefinition(sequelize, 'site_categories', 'id');
    const fkNames = await listIdSiteCategoryForeignKeys(sequelize);
    for (const name of fkNames) {
      await sequelize.query(`ALTER TABLE \`categories\` DROP FOREIGN KEY \`${name}\``);
    }

    await sequelize.query(
      `ALTER TABLE \`categories\` MODIFY \`idSiteCategory\` ${refType} NOT NULL`
    );

    await sequelize.query(`
      ALTER TABLE \`categories\`
      ADD CONSTRAINT \`categories_idSiteCategory_fk\`
      FOREIGN KEY (\`idSiteCategory\`) REFERENCES \`site_categories\` (\`id\`)
      ON UPDATE CASCADE ON DELETE CASCADE
    `);
  },
};
