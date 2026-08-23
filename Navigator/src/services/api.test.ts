import { afterEach, describe, expect, it, vi } from "vitest";
import { api } from "./api";

describe("api normalization", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("mantiene directions e lista items dalla visita", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        visits: [
          {
            id: "visit-1",
            title: "Visita test",
            sequence: [
              {
                order: 2,
                directions: "Vai nella sala moderna",
                items: ["item-2", { id: "item-3" }],
                map: { x: 10, y: 20 }
              },
              {
                order: 1,
                logistics: "Parti dall'ingresso",
                itemId: "item-1"
              }
            ]
          }
        ]
      })
    } as Response);

    const visit = await api.getVisit("museum-1", "visit-1");

    expect(visit.steps).toHaveLength(2);

    const [firstStep, secondStep] = visit.steps;
    expect(firstStep).toBeDefined();
    expect(secondStep).toBeDefined();

    if (!firstStep || !secondStep) {
      throw new Error("La visita deve contenere almeno due tappe.");
    }

    expect(firstStep.directions).toBe("Parti dall'ingresso");
    expect(firstStep.items).toEqual(["item-1"]);
    expect(secondStep.directions).toBe("Vai nella sala moderna");
    expect(secondStep.items).toEqual(["item-2", "item-3"]);
    expect(secondStep.map).toEqual({ x: 10, y: 20 });
  });

  it("normalizza item anche con chiavi alternative", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            _id: "item-a",
            name: "Opera A",
            length: "1min",
            language: "specialistico",
            description: "Descrizione A"
          }
        ]
      })
    } as Response);

    const items = await api.getItems("museum-1");

    expect(items).toEqual([
      {
        id: "item-a",
        title: "Opera A",
        duration: "1min",
        languageLevel: "specialistico",
        text: "Descrizione A",
        subject: undefined
      }
    ]);
  });

  it("espone visite demo e contenuti demo senza chiamate server", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    const visits = await api.getVisits("demo-museum");
    const visit = await api.getVisit("demo-museum", "visita-base");
    const items = await api.getItems("demo-museum");

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(visits.length).toBeGreaterThan(0);
    expect(visits.some((v) => v.id === "visita-base")).toBe(true);
    expect(visit.steps.length).toBeGreaterThan(0);
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]?.image).toBe("https://media.tenor.com/2ZuUWp5LDfIAAAAM/konata-lucky-star.gif");
  });
});
