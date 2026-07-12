/**
 * Resolução do ícone de fallback (sem arte ilustrada disponível ainda).
 * `resolveFallbackIconKey` é pura e testável isoladamente; o mapeamento
 * chave → componente SVG fica na camada de UI (`registry.tsx`-adjacent),
 * evitando testar JSX diretamente.
 */
import type { Slot, WeaponType } from '../../core/data/schema';

export type FallbackIconKey =
  | 'sword'
  | 'axe'
  | 'bow'
  | 'mace'
  | 'weaponGeneric'
  | 'helmet'
  | 'chest'
  | 'gloves'
  | 'boots'
  | 'wings'
  | 'ring'
  | 'amulet'
  | 'offhand';

const WEAPON_TYPE_TO_KEY: Record<WeaponType, FallbackIconKey> = {
  sword: 'sword',
  axe: 'axe',
  bow: 'bow',
  mace: 'mace',
};

// Record (não Partial) força o TS a cobrir todo slot não-arma — se um novo
// Slot for adicionado ao schema, este arquivo para de compilar até ser atualizado.
const SLOT_TO_KEY: Record<Exclude<Slot, 'weapon'>, FallbackIconKey> = {
  offhand: 'offhand',
  helmet: 'helmet',
  chest: 'chest',
  gloves: 'gloves',
  boots: 'boots',
  wings: 'wings',
  ring: 'ring',
  amulet: 'amulet',
};

/**
 * Escolhe qual ícone de fallback usar. Caso de borda: slot `weapon` sem
 * `weaponType` conhecido (ex.: slot de arma vazio no EquipmentPanel, onde
 * nenhum item está equipado ainda) cai em `weaponGeneric`.
 */
export function resolveFallbackIconKey(slot: Slot, weaponType?: WeaponType): FallbackIconKey {
  if (slot === 'weapon') {
    return weaponType ? WEAPON_TYPE_TO_KEY[weaponType] : 'weaponGeneric';
  }
  return SLOT_TO_KEY[slot];
}
