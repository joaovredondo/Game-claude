/**
 * Representação visual de um item — arte ilustrada quando existir em
 * `public/items/{icon}.png` (ver docs/design/14-arte-de-itens.md), com
 * fallback gracioso para um ícone vetorial por tipo de arma/slot enquanto
 * a arte real não foi gerada.
 *
 * Detalhes de robustez (evitam o glifo nativo de "imagem quebrada" e
 * requisições 404 repetidas a cada remount):
 * - o SVG de fallback fica sempre montado por baixo; a <img> fica por cima
 *   com opacity 0 até o onLoad — se ela falhar, nunca é revelada.
 * - ids que já falharam uma vez ficam num Set em memória (módulo) e não
 *   tentam a rede de novo na mesma sessão.
 */
import { useState } from 'react';
import type { RarityId, Slot, WeaponType } from '../../core/data/schema';
import { FALLBACK_ICON_COMPONENTS, resolveFallbackIconKey } from '../icons';
import { RARITY_VAR } from '../theme';

const missingIcons = new Set<string>();

interface ItemArtProps {
  /** Ausente para slots de equipamento vazios (modo "ghost", sem glow de raridade). */
  icon?: string;
  slot: Slot;
  weaponType?: WeaponType;
  rarity?: RarityId;
  size?: 'sm' | 'lg';
}

const SIZE_CLASSES: Record<NonNullable<ItemArtProps['size']>, string> = {
  sm: 'h-12 w-12',
  lg: 'aspect-square w-full',
};

export default function ItemArt({ icon, slot, weaponType, rarity, size = 'sm' }: ItemArtProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(() => Boolean(icon) && missingIcons.has(icon!));

  const FallbackIcon = FALLBACK_ICON_COMPONENTS[resolveFallbackIconKey(slot, weaponType)];
  const cor = rarity ? RARITY_VAR[rarity] : undefined;
  const iconSrc = icon && !failed ? `/items/${icon}.png` : null;

  return (
    <div
      className={`relative shrink-0 overflow-hidden rounded-lg border ${SIZE_CLASSES[size]}`}
      style={{
        borderColor: cor ? `${cor}55` : 'rgba(255,255,255,0.08)',
        boxShadow: cor ? `0 0 16px -10px ${cor}` : undefined,
        background: 'rgba(255,255,255,0.03)',
      }}
    >
      <FallbackIcon
        className="absolute inset-0 h-full w-full p-2.5"
        style={{ color: cor ?? 'rgba(255,255,255,0.25)' }}
      />
      {iconSrc && (
        <img
          src={iconSrc}
          alt=""
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => {
            missingIcons.add(icon!);
            setFailed(true);
          }}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
}
