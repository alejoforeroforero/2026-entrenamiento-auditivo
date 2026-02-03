'use client';

import { HeroUIProvider } from "@heroui/react";

export default function HeroUILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HeroUIProvider>
      <div className="dark text-foreground bg-background min-h-screen">
        {children}
      </div>
    </HeroUIProvider>
  );
}
