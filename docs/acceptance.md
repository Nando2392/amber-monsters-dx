# Checklist de aceptación — Amber Monsters DX

## Juego (funcionalidad)
- [x] Título con arte pixel-art (logo ámbar + Emberkit) y "Enter para empezar"
- [x] Nueva partida → overworld en la Aldea Ámbar con starter (Emberkit Lv.5)
- [x] Movimiento 4 direcciones con animación de pasos
- [x] Colisiones con paredes, árboles, NPCs y agua
- [x] Diálogos con 4 NPCs (Orme, Nia, Brok, Pip) + guardabosques Vela en Ruta 1
- [x] 3 mapas conectados (Aldea → Ruta 1 → Cueva Ópalo) con transiciones
- [x] Encuentros salvajes en hierba alta (Ruta 1) y cueva
- [x] Batalla por turnos: atacar (4 movimientos), capturar, cambiar, huir
- [x] Efectividad de tipos (ember/thorn/aqua) con mensajes "¡Es muy efectivo!"
- [x] XP, subida de nivel, aprendizaje de movimientos por nivel
- [x] Evolución por nivel (Emberkit → Pyrelinx)
- [x] Captura con orbes ámbar; criatura se une al party o va al depósito si lleno
- [x] Poción cura al party; orbes/pociones comprables en la tienda de Nia
- [x] Guardar (S) y cargar partida desde el título
- [x] Menú party con P (ver criaturas, usar pociones)
- [x] Música procedural distinta por mapa y batalla; mute con M
- [x] Derrota → vuelve a la aldea con party curada

## Sprites (game-assets)
- [x] 6 criaturas + 2 evoluciones con siluetas únicas (verificado por hash)
- [x] Sprites de batalla 16×16 y overworld por criatura
- [x] Jugador con 4 direcciones × 2 frames; 4 NPCs con sprite propio
- [x] Tiles: hierba, árbol, agua animada, hierba alta, flor, roca, banco,
      puerta, grava, cristal de cueva
- [x] Todos los índices de paleta dentro del rango; ningún sprite vacío

## Verificación automatizada
- [x] `npm run test:unit` — 21/21 (creatures, battle, tilemap, sprite-gate)
- [x] `npm run test:gates` — 7/7 (visual ×2, gameplay ×3, audio ×2)
- [x] `npm run build` — build de producción OK (57.93 kB JS, 15.41 kB gzip)
- [x] Screenshots de evidencia: title, overworld, battle, after-capture

## Repo / publicación
- [x] README con instrucciones, teclas, capturas y estructura
- [x] LICENSE MIT (arte y código 100% originales)
- [x] docs/process.md con decisiones y fallos corregidos
- [x] Repo público en GitHub (Nando2392/amber-monsters-dx)
