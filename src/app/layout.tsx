import type { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/header";
import { AuthProvider } from "@/components/auth/auth-provider";
import "./globals.css";

const zajno = localFont({
  src: "../../public/fonts/zajno.woff2",
  variable: "--font-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Progresiones",
  description: "Aprende a reconocer progresiones armónicas de música latina",
};

const themeScript = `
  (function() {
    const theme = localStorage.getItem('theme');
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${zajno.variable} ${jetbrainsMono.variable} antialiased min-h-screen bg-background`}
      >
        <AuthProvider>
          <Header />
          <main>
            {children}
          </main>
          <Toaster
            position="top-center"
            theme="dark"
            toastOptions={{
              style: {
                fontFamily: 'var(--font-sans)',
                fontSize: '16px',
                padding: '16px 20px',
              },
              classNames: {
                title: 'font-semibold text-base',
                description: 'text-sm',
                success: '!bg-success !text-white !border-success',
                error: '!bg-red-500 !text-white !border-red-400',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
