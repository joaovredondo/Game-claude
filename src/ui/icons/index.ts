/**
 * Mapa chave → componente SVG. Fica fora de `registry.ts` para manter a
 * lógica de resolução (`resolveFallbackIconKey`) livre de JSX e testável
 * sem `@testing-library/react`.
 */
import type { ComponentType, SVGProps } from 'react';
import {
  SwordIcon,
  AxeIcon,
  BowIcon,
  MaceIcon,
  WeaponGenericIcon,
  HelmetIcon,
  ChestIcon,
  GlovesIcon,
  BootsIcon,
  WingsIcon,
  RingIcon,
  AmuletIcon,
  OffhandIcon,
} from './itemIcons';
import type { FallbackIconKey } from './registry';

export { resolveFallbackIconKey } from './registry';
export type { FallbackIconKey } from './registry';

export const FALLBACK_ICON_COMPONENTS: Record<FallbackIconKey, ComponentType<SVGProps<SVGSVGElement>>> = {
  sword: SwordIcon,
  axe: AxeIcon,
  bow: BowIcon,
  mace: MaceIcon,
  weaponGeneric: WeaponGenericIcon,
  helmet: HelmetIcon,
  chest: ChestIcon,
  gloves: GlovesIcon,
  boots: BootsIcon,
  wings: WingsIcon,
  ring: RingIcon,
  amulet: AmuletIcon,
  offhand: OffhandIcon,
};
