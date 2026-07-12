/**
 * Painel de equipamento — 9 slots, stats agregados e Gear Score.
 * Ver docs/design/02 e docs/design/04.
 */
import type { Slot } from '../../core/data/schema';
import type { Item } from '../../core/items/types';
import { computeCharacterStats } from '../../core/equipment/stats';
import { computeTotalGearScore, DEFAULT_GEAR_SCORE_WEIGHTS } from '../../core/items/gearScore';
import { useInventoryStore } from '../../state/inventoryStore';
import { refinement } from '../../data';
import { RARITY_VAR } from '../theme';
import ItemArt from '../components/ItemArt';

const SLOT_LABELS: Record<Slot, string> = {
  weapon: 'Arma',
  offhand: 'Off-hand',
  helmet: 'Elmo',
  chest: 'Armadura',
  gloves: 'Manoplas',
  boots: 'Botas',
  wings: 'Asas',
  ring: 'Anel',
  amulet: 'Amuleto',
};

const SLOT_ORDER: Slot[] = [
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

export default function EquipmentPanel() {
  const inventory = useInventoryStore((s) => s.inventory);
  const equipment = useInventoryStore((s) => s.equipment);
  const characterLevel = useInventoryStore((s) => s.characterLevel);
  const setCharacterLevel = useInventoryStore((s) => s.setCharacterLevel);
  const unequipItem = useInventoryStore((s) => s.unequipItem);

  const byUid = new Map(inventory.map((i) => [i.uid, i]));
  const equippedItems: Item[] = SLOT_ORDER.map((slot) => {
    const uid = equipment[slot];
    return uid ? byUid.get(uid) : undefined;
  }).filter((i): i is Item => Boolean(i));

  const stats = computeCharacterStats(equippedItems, refinement);
  const gearScore = computeTotalGearScore(equippedItems, DEFAULT_GEAR_SCORE_WEIGHTS, refinement);

  return (
    <div className="glass p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-sm font-bold text-white">Personagem</h3>
          <div className="mt-1 text-xs text-slate-400">
            Gear Score <span className="font-bold text-cyan-300">{gearScore}</span>
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-400">
          Nível (placeholder até a Fase 5)
          <input
            type="number"
            min={1}
            value={characterLevel}
            onChange={(e) => setCharacterLevel(Number(e.target.value) || 1)}
            className="w-16 rounded border border-white/10 bg-white/5 px-2 py-1 text-white"
          />
        </label>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
        {SLOT_ORDER.map((slot) => {
          const uid = equipment[slot];
          const item = uid ? byUid.get(uid) : undefined;
          return (
            <div
              key={slot}
              className="rounded-lg border border-white/10 bg-white/[0.02] p-2 text-center"
            >
              <div className="mb-1 text-[10px] uppercase tracking-wide text-slate-500">
                {SLOT_LABELS[slot]}
              </div>
              <ItemArt
                icon={item?.icon}
                slot={slot}
                weaponType={item?.weaponType}
                rarity={item?.rarity}
                size="lg"
              />
              {item ? (
                <>
                  <div
                    className="mt-1 truncate text-xs font-semibold"
                    style={{ color: RARITY_VAR[item.rarity] }}
                    title={item.nome}
                  >
                    {item.nome}
                  </div>
                  <button
                    onClick={() => unequipItem(slot)}
                    className="mt-1 text-[10px] text-slate-500 underline hover:text-slate-300"
                  >
                    remover
                  </button>
                </>
              ) : (
                <div className="mt-1 text-xs text-slate-600">vazio</div>
              )}
            </div>
          );
        })}
      </div>

      {Object.keys(stats).length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-white/5 pt-3 text-xs text-slate-300">
          {Object.entries(stats).map(([stat, valor]) => (
            <span key={stat}>
              <span className="text-slate-500">{stat}</span> {valor}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
