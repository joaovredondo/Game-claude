/**
 * Tela da Forja — seleção de item, pedras/selo, Forja Ativa e confirmação.
 * Ver docs/design/05 e docs/design/11.
 */
import { useMemo, useState } from 'react';
import { refinement } from '../../data';
import { useInventoryStore } from '../../state/inventoryStore';
import { computeFinalChance, computeHotZoneWidth, getRefineTier } from '../../core/refine/refine';
import type { ForjaResultado } from '../../core/refine/refine';
import { RARITY_VAR } from '../theme';
import ForgeMeter, { type ForjaPreciso } from './ForgeMeter';

const STONE_LABELS: Record<string, string> = {
  pedra_bruta: 'Pedra Bruta',
  pedra_polida: 'Pedra Polida',
  pedra_arcana: 'Pedra Arcana',
  pedra_estelar: 'Pedra Estelar',
};

export default function ForgeScreen() {
  const inventory = useInventoryStore((s) => s.inventory);
  const recursos = useInventoryStore((s) => s.recursos);
  const refineItem = useInventoryStore((s) => s.refineItem);
  const refineLog = useInventoryStore((s) => s.refineLog);

  const refinaveis = inventory.filter((i) => i.refino.nivel < i.refino.cap && !i.bloqueado);

  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const item = refinaveis.find((i) => i.uid === selectedUid) ?? refinaveis[0] ?? null;

  const [stoneCounts, setStoneCounts] = useState<Record<string, number>>({});
  const [useSeal, setUseSeal] = useState(false);
  const [autoForja, setAutoForja] = useState(false);
  const [forjaPreciso, setForjaPreciso] = useState<ForjaPreciso | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const stoneIds = useMemo(
    () => Object.entries(stoneCounts).flatMap(([id, qtd]) => Array(qtd).fill(id)),
    [stoneCounts],
  );
  const totalPedras = stoneIds.length;

  const nivelAlvo = item ? item.refino.nivel + 1 : null;
  const tier = item && nivelAlvo ? getRefineTier(refinement, nivelAlvo) : undefined;
  const hotZoneWidth = nivelAlvo ? computeHotZoneWidth(nivelAlvo, stoneIds, refinement) : 0;

  const forjaResultado: ForjaResultado = autoForja ? 'auto' : (forjaPreciso ?? 'erro');
  const chancePreview = tier
    ? computeFinalChance(tier.chanceBase, stoneIds, forjaResultado, refinement)
    : 0;
  const chanceSemForja = tier ? computeFinalChance(tier.chanceBase, stoneIds, 'erro', refinement) : 0;

  const podeConfirmar =
    !!item &&
    !!tier &&
    (autoForja || forjaPreciso !== null) &&
    (recursos.ouro ?? 0) >= tier.custoOuro;

  function resetSelecao() {
    setStoneCounts({});
    setForjaPreciso(null);
    setUseSeal(false);
  }

  function addStone(id: string) {
    if (totalPedras >= refinement.maxPedrasPorTentativa) return;
    if ((recursos[id] ?? 0) <= (stoneCounts[id] ?? 0)) return;
    setStoneCounts((s) => ({ ...s, [id]: (s[id] ?? 0) + 1 }));
    setForjaPreciso(null);
  }

  function removeStone(id: string) {
    setStoneCounts((s) => {
      const next = { ...s };
      if (!next[id]) return next;
      next[id] -= 1;
      if (next[id] <= 0) delete next[id];
      return next;
    });
    setForjaPreciso(null);
  }

  function handleConfirm() {
    if (!item || !tier) return;
    const result = refineItem(item.uid, { stoneIds, useSeal, forjaResultado });
    if (!result.ok) {
      setFeedback(`Não foi possível refinar: ${result.reason}`);
      return;
    }
    setFeedback(
      result.destruido
        ? `Item destruído na tentativa de +${tier.nivelAlvo}.`
        : result.sucesso
          ? `Sucesso! O item foi para +${tier.nivelAlvo}.`
          : `Falhou (a chance era ${Math.round(result.chanceFinal * 100)}%).`,
    );
    resetSelecao();
  }

  if (refinaveis.length === 0) {
    return (
      <div className="glass p-5 text-center text-sm text-slate-500">
        Nenhum item refinável no inventário. Role loot e mantenha ao menos um item destrancado
        abaixo do cap (+{refinement.cap}).
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
      {/* Seleção de item */}
      <div className="glass p-5">
        <h3 className="mb-3 font-display text-sm font-bold text-white">Item a refinar</h3>
        <div className="flex flex-col gap-2">
          {refinaveis.map((i) => (
            <button
              key={i.uid}
              onClick={() => {
                setSelectedUid(i.uid);
                resetSelecao();
              }}
              className={`rounded-lg border px-3 py-2 text-left text-xs transition ${
                item?.uid === i.uid
                  ? 'border-cyan-400/50 bg-cyan-400/10'
                  : 'border-white/10 bg-white/[0.02] hover:bg-white/5'
              }`}
            >
              <span className="font-semibold" style={{ color: RARITY_VAR[i.rarity] }}>
                {i.nome}
              </span>
              <span className="ml-2 text-slate-500">
                +{i.refino.nivel} → +{i.refino.nivel + 1}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-4 border-t border-white/5 pt-3 text-xs text-slate-400">
          Recursos: ouro{' '}
          <span className="text-amber-300">{(recursos.ouro ?? 0).toLocaleString('pt-BR')}</span>
          {' · '}selo <span className="text-cyan-300">{recursos.selo_protecao ?? 0}</span>
        </div>
      </div>

      {/* Forja */}
      <div className="glass p-5">
        {item && tier ? (
          <>
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="font-display text-sm font-bold text-white">
                Forjar → +{tier.nivelAlvo}
              </h3>
              <span className="text-xs text-slate-500">
                custo {tier.custoOuro.toLocaleString('pt-BR')} ouro
              </span>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              {refinement.stones.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.02] px-2 py-1 text-xs"
                >
                  <span className="text-slate-300">{STONE_LABELS[s.id] ?? s.id}</span>
                  <span className="text-slate-500">({recursos[s.id] ?? 0})</span>
                  <button
                    onClick={() => removeStone(s.id)}
                    className="rounded bg-white/5 px-1.5 text-slate-300 hover:bg-white/10"
                  >
                    −
                  </button>
                  <span className="w-4 text-center text-cyan-300">{stoneCounts[s.id] ?? 0}</span>
                  <button
                    onClick={() => addStone(s.id)}
                    className="rounded bg-white/5 px-1.5 text-slate-300 hover:bg-white/10"
                  >
                    +
                  </button>
                </div>
              ))}
            </div>

            {tier.falha === 'menos1_ou_destroi' && (
              <label className="mb-3 flex items-center gap-2 text-xs text-amber-300">
                <input
                  type="checkbox"
                  checked={useSeal}
                  onChange={(e) => setUseSeal(e.target.checked)}
                />
                Usar Selo de Proteção — impede destruição (você tem{' '}
                {recursos.selo_protecao ?? 0})
              </label>
            )}

            <div className="mb-3 text-xs text-slate-400">
              Chance sem a Forja Ativa:{' '}
              <span className="font-bold text-cyan-300">{Math.round(chanceSemForja * 100)}%</span>
              {tier.falha !== 'nada' && (
                <span className="ml-2 text-slate-500">
                  em caso de falha:{' '}
                  {tier.falha === 'menos1'
                    ? '−1 nível'
                    : useSeal
                      ? '−1 nível (protegido pelo Selo)'
                      : '−1 nível ou destrói'}
                </span>
              )}
            </div>

            <label className="mb-2 flex items-center gap-2 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={autoForja}
                onChange={(e) => {
                  setAutoForja(e.target.checked);
                  setForjaPreciso(null);
                }}
              />
              Modo auto-forja (sem mini-jogo)
            </label>

            {!autoForja && (
              <ForgeMeter
                key={`${item.uid}-${stoneIds.join(',')}`}
                hotZoneWidth={hotZoneWidth}
                onResult={setForjaPreciso}
              />
            )}

            <div className="my-3 text-sm">
              Chance final:{' '}
              <span className="font-bold text-cyan-300">{Math.round(chancePreview * 100)}%</span>
            </div>

            {feedback && <div className="mb-3 text-xs text-slate-400">{feedback}</div>}

            <button
              onClick={handleConfirm}
              disabled={!podeConfirmar}
              className="w-full rounded-lg bg-amber-400/15 py-2.5 text-sm font-bold text-amber-300 transition hover:bg-amber-400/25 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Confirmar Refino
            </button>
          </>
        ) : (
          <div className="text-sm text-slate-500">Selecione um item.</div>
        )}
      </div>

      {refineLog.length > 0 && (
        <div className="glass p-5 lg:col-span-2">
          <h3 className="mb-3 font-display text-sm font-bold text-white">
            Histórico de tentativas
          </h3>
          <div className="flex flex-col gap-1 text-xs">
            {refineLog.slice(0, 10).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between border-b border-white/5 py-1 last:border-0"
              >
                <span className="text-slate-300">
                  {entry.itemNomeAntes} → +{entry.nivelAlvo}
                </span>
                <span
                  className={
                    entry.destruido
                      ? 'text-red-400'
                      : entry.sucesso
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                  }
                >
                  {entry.destruido ? 'destruído' : entry.sucesso ? 'sucesso' : 'falhou'} (
                  {Math.round(entry.chanceFinal * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
