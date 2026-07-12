/**
 * Tela de inventário — grid, filtros, comparação e ações (equipar, trancar,
 * descartar, fundir em massa). Ver docs/design/02 e docs/design/11.
 */
import { useMemo, useState } from 'react';
import type { Slot } from '../../core/data/schema';
import { filterItems } from '../../core/items/filter';
import { useInventoryStore } from '../../state/inventoryStore';
import { rarities } from '../../data';
import ItemCard from '../components/ItemCard';

const SLOT_OPTIONS: Array<Slot | 'all'> = [
  'all',
  'weapon',
  'offhand',
  'helmet',
  'chest',
  'gloves',
  'boots',
  'wings',
  'ring',
  'amulet',
];

export default function InventoryScreen() {
  const inventory = useInventoryStore((s) => s.inventory);
  const equipment = useInventoryStore((s) => s.equipment);
  const equipItem = useInventoryStore((s) => s.equipItem);
  const unequipItem = useInventoryStore((s) => s.unequipItem);
  const toggleLock = useInventoryStore((s) => s.toggleLock);
  const discardItem = useInventoryStore((s) => s.discardItem);
  const fuseItems = useInventoryStore((s) => s.fuseItems);

  const [slotFilter, setSlotFilter] = useState<Slot | 'all'>('all');
  const [minRarityIndex, setMinRarityIndex] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [feedback, setFeedback] = useState<string | null>(null);

  const equippedUids = useMemo(() => new Set(Object.values(equipment)), [equipment]);
  const byUid = useMemo(() => new Map(inventory.map((i) => [i.uid, i])), [inventory]);

  const visible = useMemo(
    () =>
      filterItems(inventory, rarities, {
        slot: slotFilter === 'all' ? undefined : slotFilter,
        minRarityIndex: minRarityIndex || undefined,
      }),
    [inventory, slotFilter, minRarityIndex],
  );

  function toggleSelect(uid: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  }

  function handleFuse() {
    const summary = fuseItems([...selected]);
    setSelected(new Set());
    setFeedback(
      `Fundidos ${summary.fundidos} · ignorados ${summary.ignorados} (trancados/equipados) · +${summary.recursoGanho} pó de forja`,
    );
  }

  return (
    <div className="glass p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-sm font-bold text-white">
          Inventário ({inventory.length})
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={slotFilter}
            onChange={(e) => setSlotFilter(e.target.value as Slot | 'all')}
            className="rounded border border-white/10 bg-white/5 px-2 py-1 text-slate-200"
          >
            {SLOT_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === 'all' ? 'Todos os slots' : s}
              </option>
            ))}
          </select>
          <select
            value={minRarityIndex}
            onChange={(e) => setMinRarityIndex(Number(e.target.value))}
            className="rounded border border-white/10 bg-white/5 px-2 py-1 text-slate-200"
          >
            <option value={0}>Qualquer raridade</option>
            {rarities.map((r, i) => (
              <option key={r.id} value={i}>
                ≥ {r.nome}
              </option>
            ))}
          </select>
          {selected.size > 0 && (
            <button
              onClick={handleFuse}
              className="rounded bg-amber-400/10 px-3 py-1 font-semibold text-amber-300 transition hover:bg-amber-400/20"
            >
              Fundir {selected.size} item(ns)
            </button>
          )}
        </div>
      </div>

      {feedback && <div className="mb-3 text-xs text-slate-400">{feedback}</div>}

      {visible.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500">
          Nenhum item encontrado. Role loot na seção acima.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((item) => {
            const isEquipped = equippedUids.has(item.uid);
            const equipadoNoSlot = equipment[item.slot];
            const compareTo =
              !isEquipped && equipadoNoSlot ? byUid.get(equipadoNoSlot) : undefined;

            return (
              <ItemCard
                key={item.uid}
                item={item}
                compareTo={compareTo}
                selected={selected.has(item.uid)}
                onToggleSelect={() => toggleSelect(item.uid)}
                actions={{
                  onEquip: isEquipped
                    ? undefined
                    : () => {
                        const result = equipItem(item.uid);
                        if (!result.ok) setFeedback(`Não foi possível equipar: ${result.reason}`);
                      },
                  onUnequip: isEquipped ? () => unequipItem(item.slot) : undefined,
                  onToggleLock: () => toggleLock(item.uid),
                  onDiscard: () => {
                    const result = discardItem(item.uid);
                    if (!result.ok) setFeedback(`Não foi possível descartar: ${result.reason}`);
                  },
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
