import { describe, it, expect } from 'vitest';
import { createRng } from './rng';

describe('createRng', () => {
  it('é determinístico: mesma semente → mesma sequência', () => {
    const a = createRng(12345);
    const b = createRng(12345);
    const seqA = Array.from({ length: 20 }, () => a.next());
    const seqB = Array.from({ length: 20 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it('sementes diferentes → sequências diferentes', () => {
    const a = createRng(1);
    const b = createRng(2);
    expect(a.next()).not.toEqual(b.next());
  });

  it('next() fica em [0, 1)', () => {
    const r = createRng(7);
    for (let i = 0; i < 1000; i++) {
      const v = r.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('int() respeita os limites inclusivos', () => {
    const r = createRng(42);
    const seen = new Set<number>();
    for (let i = 0; i < 5000; i++) {
      const v = r.int(1, 6);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(6);
      expect(Number.isInteger(v)).toBe(true);
      seen.add(v);
    }
    expect(seen).toEqual(new Set([1, 2, 3, 4, 5, 6]));
  });

  it('weighted() respeita a distribuição aproximada dos pesos', () => {
    const r = createRng(99);
    const entries = [
      { value: 'a', weight: 70 },
      { value: 'b', weight: 25 },
      { value: 'c', weight: 5 },
    ];
    const counts: Record<string, number> = { a: 0, b: 0, c: 0 };
    const N = 100000;
    for (let i = 0; i < N; i++) counts[r.weighted(entries)]++;
    expect(counts.a / N).toBeCloseTo(0.7, 1);
    expect(counts.b / N).toBeCloseTo(0.25, 1);
    expect(counts.c / N).toBeCloseTo(0.05, 1);
  });

  it('weighted() ignora pesos <= 0', () => {
    const r = createRng(3);
    const entries = [
      { value: 'x', weight: 0 },
      { value: 'y', weight: 1 },
    ];
    for (let i = 0; i < 100; i++) expect(r.weighted(entries)).toBe('y');
  });
});
