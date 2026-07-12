/**
 * Card de item reutilizável — usado na geração de loot (Fase 1), no
 * inventário e no equipamento (Fase 2). Ver docs/design/11 (design system).
 */
import type { Item } from '../../core/items/types';
import { resolveItemStats } from '../../core/items/stats';
import { rarities, refinement } from '../../data';
import { RARITY_VAR } from '../theme';

export interface ItemCardActions {
  onEquip?: () => void;
  onUnequip?: () => void;
  onToggleLock?: () => void;
  onDiscard?: () => void;
}

interface ItemCardProps {
  item: Item;
  /** Item equipado no mesmo slot, para mostrar o delta de stats (comparação). */
  compareTo?: Item;
  actions?: ItemCardActions;
  selected?: boolean;
  onToggleSelect?: () => void;
}

function ActionButton({
  onClick,
  label,
  tone,
}: {
  onClick: () => void;
  label: string;
  tone?: 'danger';
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded px-2 py-1 text-[10px] font-semibold transition ${
        tone === 'danger'
          ? 'bg-red-500/10 text-red-300 hover:bg-red-500/20'
          : 'bg-white/5 text-slate-200 hover:bg-white/10'
      }`}
    >
      {label}
    </button>
  );
}

export default function ItemCard({
  item,
  compareTo,
  actions,
  selected,
  onToggleSelect,
}: ItemCardProps) {
  const rarityDef = rarities.find((r) => r.id === item.rarity)!;
  const cor = RARITY_VAR[item.rarity];
  const stats = resolveItemStats(item, refinement);
  const statsCompare = compareTo ? resolveItemStats(compareTo, refinement) : null;

  const hasFooter = Boolean(actions) || Boolean(onToggleSelect);

  return (
    <div
      className="glass flex flex-col gap-2 p-4"
      style={{
        borderColor: `${cor}55`,
        boxShadow: selected ? `0 0 0 2px ${cor}` : `0 0 24px -16px ${cor}`,
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-display text-sm font-bold" style={{ color: cor }}>
          {item.nome}
        </span>
        <div className="flex shrink-0 items-center gap-1.5">
          {item.bloqueado && (
            <span title="Trancado" className="text-[11px]">
              🔒
            </span>
          )}
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{ color: cor, border: `1px solid ${cor}` }}
          >
            {rarityDef.nome}
          </span>
        </div>
      </div>

      <div className="text-[11px] text-slate-500">
        {item.slot}
        {item.weaponType ? ` · ${item.weaponType}` : ''} · nível {item.nivelRequerido} · iLvl{' '}
        {item.itemLevel}
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-300">
        {Object.entries(stats).map(([stat, valor]) => {
          const delta = statsCompare ? valor - (statsCompare[stat] ?? 0) : null;
          return (
            <span key={stat}>
              <span className="text-slate-500">{stat}</span> {valor}
              {delta !== null && delta !== 0 && (
                <span className={delta > 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {' '}
                  ({delta > 0 ? '+' : ''}
                  {delta})
                </span>
              )}
            </span>
          );
        })}
      </div>

      {item.afixos.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.afixos.map((a) => (
            <span
              key={a.affixId}
              className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-400"
            >
              {a.tipo === 'prefixo' ? '↑' : '↓'} {a.affixId} +{a.valor}
            </span>
          ))}
        </div>
      )}

      {hasFooter && (
        <div className="mt-1 flex flex-wrap items-center gap-1.5 border-t border-white/5 pt-2">
          {onToggleSelect && (
            <button
              onClick={onToggleSelect}
              className={`rounded px-2 py-1 text-[10px] font-semibold transition ${
                selected ? 'bg-cyan-400/20 text-cyan-300' : 'bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {selected ? 'Selecionado' : 'Selecionar'}
            </button>
          )}
          {actions?.onEquip && <ActionButton onClick={actions.onEquip} label="Equipar" />}
          {actions?.onUnequip && <ActionButton onClick={actions.onUnequip} label="Desequipar" />}
          {actions?.onToggleLock && (
            <ActionButton onClick={actions.onToggleLock} label={item.bloqueado ? 'Destrancar' : 'Trancar'} />
          )}
          {actions?.onDiscard && (
            <ActionButton onClick={actions.onDiscard} label="Descartar" tone="danger" />
          )}
        </div>
      )}
    </div>
  );
}
