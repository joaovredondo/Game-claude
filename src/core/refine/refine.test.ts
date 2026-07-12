import { describe, it, expect } from 'vitest';
import type { Rng } from '../rng';
import {
  computeStoneBonus,
  computeForjaAtivaBonus,
  computeFinalChance,
  computeHotZoneWidth,
  resolveRefine,
  canRefine,
  getRefineTier,
} from './refine';
import { refinement, itemDefs, rarities } from '../../data';
import { generateItem } from '../items/generate';
import { createRng } from '../rng';

/** Rng determinístico para os testes: `next()` sempre retorna `value`. */
function fixedRng(value: number): Rng {
  return {
    next: () => value,
    int: () => 0,
    float: () => value,
    pick: (arr) => arr[0],
    weighted: (entries) => entries[0].value,
    seed: 0,
  };
}

const espada = itemDefs.bases.find((b) => b.id === 'espada_ferro')!;

function makeItem(refinoNivel = 0) {
  const item = generateItem(createRng(1), {
    base: espada,
    itemLevel: 10,
    rarities,
    afixDefs: itemDefs.afixos,
    refineCap: refinement.cap,
    rarityOverride: 'rare',
  });
  return { ...item, refino: { ...item.refino, nivel: refinoNivel } };
}

describe('computeStoneBonus', () => {
  it('é 0 sem pedras', () => {
    expect(computeStoneBonus([], refinement)).toBe(0);
  });

  it('aplica o fator decrescente à pedra de menor bônus, não à ordem de entrada', () => {
    // estelar (0.25) + bruta (0.00): independente da ordem, o resultado é igual.
    const a = computeStoneBonus(['pedra_estelar', 'pedra_bruta'], refinement);
    const b = computeStoneBonus(['pedra_bruta', 'pedra_estelar'], refinement);
    expect(a).toBe(b);
    expect(a).toBeCloseTo(0.25 * 1.0 + 0.0 * 1.0, 5);
  });

  it('respeita o teto de pedras por tentativa', () => {
    const seis = Array(6).fill('pedra_estelar');
    const cinco = Array(5).fill('pedra_estelar');
    expect(computeStoneBonus(seis, refinement)).toBe(computeStoneBonus(cinco, refinement));
  });

  it('ignora ids de pedra desconhecidos (peso 0)', () => {
    expect(computeStoneBonus(['pedra_inexistente'], refinement)).toBe(0);
  });
});

describe('computeForjaAtivaBonus', () => {
  it('perfeito > bom > erro', () => {
    const perfeito = computeForjaAtivaBonus('perfeito', refinement);
    const bom = computeForjaAtivaBonus('bom', refinement);
    const erro = computeForjaAtivaBonus('erro', refinement);
    expect(perfeito).toBeGreaterThan(bom);
    expect(bom).toBeGreaterThan(erro);
  });

  it('auto fica entre bom e perfeito', () => {
    const auto = computeForjaAtivaBonus('auto', refinement);
    const perfeito = computeForjaAtivaBonus('perfeito', refinement);
    const bom = computeForjaAtivaBonus('bom', refinement);
    expect(auto).toBeGreaterThan(bom);
    expect(auto).toBeLessThan(perfeito);
  });
});

describe('computeFinalChance', () => {
  it('nunca fica abaixo de 1% nem acima de 100%', () => {
    const baixa = computeFinalChance(0.01, [], 'erro', refinement);
    const alta = computeFinalChance(0.95, Array(5).fill('pedra_estelar'), 'perfeito', refinement);
    expect(baixa).toBeGreaterThanOrEqual(0.01);
    expect(alta).toBeLessThanOrEqual(1);
  });

  it('cresce com pedras e com o resultado da Forja Ativa', () => {
    const semNada = computeFinalChance(0.5, [], 'erro', refinement);
    const comPedraEForja = computeFinalChance(0.5, ['pedra_arcana'], 'perfeito', refinement);
    expect(comPedraEForja).toBeGreaterThan(semNada);
  });
});

describe('computeHotZoneWidth', () => {
  it('diminui conforme o nível-alvo sobe', () => {
    const larga = computeHotZoneWidth(1, [], refinement);
    const estreita = computeHotZoneWidth(11, [], refinement);
    expect(estreita).toBeLessThan(larga);
  });

  it('aumenta quando há pedra em uso', () => {
    const semPedra = computeHotZoneWidth(8, [], refinement);
    const comPedra = computeHotZoneWidth(8, ['pedra_polida'], refinement);
    expect(comPedra).toBeGreaterThan(semPedra);
  });

  it('nunca fica abaixo do piso de jogabilidade', () => {
    expect(computeHotZoneWidth(11, [], refinement)).toBeGreaterThanOrEqual(0.04);
  });
});

describe('canRefine / getRefineTier', () => {
  it('permite refinar abaixo do cap e bloqueia no cap', () => {
    expect(canRefine(makeItem(0))).toBe(true);
    expect(canRefine(makeItem(refinement.cap))).toBe(false);
  });

  it('getRefineTier retorna undefined além do cap', () => {
    expect(getRefineTier(refinement, refinement.cap + 1)).toBeUndefined();
    expect(getRefineTier(refinement, 1)?.nivelAlvo).toBe(1);
  });
});

describe('resolveRefine', () => {
  it('lança erro se o item já estiver no cap', () => {
    const item = makeItem(refinement.cap);
    expect(() =>
      resolveRefine(fixedRng(0), item, { stoneIds: [], useSeal: false, forjaResultado: 'erro' }, refinement),
    ).toThrow(/cap/);
  });

  it('sucesso garantido (roll 0) sobe o nível e atualiza o nome', () => {
    const item = makeItem(0);
    const result = resolveRefine(
      fixedRng(0),
      item,
      { stoneIds: [], useSeal: false, forjaResultado: 'perfeito' },
      refinement,
    );
    expect(result.sucesso).toBe(true);
    expect(result.destruido).toBe(false);
    expect(result.item?.refino.nivel).toBe(1);
    expect(result.item?.nome.endsWith('+1')).toBe(true);
  });

  it('falha garantida (roll 0.999) em nível "seguro" (+1..+4) não altera o item', () => {
    const item = makeItem(0);
    const result = resolveRefine(
      fixedRng(0.999),
      item,
      { stoneIds: [], useSeal: false, forjaResultado: 'erro' },
      refinement,
    );
    expect(result.sucesso).toBe(false);
    expect(result.destruido).toBe(false);
    expect(result.item?.refino.nivel).toBe(0);
    expect(result.item?.nome).toBe(item.nome);
  });

  it('falha garantida em nível "arriscado" (+5..+7) rebaixa 1 nível', () => {
    const item = makeItem(5); // próxima tentativa é +6, falha = 'menos1'
    const result = resolveRefine(
      fixedRng(0.999),
      item,
      { stoneIds: [], useSeal: false, forjaResultado: 'erro' },
      refinement,
    );
    expect(result.sucesso).toBe(false);
    expect(result.destruido).toBe(false);
    expect(result.item?.refino.nivel).toBe(4);
  });

  it('falha garantida em nível "perigoso" (+8+) sem selo destrói o item', () => {
    const item = makeItem(7); // próxima tentativa é +8, falha = 'menos1_ou_destroi'
    const result = resolveRefine(
      fixedRng(0.999),
      item,
      { stoneIds: [], useSeal: false, forjaResultado: 'erro' },
      refinement,
    );
    expect(result.sucesso).toBe(false);
    expect(result.destruido).toBe(true);
    expect(result.item).toBeNull();
  });

  it('falha garantida em nível "perigoso" com selo apenas rebaixa 1 nível', () => {
    const item = makeItem(7);
    const result = resolveRefine(
      fixedRng(0.999),
      item,
      { stoneIds: [], useSeal: true, forjaResultado: 'erro' },
      refinement,
    );
    expect(result.sucesso).toBe(false);
    expect(result.destruido).toBe(false);
    expect(result.item?.refino.nivel).toBe(6);
  });

  it('sucesso no nível do cap concede o passivo de refino', () => {
    const item = makeItem(refinement.cap - 1);
    const result = resolveRefine(
      fixedRng(0),
      item,
      { stoneIds: [], useSeal: false, forjaResultado: 'perfeito' },
      refinement,
    );
    expect(result.sucesso).toBe(true);
    expect(result.item?.refino.nivel).toBe(refinement.cap);
    expect(result.item?.refino.passivoRefino).toBe(refinement.passivoRefinoTopo);
  });
});
