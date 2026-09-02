// Banco de preguntas de MasterCinema, agrupado por categoría.
// Cada pregunta tiene `correct` (respuesta correcta) y `wrong` (3 opciones falsas).
export const QUESTIONS = {
  directors: {
    label: 'Directores',
    description: '¿Quién está detrás de la cámara en los grandes clásicos?',
    items: [
      {
        q: '¿Quién dirigió "Pulp Fiction"?',
        correct: 'Quentin Tarantino',
        wrong: ['Martin Scorsese', 'David Fincher', 'Guy Ritchie']
      },
      {
        q: '¿Quién dirigió "El Padrino"?',
        correct: 'Francis Ford Coppola',
        wrong: ['Sidney Lumet', 'Brian De Palma', 'Michael Cimino']
      },
      {
        q: '¿Quién dirigió "Origen" (Inception)?',
        correct: 'Christopher Nolan',
        wrong: ['Denis Villeneuve', 'Ridley Scott', 'James Cameron']
      },
      {
        q: '¿Quién dirigió "Tiburón" (Jaws)?',
        correct: 'Steven Spielberg',
        wrong: ['George Lucas', 'Ridley Scott', 'John Carpenter']
      }
    ]
  },
  actors: {
    label: 'Actores y Personajes',
    description: 'Reconoce a las estrellas y a quiénes dieron vida a los íconos.',
    items: [
      {
        q: '¿Qué actor interpreta a Tony Stark / Iron Man en el UCM?',
        correct: 'Robert Downey Jr.',
        wrong: ['Chris Evans', 'Chris Hemsworth', 'Mark Ruffalo']
      },
      {
        q: '¿Qué actriz interpreta a Hermione Granger?',
        correct: 'Emma Watson',
        wrong: ['Emma Stone', 'Emma Roberts', 'Evanna Lynch']
      },
      {
        q: '¿Qué actor interpreta a Jack Sparrow?',
        correct: 'Johnny Depp',
        wrong: ['Orlando Bloom', 'Geoffrey Rush', 'Ewan McGregor']
      }
    ]
  },
  quotes: {
    label: 'Frases Icónicas',
    description: 'Las líneas de diálogo que quedaron para la historia.',
    items: [
      {
        q: '"Que la fuerza te acompañe" es de...',
        correct: 'Star Wars',
        wrong: ['Star Trek', 'Dune', 'Guardianes de la Galaxia']
      },
      {
        q: '"Hasta el infinito y más allá" es de...',
        correct: 'Toy Story',
        wrong: ['Los Increíbles', 'Wall-E', 'Up']
      },
      {
        q: '"Sayonara, baby" es de...',
        correct: 'Terminator 2',
        wrong: ['Depredador', 'Rocky IV', 'Duro de Matar']
      }
    ]
  },
  years: {
    label: 'Años de Estreno',
    description: 'Ubica cada película en su año correcto.',
    items: [
      {
        q: '¿En qué año se estrenó "Titanic"?',
        correct: '1997',
        wrong: ['1995', '1998', '2000']
      },
      {
        q: '¿En qué año se estrenó la primera "Toy Story"?',
        correct: '1995',
        wrong: ['1993', '1997', '1999']
      },
      {
        q: '¿En qué año se estrenó "El Rey León" original?',
        correct: '1994',
        wrong: ['1992', '1996', '1989']
      },
      {
        q: '¿En qué año ganó "La Lista de Schindler" el Oscar a mejor película?',
        correct: '1994',
        wrong: ['1991', '1996', '1998']
      }
    ]
  }
};
