/**
 * Seam da camada de CENA (Phaser) — preparação para o combate em ação futuro
 * (ver docs/design/10 e docs/design/12). O `core/` de regras é agnóstico de
 * engine; esta é a única ponte React → Phaser. Fase 4 substituirá a cena de
 * demonstração pela cena de combate real.
 *
 * Phaser é carregado sob demanda (dynamic import) para não pesar no bundle
 * inicial — a cena só custa quando é montada.
 */
import { useEffect, useRef } from 'react';

const WIDTH = 560;
const HEIGHT = 220;

export default function PhaserMount() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    // Tipo do Game via ReturnType para não importar o tipo estaticamente.
    let game: import('phaser').Game | undefined;

    void import('phaser').then(({ default: Phaser }) => {
      if (disposed || !hostRef.current) return;

      class DemoScene extends Phaser.Scene {
        private g!: Phaser.GameObjects.Graphics;
        private t = 0;

        create() {
          this.g = this.add.graphics();
        }

        update(_time: number, delta: number) {
          this.t += delta / 1000;
          const cx = WIDTH / 2;
          const cy = HEIGHT / 2;
          this.g.clear();

          // Anel pulsante (energia da Fratura)
          const pulse = 46 + Math.sin(this.t * 2) * 8;
          this.g.lineStyle(2, 0x22d3ee, 0.9);
          this.g.strokeCircle(cx, cy, pulse);
          this.g.lineStyle(1, 0x22d3ee, 0.25);
          this.g.strokeCircle(cx, cy, pulse + 14);

          // Orbitais (loot/partículas)
          const cores = [0xa855f7, 0x3b82f6, 0xf59e0b, 0x3fb950];
          for (let i = 0; i < cores.length; i++) {
            const ang = this.t * 1.4 + (i * Math.PI) / 2;
            const r = 74 + Math.sin(this.t * 3 + i) * 6;
            const x = cx + Math.cos(ang) * r;
            const y = cy + Math.sin(ang) * r * 0.55;
            this.g.fillStyle(cores[i], 0.9);
            this.g.fillCircle(x, y, 6);
            this.g.fillStyle(cores[i], 0.18);
            this.g.fillCircle(x, y, 13);
          }
        }
      }

      game = new Phaser.Game({
        type: Phaser.AUTO,
        parent: hostRef.current,
        width: WIDTH,
        height: HEIGHT,
        transparent: true,
        scene: DemoScene,
        banner: false,
      });
    });

    return () => {
      disposed = true;
      game?.destroy(true);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      style={{ width: WIDTH, height: HEIGHT }}
      className="mx-auto max-w-full overflow-hidden rounded-xl"
      aria-label="Prévia da cena de combate (Phaser)"
    />
  );
}
