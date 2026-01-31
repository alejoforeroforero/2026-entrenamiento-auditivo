import Link from 'next/link';
import { Music } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GenreNotFound() {
  return (
    <div className="max-w-2xl mx-auto py-16 text-center">
      <div className="w-20 h-20 rounded-3xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mb-8 mx-auto">
        <Music className="h-10 w-10 text-destructive" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight mb-4">
        Género no encontrado
      </h1>
      <p className="text-muted-foreground mb-6">
        Este género no existe o no tiene contenido disponible.
      </p>
      <Button className="rounded-xl" asChild>
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
