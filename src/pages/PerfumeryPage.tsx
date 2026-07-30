import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { StatTile } from "@/components/ui/StatTile";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListRow } from "@/components/ui/ListRow";
import { InlineForm } from "@/components/ui/InlineForm";
import { Field, Select, TextArea, TextInput } from "@/components/ui/Field";
import { Button } from "@/components/common/Button";
import { useFeySnapshot } from "@/hooks/useFeySnapshot";
import { PerfumeryRepository } from "@/repositories/perfumeryRepository";
import type { PerfumeIngredient, PerfumeVersion } from "@/types/modules";
import { formatDate, today } from "@/utils/date";
import { percent } from "@/utils/format";

export default function PerfumeryPage() {
  const snapshot = useFeySnapshot();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [formula, setFormula] = useState({ name: "", inspiration: "" });

  const formulas = snapshot.perfumeFormulas;
  const selected = formulas.find((item) => item.id === selectedId) ?? formulas[0];

  const versions = useMemo(
    () =>
      snapshot.perfumeVersions
        .filter((version) => version.formulaId === selected?.id)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [snapshot.perfumeVersions, selected?.id],
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Craft & Composition"
        title="Perfumery"
        description="Formulas, versions, ingredient amounts, notes and how each blend developed."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Formulas" value={formulas.length} tone="burgundy" />
        <StatTile label="Versions" value={snapshot.perfumeVersions.length} />
        <StatTile
          label="Ingredients used"
          value={new Set(snapshot.perfumeVersions.flatMap((v) => v.ingredients.map((i) => i.name.toLowerCase()))).size}
        />
        <StatTile label="Archived" value={formulas.filter((item) => item.archived).length} />
      </div>

      <Section title="Formulas">
        <InlineForm
          title="New formula"
          onSubmit={async () => {
            if (!formula.name) return;
            const id = await PerfumeryRepository.createFormula({
              name: formula.name,
              inspiration: formula.inspiration || undefined,
            });
            setSelectedId(id);
            setFormula({ name: "", inspiration: "" });
          }}
        >
          <Field label="Name">
            <TextInput value={formula.name} placeholder="Amber Study" onChange={(e) => setFormula({ ...formula, name: e.target.value })} />
          </Field>
          <Field label="Inspiration">
            <TextInput
              value={formula.inspiration}
              placeholder="Late autumn, resin, dried figs"
              onChange={(e) => setFormula({ ...formula, inspiration: e.target.value })}
            />
          </Field>
        </InlineForm>

        {formulas.length === 0 ? (
          <EmptyState title="No formulas yet" hint="Create a formula, then log versions as you refine it." />
        ) : (
          <div className="flex flex-wrap gap-2">
            {formulas.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedId(item.id!)}
                className={`rounded-full border px-3.5 py-1.5 text-xs transition-colors ${
                  item.id === selected?.id
                    ? "border-[#6B2D3A] bg-[#6B2D3A] text-[#F8F5F2]"
                    : "border-[#EAE3DE] bg-[#FFFCFA] text-[#8C7B75] hover:border-[#D9B7BE]"
                }`}
              >
                {item.name}
                {item.archived ? " · archived" : ""}
              </button>
            ))}
          </div>
        )}
      </Section>

      {selected && (
        <>
          <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-[#EAE3DE] bg-[#FFFCFA] p-5">
            <div>
              <h2 className="font-serif text-2xl text-[#1A1817]">{selected.name}</h2>
              <p className="text-xs text-[#8C7B75]">
                {selected.inspiration ?? "No inspiration noted"} · started {formatDate(selected.createdAt)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => void PerfumeryRepository.archiveFormula(selected.id!, !selected.archived)}>
                {selected.archived ? "Unarchive" : "Archive"}
              </Button>
              <Button
                size="sm"
                variant="rose"
                onClick={async () => {
                  await PerfumeryRepository.deleteFormula(selected.id!);
                  setSelectedId(null);
                }}
              >
                Delete
              </Button>
            </div>
          </div>

          <VersionForm key={`${selected.id}-${versions[0]?.id ?? "new"}`} formulaId={selected.id!} previous={versions[0]} />

          <Section title="Development history" subtitle="Newest first — each version keeps its own amounts and observations">
            {versions.length === 0 && <EmptyState title="No versions yet" hint="Log the first blend to start the history." />}
            <div className="space-y-3">
              {versions.map((version) => {
                const total = version.ingredients.reduce((sum, ingredient) => sum + ingredient.amount, 0);
                return (
                  <ListRow
                    key={version.id}
                    title={`${version.version}`}
                    subtitle={version.observations}
                    meta={`${formatDate(version.date)}${version.rating ? ` · ${version.rating}/5` : ""}`}
                  >
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-[10px] uppercase tracking-widest text-[#8C7B75]">
                          <th className="py-1 text-left font-bold">Ingredient</th>
                          <th className="py-1 text-left font-bold">Note</th>
                          <th className="py-1 text-right font-bold">Amount</th>
                          <th className="py-1 text-right font-bold">Share</th>
                          <th className="py-1 text-right font-bold">Contribution</th>
                        </tr>
                      </thead>
                      <tbody>
                        {version.ingredients.map((ingredient, index) => {
                          const share = percent(ingredient.amount, total);
                          // Calculate contribution to final strength (accounting for dilution)
                          const dilution = ingredient.dilution || 100;
                          const contribution = percent(ingredient.amount * (dilution / 100), total);
                          return (
                            <tr key={`${version.id}-${index}`} className="border-t border-[#EAE3DE]/70">
                              <td className="py-1.5 font-serif text-[#1A1817]">{ingredient.name}</td>
                              <td className="py-1.5 capitalize text-[#8C7B75]">{ingredient.note}</td>
                              <td className="py-1.5 text-right font-mono text-[#6B2D3A]">
                                {ingredient.amount} {version.unit}
                              </td>
                              <td className="py-1.5 text-right font-mono text-[#8C7B75]">{share}%</td>
                              <td className="py-1.5 text-right font-mono text-[#6B2D3A]">{contribution}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </ListRow>
                );
              })}
            </div>
          </Section>
        </>
      )}
    </div>
  );
}

const emptyIngredient = (): PerfumeIngredient => ({ name: "", note: "heart", amount: 0, dilution: 100 });

/** Increments the numeric part of the previous version label, e.g. v2 -> v3. */
function nextLabel(previous?: PerfumeVersion): string {
  const match = previous?.version.match(/(\d+)/);
  return match ? `v${Number(match[1]) + 1}` : "v1";
}

function VersionForm({ formulaId, previous }: { formulaId: number; previous?: PerfumeVersion }) {
  const [unit, setUnit] = useState<PerfumeVersion["unit"]>(previous?.unit ?? "drops");
  const [date, setDate] = useState(today());
  const [observations, setObservations] = useState("");
  const [rating, setRating] = useState("");
  const [alcoholAmount, setAlcoholAmount] = useState(previous?.alcoholAmount?.toString() ?? "");
  const [ingredients, setIngredients] = useState<PerfumeIngredient[]>(() =>
    previous ? previous.ingredients.map((item) => ({ ...item })) : [emptyIngredient()],
  );
  const [label, setLabel] = useState(() => nextLabel(previous));

  // Calculate final strength percentage
  const calculateStrength = () => {
    let totalScentAmount = 0;
    let totalAlcoholFromDilutions = 0;

    ingredients.forEach((ingredient) => {
      if (ingredient.amount > 0 && ingredient.dilution) {
        const scentAmount = ingredient.amount * (ingredient.dilution / 100);
        const alcoholAmount = ingredient.amount - scentAmount;
        totalScentAmount += scentAmount;
        totalAlcoholFromDilutions += alcoholAmount;
      }
    });

    const addedAlcohol = Number(alcoholAmount) || 0;
    const totalAlcohol = totalAlcoholFromDilutions + addedAlcohol;
    const totalMixture = totalScentAmount + totalAlcohol;

    if (totalMixture === 0) return 0;
    return Math.round((totalScentAmount / totalMixture) * 100);
  };

  const strengthPercent = calculateStrength();

  function updateIngredient(index: number, patch: Partial<PerfumeIngredient>) {
    setIngredients((list) => list.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  return (
    <Section title="Log a version" subtitle={previous ? `Pre-filled from ${previous.version} so you can tweak amounts` : undefined}>
      <div className="space-y-3 rounded-2xl border border-[#EAE3DE] bg-[#FFFCFA] p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <Field label="Version">
            <TextInput value={label} onChange={(e) => setLabel(e.target.value)} />
          </Field>
          <Field label="Date">
            <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <Field label="Unit">
            <Select value={unit} onChange={(e) => setUnit(e.target.value as PerfumeVersion["unit"])}>
              <option value="drops">drops</option>
              <option value="g">g</option>
              <option value="ml">ml</option>
            </Select>
          </Field>
          <Field label="Rating">
            <Select value={rating} onChange={(e) => setRating(e.target.value)}>
              <option value="">—</option>
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="space-y-2">
          {ingredients.map((ingredient, index) => (
            <div key={index} className="grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr_1fr_1fr_auto]">
              <TextInput
                placeholder="Ingredient"
                value={ingredient.name}
                onChange={(e) => updateIngredient(index, { name: e.target.value })}
              />
              <Select value={ingredient.note} onChange={(e) => updateIngredient(index, { note: e.target.value as PerfumeIngredient["note"] })}>
                <option value="top">top</option>
                <option value="heart">heart</option>
                <option value="base">base</option>
              </Select>
              <TextInput
                type="number"
                step="0.1"
                placeholder="Amount"
                value={ingredient.amount || ""}
                onChange={(e) => updateIngredient(index, { amount: Number(e.target.value) })}
              />
              <TextInput
                type="number"
                step="1"
                placeholder="Dilution %"
                value={ingredient.dilution || ""}
                onChange={(e) => updateIngredient(index, { dilution: Number(e.target.value) })}
              />
              <button
                type="button"
                onClick={() => setIngredients((list) => list.filter((_, i) => i !== index))}
                className="flex items-center justify-center rounded-xl border border-[#EAE3DE] px-3 text-[#8C7B75] hover:text-[#6B2D3A]"
                aria-label="Remove ingredient"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button size="sm" variant="ghost" onClick={() => setIngredients((list) => [...list, emptyIngredient()])}>
            Add ingredient
          </Button>
        </div>

        {/* Alcohol Amount and Strength Calculation */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Alcohol amount" hint="Additional alcohol to add to the mixture">
            <TextInput
              type="number"
              step="0.1"
              placeholder="Alcohol amount"
              value={alcoholAmount}
              onChange={(e) => setAlcoholAmount(e.target.value)}
            />
          </Field>
          <div className="bg-[#F2E8EA] border border-[#D9B7BE]/30 rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C7B75]">Final strength</p>
            <p className="font-mono text-2xl text-[#6B2D3A]">{strengthPercent}%</p>
            <p className="text-xs text-[#8C7B75]">scent concentration</p>
          </div>
        </div>

        <Field label="Observations" hint="How it smelled, what changed, what to try next">
          <TextArea value={observations} onChange={(e) => setObservations(e.target.value)} />
        </Field>

        <Button
          size="sm"
          onClick={async () => {
            const filled = ingredients.filter((ingredient) => ingredient.name && ingredient.amount > 0);
            if (filled.length === 0) return;
            await PerfumeryRepository.addVersion({
              formulaId,
              version: label,
              date,
              unit,
              ingredients: filled,
              observations: observations || undefined,
              rating: rating ? Number(rating) : undefined,
            });
            setObservations("");
            setRating("");
            setLabel(await PerfumeryRepository.nextVersionLabel(formulaId));
          }}
        >
          Save version
        </Button>
      </div>
    </Section>
  );
}
