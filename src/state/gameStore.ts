/**
 * Store global (Zustand) — esqueleto da Fase 0.
 * Guarda a semente do RNG (serializável no save) e utilidades de demonstração.
 * As regras de jogo vivem no `core/` (agnóstico de engine); a store só orquestra.
 */
import { create } from 'zustand';
import { randomSeed } from '../core/rng';

interface GameState {
  seed: number;
  reseed: () => void;
  setSeed: (seed: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  seed: 20260712,
  reseed: () => set({ seed: randomSeed() }),
  setSeed: (seed) => set({ seed: seed >>> 0 }),
}));
