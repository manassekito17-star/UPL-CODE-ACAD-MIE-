import { describe, expect, it } from "vitest";
import { applyPreviewStorage, buildPreviewDocument, clearPreviewStorage } from "./web-document";

describe("aperçu web : document assemblé", () => {
  it("intègre les fichiers du projet (dossiers compris) et signale un fichier introuvable", () => {
    const doc = buildPreviewDocument([
      { name: "index.html", content: '<html><head><link rel="stylesheet" href="css/style.css"></head><body><script src="js/utils.js"></script><script src="js/absent.js"></script></body></html>' },
      { name: "css/style.css", content: "body{color:red}" },
      { name: "js/utils.js", content: "var x = 1;" },
    ]);
    expect(doc).toContain('<style data-fichier="css/style.css">');
    expect(doc).toContain('<script data-fichier="js/utils.js">');
    expect(doc).toContain("Script introuvable dans le projet : js/absent.js");
    expect(doc).not.toContain('src="js/absent.js"');
  });

  it("localStorage de l'aperçu : remplacement disponible et données gardées pour le rechargement suivant", () => {
    clearPreviewStorage();
    applyPreviewStorage({ area: "local", key: "theme", value: "sombre" });
    const doc = buildPreviewDocument([{ name: "index.html", content: "<p>ok</p>" }]);
    expect(doc).toContain('"theme":"sombre"');
    expect(doc).toContain('defineProperty(window,"localStorage"');
    applyPreviewStorage({ area: "local", key: "theme", value: null });
    expect(buildPreviewDocument([{ name: "index.html", content: "<p>ok</p>" }])).not.toContain('"theme"');
    // Données mal formées ignorées.
    applyPreviewStorage({ area: "autre", key: "x", value: "y" });
    applyPreviewStorage({ area: "local", key: 5, value: "y" });
    expect(buildPreviewDocument([{ name: "index.html", content: "" }])).not.toContain('"x"');
  });

  it("formulaires : l'envoi non géré par la page est annulé et affiché dans la console", () => {
    const doc = buildPreviewDocument([{ name: "index.html", content: "<form><input name=a></form>" }]);
    expect(doc).toContain('addEventListener("submit"');
    expect(doc).toContain("Formulaire envoyé");
  });

  it("une donnée de stockage contenant </script> ne casse pas le document", () => {
    clearPreviewStorage();
    applyPreviewStorage({ area: "local", key: "k", value: "</script><script>alert(1)</script>" });
    const doc = buildPreviewDocument([{ name: "index.html", content: "<p>ok</p>" }]);
    expect(doc).not.toContain("</script><script>alert(1)");
    clearPreviewStorage();
  });
});
