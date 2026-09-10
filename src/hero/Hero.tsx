import { useState } from 'react';
import { Film, Menu, SkipBack, SkipForward, X } from 'lucide-react';
import CountdownBg from './CountdownBg';
import ReelMark from './ReelMark';
import { TRIVIA_FACTS } from './trivia-facts';

const NAV_LINKS: { label: string; action: () => void }[] = [
  { label: 'Categorías', action: () => scrollToSelector('#category-grid') },
  { label: 'Modo Maratón', action: () => scrollToSelector('.marathon-card') },
  { label: 'Tienda', action: () => scrollToSelector('.theme-shop') },
  { label: 'Ranking', action: () => document.querySelector('#ranking-open')?.dispatchEvent(new MouseEvent('click', { bubbles: true })) }
];

function scrollToSelector(selector: string) {
  document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Hero() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [factIndex, setFactIndex] = useState(0);
  const fact = TRIVIA_FACTS[factIndex];

  function runNavAction(action: () => void) {
    setMenuOpen(false);
    action();
  }

  function showPreviousFact() {
    setFactIndex((current) => (current === 0 ? TRIVIA_FACTS.length - 1 : current - 1));
  }
  function showNextFact() {
    setFactIndex((current) => (current === TRIVIA_FACTS.length - 1 ? 0 : current + 1));
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black font-sans text-white">
      <CountdownBg />
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/70 via-black/30 to-black/85" />

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
              onClick={() => runNavAction(link.action)}
              className="transition-colors hover:text-white"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="liquid-glass grid h-10 w-10 place-items-center rounded-full text-white md:hidden"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {menuOpen && (
        <div className="liquid-glass absolute inset-x-4 top-20 z-30 rounded-2xl p-4 md:hidden">
          <nav className="flex flex-col gap-4 text-sm text-white/90">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => runNavAction(link.action)}
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
          107 preguntas reales · 5 categorías
        </span>
        {/*
          text-white + font-display + [text-shadow:none] se declaran explícitos
          (no solo heredados) porque shared/theme.css define un h1 global que,
          al ser una coincidencia directa sobre el propio elemento, ganaría a
          cualquier estilo solo heredado de un ancestro.
        */}
        <h1 className="animate-fade-up delay-2 max-w-3xl font-display text-4xl font-black leading-[1.05] tracking-tight text-white [text-shadow:none] sm:text-6xl md:text-7xl">
          tu cinefilia,
          <br />
          contrarreloj.
        </h1>
        <p className="animate-fade-up delay-3 mt-6 max-w-xl text-base text-white/70 sm:text-lg">
          Directores, actores, citas, años y bandas sonoras. Elige categoría o entra en Modo
          Maratón: la racha multiplica tus puntos mientras aciertes.
        </p>
        <div className="animate-fade-up delay-4 mt-9 flex flex-col items-center gap-4 sm:flex-row">
          <button
            type="button"
            onClick={() => scrollToSelector('#category-grid')}
            className="rounded-full bg-amber px-7 py-3 text-sm font-bold text-black transition-colors hover:bg-amber-bright"
          >
            Elegir categoría
          </button>
          <button
            type="button"
            onClick={() => scrollToSelector('.marathon-card')}
            className="liquid-glass rounded-full px-7 py-3 text-sm font-medium text-white"
          >
            Modo Maratón
          </button>
        </div>
      </main>

      <div className="animate-fade-up delay-5 absolute bottom-6 right-6 z-20 hidden w-72 sm:block">
        <div className="liquid-glass rounded-2xl p-4 text-left text-white">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 flex-none place-items-center rounded-lg bg-amber">
              <Film className="h-5 w-5 text-black" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-white/60">Dato curioso</p>
              <p className="truncate text-sm font-medium">{fact.title}</p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-white/70">{fact.detail}</p>
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={showPreviousFact}
              aria-label="Dato anterior"
              className="liquid-glass grid h-8 w-8 place-items-center rounded-full"
            >
              <SkipBack className="h-3.5 w-3.5" />
            </button>
            <span className="text-[11px] text-white/50">
              {factIndex + 1} / {TRIVIA_FACTS.length}
            </span>
            <button
              type="button"
              onClick={showNextFact}
              aria-label="Dato siguiente"
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
