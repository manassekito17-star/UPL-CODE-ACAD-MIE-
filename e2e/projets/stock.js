// Gestionnaire de stock (application console)
class Produit {
  constructor(nom, prix, quantite) {
    this.nom = nom;
    this.prix = prix;
    this.quantite = quantite;
  }
  get valeur() {
    return this.prix * this.quantite;
  }
}

const stock = [new Produit("Riz", 2500, 40), new Produit("Huile", 6000, 12), new Produit("Sucre", 1800, 0)];
const enRupture = stock.filter((p) => p.quantite === 0).map((p) => p.nom);
const total = stock.reduce((s, p) => s + p.valeur, 0);
console.log("Produits :", stock.length);
console.table(stock.map(({ nom, prix, quantite }) => ({ nom, prix, quantite })));
console.log("Valeur totale :", total.toLocaleString("fr-FR"), "FC");
console.log("En rupture :", enRupture.join(", ") || "aucun");
const nom = prompt("Produit à chercher ?");
const trouve = stock.find((p) => p.nom.toLowerCase() === String(nom).toLowerCase());
console.log(trouve ? `${trouve.nom} : ${trouve.quantite} en stock` : "Introuvable");
