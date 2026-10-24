-- Table CATEGORIE
CREATE TABLE categorie (
    id_categorie   INT AUTO_INCREMENT PRIMARY KEY,
    nom_categorie  VARCHAR(100) NOT NULL,
    description    TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table PRODUIT
CREATE TABLE produit (
    id_produit      INT AUTO_INCREMENT PRIMARY KEY,
    nom_produit     VARCHAR(150) NOT NULL,
    prix_unitaire   DECIMAL(10,2) NOT NULL CHECK (prix_unitaire >= 0),
    quantite_stock  INT NOT NULL DEFAULT 0 CHECK (quantite_stock >= 0),
    seuil_minimum   INT NOT NULL DEFAULT 5 CHECK (seuil_minimum >= 0),
    date_creation   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_categorie    INT NOT NULL,
    FOREIGN KEY (id_categorie) REFERENCES categorie(id_categorie)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table CLIENT
CREATE TABLE client (
    id_client   INT AUTO_INCREMENT PRIMARY KEY,
    nom         VARCHAR(100) NOT NULL,
    prenom      VARCHAR(100) NOT NULL,
    telephone   VARCHAR(20),
    email       VARCHAR(150),
    adresse     VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table UTILISATEUR : générée par Django à partir du modèle Utilisateur(AbstractUser)
-- (Meta.db_table = 'utilisateur' fixe ce nom exact ; non créée manuellement ici)

-- Table VENTE
CREATE TABLE vente (
    id_vente        INT AUTO_INCREMENT PRIMARY KEY,
    date_vente      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    montant_total   DECIMAL(10,2) NOT NULL CHECK (montant_total >= 0),
    id_client       INT NOT NULL,
    id_utilisateur  INT NOT NULL,
    FOREIGN KEY (id_client) REFERENCES client(id_client),
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table LIGNE_VENTE
CREATE TABLE ligne_vente (
    id_ligne_vente       INT AUTO_INCREMENT PRIMARY KEY,
    quantite             INT NOT NULL CHECK (quantite > 0),
    prix_unitaire_vente  DECIMAL(10,2) NOT NULL CHECK (prix_unitaire_vente >= 0),
    sous_total           DECIMAL(10,2) NOT NULL CHECK (sous_total >= 0),
    id_vente             INT NOT NULL,
    id_produit           INT NOT NULL,
    FOREIGN KEY (id_vente) REFERENCES vente(id_vente) ON DELETE CASCADE,
    FOREIGN KEY (id_produit) REFERENCES produit(id_produit)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;