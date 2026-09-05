import { useState } from 'react';
import { Bookmark, Film, Heart, Menu, SkipBack, SkipForward, X } from 'lucide-react';
import BoomerangVideoBg from './BoomerangVideoBg';
import ReelMark from './ReelMark';
import { FEATURED_MOVIES } from './movies';

// Clip corto con licencia libre para uso comercial (Pexels License, sin
// atribución obligatoria): "A red curtain with a black background", de
// cottonbro studio. https://www.pexels.com/video/a-red-curtain-with-a-black-background-4722613/
const VIDEO_SRC = 'https://videos.pexels.com/video-files/4722613/4722613-sd_960_506_25fps.mp4';

const NAV_LINKS: { label: string; selector: string | null }[] = [
  { label: 'Catálogo', selector: '#category-grid' },
  { label: 'Directores', selector: '[data-category="directors"]' },
  { label: 'Reseñas', selector: 'footer' },
  { label: 'Sala de proyección', selector: '.marathon-card' },
];

function scrollToSelector(selector: string | null) {
  if (!selector) return;
  document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Hero() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [movieIndex, setMovieIndex] = useState(0);
  const [watchlisted, setWatchlisted] = useState(false);

  const movie = FEATURED_MOVIES[movieIndex];

  function goToNavLink(selector: string | null) {
    setMenuOpen(false);
    scrollToSelector(selector);
  }

  function showPreviousMovie() {
    setMovieIndex((current) => (current === 0 ? FEATURED_MOVIES.length - 1 : current - 1));
    setWatchlisted(false);
  }
  function showNextMovie() {
    setMovieIndex((current) => (current === FEATURED_MOVIES.length - 1 ? 0 : current + 1));
    setWatchlisted(false);
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black font-sans text-white">
      <BoomerangVideoBg src={VIDEO_SRC} />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/75 via-black/35 to-black/80" />

      <header className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-6 py-5 md:px-10">
        <a href="#" className="flex items-center gap-2 text-white no-underline">
          <ReelMark className="h-5 w-5" />
          <span className="text-base font-semibold tracking-tight">MasterCinema</span>
        </a>

        <nav className="hidden items-center gap-8 text-sm text-white/80 md:flex">
          {NAV_LINKS.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => goToNavLink(link.selector)}
              className="transition-colors hover:text-white"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="liquid-glass flex items-center gap-2 rounded-full py-1 pl-1 pr-4 text-sm text-white"
            aria-label="Ver watchlist"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-brand">
              <Bookmark className="h-4 w-4" />
            </span>
            <span className="hidden sm:inline">Watchlist (0)</span>
            <span className="sm:hidden">(0)</span>
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="liquid-glass grid h-10 w-10 place-items-center rounded-full text-white md:hidden"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {menuOpen && (
        <div className="liquid-glass absolute inset-x-4 top-20 z-30 rounded-2xl p-4 md:hidden">
          <nav className="flex flex-col gap-4 text-sm text-white/90">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => goToNavLink(link.selector)}
                className="text-left transition-colors hover:text-white"
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>
      )}

      <main className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
        <span className="liquid-glass animate-fade-up delay-1 mb-6 inline-flex rounded-full px-4 py-1.5 text-xs tracking-wide text-white/90">
          Colección 04 · Cine de autor
        </span>
        {/*
          text-white + font-sans + [text-shadow:none] se declaran explícitos
          (no solo heredados) porque shared/theme.css define un h1 global
          (Playfair Display, color crema, sombra dorada) que, al ser una
          coincidencia directa sobre el propio elemento, ganaría a cualquier
          estilo solo heredado de un ancestro -- ver el hero.html real.
        */}
        <h1 className="animate-fade-up delay-2 max-w-3xl text-4xl font-sans font-semibold leading-[1.05] tracking-tight text-white [text-shadow:none] sm:text-6xl md:text-7xl">
          películas que se quedan
          <br />
          contigo después.
        </h1>
        <p className="animate-fade-up delay-3 mt-6 max-w-xl text-base text-white/70 sm:text-lg">
          Cine de autor, clásicos restaurados y joyas ocultas. Un catálogo curado, no un scroll
          infinito.
        </p>
        <div className="animate-fade-up delay-4 mt-9 flex flex-col items-center gap-4 sm:flex-row">
          <button
            type="button"
            onClick={() => scrollToSelector('#category-grid')}
            className="rounded-full bg-white px-7 py-3 text-sm font-medium text-black transition-colors hover:bg-white/90"
          >
            Explorar el catálogo
          </button>
          <button
            type="button"
            onClick={() => scrollToSelector('.marathon-card')}
            className="liquid-glass rounded-full px-7 py-3 text-sm font-medium text-white"
          >
            Novedades
          </button>
        </div>
      </main>

      <div className="animate-fade-up delay-5 absolute bottom-6 right-6 z-20 hidden w-72 sm:block">
        <div className="liquid-glass rounded-2xl p-4 text-white">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 flex-none place-items-center rounded-lg bg-brand">
              <Film className="h-5 w-5 text-white" />
            </span>
            <div className="min-w-0 flex-1 text-left">
              <p className="text-xs text-white/60">En cartelera</p>
              <p className="truncate text-sm font-medium">
                {movie.title} <span className="text-white/50">· {movie.year}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setWatchlisted((value) => !value)}
              aria-label={watchlisted ? 'Quitar de watchlist' : 'Añadir a watchlist'}
              className="flex-none"
            >
              <Heart
                className={
                  watchlisted ? 'h-5 w-5 fill-gold text-gold' : 'h-5 w-5 text-white/50 hover:text-white'
                }
              />
            </button>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={showPreviousMovie}
              aria-label="Película anterior"
              className="liquid-glass grid h-8 w-8 place-items-center rounded-full"
            >
              <SkipBack className="h-3.5 w-3.5" />
            </button>
            <span className="text-[11px] text-white/50">
              {movieIndex + 1} / {FEATURED_MOVIES.length}
            </span>
            <button
              type="button"
              onClick={showNextMovie}
              aria-label="Película siguiente"
              className="liquid-glass grid h-8 w-8 place-items-center rounded-full"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
