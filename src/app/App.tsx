import { useMemo, useState } from 'react';
import { rarities, refinement, itemDefs } from '../data';
import { createRng, type Rng } from '../core/rng';
import { generateItem } from '../core/items/generate';
import { computeItemStats } from '../core/items/stats';
import type { Item } from '../core/items/types';
import { useGameStore } from '../state/gameStore';
import PhaserMount from '../ui/combat/PhaserMount';
import type { RarityId } from '../core/data/schema';

const RARITY_VAR: Record<RarityId, string> = {
  common: 'var(--color-rarity-common)',
  uncommon: 'var(--color-rarity-uncommon)',
  rare: 'var(--color-rarity-rare)',
  epic: 'var(--color-rarity-epic)',
  legendary: 'var(--color-rarity-legendary)',
  mythic: 'var(--color-rarity-mythic)',
  divine: 'var(--color-rarity-divine)',
};

function RarityChip({ id, nome }: { id: RarityId; nome: string }) {
  const cor = RARITY_VAR[id];
  return (
    <span
      className="rounded-full border px-3 py-1 text-xs font-bold"
      style={{ color: cor, borderColor: cor, boxShadow: `0 0 18px -8px ${cor}` }}
    >
      {nome}
    </span>
  );
}

function rollLoot(rng: Rng, itemLevel: number, count: number): Item[] {
  return Array.from({ length: count }, () => {
    const base = rng.pick(itemDefs.bases);
    return generateItem(rng, {
      base,
      itemLevel,
      rarities,
      afixDefs: itemDefs.afixos,
      refineCap: refinement.cap,
    });
  });
}

function ItemCard({ item }: { item: Item }) {
  const rarityDef = rarities.find((r) => r.id === item.rarity)!;
  const cor = RARITY_VAR[item.rarity];
  const statsFinais = computeItemStats(item.atributosBase, item.afixos);

  return (
    <div
      className="glass flex flex-col gap-2 p-4"
      style={{ borderColor: `${cor}55`, boxShadow: `0 0 24px -16px ${cor}` }}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-display text-sm font-bold" style={{ color: cor }}>
          {item.nome}
        </span>
        <span
          className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{ color: cor, border: `1px solid ${cor}` }}
        >
          {rarityDef.nome}
        </span>
      </div>
      <div className="text-[11px] text-slate-500">
        {item.slot}
        {item.weaponType ? ` · ${item.weaponType}` : ''} · nível {item.nivelRequerido} · iLvl{' '}
        {item.itemLevel}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-300">
        {Object.entries(statsFinais).map(([stat, valor]) => (
          <span key={stat}>
            <span className="text-slate-500">{stat}</span> {valor}
          </span>
        ))}
      </div>
      {item.afixos.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1">
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
    </div>
  );
}

function SystemCard({
  titulo,
  status,
  children,
}: {
  titulo: string;
  status: string;
  children: React.ReactNode;
}) {
  return (
    <div className="glass p-5">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-display text-sm font-bold text-white">{titulo}</h3>
        <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
          {status}
        </span>
      </div>
      <div className="text-sm text-slate-300">{children}</div>
    </div>
  );
}

export default function App() {
  const seed = useGameStore((s) => s.seed);
  const reseed = useGameStore((s) => s.reseed);
  const [showScene, setShowScene] = useState(true);
  const [lootSeed, setLootSeed] = useState(seed);
  const loot = useMemo(() => rollLoot(createRng(lootSeed), 40, 6), [lootSeed]);

  // Demonstra o RNG determinístico: mesma semente → mesma sequência.
  const rolls = useMemo(() => {
    const rng = createRng(seed);
    return Array.from({ length: 6 }, () => rng.int(1, 100));
  }, [seed]);

  const previaTiers = refinement.tiers.slice(0, 6);

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-10">
        <div className="mb-3 text-xs font-bold tracking-[0.35em] text-cyan-300">
          FASE 1 · NÚCLEO DE ITENS ONLINE
        </div>
        <h1 className="title-gradient font-display text-6xl font-black tracking-tight">
          AETHERFORGE
        </h1>
        <p className="mt-2 text-lg font-semibold text-slate-300">Caçadores da Fratura</p>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400">
          Base técnica do jogo no ar: dados <strong className="text-slate-200">data-driven</strong>{' '}
          validados, RNG determinístico e semeado, e o seam de{' '}
          <strong className="text-slate-200">cena (Phaser)</strong> pronto para o combate em ação.
        </p>
      </header>

      {/* Sistemas da Fase 0 */}
      <section className="mb-10 grid gap-4 sm:grid-cols-3">
        <SystemCard titulo="Dados validados" status="OK">
          {rarities.length} raridades · {itemDefs.bases.length} bases · {itemDefs.afixos.length}{' '}
          afixos · refino cap +{refinement.cap}
        </SystemCard>
        <SystemCard titulo="RNG semeado" status="OK">
          semente <code className="text-cyan-300">{seed}</code> → [{rolls.join(', ')}]
          <button
            onClick={reseed}
            className="mt-3 block rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
          >
            Nova semente
          </button>
        </SystemCard>
        <SystemCard titulo="Cena (Phaser)" status="PRONTO">
          Camada de ação preparada para o combate em cena (Fase 4).
        </SystemCard>
      </section>

      {/* Raridades data-driven */}
      <section className="mb-10">
        <h2 className="mb-3 font-display text-lg font-bold text-white">Raridades</h2>
        <div className="flex flex-wrap gap-2">
          {rarities.map((r) => (
            <RarityChip key={r.id} id={r.id} nome={r.nome} />
          ))}
        </div>
      </section>

      {/* Núcleo de Itens (Fase 1) */}
      <section className="mb-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white">
            Núcleo de Itens — geração ao vivo
          </h2>
          <button
            onClick={() => setLootSeed((s) => s + 1)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
          >
            Rolar loot (iLvl 40)
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {loot.map((item) => (
            <ItemCard key={item.uid} item={item} />
          ))}
        </div>
      </section>

      {/* Prévia do refino */}
      <section className="mb-10">
        <h2 className="mb-3 font-display text-lg font-bold text-white">
          Refino — prévia dos dados
        </h2>
        <div className="glass overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-left text-xs text-slate-400">
                <th className="px-4 py-2">Nível-alvo</th>
                <th className="px-4 py-2">Chance base</th>
                <th className="px-4 py-2">Em caso de falha</th>
                <th className="px-4 py-2">Custo (ouro)</th>
              </tr>
            </thead>
            <tbody>
              {previaTiers.map((t) => (
                <tr key={t.nivelAlvo} className="border-t border-white/5">
                  <td className="px-4 py-2 font-bold text-white">+{t.nivelAlvo}</td>
                  <td className="px-4 py-2 text-cyan-300">{Math.round(t.chanceBase * 100)}%</td>
                  <td className="px-4 py-2 text-slate-400">
                    {t.falha === 'nada'
                      ? 'seguro'
                      : t.falha === 'menos1'
                        ? '−1 nível'
                        : '−1 ou destrói'}
                  </td>
                  <td className="px-4 py-2 text-slate-300">{t.custoOuro.toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Cena de demonstração (Phaser) */}
      <section className="mb-10">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-white">Cena de combate — prévia</h2>
          <button
            onClick={() => setShowScene((v) => !v)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/10"
          >
            {showScene ? 'Ocultar' : 'Mostrar'} cena
          </button>
        </div>
        {showScene && (
          <div className="glass p-4">
            <PhaserMount />
            <p className="mt-3 text-center text-xs text-slate-500">
              Renderizado pelo Phaser — placeholder do combate em ação (Fase 4).
            </p>
          </div>
        )}
      </section>

      <footer className="border-t border-white/10 pt-6 text-xs text-slate-500">
        Aetherforge · Fases 0–1 concluídas · veja <code>docs/ROADMAP.md</code> e{' '}
        <code>docs/FEATURES.md</code>.
      </footer>
    </main>
  );
}
