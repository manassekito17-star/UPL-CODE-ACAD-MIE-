let total = 0;
const plats = document.querySelector("#plats");

function afficher(liste) {
  plats.innerHTML = "";
  for (const p of liste) {
    const carte = document.createElement("div");
    carte.className = "carte";
    carte.innerHTML = `<h3>${p.nom}</h3><p>${formaterPrix(p.prix)}</p><button type="button">Ajouter</button>`;
    carte.querySelector("button").addEventListener("click", () => {
      total += p.prix;
      document.querySelector("#total").textContent = "Panier : " + formaterPrix(total);
      console.log("Ajouté :", p.nom);
    });
    plats.appendChild(carte);
  }
}
afficher(PLATS);

document.querySelector("#filtre").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();
  afficher(PLATS.filter((p) => p.nom.toLowerCase().includes(q)));
});

document.querySelector("#theme").addEventListener("click", () => {
  document.body.classList.toggle("sombre");
  localStorage.setItem("theme", document.body.classList.contains("sombre") ? "sombre" : "clair");
});
if (localStorage.getItem("theme") === "sombre") document.body.classList.add("sombre");

document.querySelector("#formulaire").addEventListener("submit", (e) => {
  e.preventDefault();
  const erreur = validerReservation(e.target.nom.value, e.target.personnes.value);
  document.querySelector("#message").textContent = erreur ?? `Merci ${e.target.nom.value}, table réservée !`;
});
