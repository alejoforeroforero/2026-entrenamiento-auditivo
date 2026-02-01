'use client';

import { Piano, Music2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuizMode } from '@/types/quiz';
import { cn } from '@/lib/utils';

interface QuizModeSelectorProps {
  onSelectMode: (mode: QuizMode) => void;
  isLoading?: boolean;
  genreName?: string;
}

export function QuizModeSelector({ onSelectMode, isLoading, genreName }: QuizModeSelectorProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold">Quiz de Progresiones</h1>
        {genreName && (
          <p className="text-muted-foreground text-lg">{genreName}</p>
        )}
        <p className="text-muted-foreground">
          Pon a prueba tu oído identificando progresiones armónicas
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ModeCard
          mode="piano"
          title="Modo Piano"
          description="Escucha la progresión sintetizada e identifica los acordes"
          icon={<Piano className="w-8 h-8" />}
          onSelect={() => onSelectMode('piano')}
          isLoading={isLoading}
        />
        <ModeCard
          mode="repertoire"
          title="Modo Repertorio"
          description="Escucha fragmentos de canciones reales e identifica la progresión"
          icon={<Music2 className="w-8 h-8" />}
          onSelect={() => onSelectMode('repertoire')}
          isLoading={isLoading}
        />
      </div>

      <div className="text-center text-sm text-muted-foreground">
        10 preguntas · 3 intentos por pregunta
      </div>
    </div>
  );
}

interface ModeCardProps {
  mode: QuizMode;
  title: string;
  description: string;
  icon: React.ReactNode;
  onSelect: () => void;
  isLoading?: boolean;
}

function ModeCard({ mode, title, description, icon, onSelect, isLoading }: ModeCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:border-primary/50 hover:shadow-md',
        isLoading && 'pointer-events-none opacity-50'
      )}
      onClick={onSelect}
    >
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <Button className="w-full" disabled={isLoading}>
          {isLoading ? 'Cargando...' : 'Comenzar'}
        </Button>
      </CardContent>
    </Card>
  );
}
