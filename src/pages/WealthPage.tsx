import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Section } from "@/components/ui/Section";
import { StatTile } from "@/components/ui/StatTile";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListRow } from "@/components/ui/ListRow";
import { InlineForm } from "@/components/ui/InlineForm";
import { Field, Select, TextInput } from "@/components/ui/Field";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { TrendChart } from "@/components/ui/TrendChart";
import { Button } from "@/components/common/Button";
import { useFeySnapshot } from "@/hooks/useFeySnapshot";
import { DEFAULT_WEALTH_PROFILE, WealthRepository } from "@/repositories/wealthRepository";
import type { PurchasePlan } from "@/types/modules";
import { formatDate, monthKey, today } from "@/utils/date";
import { formatCurrency, percent } from "@/utils/format";

const TABS = [
  { id: "savings", label: "Savings" },
  { id: "goals", label: "Goals" },
  { id: "purchases", label: "Purchase planning" },
];

export default function WealthPage() {
  const [tab, setTab] = useState("savings");
  const snapshot = useFeySnapshot();
  const profile = snapshot.wealthProfile ?? DEFAULT_WEALTH_PROFILE;

  const saved = snapshot.savingsEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const savedThisMonth = snapshot.savingsEntries
    .filter((entry) => monthKey(entry.date) === monthKey())
    .reduce((sum, entry) => sum + entry.amount, 0);
  const openGoals = snapshot.savingsGoals.filter((goal) => !goal.completedAt);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Stewardship"
        title="Wealth"
        description="Savings, goals, and mindful purchase planning for financial growth."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Total saved" value={formatCurrency(saved, profile.currency)} tone="burgundy" />
        <StatTile
          label="This month"
          value={formatCurrency(savedThisMonth, profile.currency)}
          hint={`${percent(savedThisMonth, profile.monthlySavingsTarget)}% of ${formatCurrency(profile.monthlySavingsTarget, profile.currency)} target`}
        />
        <StatTile label="Open goals" value={openGoals.length} />
        <StatTile label="Monthly target" value={formatCurrency(profile.monthlySavingsTarget, profile.currency)} />
      </div>

      <Tabs tabs={TABS} active={tab} onChange={setTab} />

      {tab === "savings" && <SavingsTab />}
      {tab === "goals" && <GoalsTab />}
      {tab === "purchases" && <PurchasesTab />}
    </div>
  );
}

function SavingsTab() {
  const snapshot = useFeySnapshot();
  const profile = snapshot.wealthProfile ?? DEFAULT_WEALTH_PROFILE;
  const [form, setForm] = useState({ date: today(), amount: "", goalId: "", note: "", currency: profile.currency, location: "" });

  const byMonth = new Map<string, number>();
  for (const entry of snapshot.savingsEntries) {
    const key = monthKey(entry.date);
    byMonth.set(key, (byMonth.get(key) ?? 0) + entry.amount);
  }
  const monthly = [...byMonth.entries()].sort().map(([month, value]) => ({ label: month.slice(2), value }));

  return (
    <div className="space-y-6">
      <Section title="Saved per month">
        <TrendChart data={monthly} kind="bar" emptyLabel="Log a deposit to start the chart" />
      </Section>

      <Section title="Deposits">
        <InlineForm
          title="Log savings"
          onSubmit={async () => {
            if (!form.amount) return;
            await WealthRepository.addSavings({
              date: form.date,
              amount: Number(form.amount),
              goalId: form.goalId ? Number(form.goalId) : null,
              note: form.note || undefined,
              currency: form.currency || profile.currency,
              location: form.location || undefined,
            });
            setForm({ date: today(), amount: "", goalId: "", note: "", currency: profile.currency, location: "" });
          }}
        >
          <Field label="Date">
            <TextInput type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </Field>
          <Field label="Currency">
            <Select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="NGN">NGN - Nigerian Naira</option>
              <option value="MYR">MYR - Malaysian Ringgit</option>
            </Select>
          </Field>
          <Field label="Amount">
            <TextInput type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          </Field>
          <Field label="Location">
            <Select value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
              <option value="">Select location</option>
              <option value="account">Bank Account</option>
              <option value="e-wallet">E-wallet</option>
              <option value="cash">Cash</option>
              <option value="investment">Investment Account</option>
            </Select>
          </Field>
          <Field label="Goal">
            <Select value={form.goalId} onChange={(e) => setForm({ ...form, goalId: e.target.value })}>
              <option value="">General savings</option>
              {snapshot.savingsGoals
                .filter((goal) => !goal.completedAt)
                .map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.name}
                  </option>
                ))}
            </Select>
          </Field>
          <Field label="Note">
            <TextInput value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </Field>
        </InlineForm>

        <div className="space-y-2">
          {snapshot.savingsEntries.length === 0 && <EmptyState title="No deposits yet" />}
          {[...snapshot.savingsEntries]
            .sort((a, b) => b.date.localeCompare(a.date))
            .slice(0, 10)
            .map((entry) => {
              const goal = snapshot.savingsGoals.find((item) => item.id === entry.goalId);
              const currency = entry.currency || profile.currency;
              const location = entry.location || "General";
              return (
                <ListRow
                  key={entry.id}
                  title={formatCurrency(entry.amount, currency)}
                  subtitle={[goal?.name ?? "General savings", entry.note].filter(Boolean).join(" · ")}
                  meta={`${formatDate(entry.date)} · ${currency} · ${location}`}
                />
              );
            })}
        </div>
      </Section>

      <Section title="Settings">
        <SettingsForm />
      </Section>
    </div>
  );
}

function SettingsForm() {
  const snapshot = useFeySnapshot();
  const profile = snapshot.wealthProfile ?? DEFAULT_WEALTH_PROFILE;
  const [form, setForm] = useState({
    currency: profile.currency,
    hourlyRate: String(profile.hourlyRate),
    monthlySavingsTarget: String(profile.monthlySavingsTarget),
  });

  return (
    <InlineForm
      title="Currency, hourly rate and monthly target"
      submitLabel="Update"
      onSubmit={async () => {
        await WealthRepository.saveProfile({
          currency: form.currency || "GBP",
          hourlyRate: Number(form.hourlyRate) || 0,
          monthlySavingsTarget: Number(form.monthlySavingsTarget) || 0,
        });
      }}
    >
      <Field label="Currency" hint="ISO code, e.g. GBP, USD, EUR">
        <TextInput value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} />
      </Field>
      <Field label="Hourly rate">
        <TextInput type="number" step="0.01" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })} />
      </Field>
      <Field label="Monthly savings target">
        <TextInput
          type="number"
          step="1"
          value={form.monthlySavingsTarget}
          onChange={(e) => setForm({ ...form, monthlySavingsTarget: e.target.value })}
        />
      </Field>
    </InlineForm>
  );
}

function GoalsTab() {
  const snapshot = useFeySnapshot();
  const profile = snapshot.wealthProfile ?? DEFAULT_WEALTH_PROFILE;
  const [form, setForm] = useState({ name: "", targetAmount: "", targetDate: "" });

  return (
    <Section title="Savings goals">
      <InlineForm
        title="New goal"
        onSubmit={async () => {
          if (!form.name || !form.targetAmount) return;
          await WealthRepository.addGoal({
            name: form.name,
            targetAmount: Number(form.targetAmount),
            targetDate: form.targetDate || undefined,
            completedAt: null,
          });
          setForm({ name: "", targetAmount: "", targetDate: "" });
        }}
      >
        <Field label="Goal">
          <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label={`Target (${profile.currency})`}>
          <TextInput type="number" step="1" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} />
        </Field>
        <Field label="Target date">
          <TextInput type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} />
        </Field>
      </InlineForm>

      <div className="space-y-2">
        {snapshot.savingsGoals.length === 0 && <EmptyState title="No goals yet" hint="Deposits can be tagged to a goal." />}
        {snapshot.savingsGoals.map((goal) => {
          const saved = snapshot.savingsEntries
            .filter((entry) => entry.goalId === goal.id)
            .reduce((sum, entry) => sum + entry.amount, 0);
          const remaining = Math.max(0, goal.targetAmount - saved);
          return (
            <ListRow
              key={goal.id}
              title={goal.name}
              subtitle={goal.targetDate ? `Target date ${formatDate(goal.targetDate)}` : undefined}
              meta={goal.completedAt ? `Reached ${formatDate(goal.completedAt)}` : `${formatCurrency(remaining, profile.currency)} to go`}
            >
              <ProgressBar
                value={percent(saved, goal.targetAmount)}
                caption={`${formatCurrency(saved, profile.currency)} / ${formatCurrency(goal.targetAmount, profile.currency)}`}
                tone={goal.completedAt ? "gold" : "burgundy"}
              />
            </ListRow>
          );
        })}
      </div>
    </Section>
  );
}

function PurchasesTab() {
  const snapshot = useFeySnapshot();
  const profile = snapshot.wealthProfile ?? DEFAULT_WEALTH_PROFILE;
  const [form, setForm] = useState({ name: "", price: "", priority: "medium" as PurchasePlan["priority"], notes: "" });

  const planned = [...snapshot.purchasePlans].sort((a, b) => Number(Boolean(a.purchasedAt)) - Number(Boolean(b.purchasedAt)));
  const outstanding = planned.filter((plan) => !plan.purchasedAt);
  const outstandingTotal = outstanding.reduce((sum, plan) => sum + plan.price, 0);

  // Motivational quotes about spending
  const motivationalQuotes = [
    "Every dollar saved is a step toward freedom.",
    "Spend on what matters, not just what's available.",
    "Your future self will thank you for your discipline today.",
    "Wealth is not about having more, it's about needing less.",
    "The best investment you can make is in yourself.",
  ];
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  return (
    <div className="space-y-6">
      {/* Motivational Banner */}
      <div className="bg-[#F2E8EA] border border-[#D9B7BE]/30 rounded-2xl p-4">
        <p className="text-sm italic text-[#6B2D3A] text-center">{randomQuote}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Planned spend" value={formatCurrency(outstandingTotal, profile.currency)} hint={`${outstanding.length} items`} />
        <StatTile label="Monthly target" value={formatCurrency(profile.monthlySavingsTarget, profile.currency)} />
      </div>

      <Section title="Purchase planning" subtitle="Mindful spending aligned with your financial goals">
        <InlineForm
          title="Plan a purchase"
          onSubmit={async () => {
            if (!form.name || !form.price) return;
            await WealthRepository.addPurchasePlan({
              name: form.name,
              price: Number(form.price),
              priority: form.priority,
              notes: form.notes || undefined,
              purchasedAt: null,
            });
            setForm({ name: "", price: "", priority: "medium", notes: "" });
          }}
        >
          <Field label="Item">
            <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label={`Price (${profile.currency})`}>
            <TextInput type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </Field>
          <Field label="Priority">
            <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as PurchasePlan["priority"] })}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </Field>
          <Field label="Notes">
            <TextInput value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
        </InlineForm>

        <div className="space-y-2">
          {planned.length === 0 && <EmptyState title="Nothing planned" />}
          {planned.map((plan) => (
            <ListRow
              key={plan.id}
              title={plan.name}
              subtitle={[plan.priority, plan.notes].filter(Boolean).join(" · ")}
              meta={formatCurrency(plan.price, profile.currency)}
              actions={
                plan.purchasedAt ? (
                  <span className="text-[11px] text-[#8C7B75]">bought {formatDate(plan.purchasedAt)}</span>
                ) : (
                  <Button size="sm" variant="rose" onClick={() => void WealthRepository.markPurchased(plan.id!)}>
                    Bought
                  </Button>
                )
              }
            />
          ))}
        </div>
      </Section>
    </div>
  );
}

