import Link from "next/link";

import { COMING, FEATURES } from "./content";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function Home() {
  return (
    <>
      <section className="hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${base}/icon.png`} alt="Icône ZYNORA Office" width={112} height={112} className="hero__icon" />
        <div>
          <p className="eyebrow">Suite bureautique indépendante</p>
          <h1>ZYNORA Office</h1>
          <p className="lead">
            Un tableur complet qui fonctionne sans Internet, sur Windows, macOS, Linux et Android. Les calculs sont faits par un vrai moteur de calcul : rien n&apos;est simulé.
          </p>
          <div className="actions">
            <Link href="/telecharger/" className="button button--primary">
              Télécharger gratuitement
            </Link>
            <a href="#fonctionnalites" className="button">
              Découvrir
            </a>
          </div>
        </div>
      </section>

      <section id="fonctionnalites" aria-labelledby="titre-fonctions" className="section">
        <h2 id="titre-fonctions">Disponible aujourd&apos;hui : ZYNORA Sheets</h2>
        <ul className="features">
          {FEATURES.map((f) => (
            <li key={f.title} className="card">
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="titre-avenir" className="section">
        <h2 id="titre-avenir">En préparation</h2>
        <ul className="card list">
          {COMING.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
        <p className="note">
          Version d&apos;aperçu, compilée et testée automatiquement sur Windows, macOS, Linux et Android à chaque modification. Les installateurs ne sont pas encore signés numériquement.
        </p>
      </section>
    </>
  );
}
