'use client';

import Link from 'next/link';
import { Music } from 'lucide-react';
import { Button } from '@heroui/react';

export default function GenreNotFound() {
  return (
    <div className="max-w-2xl mx-auto py-16 text-center">
      <div className="w-20 h-20 rounded-3xl bg-danger/10 border border-danger/20 flex items-center justify-center mb-8 mx-auto">
        <Music className="h-10 w-10 text-danger" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight mb-4">
        Género no encontrado
      </h1>
      <p className="text-muted-foreground mb-6">
        Este género no existe o no tiene contenido disponible.
      </p>
      <Button color="primary" radius="lg" as={Link} href="/">
        Volver al inicio
      </Button>
    </div>
  );
}
