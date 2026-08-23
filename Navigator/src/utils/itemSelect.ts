export type Item = {
  id: string;
  title?: string;
  duration: string; // "3s" | "15s" | "40s" | ...
  languageLevel: string;
  text: string;
  image?: string;
  subject?: unknown;
};

const durationOrder = ["3s", "15s", "40s", "1min", "4min"] as const;

export function pickItemByPreference(items: Item[], allowedIds: string[], preferredDuration: string) {
  const byId = new Map(items.map((i) => [i.id, i]));
  const stepItems = allowedIds.map((id) => byId.get(id)).filter(Boolean) as Item[];

  if (stepItems.length === 0) return null;

  const exact = stepItems.find((i) => i.duration === preferredDuration);
  if (exact) return exact;

  const prefIndex = durationOrder.indexOf(preferredDuration as any);
  if (prefIndex < 0) return stepItems[0];

  // scegli durata “più vicina” tra quelle disponibili
  const withRank = stepItems
    .map((i) => ({ item: i, rank: durationOrder.indexOf(i.duration as any) }))
    .filter((x) => x.rank >= 0)
    .sort((a, b) => Math.abs(a.rank - prefIndex) - Math.abs(b.rank - prefIndex));

  return (withRank[0]?.item ?? stepItems[0]) as Item;
}

export function nextDuration(current: string): string {
  const i = durationOrder.indexOf(current as any);

  if (i < 0) return current;

  const next = durationOrder[i + 1];
  return next ?? current;
}

export function prevDuration(current: string): string {
  const i = durationOrder.indexOf(current as any);

  if (i < 0) return current;

  const prev = durationOrder[i - 1];
  return prev ?? current;
}