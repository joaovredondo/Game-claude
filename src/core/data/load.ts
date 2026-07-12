/**
 * Carregamento + validação dos dados data-driven.
 * Converte JSON cru (unknown) em estruturas tipadas, falhando cedo e com
 * mensagem legível se algo estiver fora do schema.
 */
import { z } from 'zod';
import {
  raritiesFileSchema,
  refinementFileSchema,
  itemsFileSchema,
  type RarityDef,
  type RefinementConfig,
  type ItemBase,
  type AffixDef,
} from './schema';

function parseOrThrow<T>(schema: z.ZodType<T>, data: unknown, nome: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.') || '(raiz)'}: ${i.message}`)
      .join('\n');
    throw new Error(`Dados inválidos em "${nome}":\n${issues}`);
  }
  return result.data;
}

export function parseRarities(data: unknown): RarityDef[] {
  return parseOrThrow(raritiesFileSchema, data, 'rarities.json').rarities;
}

export function parseRefinement(data: unknown): RefinementConfig {
  return parseOrThrow(refinementFileSchema, data, 'refinement.json');
}

export function parseItems(data: unknown): { bases: ItemBase[]; afixos: AffixDef[] } {
  return parseOrThrow(itemsFileSchema, data, 'items.sample.json');
}
