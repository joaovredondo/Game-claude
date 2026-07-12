/**
 * Tokens de UI compartilhados entre componentes — ver docs/design/11.
 */
import type { RarityId } from '../core/data/schema';

export const RARITY_VAR: Record<RarityId, string> = {
  common: 'var(--color-rarity-common)',
  uncommon: 'var(--color-rarity-uncommon)',
  rare: 'var(--color-rarity-rare)',
  epic: 'var(--color-rarity-epic)',
  legendary: 'var(--color-rarity-legendary)',
  mythic: 'var(--color-rarity-mythic)',
  divine: 'var(--color-rarity-divine)',
};
