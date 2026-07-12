/**
 * Forja Ativa — mini-mecânica de precisão. Um marcador varre a barra; o
 * jogador trava no momento certo. Zona quente = "perfeito", uma faixa mais
 * larga ao redor = "bom", fora disso = "erro". Ver docs/design/05 §4.
 */
import { useEffect, useRef, useState } from 'react';

export type ForjaPreciso = 'perfeito' | 'bom' | 'erro';

interface ForgeMeterProps {
  /** Largura da zona perfeita, centrada em 0.5 (0..1). */
  hotZoneWidth: number;
  disabled?: boolean;
  onResult: (resultado: ForjaPreciso) => void;
}

const GOOD_ZONE_MULTIPLIER = 2.2;
const SWEEP_PERIOD_MS = 1300;

export default function ForgeMeter({ hotZoneWidth, disabled, onResult }: ForgeMeterProps) {
  const [position, setPosition] = useState(0);
  const [locked, setLocked] = useState<ForjaPreciso | null>(null);
  const startRef = useRef(performance.now());
  const rafRef = useRef(0);

  useEffect(() => {
    if (disabled || locked) return;
    startRef.current = performance.now();

    function tick(now: number) {
      const t = ((now - startRef.current) % SWEEP_PERIOD_MS) / SWEEP_PERIOD_MS;
      // Onda triangular (0→1→0) — sem "salto" nas bordas da barra.
      const pos = t < 0.5 ? t * 2 : 2 - t * 2;
      setPosition(pos);
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [disabled, locked]);

  function handleLock() {
    if (disabled || locked) return;
    const goodWidth = Math.min(1, hotZoneWidth * GOOD_ZONE_MULTIPLIER);
    const distancia = Math.abs(position - 0.5);
    const resultado: ForjaPreciso =
      distancia <= hotZoneWidth / 2 ? 'perfeito' : distancia <= goodWidth / 2 ? 'bom' : 'erro';
    setLocked(resultado);
    onResult(resultado);
  }

  const goodWidthPct = Math.min(1, hotZoneWidth * GOOD_ZONE_MULTIPLIER) * 100;
  const hotWidthPct = hotZoneWidth * 100;

  const RESULT_LABEL: Record<ForjaPreciso, string> = {
    perfeito: 'Perfeito!',
    bom: 'Bom',
    erro: 'Errou',
  };
  const RESULT_COLOR: Record<ForjaPreciso, string> = {
    perfeito: 'text-cyan-300',
    bom: 'text-emerald-300',
    erro: 'text-red-400',
  };

  return (
    <div className="select-none">
      <div className="relative h-7 overflow-hidden rounded-full border border-white/10 bg-white/5">
        <div
          className="absolute inset-y-0 bg-emerald-400/20"
          style={{ left: `${50 - goodWidthPct / 2}%`, width: `${goodWidthPct}%` }}
        />
        <div
          className="absolute inset-y-0 bg-cyan-400/35"
          style={{ left: `${50 - hotWidthPct / 2}%`, width: `${hotWidthPct}%` }}
        />
        <div
          className="absolute inset-y-0 w-[3px] rounded bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.6)]"
          style={{ left: `calc(${position * 100}% - 1.5px)` }}
        />
      </div>

      <button
        onClick={handleLock}
        disabled={disabled || !!locked}
        className="mt-2 w-full rounded-lg bg-cyan-400/10 py-2 text-sm font-bold text-cyan-300 transition hover:bg-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {locked ? (
          <span className={RESULT_COLOR[locked]}>{RESULT_LABEL[locked]}</span>
        ) : (
          'Travar!'
        )}
      </button>
    </div>
  );
}
