import Link from 'next/link';
import { Music2, ListMusic, ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/db';
import { getGenreStats, hasContentForGenre } from '@/lib/data/genre-filters';

async function getGenres() {
  return prisma.genre.findMany({
    orderBy: { name: 'asc' },
  });
}

export default async function HomePage() {
  const genres = await getGenres();

  const genresWithStats = await Promise.all(
    genres.map(async (genre) => {
      const [stats, hasContent] = await Promise.all([
        getGenreStats(genre.id),
        hasContentForGenre(genre.id),
      ]);
      return { ...genre, stats, hasContent };
    })
  );

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-16">
      <div className="text-center mb-12 md:mb-20">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 md:mb-6">
          Entrena tu{' '}
          <span className="text-gradient">oído musical</span>
        </h1>
        <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Aprende a reconocer progresiones armónicas de música latina
          a través de ejercicios interactivos.
        </p>
      </div>

      <div className="mb-6 md:mb-8">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 md:mb-6 text-center">
          Selecciona un género
        </h2>
      </div>

      <div className="grid gap-3 md:gap-4 md:grid-cols-2">
        {genresWithStats.map((genre) => {
          if (!genre.hasContent) {
            return (
              <div
                key={genre.id}
                className="relative overflow-hidden p-5 md:p-6 rounded-2xl md:rounded-3xl bg-card/30 border border-border/30 opacity-60"
              >
                <div className="relative">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-secondary/50 flex items-center justify-center mb-3 md:mb-4">
                    <ListMusic className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold mb-1.5 md:mb-2 text-muted-foreground">
                    {genre.label}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Próximamente
                  </p>
                </div>
              </div>
            );
          }

          return (
            <Link
              key={genre.id}
              href={`/${genre.id}`}
              className="group relative overflow-hidden p-5 md:p-6 rounded-2xl md:rounded-3xl bg-card/50 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:glow active:scale-[0.98]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-primary/10 flex items-center justify-center mb-3 md:mb-4 group-hover:bg-primary/20 group-hover:glow-sm transition-all duration-300">
                  <ListMusic className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <h3 className="text-lg md:text-xl font-semibold mb-1.5 md:mb-2 group-hover:text-primary transition-colors">
                  {genre.label}
                </h3>
                <p className="text-sm text-muted-foreground mb-3 md:mb-4">
                  {genre.stats.progressions} {genre.stats.progressions === 1 ? 'progresión' : 'progresiones'} • {genre.stats.songs} {genre.stats.songs === 1 ? 'canción' : 'canciones'}
                </p>
                <div className="flex items-center gap-2 text-sm font-medium text-primary md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                  <span>Explorar</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="mt-12 md:mt-20 text-center">
        <div className="inline-flex items-center gap-2 md:gap-3 px-4 md:px-5 py-2 md:py-2.5 rounded-full bg-secondary/50 border border-border/50 text-xs md:text-sm text-muted-foreground">
          <Music2 className="w-4 h-4 text-primary" />
          <span>Salsa • Cumbia • Vallenato • Bambuco</span>
        </div>
      </div>
    </div>
  );
}
