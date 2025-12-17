const swaggerJsdoc = require('swagger-jsdoc');

/**
 * Configuration Swagger pour documenter toutes les APIs
 */
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Opportune Backend',
            version: '1.0.0',
            description: 'Documentation complète de l\'API pour la plateforme e-commerce Opportune',
            contact: {
                name: 'Support API',
                email: 'support@opportune.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000/api',
                description: 'Serveur de développement'
            },
            {
                url: 'http://localhost:6981/api',
                description: 'Serveur VPS de production'
            }
        ],
        components: {
            schemas: {
                // Schémas de réponse communs
                SuccessResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: true
                        },
                        message: {
                            type: 'string',
                            example: 'Opération réussie'
                        },
                        data: {
                            type: 'object'
                        }
                    }
                },
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false
                        },
                        message: {
                            type: 'string',
                            example: 'Erreur lors de l\'opération'
                        },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object'
                            }
                        }
                    }
                },
                // SiteCategory
                SiteCategory: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid',
                            example: '123e4567-e89b-12d3-a456-426614174000'
                        },
                        libelle: {
                            type: 'string',
                            example: 'Electromenagers',
                            minLength: 2,
                            maxLength: 100
                        },
                        description: {
                            type: 'string',
                            example: 'Appareils électroménagers pour la maison'
                        },
                        isActive: {
                            type: 'boolean',
                            example: true
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    },
                    required: ['libelle', 'isActive']
                },
                SiteCategoryInput: {
                    type: 'object',
                    properties: {
                        libelle: {
                            type: 'string',
                            example: 'Electromenagers',
                            minLength: 2,
                            maxLength: 100
                        },
                        description: {
                            type: 'string',
                            example: 'Appareils électroménagers pour la maison'
                        },
                        isActive: {
                            type: 'boolean',
                            example: true
                        }
                    },
                    required: ['libelle']
                },
                // Category
                Category: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid'
                        },
                        libelle: {
                            type: 'string',
                            example: 'Réfrigérateurs',
                            minLength: 2,
                            maxLength: 100
                        },
                        description: {
                            type: 'string',
                            example: 'Réfrigérateurs et combinés'
                        },
                        idSiteCategory: {
                            type: 'string',
                            format: 'uuid'
                        },
                        isActive: {
                            type: 'boolean',
                            example: true
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    },
                    required: ['libelle', 'idSiteCategory', 'isActive']
                },
                CategoryInput: {
                    type: 'object',
                    properties: {
                        libelle: {
                            type: 'string',
                            example: 'Réfrigérateurs',
                            minLength: 2,
                            maxLength: 100
                        },
                        description: {
                            type: 'string',
                            example: 'Réfrigérateurs et combinés'
                        },
                        idSiteCategory: {
                            type: 'string',
                            format: 'uuid',
                            example: '123e4567-e89b-12d3-a456-426614174000'
                        },
                        isActive: {
                            type: 'boolean',
                            example: true
                        }
                    },
                    required: ['libelle', 'idSiteCategory']
                },
                ElectroCategoryInput: {
                    type: 'object',
                    properties: {
                        libelle: {
                            type: 'string',
                            example: 'Réfrigérateurs',
                            minLength: 2,
                            maxLength: 100
                        },
                        typeElectro: {
                            type: 'string',
                            enum: ['gros', 'petit'],
                            example: 'gros',
                            description: 'Type d\'électroménager: gros ou petit'
                        },
                        description: {
                            type: 'string',
                            example: 'Réfrigérateurs et combinés'
                        },
                        isActive: {
                            type: 'boolean',
                            example: true
                        }
                    },
                    required: ['libelle', 'typeElectro']
                },
                // Marque
                Marque: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid'
                        },
                        libelle: {
                            type: 'string',
                            example: 'Samsung',
                            minLength: 2,
                            maxLength: 100
                        },
                        description: {
                            type: 'string',
                            example: 'Leader mondial de l\'électronique'
                        },
                        logo: {
                            type: 'string',
                            example: 'https://example.com/logo.png'
                        },
                        idSiteCategory: {
                            type: 'string',
                            format: 'uuid'
                        },
                        isActive: {
                            type: 'boolean',
                            example: true
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    },
                    required: ['libelle', 'idSiteCategory', 'isActive']
                },
                MarqueInput: {
                    type: 'object',
                    properties: {
                        libelle: {
                            type: 'string',
                            example: 'Samsung',
                            minLength: 2,
                            maxLength: 100
                        },
                        description: {
                            type: 'string',
                            example: 'Leader mondial de l\'électronique'
                        },
                        logo: {
                            type: 'string',
                            example: 'https://example.com/logo.png'
                        },
                        idSiteCategory: {
                            type: 'string',
                            format: 'uuid',
                            example: '123e4567-e89b-12d3-a456-426614174000'
                        },
                        isActive: {
                            type: 'boolean',
                            example: true
                        }
                    },
                    required: ['libelle', 'idSiteCategory']
                },
                // Produit
                Produit: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            format: 'uuid'
                        },
                        libelle: {
                            type: 'string',
                            example: 'Réfrigérateur Samsung 300L',
                            minLength: 2,
                            maxLength: 200
                        },
                        description: {
                            type: 'string',
                            example: 'Réfrigérateur combiné avec congélateur'
                        },
                        quantite_minimale: {
                            type: 'integer',
                            example: 1,
                            minimum: 1
                        },
                        prix: {
                            type: 'number',
                            format: 'decimal',
                            example: 299.99,
                            minimum: 0
                        },
                        quantite_stock: {
                            type: 'integer',
                            example: 50,
                            minimum: 0
                        },
                        idMarque: {
                            type: 'string',
                            format: 'uuid'
                        },
                        idCategory: {
                            type: 'string',
                            format: 'uuid',
                            nullable: true
                        },
                        imagePrincipale: {
                            type: 'string',
                            description: 'Image principale du produit. Supporte trois formats :\n' +
                                '1. **Base64** : Chaîne base64 avec préfixe (ex: `data:image/jpeg;base64,/9j/4AAQSkZJRg...`)\n' +
                                '2. **Chemin de fichier** : Chemin relatif vers un fichier uploadé (ex: `/uploads/produits/image.jpg`)\n' +
                                '3. **URL externe** : URL complète vers une image externe (ex: `https://example.com/image.jpg`)',
                            example: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
                            examples: {
                                base64: {
                                    summary: 'Format Base64',
                                    value: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
                                },
                                filePath: {
                                    summary: 'Chemin de fichier',
                                    value: '/uploads/produits/image-principale.jpg'
                                },
                                url: {
                                    summary: 'URL externe',
                                    value: 'https://example.com/image.jpg'
                                }
                            }
                        },
                        images: {
                            type: 'array',
                            description: 'Tableau d\'images supplémentaires du produit. Chaque élément peut être en base64, chemin de fichier ou URL externe',
                            items: {
                                type: 'string'
                            },
                            example: [
                                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
                                '/uploads/produits/image1.jpg',
                                'https://example.com/image2.jpg'
                            ]
                        },
                        caracteristiques: {
                            type: 'object',
                            example: {
                                capacite: '300L',
                                energie: 'A++',
                                couleur: 'Blanc'
                            }
                        },
                        reference: {
                            type: 'string',
                            example: 'PROD-1234567890-ABC123',
                            maxLength: 50
                        },
                        isActive: {
                            type: 'boolean',
                            example: true
                        },
                        isAvailable: {
                            type: 'boolean',
                            example: true
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time'
                        },
                        updatedAt: {
                            type: 'string',
                            format: 'date-time'
                        }
                    },
                    required: ['libelle', 'quantite_minimale', 'quantite_stock', 'idMarque', 'isActive', 'isAvailable']
                },
                ProduitInput: {
                    type: 'object',
                    properties: {
                        libelle: {
                            type: 'string',
                            example: 'Réfrigérateur Samsung 300L',
                            minLength: 2,
                            maxLength: 200
                        },
                        description: {
                            type: 'string',
                            example: 'Réfrigérateur combiné avec congélateur'
                        },
                        quantite_minimale: {
                            type: 'integer',
                            example: 1,
                            minimum: 1
                        },
                        prix: {
                            type: 'number',
                            format: 'decimal',
                            example: 299.99,
                            minimum: 0
                        },
                        quantite_stock: {
                            type: 'integer',
                            example: 50,
                            minimum: 0
                        },
                        idMarque: {
                            type: 'string',
                            format: 'uuid',
                            example: '123e4567-e89b-12d3-a456-426614174000'
                        },
                        idCategory: {
                            type: 'string',
                            format: 'uuid',
                            nullable: true
                        },
                        imagePrincipale: {
                            type: 'string',
                            description: 'Image principale du produit. Supporte trois formats :\n' +
                                '1. **Base64** : Chaîne base64 avec préfixe `data:image/[type];base64,[data]`\n' +
                                '   - Formats supportés : jpeg, jpg, png, gif, webp, svg+xml\n' +
                                '   - Exemple : `data:image/jpeg;base64,/9j/4AAQSkZJRg...`\n' +
                                '2. **Chemin de fichier** : Chemin relatif vers un fichier uploadé\n' +
                                '   - Exemple : `/uploads/produits/image.jpg`\n' +
                                '3. **URL externe** : URL complète vers une image externe\n' +
                                '   - Exemple : `https://example.com/image.jpg`',
                            example: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
                            examples: {
                                base64: {
                                    summary: 'Format Base64 (recommandé pour petits fichiers)',
                                    description: 'Stockage direct en base de données. Idéal pour les images < 100KB',
                                    value: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
                                },
                                filePath: {
                                    summary: 'Chemin de fichier (recommandé pour gros fichiers)',
                                    description: 'Fichier uploadé sur le serveur. Meilleure performance pour les images > 100KB',
                                    value: '/uploads/produits/image-principale.jpg'
                                },
                                url: {
                                    summary: 'URL externe',
                                    description: 'Image hébergée sur un service externe',
                                    value: 'https://example.com/image.jpg'
                                }
                            }
                        },
                        images: {
                            type: 'array',
                            description: 'Tableau d\'images supplémentaires du produit. Chaque élément peut être en base64, chemin de fichier ou URL externe. Formats supportés pour base64 : jpeg, jpg, png, gif, webp, svg+xml',
                            items: {
                                type: 'string',
                                description: 'Image en base64 (data:image/[type];base64,[data]), chemin de fichier (/uploads/...) ou URL externe'
                            },
                            example: [
                                'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
                                '/uploads/produits/image1.jpg',
                                'https://example.com/image2.jpg'
                            ]
                        },
                        caracteristiques: {
                            type: 'object'
                        },
                        reference: {
                            type: 'string',
                            maxLength: 50
                        },
                        isActive: {
                            type: 'boolean',
                            example: true
                        },
                        isAvailable: {
                            type: 'boolean',
                            example: true
                        }
                    },
                    required: ['libelle', 'quantite_minimale', 'quantite_stock', 'idMarque']
                },
                StockUpdateInput: {
                    type: 'object',
                    properties: {
                        quantite_stock: {
                            type: 'integer',
                            example: 10,
                            minimum: 0
                        },
                        operation: {
                            type: 'string',
                            enum: ['set', 'add', 'subtract'],
                            example: 'add',
                            description: 'set: définir la valeur, add: ajouter, subtract: soustraire'
                        }
                    },
                    required: ['quantite_stock', 'operation']
                },
                // Statistiques
                Stats: {
                    type: 'object',
                    properties: {
                        totalCategories: {
                            type: 'integer',
                            example: 15
                        },
                        totalMarques: {
                            type: 'integer',
                            example: 20
                        },
                        activeCategories: {
                            type: 'integer',
                            example: 12
                        },
                        activeMarques: {
                            type: 'integer',
                            example: 18
                        }
                    }
                },
                MarqueStats: {
                    type: 'object',
                    properties: {
                        totalProduits: {
                            type: 'integer',
                            example: 50
                        },
                        produitsActifs: {
                            type: 'integer',
                            example: 45
                        },
                        produitsDisponibles: {
                            type: 'integer',
                            example: 40
                        },
                        produitsEnStock: {
                            type: 'integer',
                            example: 35
                        }
                    }
                }
            }
        },
        tags: [
            {
                name: 'Health',
                description: 'Routes de santé et statut de l\'API'
            },
            {
                name: 'Site Categories',
                description: 'Gestion des catégories principales du site (Electromenagers, Telephones, etc.)'
            },
            {
                name: 'Categories',
                description: 'Gestion des sous-catégories (Réfrigérateurs, Lave-linge, etc.)'
            },
            {
                name: 'Marques',
                description: 'Gestion des marques de produits'
            },
            {
                name: 'Produits',
                description: 'Gestion des produits disponibles à la vente'
            }
        ]
    },
    apis: [
        './src/routes/*.js',
        './src/controllers/*.js',
        './src/server.js'
    ]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;
