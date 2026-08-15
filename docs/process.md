# Process — Amber Monsters DX

Registro del proceso de desarrollo, decisiones y evidencia de verificación.

## 2026-08-15 — Sesión 1: juego completo + gates

### Objetivo
Construir un RPG de captura de criaturas estilo Game Boy (pixel-art, 100% original)
con verificación automatizada: unit tests (vitest), gates e2e (Playwright) y
sprite gate (ningún sprite vacío, siluetas únicas).

### Origen de los assets
- Skill `game-assets` descargada e instalada en hermes-personal-home desde
  `OpusGameLabs/game-creator` (skills.sh): metodología de matrices 2D de índices
  de paleta → renderer 1px/fillRect. Reglas: paleta global, sin archivos externos,
  sprites como arrays de enteros.
- Todos los sprites del juego (6 criaturas + 2 evoluciones, tiles, personajes)
  son originales, definidos como matrices 16×16 en `src/sprites/` y `src/data/creatures.js`.

### Arquitectura
- Vite + vanilla JS (ESM), Canvas 2D, viewport lógico 480×320 escalado ×2.
- Módulos: `core` (state, input, party, save), `world` (tilemap, world),
  `battle` (battle, capture), `data` (creatures con sprites embebidos),
  `sprites` (palette, renderer, tiles, characters), `audio` (Web Audio procedural),
  `ui` (renderer, ui), `main.js` (loop + API de debug `window.AMBER`).

### Sistema de combate
- Turnos por velocidad, 3 tipos (ember/thorn/aqua) con chart de efectividad,
  buffs, movimientos por nivel (learnSet), XP, evolución por nivel, captura con
  orbes (probabilidad por PS restantes + catchRate), huida, cambio de criatura.

### Maps
- `village` (Aldea Ámbar): tienda, casas, hierba alta decorativa, NPCs (Orme, Nia,
  Brok, Pip), puerta a la cueva, salida a la Ruta 1.
- `route` (Ruta 1): hierba alta (encuentros), rocas, guardabosques Vela.
- `cave` (Cueva Ópalo): agua, cristales, criaturas raras (nivel +3).

### Verificación
| Suite | Resultado |
|---|---|
| `npm run test:unit` | 21/21 pass (creatures, battle, tilemap, sprite-gate) |
| `npm run test:gates` | 7/7 pass (visual ×2, gameplay ×3, audio ×2) |
| `npm run build` | OK — 20 módulos, 57.93 kB JS (15.41 kB gzip) |

### Fallos encontrados y corregidos
1. **tilemap route borde izquierdo abierto** — filas sin `#` inicial; corregido
   rellenando el borde y alineando 5 filas de 31 chars a 30. Verificado con un
   script node que valida `row.length === w` en todos los mapas.
2. **test de batalla**: `useMove` requiere `phase === 'player_menu'`; el test no la
   fijaba → `null`. Corregido seteando la fase en el test.
3. **gate de captura no determinista**: 5 orbes no bastan si el enemigo no se
   debilita. Añadido `AMBER.weakenEnemy()` (enemigo al 8% HP) + `AMBER.giveOrbs(50)`
   → captura garantizada en 1-2 intentos.
4. **`loadGame` no restauraba el overworld**: `AMBER.load()` ahora llama a
   `initWorld(mapId)` tras cargar.
5. **Playwright webServer timeout en Windows**: vite en `localhost` (IPv6) vs check
   `127.0.0.1` → config alineada a `http://localhost:5173` + `reuseExistingServer`.
6. **Spawn de la aldea en fila 13, pared debajo**: el gate de movimiento pulsaba ↓
   (bloqueado). Cambiado a → (camino libre a la derecha).

### Screenshots (evidencia visual)
- `docs/screenshots/title-screen.png` — título con logo y Emberkit.
- `docs/screenshots/overworld-village.png` — aldea: hierba, árboles, NPCs, jugador.
- `docs/screenshots/battle.png` — batalla: criatura jugador vs thistlehoof + menú.
- `docs/screenshots/gameplay-after-capture.png` — tras captura de Dewpup.

### Decisiones
- Sin assets externos descargados: la skill `game-assets` se usó como metodología
  (no como librería de sprites); el arte es 100% original → sin problemas de
  licencia para un repo público.
- API de debug `window.AMBER` expuesta solo para gates e2e; es la única vía de
  forzar estados (batalla, captura, cura) en tests.

### Siguiente paso
- Playtesting humano (el usuario juega 5 min y reporta bugs de UX).
- Si se quiere: sistema de guardado en slot múltiple, banco de criaturas en la
  tienda, entrenadores rivales con diálogos de victoria.

## 2026-08-15 — Sesión 2: fix diálogos invisibles + auto-repeat (reporte del jugador)

### Reporte del jugador
"No me deja hablar con ninguno, hay paredes invisibles, falla mi gate."

### Bugs encontrados (reproducción)
1. **Diálogos invisibles**: `talkTo()` cambiaba la escena a `'talk'` y `_dir()`
   bloqueaba el movimiento en esa escena, pero `renderer.frame()` dibujaba
   `'talk'` como si fuera overworld — **sin recuadro de diálogo**. El jugador
   pulsaba Enter frente a un NPC, no veía nada, y quedaba atascado sin poder
   moverse ("paredes invisibles"). Los gates existentes NO cubrían el diálogo.
2. **Sin auto-repeat**: mantener pulsada una flecha solo movía 1 tile (los
   eventos `pressed` solo se emitían en el primer keydown). UX pobre para un
   RPG estilo GB.

### Fixes
1. `renderer.js`: nuevo `renderTalk(ctx)` — caja inferior oscura con borde
   ámbar, nombre del NPC, texto con wrap en ≤2 líneas y indicador ▼; la escena
   `'talk'` ahora dibuja overworld + caja.
2. `input.js`: auto-repeat de direcciones — tras 380ms de mantener pulsada una
   flecha, se re-emite cada 130ms (hold-to-move). `confirm/cancel/party/save/
   mute` NO repiten (solo direcciones).

### Gates nuevos (tests/gates/talk.spec.js)
- Hablar con Orme: navegación real por teclado hasta (4,2) mirando a (4,3),
  Enter → scene `'talk'` + píxeles ámbar del recuadro en el canvas (>80),
  4×Enter → cierra y vuelve al overworld.
- Auto-repeat: mantener ArrowRight 1.2s → `steps` aumenta ≥3.

### Verificación
| Suite | Resultado |
|---|---|
| `npm run test:unit` | 21/21 pass |
| `npm run test:gates` | 9/9 pass (visual ×2, gameplay ×3, audio ×2, talk ×2) |

Screenshot del diálogo arreglado: `docs/screenshots/dialog-orme.png`.
