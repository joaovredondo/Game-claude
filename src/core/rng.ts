/**
 * RNG determinístico e semeado (mulberry32).
 *
 * Toda aleatoriedade com valor de jogo (drops, refino, rolagem de atributos)
 * DEVE passar por aqui, recebendo um `Rng` injetado — assim os testes são
 * reproduzíveis e o servidor pode auditar resultados (ver docs/design/12).
 */

export interface WeightedEntry<T> {
  value: T;
  weight: number;
}

export interface Rng {
  /** Próximo float em [0, 1). */
  next(): number;
  /** Inteiro em [min, max] (ambos inclusivos). */
  int(min: number, max: number): number;
  /** Float em [min, max). */
  float(min: number, max: number): number;
  /** Item aleatório de um array não-vazio. */
  pick<T>(arr: readonly T[]): T;
  /** Sorteio ponderado; ignora entradas com weight <= 0. */
  weighted<T>(entries: readonly WeightedEntry<T>[]): T;
  /** Semente atual (para serialização/save). */
  readonly seed: number;
}

/** Cria um Rng a partir de uma semente inteira de 32 bits. */
export function createRng(seed: number): Rng {
  let state = seed >>> 0;

  const next = (): number => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (min: number, max: number): number => {
    if (max < min) [min, max] = [max, min];
    return min + Math.floor(next() * (max - min + 1));
  };

  const float = (min: number, max: number): number => min + next() * (max - min);

  const pick = <T>(arr: readonly T[]): T => {
    if (arr.length === 0) throw new Error('rng.pick: array vazio');
    return arr[int(0, arr.length - 1)];
  };

  const weighted = <T>(entries: readonly WeightedEntry<T>[]): T => {
    const total = entries.reduce((s, e) => s + Math.max(0, e.weight), 0);
    if (total <= 0) throw new Error('rng.weighted: soma de pesos <= 0');
    let roll = next() * total;
    for (const e of entries) {
      const w = Math.max(0, e.weight);
      if (roll < w) return e.value;
      roll -= w;
    }
    // Fallback por erro de ponto flutuante: última entrada com peso positivo.
    for (let i = entries.length - 1; i >= 0; i--) {
      if (entries[i].weight > 0) return entries[i].value;
    }
    throw new Error('rng.weighted: nenhuma entrada válida');
  };

  return {
    next,
    int,
    float,
    pick,
    weighted,
    get seed() {
      return seed >>> 0;
    },
  };
}

/** Semente aleatória (uso: novo jogo). Não use em lógica que precise ser testável. */
export function randomSeed(): number {
  return (Math.random() * 0xffffffff) >>> 0;
}
