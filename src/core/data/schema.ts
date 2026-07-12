/**
 * Schemas zod dos dados data-driven (data/*.json).
 * Os tipos derivados são a fonte da verdade em runtime — se um JSON estiver
 * malformado, o load falha cedo com mensagem clara (ver docs/design/13).
 */
import { z } from 'zod';

/* ---------- Raridade ---------- */
export const rarityIdSchema = z.enum([
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
  'mythic',
  'divine',
]);
export type RarityId = z.infer<typeof rarityIdSchema>;

export const rarityDefSchema = z.object({
  id: rarityIdSchema,
  nome: z.string(),
  cor: z.string().regex(/^#([0-9a-fA-F]{6})$/, 'cor deve ser hex #RRGGBB'),
  numAfixos: z.number().int().min(0),
  multStats: z.number().positive(),
  pisoRolagem: z.number().min(0).max(1),
  pesoDropBase: z.number().min(0),
});
export type RarityDef = z.infer<typeof rarityDefSchema>;

export const raritiesFileSchema = z.object({
  rarities: z.array(rarityDefSchema).min(1),
});

/* ---------- Refino ---------- */
export const refineFailureSchema = z.enum(['nada', 'menos1', 'menos1_ou_destroi']);

export const refineTierSchema = z.object({
  nivelAlvo: z.number().int().positive(),
  chanceBase: z.number().min(0).max(1),
  falha: refineFailureSchema,
  custoOuro: z.number().min(0),
});
export type RefineTier = z.infer<typeof refineTierSchema>;

export const stoneDefSchema = z.object({
  id: z.string(),
  nome: z.string(),
  bonusChance: z.number(),
});
export type StoneDef = z.infer<typeof stoneDefSchema>;

export const refinementFileSchema = z.object({
  cap: z.number().int().positive(),
  tiers: z.array(refineTierSchema).min(1),
  stones: z.array(stoneDefSchema).min(1),
  fatoresPedra: z.array(z.number()).min(1),
  maxPedrasPorTentativa: z.number().int().positive(),
  seloProtecao: z.object({ id: z.string(), nome: z.string(), efeito: z.string() }),
  forjaAtiva: z.object({
    bonusPerfeito: z.number(),
    bonusBom: z.number(),
    bonusErro: z.number(),
    larguraBasePerfeito: z.number(),
    reducaoLarguraPorNivel: z.number(),
    aumentoLarguraPorQualidadePedra: z.number(),
  }),
  bonusStatsPorNivel: z.record(z.string(), z.number()),
  passivoRefinoTopo: z.string(),
});
export type RefinementConfig = z.infer<typeof refinementFileSchema>;

/* ---------- Itens (bases + afixos) ---------- */
export const slotSchema = z.enum([
  'weapon',
  'offhand',
  'helmet',
  'chest',
  'gloves',
  'boots',
  'wings',
  'ring',
  'amulet',
]);
export type Slot = z.infer<typeof slotSchema>;

export const weaponTypeSchema = z.enum(['sword', 'axe', 'bow', 'mace']);
export type WeaponType = z.infer<typeof weaponTypeSchema>;

const rangeSchema = z.tuple([z.number(), z.number()]);

export const itemBaseSchema = z.object({
  id: z.string(),
  nome: z.string(),
  slot: slotSchema,
  weaponType: weaponTypeSchema.optional(),
  icon: z.string(),
  nivelRequeridoBase: z.number().int().min(0),
  tierTematico: z.number().int().min(0),
  faixasBase: z.record(z.string(), rangeSchema),
  poolAfixos: z.object({ prefixos: z.array(z.string()), sufixos: z.array(z.string()) }),
  passivoRaridade: z.string().optional(),
});
export type ItemBase = z.infer<typeof itemBaseSchema>;

export const affixDefSchema = z.object({
  id: z.string(),
  nome: z.string(),
  tipo: z.enum(['prefixo', 'sufixo']),
  stat: z.string(),
  faixa: rangeSchema,
  slotsPermitidos: z.array(slotSchema),
});
export type AffixDef = z.infer<typeof affixDefSchema>;

export const itemsFileSchema = z.object({
  bases: z.array(itemBaseSchema).min(1),
  afixos: z.array(affixDefSchema).min(1),
});
