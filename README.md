# MasterCinema

[![Deploy to GitHub Pages](https://github.com/lucasmarjua-ui/mastercinema/actions/workflows/deploy.yaml/badge.svg)](https://github.com/lucasmarjua-ui/mastercinema/actions/workflows/deploy.yaml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Demo en vivo](https://img.shields.io/badge/demo-en%20vivo-brightgreen)](https://lucasmarjua-ui.github.io/mastercinema/)
![Sin dependencias](https://img.shields.io/badge/dependencias-cero-orange)

MasterCinema es un juego de trivia de cine, estático y responsive, con una identidad visual de sala de cine y alfombra roja: rojo carmesí, dorado, negro y tipografía tipo cartel. Hecho con HTML, CSS y JavaScript vanilla, sin frameworks ni build step.

**[▶ Jugar ahora](https://lucasmarjua-ui.github.io/mastercinema/)**

## Jugar localmente

No hay dependencias ni build step. Al usar módulos ES nativos, hace falta servir los archivos (abrir `index.html` con doble clic no funciona por las políticas de CORS de `file://`). Sirve la raíz con cualquier servidor estático, por ejemplo:

```bash
python -m http.server 8000
```

Luego visita `http://localhost:8000`.

## Cómo se juega

1. En la pantalla de inicio, elige una de las cuatro categorías: **Directores**, **Actores y Personajes**, **Frases Icónicas** o **Años de Estreno**.
2. Responde una ronda de 10 preguntas de opción múltiple, elegidas al azar del banco de esa categoría. Cada pregunta tiene un temporizador de 15 segundos: si se agota, cuenta como fallo.
3. Cada acierto suma puntos (entre 50 y 150, según la rapidez de la respuesta); los fallos no restan puntos.
4. Al terminar las 10 preguntas aparece la pantalla de resultados con aciertos, fallos y puntuación total, con botones para jugar de nuevo o cambiar de categoría.

## Arquitectura

```text
index.html                 Pantalla de inicio y selección de categoría
game.html                  Pantalla de juego: preguntas, temporizador y resultados
shared/theme.css           Paleta, tipografía y layout responsive (mobile-first)
shared/questions.js        Banco de preguntas por categoría
shared/quiz-engine.js      Selección de preguntas, orden de opciones y puntuación
.github/workflows/deploy.yaml   Publicación en GitHub Pages en cada push a main
```

### Cómo agregar preguntas

Cada categoría en `shared/questions.js` es un objeto con `label`, `description` e `items`. Cada `item` tiene `q` (el enunciado), `correct` (la respuesta correcta) y `wrong` (un array con las 3 opciones falsas). No hace falta tocar `game.html` ni `quiz-engine.js`: el motor arma la ronda, baraja el orden de las opciones y recicla el banco si tiene menos de 10 preguntas por categoría.

## Decisiones técnicas

**Sin build step ni frameworks.** Todo el proyecto es HTML, CSS y JavaScript vanilla con módulos ES nativos del navegador. Esto permite que GitHub Pages sirva el repositorio tal cual, sin paso de compilación ni CI de build, y que cualquiera pueda clonar el repositorio y abrir el proyecto sin instalar nada.

**Sin imágenes ni fuentes de terceros con derechos.** No hay carteles ni fotos de películas o actores: toda la identidad visual (claqueta, estrella, comillas, rollo de película) se dibuja con CSS puro (gradientes, `clip-path`, pseudo-elementos), evitando dependencias de assets binarios y problemas de derechos de autor.

**Responsive mobile-first.** El layout usa flexbox/grid con unidades relativas y `clamp()`, botones con una altura mínima de 44px para uso táctil, y media queries que colapsan la grilla de categorías y de respuestas a una sola columna en pantallas pequeñas, sin scroll horizontal.

## GitHub Pages

El workflow `.github/workflows/deploy.yaml` publica los archivos estáticos en cada push a `main`, sin compilación. Después de crear el repositorio, activa Pages una sola vez en **Settings → Pages → Source: GitHub Actions**. Ese toggle no se puede configurar mediante Git.

El sitio está disponible en `https://lucasmarjua-ui.github.io/mastercinema/`.

## Roadmap

Ideas futuras: ampliar el banco de preguntas por categoría, modo contrarreloj global, tabla de mejores puntuaciones en `localStorage`, más categorías (bandas sonoras, carteles por siluetas).

## Licencia

MIT. Copyright Lucas Martinez, 2026. Ver [LICENSE](LICENSE).
