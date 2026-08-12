type VisitSummary = {
  id: string;
  title: string;
};

type VisitStep = {
  directions: string;
  map?: {
    x: number;
    y: number;
  };
  items: string[];
};

type Visit = {
  id: string;
  title: string;
  floorplan?: string;
  steps: VisitStep[];
};

type Item = {
  id: string;
  title?: string;
  duration: string;
  languageLevel: string;
  text: string;
  subject?: unknown;
};

type RawRecord = Record<string, any>;

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function asArray(payload: any, fallbackKey: string): RawRecord[] {
  if (Array.isArray(payload)) return payload;

  if (Array.isArray(payload?.[fallbackKey])) return payload[fallbackKey];
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;

  return [];
}

function getId(obj: RawRecord): string {
  return String(obj.id ?? obj._id ?? "");
}

function getTitle(obj: RawRecord): string {
  return String(obj.title ?? obj.name ?? obj.nome ?? "Senza titolo");
}

function normalizeItemId(value: any): string {
  if (!value) return "";

  if (typeof value === "string") return value;

  if (typeof value === "object") {
    return String(value.id ?? value._id ?? value.itemId ?? "");
  }

  return "";
}

const defaultMarkers = [
  { x: 28, y: 55 },
  { x: 45, y: 42 },
  { x: 63, y: 48 },
  { x: 72, y: 66 },
  { x: 38, y: 74 }
];

function getDefaultMarker(index: number) {
  return defaultMarkers[index % defaultMarkers.length];
}

function normalizeStep(raw: RawRecord, index: number): VisitStep {
  const itemId = normalizeItemId(raw.itemId);

  const items = itemId ? [itemId] : [];

  const order = raw.order ?? index + 1;

  return {
    directions: `Tappa ${order}`,
    map: raw.map ?? getDefaultMarker(index),//se la visita ha coordinate usa quelle altrimenti usa quelle provvisorie
    items
  };
}

function normalizeVisit(raw: RawRecord): Visit {
  const sequence = Array.isArray(raw.sequence) ? raw.sequence : [];

  const orderedSequence = [...sequence].sort((a, b) => {
    return Number(a.order ?? 0) - Number(b.order ?? 0);
  });

  return {
    id: getId(raw),
    title: getTitle(raw),
    floorplan: raw.floorplan ?? raw.mapImage ?? raw.floorPlan,
    steps: orderedSequence.map(normalizeStep)
  };
}

function normalizeItem(raw: RawRecord): Item {
  return {
    id: getId(raw),
    title: getTitle(raw),
    duration: String(raw.duration ?? raw.length ?? "15s"),
    languageLevel: String(raw.languageLevel ?? raw.level ?? raw.language ?? "medio"),
    text: String(raw.text ?? raw.description ?? raw.content ?? raw.title ?? ""),
    subject: raw.subject
  };
}

export const api = {
  async getVisits(_museumId: string): Promise<VisitSummary[]> {
    const payload = await getJson<unknown>("/api/visits");
    const visits = asArray(payload, "visits");

    return visits
      .map((visit) => ({
        id: getId(visit),
        title: getTitle(visit)
      }))
      .filter((visit) => visit.id);
  },

  async getVisit(_museumId: string, visitId: string): Promise<Visit> {
    const payload = await getJson<unknown>("/api/visits");
    const visits = asArray(payload, "visits");

    const visit = visits.find((v) => getId(v) === visitId);

    if (!visit) {
      throw new Error("Visita non trovata.");
    }

    return normalizeVisit(visit);
  },

  async getItems(_museumId: string): Promise<Item[]> {
    const payload = await getJson<unknown>("/api/items");
    const items = asArray(payload, "items");

    return items
      .map(normalizeItem)
      .filter((item) => item.id && item.text);
  }
};