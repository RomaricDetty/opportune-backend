/**
 * Snapshot des données locales (ecommerce_db) pour le seed.
 * Généré automatiquement — ne pas éditer les passwordHash à la main.
 */
module.exports = {
    "admins": [
        {
            "login": "admin",
            "passwordHash": "$2b$10$1qzHGicH.QI/2S0XwG26oOzBo48e6xnukW.Bjx/dw9wdixDnU8WaK",
            "nom": "Admin",
            "prenom": "Opportune",
            "email": "admin@opportune.ci",
            "isActive": true
        },
        {
            "login": "romdja",
            "passwordHash": "$2b$10$boH5SHJpsJU.Yt/ihOeZouoGzawbtImpxDAgcWbfjpKePs2LrnW4m",
            "nom": "GUEU",
            "prenom": "Detty",
            "email": "romaricdetty@gmail.com",
            "isActive": true
        }
    ],
    "clients": [
        {
            "email": "client@demo.ci",
            "passwordHash": "$2b$10$a8MYVEhwCHSsbo6yfh2ZZuhpMun8PWACOraosYzyRf.lCmQkYQX3q",
            "nom": "Kouassi",
            "prenom": "Aya",
            "telephone": "+2250700000001",
            "adresse": "Cocody Angré",
            "ville": "Abidjan",
            "isActive": true
        }
    ],
    "siteCategories": [
        {
            "libelle": "Accessoires",
            "description": "Accessoires high-tech",
            "isActive": true
        },
        {
            "libelle": "Electromenagers",
            "description": "Cuisine et froid",
            "isActive": true
        },
        {
            "libelle": "Smartphones",
            "description": "Téléphones et tablettes",
            "isActive": true
        },
        {
            "libelle": "TV et Audio",
            "description": "Télévisions et son",
            "isActive": true
        }
    ],
    "categories": [
        {
            "libelle": "Android",
            "description": "Smartphones Android des grandes marques (Samsung, etc.).",
            "siteCategory": "Smartphones",
            "isActive": true
        },
        {
            "libelle": "Audio",
            "description": "Barres de son, enceintes et solutions home cinéma.",
            "siteCategory": "TV et Audio",
            "isActive": true
        },
        {
            "libelle": "Câbles",
            "description": "Câbles de charge, connectique et accessoires high-tech.",
            "siteCategory": "Accessoires",
            "isActive": true
        },
        {
            "libelle": "Cuisine",
            "description": "Gazinières, friteuses et petit électroménager de cuisine.",
            "siteCategory": "Electromenagers",
            "isActive": true
        },
        {
            "libelle": "Froid",
            "description": "Réfrigérateurs, congélateurs et appareils de conservation.",
            "siteCategory": "Electromenagers",
            "isActive": true
        },
        {
            "libelle": "iPhone",
            "description": "Gamme Apple iPhone, accessoires et modèles récents.",
            "siteCategory": "Smartphones",
            "isActive": true
        },
        {
            "libelle": "TV 4K",
            "description": "Télévisions 4K / QLED connectées pour le salon.",
            "siteCategory": "TV et Audio",
            "isActive": true
        }
    ],
    "marques": [
        {
            "libelle": "Apple",
            "description": null,
            "logo": null,
            "siteCategory": "Smartphones",
            "isActive": true
        },
        {
            "libelle": "Hisense",
            "description": null,
            "logo": null,
            "siteCategory": "TV et Audio",
            "isActive": true
        },
        {
            "libelle": "Midea",
            "description": null,
            "logo": null,
            "siteCategory": "Electromenagers",
            "isActive": true
        },
        {
            "libelle": "Nasco",
            "description": null,
            "logo": null,
            "siteCategory": "Electromenagers",
            "isActive": true
        },
        {
            "libelle": "Samsung",
            "description": null,
            "logo": null,
            "siteCategory": "Smartphones",
            "isActive": true
        },
        {
            "libelle": "TCL",
            "description": null,
            "logo": null,
            "siteCategory": "TV et Audio",
            "isActive": true
        }
    ],
    "produits": [
        {
            "libelle": "Câble USB-C Fast Charge 1.5m",
            "description": "Câble USB-C 1,5 m compatible charge rapide. Solide, pratique pour téléphone et accessoires au quotidien.",
            "prix": 4900,
            "remise": 0,
            "quantite_stock": 100,
            "quantite_minimale": 1,
            "devise": "XOF",
            "marque": "Samsung",
            "category": "Câbles",
            "caracteristiques": {
                "longueur": "1.5m",
                "connecteur": "USB-C"
            },
            "featured": false,
            "isActive": true,
            "isAvailable": true,
            "imagePrincipale": "https://images.unsplash.com/photo-1625948515291-69613efd103f?auto=format&fit=crop&w=560&h=560&q=65",
            "images": [
                "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=560&h=560&q=65",
                "https://images.unsplash.com/photo-1601524909162-ae8725290836?auto=format&fit=crop&w=560&h=560&q=65",
                "https://images.unsplash.com/photo-1621768216002-5ac171876625?auto=format&fit=crop&w=560&h=560&q=65"
            ],
            "reference": "PROD-1792240116683-RKIGBW8BW"
        },
        {
            "libelle": "Hisense Friteuse à air 4.2L",
            "description": "Friteuse à air 4.2L digitale pour cuisiner avec peu ou sans huile. Programmes pratiques et nettoyage facile.",
            "prix": 34900,
            "remise": 0,
            "quantite_stock": 40,
            "quantite_minimale": 1,
            "devise": "XOF",
            "marque": "Hisense",
            "category": "Cuisine",
            "caracteristiques": {
                "type": "Air fryer",
                "capacite": "4.2L"
            },
            "featured": false,
            "isActive": true,
            "isAvailable": true,
            "imagePrincipale": "https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=560&h=560&q=65",
            "images": [
                "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=560&h=560&q=65",
                "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=560&h=560&q=65",
                "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=560&h=560&q=65"
            ],
            "reference": "PROD-1792240116683-NJNH7MNQ9"
        },
        {
            "libelle": "Hisense TV 65\" QLED Connectée",
            "description": "TV QLED 65\" 4K connectée pour un salon immersif. Couleurs vives, applications intégrées et design fin.",
            "prix": 559900,
            "remise": 10,
            "quantite_stock": 8,
            "quantite_minimale": 1,
            "devise": "XOF",
            "marque": "Hisense",
            "category": "TV 4K",
            "caracteristiques": {
                "smart": "VIDAA",
                "taille": "65\"",
                "resolution": "4K"
            },
            "featured": true,
            "isActive": true,
            "isAvailable": true,
            "imagePrincipale": "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=560&h=560&q=65",
            "images": [
                "https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=560&h=560&q=65",
                "https://images.unsplash.com/photo-1571415060716-baff5f717c37?auto=format&fit=crop&w=560&h=560&q=65",
                "https://images.unsplash.com/photo-1601944177325-f8867652837f?auto=format&fit=crop&w=560&h=560&q=65"
            ],
            "reference": "PROD-1792240116680-ZZ5BFXYKW"
        },
        {
            "libelle": "iPhone 16 - 128 Go",
            "description": "iPhone dernière génération avec puce A18, photo améliorée et écosystème Apple. Un choix premium pour usage pro et perso.",
            "prix": 899900,
            "remise": 0,
            "quantite_stock": 5,
            "quantite_minimale": 1,
            "devise": "XOF",
            "marque": "Apple",
            "category": "iPhone",
            "caracteristiques": {
                "ram": "8 Go",
                "stockage": "128 Go"
            },
            "featured": true,
            "isActive": true,
            "isAvailable": true,
            "imagePrincipale": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=560&h=560&q=65",
            "images": [
                "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=560&h=560&q=65",
                "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=560&h=560&q=65",
                "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=560&h=560&q=65"
            ],
            "reference": "PROD-1792240116680-0F8E9J1PU"
        },
        {
            "libelle": "Midea Gazinière 5 feux Inox",
            "description": "Gazinière 5 feux format 90x60 en inox. Puissante et robuste pour une cuisine familiale ou semi-pro.",
            "prix": 349900,
            "remise": 8,
            "quantite_stock": 6,
            "quantite_minimale": 1,
            "devise": "XOF",
            "marque": "Midea",
            "category": "Cuisine",
            "caracteristiques": {
                "feux": "5",
                "format": "90x60"
            },
            "featured": true,
            "isActive": true,
            "isAvailable": true,
            "imagePrincipale": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=560&h=560&q=65",
            "images": [
                "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=560&h=560&q=65",
                "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=560&h=560&q=65",
                "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=560&h=560&q=65"
            ],
            "reference": "PROD-1792240116682-UIJL0X1SC"
        },
        {
            "libelle": "Nasco Congélateur Horizontal 99L",
            "description": "Congélateur horizontal 99L compact et économique. Parfait pour stocker vos denrées sans prendre trop de place.",
            "prix": 89900,
            "remise": 0,
            "quantite_stock": 18,
            "quantite_minimale": 1,
            "devise": "XOF",
            "marque": "Nasco",
            "category": "Froid",
            "caracteristiques": {
                "type": "Horizontal",
                "capacite": "99L"
            },
            "featured": false,
            "isActive": true,
            "isAvailable": true,
            "imagePrincipale": "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=560&h=560&q=65",
            "images": [
                "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=560&h=560&q=65",
                "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=560&h=560&q=65",
                "https://images.unsplash.com/photo-1556912173-46c336c7fd55?auto=format&fit=crop&w=560&h=560&q=65"
            ],
            "reference": "PROD-1792240116681-MI6B4B5ZH"
        },
        {
            "libelle": "Samsung Galaxy A36 - 256 Go",
            "description": "Smartphone Android 5G conçu pour le quotidien. Écran AMOLED fluide, stockage 256 Go et autonomie confortable pour Abidjan comme en déplacement.",
            "prix": 249900,
            "remise": 5,
            "quantite_stock": 23,
            "quantite_minimale": 1,
            "devise": "XOF",
            "marque": "Samsung",
            "category": "Android",
            "caracteristiques": {
                "ram": "8 Go",
                "ecran": "6.7\"",
                "stockage": "256 Go"
            },
            "featured": true,
            "isActive": true,
            "isAvailable": true,
            "imagePrincipale": "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=560&h=560&q=65",
            "images": [
                "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=560&h=560&q=65",
                "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=560&h=560&q=65",
                "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=560&h=560&q=65"
            ],
            "reference": "PROD-1792240116677-G6LRGC888"
        },
        {
            "libelle": "Samsung Galaxy S25 Ultra - 256 Go",
            "description": "Flagship Galaxy avec photo pro, Galaxy AI et performances haut de gamme. Idéal pour ceux qui veulent le meilleur de Samsung.",
            "prix": 1249900,
            "remise": 0,
            "quantite_stock": 10,
            "quantite_minimale": 1,
            "devise": "XOF",
            "marque": "Samsung",
            "category": "Android",
            "caracteristiques": {
                "ram": "12 Go",
                "reseau": "5G",
                "stockage": "256 Go"
            },
            "featured": true,
            "isActive": true,
            "isAvailable": true,
            "imagePrincipale": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=560&h=560&q=65",
            "images": [
                "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=560&h=560&q=65",
                "https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=560&h=560&q=65",
                "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=560&h=560&q=65"
            ],
            "reference": "PROD-1792240116679-JVJVEO1GT"
        },
        {
            "libelle": "TCL Barre de son 220W Dolby Atmos",
            "description": "Barre de son 220W compatible Dolby Atmos pour un son cinéma à la maison. Simple à brancher sur votre TV.",
            "prix": 99900,
            "remise": 0,
            "quantite_stock": 20,
            "quantite_minimale": 1,
            "devise": "XOF",
            "marque": "TCL",
            "category": "Audio",
            "caracteristiques": {
                "format": "Dolby Atmos",
                "puissance": "220W"
            },
            "featured": false,
            "isActive": true,
            "isAvailable": true,
            "imagePrincipale": "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=560&h=560&q=65",
            "images": [
                "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=560&h=560&q=65",
                "https://images.unsplash.com/photo-1558089687-f282ffcbc126?auto=format&fit=crop&w=560&h=560&q=65",
                "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=560&h=560&q=65"
            ],
            "reference": "PROD-1792240116681-8EB93YUGR"
        },
        {
            "libelle": "TCL TV QLED 65\" Google TV",
            "description": "Télévision QLED 65\" avec Google TV et assistant vocal. Accès rapide à vos apps préférées et image 4K nette.",
            "prix": 459900,
            "remise": 0,
            "quantite_stock": 15,
            "quantite_minimale": 1,
            "devise": "XOF",
            "marque": "TCL",
            "category": "TV 4K",
            "caracteristiques": {
                "taille": "65\"",
                "resolution": "4K"
            },
            "featured": false,
            "isActive": true,
            "isAvailable": true,
            "imagePrincipale": "https://images.unsplash.com/photo-1461151304267-38535e780c79?auto=format&fit=crop&w=560&h=560&q=65",
            "images": [
                "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=560&h=560&q=65",
                "https://images.unsplash.com/photo-1571415060716-baff5f717c37?auto=format&fit=crop&w=560&h=560&q=65",
                "https://images.unsplash.com/photo-1601944177325-f8867652837f?auto=format&fit=crop&w=560&h=560&q=65"
            ],
            "reference": "PROD-1792240116680-SJ4BT9UCS"
        }
    ],
    "publicites": [
        {
            "libelle": "Promo Smartphones",
            "description": "Jusqu'à -10% sur une sélection Galaxy",
            "images": [
                "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=960&h=960&q=65"
            ],
            "isActive": true,
            "category": "Android",
            "produit": null,
            "emplacement": "hero"
        },
        {
            "libelle": "TV 4K en stock",
            "description": "Les meilleures TV connectées",
            "images": [
                "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=960&h=960&q=65"
            ],
            "isActive": true,
            "category": null,
            "produit": "Hisense TV 65\" QLED Connectée",
            "emplacement": "hero"
        }
    ]
};
