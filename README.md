# MasterCinema

[![Deploy to GitHub Pages](https://github.com/lucasmarjua-ui/mastercinema/actions/workflows/deploy.yaml/badge.svg)](https://github.com/lucasmarjua-ui/mastercinema/actions/workflows/deploy.yaml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Demo en vivo](https://img.shields.io/badge/demo-en%20vivo-brightgreen)](https://lucasmarjua-ui.github.io/mastercinema/)
![Vanilla + hero en React](https://img.shields.io/badge/juego-vanilla%20JS-orange) ![Hero](https://img.shields.io/badge/hero-React%20%2B%20TS%20%2B%20Tailwind-blue)

MasterCinema es un juego de trivia de cine, estático y responsive. La identidad visual es **"Leader"**: el cabo de cuenta atrás (8-7-6-5...) que abre las copias de proyección de 35mm — negro de sala, papel y un acento ámbar de línea de tiempo, círculos concéntricos, tipografía geométrica gruesa (Archivo + Inter). Nada de alfombra roja ni dorado de gala: esto es la cabina de proyección, no el estreno. El sitio en sí (categorías, partidas, tiendas, cuentas, ranking) es HTML, CSS y JavaScript vanilla, sin frameworks ni build step. La única excepción es el hero de portada de `index.html`, en React + TypeScript + Tailwind, que se compila aparte a un bundle estático (ver [Hero de portada](#hero-de-portada)).

**[▶ Jugar ahora](https://lucasmarjua-ui.github.io/mastercinema/)**

## Jugar localmente

El sitio en sí no tiene dependencias ni build step, pero `index.html` carga el hero de portada ya compilado desde `dist/`, así que hace falta generarlo una vez:

```bash
npm install
npm run build   # deja dist/mastercinema-hero.js y dist/mastercinema-hero.css listos
```

Al usar módulos ES nativos, además hace falta servir los archivos (abrir `index.html` con doble clic no funciona por las políticas de CORS de `file://`). Sirve la raíz con cualquier servidor estático, por ejemplo:

```bash
python -m http.server 8000
```

Luego visita `http://localhost:8000`. Para iterar solo sobre el hero con recarga en caliente, sin el resto del sitio, usa `npm run dev` (sirve `src/hero/dev/` de forma aislada).

## Cómo se juega

1. En la pantalla de inicio, elige una de las cinco categorías: **Directores**, **Actores y Personajes**, **Frases Icónicas**, **Años de Estreno** o **Bandas Sonoras**.
2. Responde una ronda de 10 preguntas de opción múltiple, elegidas al azar del banco de esa categoría. Cada pregunta tiene un temporizador circular de 15 segundos (con tic-tac en los últimos 5) y una transición de iris (el cierre circular clásico de montaje de cine mudo) al pasar a la siguiente: si se agota el tiempo, cuenta como fallo.
3. Cada acierto suma puntos (entre 50 y 150, según la rapidez de la respuesta) y reproduce un aplauso con destello ámbar; cada fallo suena a buzzer/gong, sacude el botón en rojo y muestra la respuesta correcta. Los fallos no restan puntos.
4. Al terminar las 10 preguntas aparece la pantalla de resultados con aciertos, fallos, puntuación y **bobinas** ganadas (la moneda del juego, según la puntuación), con botones para jugar de nuevo, cambiar de categoría o ver tus **logros**.
5. Las bobinas se gastan en la **tienda de temas** de la pantalla de inicio: 4 paletas visuales completas para equipar.
6. Si inicias sesión (nombre de usuario y contraseña), tu progreso se sincroniza en la nube y tus mejores puntuaciones entran al **ranking global** por categoría.
7. En **Modo Maratón** (sexta tarjeta, distinta a las demás) las preguntas de las 5 categorías se mezclan sin repetir hasta agotar el pool, sin número fijo de preguntas: sigues mientras aciertes. La racha multiplica tus puntos (x1, x1.5 desde 5, x2 desde 10, x3 desde 20) y tienes 3 comodines —**50:50**, **Pasar** y **Chivato**— para salvar una respuesta.

## Arquitectura

```text
index.html                 Pantalla de inicio, categorías, tienda de temas, login y ranking
game.html                  Pantalla de juego: preguntas, temporizador, resultados y logros
shared/theme.css           Paleta "Leader", tipografía, layout responsive y temas visuales completos
shared/questions.js        Banco de preguntas por categoría (107 preguntas, 5 categorías)
shared/quiz-engine.js      Selección de preguntas, orden de opciones y puntuación
shared/audio.js            Aplausos, buzzer y tic-tac sintetizados con Web Audio API
shared/wallet.js           Monedero de "bobinas" persistido en localStorage
shared/themes.js           Catálogo de temas visuales, compra y equipamiento
shared/achievements.js     Estadísticas y logros (bronce/plata/oro) por categoría
shared/firebase-config.js  Configuración e inicialización del SDK Firebase CDN
shared/auth.js             Registro, login con usuario/contraseña, invitado y sincronización Firestore
shared/leaderboard.js      Envío y lectura del ranking global en Firestore (por categoría y de mejor racha)
shared/wildcards.js        Catálogo de comodines de Maratón, usos base y compra de usos extra
firestore.rules            Reglas de seguridad del proyecto Firebase (referencia, se pegan en la consola)
src/hero/                  Hero de portada: React + TypeScript + Tailwind (ver más abajo)
dist/                      Bundle compilado del hero, generado por `npm run build` (no versionado)
.github/workflows/deploy.yaml   Compila el hero e instala en GitHub Pages en cada push a main
```

## Banco de preguntas

`shared/questions.js` tiene **107 preguntas reales y verificables** repartidas en 5 categorías (directores, intérpretes, citas, años de estreno y compositores de bandas sonoras — ningún dato inventado):

| Categoría | Preguntas |
|---|---|
| Directores | 25 |
| Actores y Personajes | 24 |
| Años de Estreno | 23 |
| Bandas Sonoras | 18 |
| Frases Icónicas | 17 |
| **Total** | **107** |

### Cómo agregar preguntas

Cada categoría es un objeto con `label`, `description` e `items`. Cada `item` tiene `q` (el enunciado), `correct` (la respuesta correcta) y `wrong` (un array con las 3 opciones falsas). No hace falta tocar `game.html` ni `quiz-engine.js`: el motor arma la ronda, baraja el orden de las opciones y recicla el banco si una categoría tiene menos de 10 preguntas (ninguna la tiene ahora mismo). Añadir una categoría nueva tampoco requiere tocar el motor —`buildRound`/`createMarathonDeck` leen `Object.entries(QUESTIONS)` de forma genérica—, pero si quieres que tenga sus propios logros hay que añadir su id a `CATEGORIES` en `shared/achievements.js` y a la lista de merge de `shared/auth.js`.

## Identidad visual: "Leader"

La referencia es el cabo de cuenta atrás de 35mm, no la alfombra roja: negro de sala (`--ink`), papel (`--paper`) y ámbar (`--amber`) como único acento de marca, con círculos concéntricos y tics de graduación como motivo recurrente (divisores, temporizador, fondo del hero). Tipografía: **Archivo** (800/900, geométrica y muy gruesa) para titulares, **Inter** para cuerpo e interfaz — ambas de Google Fonts, con licencia abierta.

Motivos propios de esta vuelta de diseño:

- **Temporizador circular** (`.timer-ring`): un `conic-gradient` que se vacía en sentido horario con el segundero, con el número de segundos restantes en el centro; se pone rojo en los últimos segundos.
- **Transición de iris** (`.iris-wipe`, antes una barra lateral): el cierre circular clásico del montaje de cine mudo, vía `clip-path: circle()` animado, entre pregunta y pregunta.
- **Iconografía CSS pura**: claqueta, estrella, comillas y rollo de película (heredados, redibujados en ámbar) más un ecualizador de barras nuevo para Bandas Sonoras — todo con gradientes, `clip-path` y pseudo-elementos, sin imágenes.
- **Racha de Maratón**: la llama ya existente se conserva (encaja mejor que nunca: el ámbar ya es el color de marca) con sus mismos tramos de intensidad.

## Sonido y sensación de juego

Todos los efectos se sintetizan en tiempo real con la Web Audio API (`shared/audio.js`), sin archivos de audio externos: un aplauso (ráfagas de ruido filtrado) al acertar, un buzzer/gong grave (dos osciladores desafinados) al fallar, y un tic-tac que arranca en los últimos 5 segundos de cada pregunta. El botón **Sonido** silencia todo. Al acertar, el botón elegido destella en ámbar; al fallar, tiembla en rojo y se resalta la respuesta correcta.

## Bobinas y tienda de temas

Cada partida entrega bobinas según la puntuación conseguida (`reelsForScore` en `shared/wallet.js`). La tienda de `index.html` ofrece 4 temas visuales completos —no solo un color de acento, sino toda la paleta vía variables CSS en `[data-theme="id"]`—: **Leader** (incluido), **Bandas SMPTE** (15 bobinas, magenta/cian de calibración de imagen), **Cinerama Noir** (20 bobinas, blanco y negro con grano de película y parpadeo de proyector) y **Sesión Grindhouse** (30 bobinas, exclusivo, rojo/ámbar saturados con flashes de cámaras al equiparlo).

## Logros

`shared/achievements.js` deriva **19 logros** (15 por categoría clásica —3 por cada una de las 5—, bronce/plata/oro, más 4 de Maratón) a partir de estadísticas acumuladas en `localStorage`, nunca de flags guardados aparte. Incluye una racha global entre categorías y un logro meta (oro de Años de Estreno = oro en Directores, Actores y Frases Icónicas). El botón **Ver logros** de la pantalla de resultados abre el detalle de conseguidos y pendientes.

## Modo Maratón y comodines

`shared/quiz-engine.js` expone `createMarathonDeck()` (mazo con las 5 categorías mezcladas, sin repetir hasta agotar el pool) y `computeMarathonScore()` (puntuación base multiplicada según la racha: x1 de 0 a 4, x1.5 de 5 a 9, x2 de 10 a 19, x3 desde 20). El destello de combo (`Audio.playCombo`) se intensifica en esos mismos tramos, y un destello de confeti (`spawnConfetti` en `game.html`) más un arpegio (`Audio.playRecord`) celebran cada vez que se supera el récord personal de racha (`stats.marathon.bestStreak`, sincronizado en Firestore igual que el resto de estadísticas).

Cada partida arranca con 1 uso de cada comodín (`shared/wildcards.js`): **50:50** (elimina 2 respuestas incorrectas), **Pasar** (descarta la pregunta sin romper la racha) y **Chivato** (resalta la respuesta correcta; cuenta como acierto pero con puntos base reducidos a la mitad, sin bonus por rapidez). La **tienda de comodines** de `index.html` vende usos extra permanentes (10 bobinas cada uno) que se suman al uso base en cada partida nueva.

Al fallar sin comodín que salve la respuesta termina la partida y aparece el **resumen de Maratón**: racha final, puntos, comodines usados y bobinas ganadas (cada tarjeta con su icono y los números contando hacia arriba al aparecer), aviso de nuevo récord si corresponde (con brillo ámbar más marcado en las tarjetas), y un botón **Compartir resultado** que copia al portapapeles un texto tipo "He conseguido una racha de X en MasterCinema 🎬🔥". La mejor racha también se envía a un ranking global propio (categoría `marathon-streak` en `leaderboards/`), visible desde el selector de la pantalla **Ranking**.

## Mi perfil

Con sesión iniciada, el botón **Mi perfil** de la cabecera abre un modal con la mejor racha histórica de Maratón, partidas jugadas (categorías + Maratón), porcentaje de aciertos global y categoría favorita (la más jugada), además de los temas y comodines ya comprados. Todo se deriva de `shared/achievements.js` (`getProfileSummary`); los contadores `totalCorrect`/`totalAnswered` por categoría, necesarios para el % de aciertos, se guardan igual que el resto de estadísticas y se fusionan en Firestore con la misma lógica de máximos.

## Cuentas y ranking global (Firebase)

MasterCinema usa un proyecto Firebase propio (`mastercinema-trivia`, Authentication + Firestore), independiente de cualquier otro proyecto. Funciona como invitado sin registro: las bobinas, el tema equipado, las estadísticas y los logros se guardan en `localStorage`. Desde **Iniciar sesión** se puede crear una cuenta o entrar con **nombre de usuario y contraseña** (por debajo usa Firebase Authentication con un email generado internamente a partir del nombre de usuario, `usuario@mastercinema.local`; nunca se pide ni se muestra un email real). Al entrar, el progreso local se fusiona con el documento `users/{uid}` de Firestore.

Al terminar una partida con sesión iniciada, si la puntuación supera la guardada, se envía a `leaderboards/{categoria}/entries/{uid}`. La pantalla **Ranking** (botón en la cabecera de inicio) muestra el top 10 por categoría; como invitado se avisa que hace falta iniciar sesión para aparecer.

### Cuenta de pruebas

Para revisar Mi perfil y el ranking sin registrarte: usuario `cinefilo5050`, contraseña `Prueba12345`.

### Configuración pendiente en la consola de Firebase

El proyecto y la app web ya están creados (`mastercinema-trivia`), pero **Firestore y el proveedor de email/contraseña no se pueden activar por API ni por CLI** — Google exige un primer clic manual en la consola para cada uno. Sin estos dos pasos, el login y el ranking no funcionarán (el resto de la web sí):

1. Abre la [consola de Firebase del proyecto](https://console.firebase.google.com/project/mastercinema-trivia/overview).
2. **Firestore Database → Crear base de datos** (elige una región, por ejemplo `nam5`) — un solo clic, no hace falta configurar nada más.
3. **Authentication → Comenzar → Sign-in method → Email/contraseña → Habilitar**.
4. **Authentication → Settings → Authorized domains**: añade `lucasmarjua-ui.github.io` para que el login funcione también en GitHub Pages (además de `localhost`, que ya viene autorizado).
5. **Firestore Database → Reglas**: pega el contenido de [`firestore.rules`](firestore.rules) y publica.

Después de estos pasos, cuentas, sincronización y ranking funcionan sin tocar código.

## Hero de portada

El bloque de bienvenida a pantalla completa de `index.html` (antes de la selección de categorías) es un componente aislado en **React + TypeScript + Tailwind CSS + Vite**, con iconos de `lucide-react` — la única parte del proyecto con build step. Se compila por separado a un bundle propio (`npm run build` → `dist/mastercinema-hero.js` + `dist/mastercinema-hero.css`) que `index.html` carga con un `<script type="module">`/`<link>` normales, igual que cualquier otro asset estático: Vite no procesa ni toca el resto de la página (categorías, tiendas, modales, el script de juego), que sigue siendo exactamente el mismo HTML/CSS/JS vanilla de siempre, sirviéndose de la cabecera funcional real (bobinas, sonido, login, ranking, perfil) que queda justo debajo del hero.

Piezas propias, en `src/hero/`:

- `CountdownBg.tsx` — fondo animado dibujado enteramente en `<canvas>`: círculos concéntricos, tics de graduación y una cuña ámbar que gira, como el barrido de un cabo de cuenta atrás. Cero vídeo, cero imágenes externas: sin ningún problema de licencia posible (respeta `prefers-reduced-motion`).
- `Hero.tsx` — cabecera propia (logo, nav funcional, menú móvil), titular con entrada escalonada (`animate-fade-up` + `delay-N`, con `fill-mode: backwards` porque `both`/`forwards` deja un `transform` residual que rompe el `backdrop-filter` de los `.liquid-glass` hijos) y el widget "Dato curioso".
- `trivia-facts.ts` — los 5 datos que muestra el widget son reales, consistentes con `shared/questions.js` (Tiburón 1975, El Padrino 1972, Star Wars 1977, Titanic 1997, Parásitos 2019): nada inventado.

**Sin vídeo, sin problema de licencia.** La versión anterior del hero usaba un vídeo de Pexels con licencia verificada; en este rediseño se sustituyó por el fondo de `<canvas>` descrito arriba, así que ese problema desaparece por completo — no hay ningún asset de vídeo o imagen de terceros en el hero. La tipografía es Inter + Archivo (Google Fonts, licencia abierta).

**Color de marca "Leader", no el azul de ninguna referencia.** El hero usa exactamente la misma paleta que `shared/theme.css` (`amber`/`amber-bright` en Tailwind = `--amber`/`--amber-bright` en CSS): ámbar en superficies sólidas (CTA principal, icono del widget) y en los acentos de `.liquid-glass`.

**Preflight de Tailwind desactivado.** El reset global de Tailwind (`corePlugins.preflight`) pisaría selectores globales que ya existen en `shared/theme.css` (`h1, h2, h3`, `button`, etc.) para el resto de la página; se desactivó, y los resets que hacían falta dentro del hero (botones sin borde/fondo por defecto) se añadieron con alcance explícito a `#hero-root` en `src/hero/index.css`.

**Nav funcional, no decorativo.** Los 4 enlaces del hero (Categorías, Modo Maratón, Tienda, Ranking) hacen scroll suave a la sección real correspondiente de la página, o —en el caso de Ranking— abren directamente el modal de ranking ya existente. No hay ningún enlace de relleno.

## Decisiones técnicas

**Sin build step ni frameworks, salvo el hero de portada.** El resto del proyecto es HTML, CSS y JavaScript vanilla con módulos ES nativos del navegador, sin paso de compilación. Esto permite que GitHub Pages sirva el repositorio prácticamente tal cual, y que cualquiera pueda clonar el repositorio y abrir el proyecto sin instalar nada más que lo necesario para el hero (`npm install && npm run build`, una sola vez).

**Sin imágenes, vídeos ni fuentes de terceros con derechos dudosos.** No hay carteles ni fotos de películas o actores: toda la identidad visual (círculos de cuenta atrás, claqueta, estrella, comillas, rollo de película, ecualizador) se dibuja con CSS/canvas puro (gradientes, `clip-path`, pseudo-elementos), evitando dependencias de assets binarios y problemas de derechos de autor. El propio fondo del hero es canvas generado, no vídeo.

**Responsive mobile-first.** El layout usa flexbox/grid con unidades relativas y `clamp()`, botones con una altura mínima de 44px para uso táctil, y media queries que colapsan la grilla de categorías y de respuestas a una sola columna en pantallas pequeñas, sin scroll horizontal.

## Capturas

| | |
|---|---|
| ![Vestíbulo](screenshots/vestibulo.png) Vestíbulo: categorías, Modo Maratón y tiendas | ![Modo Maratón](screenshots/maraton.png) Modo Maratón: racha, multiplicador y comodines |
| ![Resumen de Maratón](screenshots/resumen.png) Resumen al terminar la racha | ![Mi perfil](screenshots/perfil.png) Mi perfil: estadísticas del jugador |

## GitHub Pages

El workflow `.github/workflows/deploy.yaml` instala dependencias, compila el hero (`npm ci && npm run build`) y publica el repositorio completo (incluido el `dist/` recién generado) en cada push a `main`. Después de crear el repositorio, activa Pages una sola vez en **Settings → Pages → Source: GitHub Actions**. Ese toggle no se puede configurar mediante Git.

El sitio está disponible en `https://lucasmarjua-ui.github.io/mastercinema/`.

## Roadmap

Ideas futuras: seguir ampliando el banco de preguntas, más categorías (carteles por siluetas, escenas por descripción), notificaciones de logro recién desbloqueado durante la partida, pregunta diaria con recompensa especial, historial de partidas anteriores en Mi perfil.

## Licencia

MIT. Copyright Lucas Martinez, 2026. Ver [LICENSE](LICENSE).
