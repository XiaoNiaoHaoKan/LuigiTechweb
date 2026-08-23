import demoVisits from "../mocks/visits.demo-museum.json";
import demoVisitBase from "../mocks/visit.visita-base.json";
import demoVisitApprofondita from "../mocks/visit.visita-approfondita.json";
import demoItems from "../mocks/items.demo-museum.json";

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
  image?: string;
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
  const items = Array.isArray(raw.items)
    ? raw.items.map(normalizeItemId).filter(Boolean)
    : [];

  const itemId = normalizeItemId(raw.itemId);
  const normalizedItems = items.length > 0 ? items : itemId ? [itemId] : [];

  const order = raw.order ?? index + 1;
  const directions = raw.directions ?? raw.logistics ?? `Tappa ${order}`;

  return {
    directions: String(directions),
    map: raw.map ?? getDefaultMarker(index),
    items: normalizedItems
  };
}

function normalizeVisit(raw: RawRecord): Visit {
  const sequence = Array.isArray(raw.sequence)
    ? raw.sequence
    : Array.isArray(raw.steps)
      ? raw.steps
      : [];

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
    image: raw.image ?? raw.imageUrl ?? raw.thumbnail ?? raw.cover,
    subject: raw.subject
  };
}

function getDemoVisitById(visitId: string): RawRecord | null {
  const demoById: Record<string, RawRecord> = {
    [String(demoVisitBase.id)]: demoVisitBase as RawRecord,
    [String(demoVisitApprofondita.id)]: demoVisitApprofondita as RawRecord
  };

  return demoById[visitId] ?? null;
}

export const api = {
  async getVisits(museumId: string): Promise<VisitSummary[]> {
    if (museumId === "demo-museum") {
      return (demoVisits as RawRecord[])
        .map((visit) => ({
          id: getId(visit),
          title: getTitle(visit)
        }))
        .filter((visit) => visit.id);
    }

    const payload = await getJson<unknown>("/api/visits");
    const visits = asArray(payload, "visits");

    return visits
      .map((visit) => ({
        id: getId(visit),
        title: getTitle(visit)
      }))
      .filter((visit) => visit.id);
  },

  async getVisit(museumId: string, visitId: string): Promise<Visit> {
    if (museumId === "demo-museum") {
      const demoVisit = getDemoVisitById(visitId);

      if (!demoVisit) {
        throw new Error("Visita demo non trovata.");
      }

      return normalizeVisit(demoVisit);
    }

    const payload = await getJson<unknown>("/api/visits");
    const visits = asArray(payload, "visits");

    const visit = visits.find((v) => getId(v) === visitId);

    if (!visit) {
      throw new Error("Visita non trovata.");
    }

    return normalizeVisit(visit);
  },

  async getItems(museumId: string): Promise<Item[]> {
    if (museumId === "demo-museum") {
      return (demoItems as RawRecord[])
        .map(normalizeItem)
        .filter((item) => item.id && item.text);
    }

    const payload = await getJson<unknown>("/api/items");
    const items = asArray(payload, "items");

    return items
      .map(normalizeItem)
      .filter((item) => item.id && item.text);
  }
};