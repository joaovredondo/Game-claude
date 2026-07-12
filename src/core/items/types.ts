/**
 * Tipos de instância de item (runtime), distintos das *Def (moldes/config)
 * que vêm de core/data/schema.ts. Ver docs/design/13-modelo-de-dados.md.
 */
import type { RarityId, Slot, WeaponType } from '../data/schema';

export interface AffixRoll {
  affixId: string;
  tipo: 'prefixo' | 'sufixo';
  stat: string;
  valor: number;
}

export interface RefineState {
  nivel: number;
  cap: number;
  passivoRefino?: string;
}

export interface Item {
  uid: string;
  baseId: string;
  nome: string;
  slot: Slot;
  weaponType?: WeaponType;
  rarity: RarityId;
  itemLevel: number;
  nivelRequerido: number;
  atributosBase: Record<string, number>;
  afixos: AffixRoll[];
  refino: RefineState;
  bloqueado: boolean;
}
