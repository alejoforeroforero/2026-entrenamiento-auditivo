'use client';

import { Music, Menu } from 'lucide-react';

export default function ProgresionesPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <div className="w-20 h-20 rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-8">
        <Music className="h-10 w-10 text-accent" />
      </div>
      <h2 className="text-2xl font-semibold mb-3">Selecciona una progresión</h2>
      <p className="text-muted-foreground max-w-sm text-lg hidden md:block">
        Elige una progresión del catálogo para ver ejemplos de canciones que la utilizan.
      </p>
      <p className="text-muted-foreground max-w-sm text-lg md:hidden">
        Toca el botón{' '}
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground align-middle mx-1">
          <Menu className="w-4 h-4" />
        </span>{' '}
        para ver el catálogo de progresiones.
      </p>
    </div>
  );
}
