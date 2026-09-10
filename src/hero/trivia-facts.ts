export interface TriviaFact {
  title: string;
  detail: string;
}

// Datos reales, consistentes con shared/questions.js -- nada inventado.
// Mantenimiento manual: si el banco de preguntas cambia mucho, revisa que
// estas cinco siguan encajando.
export const TRIVIA_FACTS: TriviaFact[] = [
  { title: 'Tiburón, 1975', detail: 'Steven Spielberg la dirigió con poco más de 27 años: fue su primer gran éxito.' },
  { title: 'El Padrino, 1972', detail: 'Francis Ford Coppola dirigió a Marlon Brando y Al Pacino.' },
  { title: 'Star Wars, 1977', detail: 'John Williams compuso también las bandas sonoras de Tiburón, E.T. e Indiana Jones.' },
  { title: 'Titanic, 1997', detail: 'James Cameron dirigió a Leonardo DiCaprio y Kate Winslet.' },
  { title: 'Parásitos, 2019', detail: 'Bong Joon-ho hizo historia en los Óscar con esta película.' }
];
