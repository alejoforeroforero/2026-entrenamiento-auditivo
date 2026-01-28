'use client';

import { Music } from 'lucide-react';

export default function ProgresionesPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <Music className="h-12 w-12 text-muted-foreground mb-4" />
      <h2 className="text-lg font-medium">Selecciona una progresión</h2>
      <p className="text-sm text-muted-foreground mt-1">
        Elige una progresión del listado para ver sus canciones
      </p>
    </div>
  );
}
