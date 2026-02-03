'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Headphones } from 'lucide-react';
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Chip,
} from '@heroui/react';
import { ThemeToggle } from './theme-toggle';
import { UserMenu } from '@/components/auth/user-menu';
import { MobileNavTrigger } from './mobile-nav-trigger';
import { MobileNavPanel } from './mobile-nav-panel';

const GENRE_LABELS: Record<string, string> = {
  salsa: 'Salsa',
  cumbia: 'Cumbia',
  vallenato: 'Vallenato',
  bambuco: 'Bambuco',
};

function extractGenreFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/([^/]+)/);
  if (!match) return null;
  const potentialGenre = match[1];
  return GENRE_LABELS[potentialGenre] ? potentialGenre : null;
}

export function Header() {
  const pathname = usePathname();
  const currentGenre = extractGenreFromPathname(pathname);
  const genreLabel = currentGenre ? GENRE_LABELS[currentGenre] : null;

  return (
    <>
      <Navbar
        maxWidth="full"
        className="bg-background/80 backdrop-blur-md border-b border-divider"
        classNames={{
          wrapper: "px-4 md:px-6",
        }}
      >
        <NavbarBrand as={Link} href="/" className="gap-3 cursor-pointer">
          <div className="flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-full bg-primary text-primary-foreground">
            <Headphones className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <span className="text-xl md:text-2xl font-bold tracking-tight hidden sm:inline">
            Progresiones
          </span>
          {genreLabel && (
            <Chip size="sm" variant="flat" color="default" className="hidden sm:flex">
              {genreLabel}
            </Chip>
          )}
        </NavbarBrand>

        <NavbarContent justify="end" className="gap-2 md:gap-3">
          {currentGenre && (
            <NavbarItem>
              <Button
                as={Link}
                href={`/${currentGenre}/practicar`}
                color="primary"
                variant="shadow"
                radius="full"
                className="font-semibold uppercase text-xs tracking-wide"
              >
                Practicar
              </Button>
            </NavbarItem>
          )}
          <NavbarItem>
            <ThemeToggle />
          </NavbarItem>
          <NavbarItem>
            <UserMenu />
          </NavbarItem>
        </NavbarContent>
      </Navbar>
      <MobileNavTrigger />
      <MobileNavPanel />
    </>
  );
}
