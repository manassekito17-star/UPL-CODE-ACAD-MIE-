/**
 * Jeux de données des leçons et exercices SQL (exécutés comme « données de
 * départ » avant la requête de l'étudiant, sur une base SQLite neuve).
 */

/** Une seule table : etudiants (exemple de référence de la formation). */
export const ETUDIANTS = `CREATE TABLE etudiants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  postnom TEXT NOT NULL,
  age INTEGER,
  filiere TEXT
);
INSERT INTO etudiants (nom, postnom, age, filiere) VALUES
  ('Kito', 'Manasse', 23, 'Informatique'),
  ('Mbuyi', 'Grace', 19, 'Droit'),
  ('Kabila', 'Mutombo', 21, 'Informatique'),
  ('Ilunga', 'Sarah', 25, 'Médecine'),
  ('Tshala', 'Benie', 20, 'Droit'),
  ('Nsimba', 'Joel', 22, NULL);`;

/** Base « universite » relationnelle : filières, étudiants, cours, inscriptions (notes). */
export const UNIVERSITE = `PRAGMA foreign_keys = ON;
CREATE TABLE filieres (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL UNIQUE
);
CREATE TABLE etudiants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nom TEXT NOT NULL,
  postnom TEXT NOT NULL,
  age INTEGER CHECK (age >= 15),
  filiere_id INTEGER REFERENCES filieres (id)
);
CREATE TABLE cours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  intitule TEXT NOT NULL,
  credits INTEGER NOT NULL DEFAULT 3
);
CREATE TABLE inscriptions (
  etudiant_id INTEGER NOT NULL REFERENCES etudiants (id),
  cours_id INTEGER NOT NULL REFERENCES cours (id),
  note REAL CHECK (note BETWEEN 0 AND 20),
  PRIMARY KEY (etudiant_id, cours_id)
);
INSERT INTO filieres (nom) VALUES ('Informatique'), ('Droit'), ('Médecine');
INSERT INTO etudiants (nom, postnom, age, filiere_id) VALUES
  ('Kito', 'Manasse', 23, 1),
  ('Mbuyi', 'Grace', 19, 2),
  ('Kabila', 'Mutombo', 21, 1),
  ('Ilunga', 'Sarah', 25, 3),
  ('Nsimba', 'Joel', 22, NULL);
INSERT INTO cours (intitule, credits) VALUES ('Algorithmique', 5), ('Bases de données', 4), ('Droit civil', 3), ('Anatomie', 6);
INSERT INTO inscriptions (etudiant_id, cours_id, note) VALUES
  (1, 1, 15), (1, 2, 17), (2, 3, 12), (3, 1, 9), (3, 2, 11), (4, 4, 14);`;

/** Boutique : produits, clients, commandes, lignes de commande. */
export const BOUTIQUE = `PRAGMA foreign_keys = ON;
CREATE TABLE produits (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT NOT NULL, categorie TEXT NOT NULL, prix REAL NOT NULL CHECK (prix > 0), stock INTEGER NOT NULL DEFAULT 0);
CREATE TABLE clients (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT NOT NULL, ville TEXT NOT NULL);
CREATE TABLE commandes (id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER NOT NULL REFERENCES clients (id), date_commande TEXT NOT NULL);
CREATE TABLE lignes_commande (commande_id INTEGER NOT NULL REFERENCES commandes (id), produit_id INTEGER NOT NULL REFERENCES produits (id), quantite INTEGER NOT NULL CHECK (quantite > 0), PRIMARY KEY (commande_id, produit_id));
INSERT INTO produits (nom, categorie, prix, stock) VALUES
  ('Cahier', 'Papeterie', 1.5, 200), ('Stylo', 'Papeterie', 0.5, 500), ('Calculatrice', 'Électronique', 25, 15),
  ('Clé USB', 'Électronique', 8, 40), ('Sac à dos', 'Bagagerie', 30, 0), ('Règle', 'Papeterie', 1, 120);
INSERT INTO clients (nom, ville) VALUES ('Kito', 'Kinshasa'), ('Mbuyi', 'Lubumbashi'), ('Ilunga', 'Kinshasa'), ('Tshala', 'Goma');
INSERT INTO commandes (client_id, date_commande) VALUES (1, '2026-10-02'), (2, '2026-10-05'), (1, '2026-10-20'), (3, '2026-11-01');
INSERT INTO lignes_commande (commande_id, produit_id, quantite) VALUES
  (1, 1, 10), (1, 2, 5), (2, 3, 1), (3, 4, 2), (3, 1, 4), (4, 5, 1), (4, 6, 3);`;
