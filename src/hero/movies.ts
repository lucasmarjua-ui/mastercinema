export interface FeaturedMovie {
  title: string;
  year: number;
}

// Títulos y años reales, extraídos tal cual del banco de preguntas de la
// categoría "Años de Estreno" en shared/questions.js -- MasterCinema todavía
// no tiene un catálogo de fichas de película navegable, así que se reutiliza
// el único dato real disponible en vez de inventar títulos de muestra.
export const FEATURED_MOVIES: FeaturedMovie[] = [
  { title: 'Titanic', year: 1997 },
  { title: 'Toy Story', year: 1995 },
  { title: 'El Rey León', year: 1994 },
  { title: 'La Lista de Schindler', year: 1994 },
];
