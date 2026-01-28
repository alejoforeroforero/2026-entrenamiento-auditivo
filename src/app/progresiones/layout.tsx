'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Headphones } from 'lucide-react';
import { useProgressionStore } from '@/stores/progression-store';
import { cn } from '@/lib/utils';

export default function ProgresionesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isPracticar = pathname === '/progresiones/practicar';
  const { progressions } = useProgressionStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex">
      {/* Sidebar with progressions list */}
      <div className="w-64 border-r bg-muted/30 p-4">
        {/* Practicar link */}
        <Link
          href="/progresiones/practicar"
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-4',
            isPracticar
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted text-foreground'
          )}
        >
          <Headphones className="h-4 w-4" />
          Practicar
        </Link>

        <div className="border-t pt-4">
          <h2 className="font-semibold text-sm text-muted-foreground mb-3 px-2">
            Catálogo
          </h2>
          {!mounted ? (
            <p className="text-sm text-muted-foreground px-3 py-2">
              Cargando...
            </p>
          ) : progressions.length === 0 ? (
            <p className="text-sm text-muted-foreground px-3 py-2">
              No hay progresiones registradas.{' '}
              <Link href="/admin" className="text-primary hover:underline">
                Agregar en Admin
              </Link>
            </p>
          ) : (
            <nav className="space-y-1">
              {progressions.map((progression) => {
                const isActive = pathname === `/progresiones/${progression.id}`;
                return (
                  <Link
                    key={progression.id}
                    href={`/progresiones/${progression.id}`}
                    className={cn(
                      'block px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-foreground'
                    )}
                  >
                    {progression.name}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  );
}
