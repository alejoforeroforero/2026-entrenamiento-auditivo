'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { User, Heart, LogOut, Settings } from 'lucide-react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Avatar,
  Button,
} from '@heroui/react';

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="w-9 h-9 rounded-full bg-muted animate-pulse" />
    );
  }

  if (!session) {
    return (
      <Button variant="light" size="sm" as={Link} href="/login">
        Iniciar Sesión
      </Button>
    );
  }

  const initials = session.user.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

  return (
    <Dropdown placement="bottom-end">
      <DropdownTrigger>
        <Avatar
          as="button"
          className="h-9 w-9 cursor-pointer transition-transform"
          src={session.user.image || undefined}
          name={initials}
          showFallback
        />
      </DropdownTrigger>
      <DropdownMenu
        aria-label="User menu"
        className="w-56"
        disabledKeys={session.user.isAdmin ? [] : ['admin']}
      >
        <DropdownSection showDivider>
          <DropdownItem key="profile-info" isReadOnly className="cursor-default">
            <p className="font-medium">{session.user.name}</p>
            <p className="text-xs text-muted-foreground">{session.user.email}</p>
          </DropdownItem>
        </DropdownSection>
        <DropdownSection showDivider={session.user.isAdmin}>
          <DropdownItem
            key="perfil"
            as={Link}
            href="/perfil"
            startContent={<User className="h-4 w-4" />}
          >
            Perfil
          </DropdownItem>
          <DropdownItem
            key="favoritos"
            as={Link}
            href="/perfil/favoritos"
            startContent={<Heart className="h-4 w-4" />}
          >
            Favoritos
          </DropdownItem>
        </DropdownSection>
        <DropdownSection showDivider className={session.user.isAdmin ? '' : 'hidden'}>
          <DropdownItem
            key="admin"
            as={Link}
            href="/admin"
            startContent={<Settings className="h-4 w-4" />}
            className={session.user.isAdmin ? '' : 'hidden'}
          >
            Administración
          </DropdownItem>
        </DropdownSection>
        <DropdownSection>
          <DropdownItem
            key="logout"
            className="text-danger"
            color="danger"
            startContent={<LogOut className="h-4 w-4" />}
            onPress={() => signOut({ callbackUrl: '/' })}
          >
            Cerrar Sesión
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
}
