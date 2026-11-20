// Fonctions utilitaires partagées
const PLATS = [
  { nom: "Poulet mayo", prix: 8000 },
  { nom: "Pondu", prix: 5000 },
  { nom: "Liboke de poisson", prix: 12000 },
];

function formaterPrix(montant) {
  return montant.toLocaleString("fr-FR") + " FC";
}

function validerReservation(nom, personnes) {
  if (!nom.trim()) return "Le nom est obligatoire.";
  if (!(Number(personnes) >= 1)) return "Nombre de personnes invalide.";
  return null;
}
