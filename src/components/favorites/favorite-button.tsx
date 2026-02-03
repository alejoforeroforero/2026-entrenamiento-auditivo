'use client';

import { useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { Button } from '@heroui/react';
import { cn } from '@/lib/utils';
import { toggleFavorite } from '@/app/perfil/actions';

interface FavoriteButtonProps {
  songId: string;
  initialFavorited?: boolean;
  className?: string;
}

export function FavoriteButton({ songId, initialFavorited = false, className }: FavoriteButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [favorited, setFavorited] = useState(initialFavorited);

  const handleClick = () => {
    if (!session) {
      router.push('/login');
      return;
    }

    startTransition(async () => {
      const result = await toggleFavorite(songId);
      if (!result.error && result.favorited !== undefined) {
        setFavorited(result.favorited);
      }
    });
  };

  return (
    <Button
      variant="light"
      isIconOnly
      size="sm"
      className={cn('h-8 w-8 min-w-8', className)}
      onPress={handleClick}
      isDisabled={isPending}
    >
      <Heart
        className={cn(
          'h-4 w-4 transition-colors',
          favorited ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground'
        )}
      />
    </Button>
  );
}
