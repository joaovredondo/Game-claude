/**
 * Forja Ativa — cálculo de chance e resolução de refino. Ver
 * docs/design/05 para as regras completas e a tabela de referência.
 */
import type { Rng } from '../rng';
import type { RefinementConfig, RefineTier } from '../data/schema';
import { withRefineSuffix } from '../items/generate';
import type { Item } from '../items/types';

export type ForjaResultado = 'perfeito' | 'bom' | 'erro' | 'auto';

export interface RefineAttemptOptions {
  /** Ids de pedra (repetíveis), até `config.maxPedrasPorTentativa`. */
  stoneIds: readonly string[];
  /** Selo de Proteção incluído na tentativa (evita destruição em falhas perigosas). */
  useSeal: boolean;
  /** Resultado da mini-mecânica de precisão (ou 'auto' no modo acessível). */
  forjaResultado: ForjaResultado;
}

export interface RefineResult {
  sucesso: boolean;
  destruido: boolean;
  chanceFinal: number;
  nivelAlvo: number;
  /** Item resultante (nível +1, -1 ou inalterado); `null` somente quando destruído. */
  item: Item | null;
}

/** Busca a configuração de um nível-alvo de refino (+1..+cap). */
export function getRefineTier(config: RefinementConfig, nivelAlvo: number): RefineTier | undefined {
  return config.tiers.find((t) => t.nivelAlvo === nivelAlvo);
}

/** Um item pode ser refinado enquanto não atingir o cap. */
export function canRefine(item: Item): boolean {
  return item.refino.nivel < item.refino.cap;
}

/**
 * Bônus de chance somado pelas pedras, com retorno decrescente por posição
 * (não por tipo): a pedra de maior bônus sempre absorve o fator mais
 * favorável, para que a ordem de seleção não vire uma pegadinha de UI.
 */
export function computeStoneBonus(
  stoneIds: readonly string[],
  config: RefinementConfig,
): number {
  const stonesById = new Map(config.stones.map((s) => [s.id, s]));
  const bonuses = stoneIds
    .slice(0, config.maxPedrasPorTentativa)
    .map((id) => stonesById.get(id)?.bonusChance ?? 0)
    .sort((a, b) => b - a);

  return bonuses.reduce((soma, bonus, i) => soma + bonus * (config.fatoresPedra[i] ?? 0), 0);
}

/** Bônus de chance ganho na mini-mecânica de precisão (Forja Ativa). */
export function computeForjaAtivaBonus(
  resultado: ForjaResultado,
  config: RefinementConfig,
): number {
  switch (resultado) {
    case 'perfeito':
      return config.forjaAtiva.bonusPerfeito;
    case 'bom':
      return config.forjaAtiva.bonusBom;
    case 'erro':
      return config.forjaAtiva.bonusErro;
    case 'auto':
      // Modo acessível (sem mini-jogo): usa a média entre perfeito e bom.
      return (config.forjaAtiva.bonusPerfeito + config.forjaAtiva.bonusBom) / 2;
  }
}

/** Chance final de sucesso, já com pedras e Forja Ativa somadas e limitada a [1%, 100%]. */
export function computeFinalChance(
  chanceBase: number,
  stoneIds: readonly string[],
  forjaResultado: ForjaResultado,
  config: RefinementConfig,
): number {
  const total =
    chanceBase + computeStoneBonus(stoneIds, config) + computeForjaAtivaBonus(forjaResultado, config);
  return Math.min(1, Math.max(0.01, total));
}

/**
 * Largura da zona "perfeita" da Forja Ativa: menor em níveis mais altos,
 * um pouco maior quando pelo menos uma pedra está em uso (ela "estabiliza"
 * a forja). Ver docs/design/05 §4.
 */
export function computeHotZoneWidth(
  nivelAlvo: number,
  stoneIds: readonly string[],
  config: RefinementConfig,
): number {
  const stonesById = new Map(config.stones.map((s) => [s.id, s]));
  const usaPedra = stoneIds.some((id) => (stonesById.get(id)?.bonusChance ?? 0) > 0);
  const larguraBase =
    config.forjaAtiva.larguraBasePerfeito - config.forjaAtiva.reducaoLarguraPorNivel * nivelAlvo;
  const bonusPedra = usaPedra ? config.forjaAtiva.aumentoLarguraPorQualidadePedra : 0;
  const MIN_WIDTH = 0.04; // piso de jogabilidade — nunca fica impossível de acertar
  return Math.max(MIN_WIDTH, larguraBase + bonusPedra);
}

/**
 * Resolve uma tentativa de refino. Não valida posse de recursos (ouro,
 * pedras, selo) — isso é responsabilidade de quem chama (a store), que já
 * sabe o inventário do jogador. Lança erro apenas se o item já estiver no
 * cap, condição que a UI deve impedir antes de chegar aqui.
 */
export function resolveRefine(
  rng: Rng,
  item: Item,
  options: RefineAttemptOptions,
  config: RefinementConfig,
): RefineResult {
  if (!canRefine(item)) {
    throw new Error(`resolveRefine: item já está no cap (+${item.refino.nivel})`);
  }

  const nivelAlvo = item.refino.nivel + 1;
  const tier = getRefineTier(config, nivelAlvo);
  if (!tier) throw new Error(`resolveRefine: sem configuração de tier para +${nivelAlvo}`);

  const chanceFinal = computeFinalChance(tier.chanceBase, options.stoneIds, options.forjaResultado, config);
  const sucesso = rng.next() < chanceFinal;

  if (sucesso) {
    const atingiuCap = nivelAlvo >= config.cap;
    const refino = {
      ...item.refino,
      nivel: nivelAlvo,
      ...(atingiuCap ? { passivoRefino: config.passivoRefinoTopo } : {}),
    };
    return {
      sucesso: true,
      destruido: false,
      chanceFinal,
      nivelAlvo,
      item: { ...item, refino, nome: withRefineSuffix(item.nome, nivelAlvo) },
    };
  }

  if (tier.falha === 'nada') {
    return { sucesso: false, destruido: false, chanceFinal, nivelAlvo, item };
  }

  const rebaixaSemDestruir = tier.falha === 'menos1' || (tier.falha === 'menos1_ou_destroi' && options.useSeal);
  if (rebaixaSemDestruir) {
    const novoNivel = Math.max(0, item.refino.nivel - 1);
    const refino = { ...item.refino, nivel: novoNivel };
    return {
      sucesso: false,
      destruido: false,
      chanceFinal,
      nivelAlvo,
      item: { ...item, refino, nome: withRefineSuffix(item.nome, novoNivel) },
    };
  }

  // 'menos1_ou_destroi' sem Selo de Proteção.
  return { sucesso: false, destruido: true, chanceFinal, nivelAlvo, item: null };
}
