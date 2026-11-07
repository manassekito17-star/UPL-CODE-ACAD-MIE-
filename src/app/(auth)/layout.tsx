import { Card, Container, Notice } from "@/components/ui";
import { isSupabaseConfigured } from "@/lib/env";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container className="flex justify-center py-12">
      <Card className="w-full max-w-md p-6 sm:p-8">
        {!isSupabaseConfigured() && (
          <div className="mb-4">
            <Notice tone="alerte" title="Mode démonstration">
              Les comptes nécessitent la configuration de Supabase (voir le fichier README). Les cours, l&apos;éditeur et les exercices restent accessibles.
            </Notice>
          </div>
        )}
        {children}
      </Card>
    </Container>
  );
}
