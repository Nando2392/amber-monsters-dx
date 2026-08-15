// Renderer Canvas 2D: dibuja tiles, entidades, batalla, HUD, menús, diálogos, título.
// Escala: viewport lógico 480x320 → canvas 960x640 (x2). Tiles/sprites 16x16 → 32px.

import { GameState } from '../core/state.js';
import { TILE_SIZE, tileAt, isWalkable } from '../world/tilemap.js';
import { TILE_SPRITES } from '../sprites/tiles.js';
import { PLAYER_FRAMES, NPCS } from '../sprites/characters.js';
import { SPECIES, MOVES } from '../data/creatures.js';
import { renderMatrix, renderFrames } from '../sprites/renderer.js';
import { BGM } from '../audio/audio.js';

const VIEW_W = 30; // tiles
const VIEW_H = 20;
const SCALE = 2;
const LOGICAL_W = VIEW_W * TILE_SIZE;   // 480
const LOGICAL_H = VIEW_H * TILE_SIZE;   // 320

// Caché de sprites renderizados (canvas offscreen)
const spriteCache = new Map();

function cached(rows, scale = 2) {
  const key = rows.length + 'x' + rows[0].length + ':' + rows.join(';') + '@' + scale;
  if (!spriteCache.has(key)) {
    spriteCache.set(key, renderMatrix(rows, scale));
  }
  return spriteCache.get(key);
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;
    this.animT = 0;
    this.tileAnimT = 0;
  }

  frame(t) {
    this.animT = t;
    this.tileAnimT = Math.floor(t / 300) % 2;
    const ctx = this.ctx;
    ctx.save();
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // fondo oscuro global
    ctx.fillStyle = '#0d0a14';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.imageSmoothingEnabled = false;
    ctx.scale(SCALE, SCALE);

    const scene = GameState.scene;
    if (scene === 'title') this.renderTitle(ctx);
    else if (scene === 'overworld') this.renderWorld(ctx);
    else if (scene === 'talk') {
      this.renderWorld(ctx);
      this.renderTalk(ctx);
    } else if (scene === 'battle') this.renderBattle(ctx);
    else if (scene === 'party' || scene === 'shop' || scene === 'save' || scene === 'evolve') this.renderMenuScenes(ctx);

    ctx.restore();
  }

  // ---------------- Overworld ----------------
  renderWorld(ctx) {
    const map = GameState.map;
    const p = GameState.player;
    if (!map || !p) return;
    const camX = Math.max(0, Math.min(map.w - VIEW_W, p.x - VIEW_W / 2 + 0.5));
    const camY = Math.max(0, Math.min(map.h - VIEW_H, p.y - VIEW_H / 2 + 0.5));
    const ox = Math.round((camX - Math.floor(camX)) * TILE_SIZE);
    const oy = Math.round((camY - Math.floor(camY)) * TILE_SIZE);

    const t0x = Math.floor(camX), t0y = Math.floor(camY);
    const t1x = t0x + VIEW_W + 1, t1y = t0y + VIEW_H + 1;

    // suelo + tiles
    for (let ty = t0y; ty < t1y; ty++) {
      for (let tx = t0x; tx < t1x; tx++) {
        const t = tileAt(map, tx, ty);
        const frames = TILE_SPRITES[t];
        if (!frames) continue;
        const frame = frames[this.tileAnimT % frames.length];
        const img = cached(frame, 2);
        ctx.drawImage(img, (tx - t0x) * TILE_SIZE - ox, (ty - t0y) * TILE_SIZE - oy, TILE_SIZE * 2, TILE_SIZE * 2);
      }
    }

    // NPCs
    for (const n of GameState.npcs) {
      const spr = NPCS[n.id] ? NPCS[n.id].sprite : NPCS.orme.sprite;
      const frame = spr[n.spriteIdx || 0];
      const img = cached(frame, 2);
      ctx.drawImage(img, (n.x - t0x) * TILE_SIZE - ox, (n.y - t0y) * TILE_SIZE - oy - 4, TILE_SIZE * 2, TILE_SIZE * 2);
    }

    // jugador (con interpolación suave al moverse)
    let px = p.x, py = p.y;
    if (p.moving) {
      const d = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[p.dir];
      const k = Math.min(1, (p.animT || 0) / 110);
      px = p.x - d[0] * (1 - k);
      py = p.y - d[1] * (1 - k);
    }
    const frames = PLAYER_FRAMES[p.dir];
    const walkFrame = p.moving ? Math.floor(this.animT / 90) % 2 : 0;
    const img = cached(frames[walkFrame], 2);
    ctx.drawImage(img, (px - t0x) * TILE_SIZE - ox, (py - t0y) * TILE_SIZE - oy - 4, TILE_SIZE * 2, TILE_SIZE * 2);
  }

  // ---------------- Batalla ----------------
  renderBattle(ctx) {
    const sd = GameState.sceneData;
    if (!sd) return;
    const enemy = sd.enemy;
    const b = sd.battle;
    const player = b ? b.player : GameState.party[0];
    const fx = sd.fx || null;
    const age = fx ? this.animT - fx.t0 : 0;

    // fondo
    ctx.fillStyle = '#1a1226';
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
    const grad = ctx.createLinearGradient(0, 0, 0, LOGICAL_H);
    grad.addColorStop(0, '#241b33');
    grad.addColorStop(1, '#1a1226');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);

    // sacudida de la víctima al recibir un golpe
    let enemyShake = 0, playerShake = 0;
    if (fx && fx.kind === 'hit') {
      const shake = Math.sin(age / 32) * 6 * Math.max(0, 1 - age / 420);
      if (fx.side === 'player') enemyShake = shake;   // el jugador ataca → la víctima es el enemigo
      else playerShake = shake;                       // el enemigo ataca → la víctima es el jugador
    }

    // criatura enemiga (derecha, grande) — se oculta parpadeando al ser capturada
    let enemyVisible = true;
    if (fx && fx.kind === 'capture' && age > 400) enemyVisible = Math.floor(age / 90) % 2 === 0;
    if (enemy && enemyVisible) {
      const frames = SPECIES[enemy.species].battle;
      const frame = frames[Math.floor(this.animT / 250) % 2];
      const img = cached(frame, 6);
      const wobble = Math.sin(this.animT / 200) * 2;
      ctx.drawImage(img, 330 - 24 + enemyShake, 70 - 24 + wobble, 96, 96);
      // nombre + nivel
      ctx.font = '8px monospace';
      ctx.fillStyle = '#f4e9d8';
      ctx.textBaseline = 'top';
      ctx.fillText(`${SPECIES[enemy.species].name} Nv${enemy.level}`, 322, 12);
      // barra HP enemigo
      this.hpBar(ctx, 322, 26, enemy.hp, enemy.maxHp, '#3fd6c2');
    }

    // criatura del jugador (izquierda)
    if (player) {
      const frames = SPECIES[player.species].battle;
      const frame = frames[Math.floor(this.animT / 250) % 2];
      const img = cached(frame, 6);
      const bob = Math.sin(this.animT / 180) * 2;
      ctx.drawImage(img, 40 + playerShake, 170 + bob, 96, 96);
      ctx.font = '8px monospace';
      ctx.fillStyle = '#f4e9d8';
      ctx.fillText(`${player.name} Nv${player.level}`, 32, 160);
      this.hpBar(ctx, 32, 174, player.hp, player.maxHp, '#79d94a');
    }

    // ---- efectos de batalla ----
    if (fx) {
      if (fx.kind === 'hit') {
        const isEnemy = fx.side === 'player';
        const vx = isEnemy ? 330 - 24 : 40;
        const vy = isEnemy ? 70 - 24 : 170;
        // destello blanco en la víctima al impactar
        if (age < 140) {
          ctx.fillStyle = `rgba(255,255,255,${0.45 * (1 - age / 140)})`;
          ctx.fillRect(vx - 6, vy - 6, 108, 108);
        }
        // texto de daño flotante
        const rise = Math.min(1, age / 320);
        ctx.globalAlpha = 1 - rise;
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = fx.eff > 1 ? '#ffb02e' : fx.eff < 1 ? '#9a8bb0' : '#f4e9d8';
        ctx.fillText(`-${fx.dmg}`, vx + 48, vy + 30 - rise * 22);
        ctx.textAlign = 'left';
        ctx.globalAlpha = 1;
      } else if (fx.kind === 'miss') {
        const isEnemy = fx.side === 'player';
        const vx = isEnemy ? 330 - 24 : 40;
        const vy = isEnemy ? 70 - 24 : 170;
        const rise = Math.min(1, age / 300);
        ctx.globalAlpha = 1 - rise;
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#9a8bb0';
        ctx.fillText('¡Falló!', vx + 48, vy + 30 - rise * 18);
        ctx.textAlign = 'left';
        ctx.globalAlpha = 1;
      } else if (fx.kind === 'capture') {
        // orbe ámbar volando del jugador al enemigo con arco
        const p0 = { x: 40 + 48, y: 170 + 48 };
        const p1 = { x: 330 - 24 + 48, y: 70 - 24 + 48 };
        const t = Math.min(1, age / 360);
        const ox = p0.x + (p1.x - p0.x) * t;
        const oy = p0.y + (p1.y - p0.y) * t - Math.sin(t * Math.PI) * 70;
        if (age < 400) {
          ctx.beginPath();
          ctx.arc(ox, oy, 10, 0, Math.PI * 2);
          ctx.fillStyle = '#ffb02e';
          ctx.fill();
          ctx.strokeStyle = '#c77d1e';
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          // el orbe "absorbe" a la criatura
          ctx.beginPath();
          ctx.arc(330 - 24 + 48, 70 - 24 + 48, 10 + (age - 400) / 30, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,176,46,0.9)';
          ctx.fill();
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#ffe9a8';
          ctx.fillText('¡Ya!', 330 + 24, 40);
          ctx.textAlign = 'left';
        }
      }
    }

    // texto de estado (mensajes de captura fallida, sin pociones, etc.)
    if (sd.msg && !(fx && fx.kind === 'hit')) {
      ctx.fillStyle = '#ffe9a8';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(sd.msg, 20, 120);
    }

    // menú de combate (abajo)
    this.renderBattleMenu(ctx);
  }

  hpBar(ctx, x, y, hp, maxHp, color) {
    const w = 100, h = 6;
    ctx.fillStyle = '#000';
    ctx.fillRect(x - 1, y - 1, w + 2, h + 2);
    ctx.fillStyle = '#3a2c52';
    ctx.fillRect(x, y, w, h);
    const ratio = Math.max(0, hp / Math.max(1, maxHp));
    ctx.fillStyle = ratio > 0.5 ? color : ratio > 0.25 ? '#ffb02e' : '#ff5a4e';
    ctx.fillRect(x, y, Math.round(w * ratio), h);
  }

  renderBattleMenu(ctx) {
    const sd = GameState.sceneData;
    const b = sd.battle;
    if (!b) return;
    // panel inferior
    ctx.fillStyle = 'rgba(20, 16, 28, 0.92)';
    ctx.fillRect(0, LOGICAL_H - 96, LOGICAL_W, 96);
    ctx.strokeStyle = '#3a2c52';
    ctx.strokeRect(1, LOGICAL_H - 96, LOGICAL_W - 2, 94);

    const player = b.player;
    const isMoves = sd.panel === 'moves';
    if (b.phase === 'player_menu') {
      const MENU = [
        { key: 'fight', label: 'Luchar' },
        { key: 'capture', label: `Orbe (${GameState.orbs})` },
        { key: 'potion', label: `Poción (${GameState.potions})` },
        { key: 'party', label: 'Cambiar' },
        { key: 'flee', label: 'Huir' },
      ];
      if (!isMoves) {
        // menú principal: 5 acciones en una columna, cursor navegable
        ctx.font = 'bold 10px monospace';
        MENU.forEach((m, i) => {
          const y = LOGICAL_H - 84 + i * 17;
          const active = i === (sd.cursor || 0);
          ctx.fillStyle = active ? '#ffb02e' : '#f4e9d8';
          if (active) ctx.fillText('▶', 16, y);
          ctx.fillText(m.label, 30, y);
        });
        ctx.fillStyle = '#9a8bb0';
        ctx.font = '8px monospace';
        ctx.fillText('↑↓ elegir · Z confirmar · X volver', 14, LOGICAL_H - 8);
        return;
      }
      // submenú de movimientos
      const moves = player.moves;
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#f4e9d8';
      ctx.textBaseline = 'middle';
      moves.forEach((m, i) => {
        const label = MOVES[m]?.name || m;
        const col = i < 2 ? 24 : 200;
        const row = i % 2;
        ctx.fillText(label, col, LOGICAL_H - 70 + row * 22);
      });
      // cursor
      const cur = sd.cursor || 0;
      const cx = cur < 2 ? 14 : 190;
      const cy = LOGICAL_H - 70 + (cur % 2) * 22;
      ctx.fillStyle = '#ffb02e';
      ctx.fillText('▶', cx, cy);
      // info del movimiento
      const mv = moves[cur];
      if (mv) {
        const info = MOVES[mv];
        ctx.fillStyle = '#9a8bb0';
        ctx.font = '8px monospace';
        ctx.fillText(`PS ${player.hp}/${player.maxHp}`, 320, LOGICAL_H - 78);
        ctx.fillText(info ? `${info.name} · ${info.power ? 'Pot ' + info.power : 'Est.'}` : mv, 320, LOGICAL_H - 66);
      }
      ctx.fillStyle = '#9a8bb0';
      ctx.font = '8px monospace';
      ctx.fillText('X: volver', 320, LOGICAL_H - 30);
    } else if (b.phase === 'intro') {
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = '#ffe9a8';
      ctx.textAlign = 'center';
      ctx.fillText(`¡Un ${SPECIES[sd.enemy.species].name} salvaje apareció!`, LOGICAL_W / 2, LOGICAL_H - 50);
      ctx.textAlign = 'left';
    } else if (b.phase === 'animating') {
      ctx.font = 'bold 12px monospace';
      ctx.fillStyle = '#f4e9d8';
      ctx.textAlign = 'center';
      ctx.fillText('…', LOGICAL_W / 2, LOGICAL_H - 50);
      ctx.textAlign = 'left';
    }
  }

  // ---------------- Diálogo (escena talk) ----------------
  renderTalk(ctx) {
    const sd = GameState.sceneData;
    if (!sd || !sd.lines || sd.lines.length === 0) return;
    const boxH = 76;
    ctx.fillStyle = 'rgba(13, 10, 20, 0.95)';
    ctx.fillRect(0, LOGICAL_H - boxH, LOGICAL_W, boxH);
    ctx.strokeStyle = '#ffb02e';
    ctx.lineWidth = 2;
    ctx.strokeRect(3, LOGICAL_H - boxH + 3, LOGICAL_W - 6, boxH - 6);
    ctx.lineWidth = 1;
    ctx.textBaseline = 'top';
    // nombre del NPC
    if (sd.npc?.name) {
      ctx.font = 'bold 10px monospace';
      ctx.fillStyle = '#ffb02e';
      ctx.fillText(`${sd.npc.name}:`, 12, LOGICAL_H - boxH + 10);
    }
    // línea de diálogo con wrap en hasta 2 filas
    const line = sd.lines[Math.min(sd.idx, sd.lines.length - 1)];
    const maxW = 44;
    const words = String(line).split(' ');
    const rows = [];
    let out = '';
    for (const w of words) {
      if ((out + ' ' + w).trim().length > maxW) { rows.push(out.trim()); out = w; }
      else out = (out + ' ' + w).trim();
    }
    if (out) rows.push(out);
    ctx.font = '10px monospace';
    ctx.fillStyle = '#f4e9d8';
    rows.slice(0, 2).forEach((r, i) => ctx.fillText(r, 12, LOGICAL_H - boxH + 26 + i * 14));
    // indicador de continuar
    if (sd.idx < sd.lines.length - 1) {
      ctx.fillStyle = '#3fd6c2';
      ctx.fillText('▼', LOGICAL_W - 18, LOGICAL_H - 22);
    }
  }

  // ---------------- Menús / tienda / título ----------------
  renderMenuScenes(ctx) {
    ctx.fillStyle = '#0d0a14';
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
    const scene = GameState.scene;
    if (scene === 'party') this.renderParty(ctx);
    else if (scene === 'shop') this.renderShop(ctx);
    else if (scene === 'save') this.renderSave(ctx);
    else if (scene === 'heal') this.renderHeal(ctx);
    else if (scene === 'evolve') this.renderEvolve(ctx);
  }

  renderHeal(ctx) {
    ctx.fillStyle = '#241b33';
    ctx.fillRect(8, 8, LOGICAL_W - 16, LOGICAL_H - 16);
    ctx.strokeStyle = '#3fd6c2';
    ctx.strokeRect(8, 8, LOGICAL_W - 16, LOGICAL_H - 16);
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#3fd6c2';
    ctx.fillText('CENTRO DE CURA', 20, 30);
    ctx.font = '10px monospace';
    ctx.fillStyle = '#f4e9d8';
    ctx.fillText('Tu party ha sido curada por completo.', 20, 60);
    ctx.fillText('Sigue explorando, ¡y vuelve cuando lo necesites!', 20, 78);
    ctx.fillStyle = '#9a8bb0';
    ctx.fillText('Z: continuar  X: salir', 16, LOGICAL_H - 20);
  }

  renderParty(ctx) {
    ctx.fillStyle = '#241b33';
    ctx.fillRect(8, 8, LOGICAL_W - 16, LOGICAL_H - 16);
    ctx.strokeStyle = '#3a2c52';
    ctx.strokeRect(8, 8, LOGICAL_W - 16, LOGICAL_H - 16);
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#ffb02e';
    ctx.fillText('PARTY', 20, 26);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#f4e9d8';
    const cursor = GameState.sceneData?.cursor || 0;
    GameState.party.forEach((c, i) => {
      const y = 40 + i * 22;
      if (i === cursor) {
        ctx.fillStyle = '#ffb02e';
        ctx.fillText('▶', 16, y + 7);
      }
      ctx.fillStyle = c.hp > 0 ? '#f4e9d8' : '#9a8bb0';
      const typeColor = SPECIES[c.species]?.type;
      ctx.fillText(`${c.name} Nv${c.level}  HP ${c.hp}/${c.maxHp}`, 30, y + 7);
    });
    ctx.fillStyle = '#9a8bb0';
    ctx.fillText('Z: seleccionar  X: cerrar', 16, LOGICAL_H - 20);
  }

  renderShop(ctx) {
    ctx.fillStyle = '#241b33';
    ctx.fillRect(8, 8, LOGICAL_W - 16, LOGICAL_H - 16);
    ctx.strokeStyle = '#3a2c52';
    ctx.strokeRect(8, 8, LOGICAL_W - 16, LOGICAL_H - 16);
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#ffb02e';
    ctx.fillText('TIENDA DE NIA', 20, 26);
    ctx.font = '9px monospace';
    ctx.fillStyle = '#f4e9d8';
    const sd = GameState.sceneData;
    const cursor = sd?.cursor || 0;
    const items = [
      { label: `Orbe ámbar  — ${GameState.orbs}/${GameState.orbsMax}`, key: 'orb' },
      { label: `Poción      — ${GameState.potions}/${GameState.potionsMax}`, key: 'potion' },
      { label: 'Salir', key: 'exit' },
    ];
    items.forEach((it, i) => {
      const y = 44 + i * 22;
      if (i === cursor) {
        ctx.fillStyle = '#ffb02e';
        ctx.fillText('▶', 16, y + 7);
      }
      ctx.fillStyle = '#f4e9d8';
      ctx.fillText(it.label, 30, y + 7);
    });
    ctx.fillStyle = '#9a8bb0';
    ctx.fillText('Z: comprar  X: salir', 16, LOGICAL_H - 20);
  }

  renderSave(ctx) {
    ctx.fillStyle = '#241b33';
    ctx.fillRect(8, 8, LOGICAL_W - 16, LOGICAL_H - 16);
    ctx.strokeStyle = '#3a2c52';
    ctx.strokeRect(8, 8, LOGICAL_W - 16, LOGICAL_H - 16);
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#ffb02e';
    ctx.fillText('GUARDAR PARTIDA', 20, 26);
    ctx.font = '10px monospace';
    ctx.fillStyle = '#f4e9d8';
    ctx.fillText('¿Guardar el progreso?', 20, 60);
    ctx.fillStyle = '#9a8bb0';
    ctx.fillText('Z: guardar  X: cancelar', 16, LOGICAL_H - 20);
  }

  renderEvolve(ctx) {
    const sd = GameState.sceneData;
    if (!sd) return;
    ctx.fillStyle = '#241b33';
    ctx.fillRect(0, 0, LOGICAL_W, LOGICAL_H);
    const frames = SPECIES[sd.to]?.battle || SPECIES[sd.from]?.battle;
    const img = cached(frames[0], 6);
    const cx = LOGICAL_W / 2 - 48;
    ctx.drawImage(img, cx, 40, 96, 96);
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#ffb02e';
    ctx.textAlign = 'center';
    ctx.fillText(`¡${SPECIES[sd.from].name} está evolucionando!`, LOGICAL_W / 2, 160);
    ctx.fillText(`→ ¡${SPECIES[sd.to].name}!`, LOGICAL_W / 2, 180);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#9a8bb0';
    ctx.font = '9px monospace';
    ctx.fillText('Z: continuar', LOGICAL_W / 2 - 30, LOGICAL_H - 20);
  }

  renderTitle(ctx) {
    // título
    ctx.fillStyle = '#ffb02e';
    ctx.font = 'bold 34px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('AMBER MONSTERS DX', LOGICAL_W / 2, 120);
    ctx.fillStyle = '#3fd6c2';
    ctx.font = '12px monospace';
    ctx.fillText('— una aventura monster-taming 100% original —', LOGICAL_W / 2, 150);
    // criatura mascota (Emberkit grande)
    const frames = SPECIES.emberkit.battle;
    const img = cached(frames[Math.floor(this.animT / 250) % 2], 6);
    const bob = Math.sin(this.animT / 400) * 4;
    ctx.drawImage(img, LOGICAL_W / 2 - 48, 175 + bob, 96, 96);
    ctx.fillStyle = '#f4e9d8';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('▶  Nueva aventura', LOGICAL_W / 2 - 60, 320);
    ctx.fillStyle = '#9a8bb0';
    ctx.font = '10px monospace';
    ctx.fillText('Z/Enter: empezar   M: sonido', LOGICAL_W / 2 - 70, 340);
    ctx.textAlign = 'left';
  }
}

export { VIEW_W, VIEW_H, SCALE, LOGICAL_W, LOGICAL_H };
