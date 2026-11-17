import { redirect } from "next/navigation";

/** Ancienne page « Avis important » (retirée) : les liens déjà partagés mènent à l'accueil. */
export default function AvisImportantPage() {
  redirect("/");
}
