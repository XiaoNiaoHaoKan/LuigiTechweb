import { describe, expect, it } from "vitest";
import { nextDuration, pickItemByPreference, prevDuration, type Item } from "./itemSelect";

describe("itemSelect", () => {
  const items: Item[] = [
    { id: "a-3", duration: "3s", languageLevel: "base", text: "Breve" },
    { id: "a-15", duration: "15s", languageLevel: "medio", text: "Medio" },
    { id: "a-1m", duration: "1min", languageLevel: "alto", text: "Lungo" }
  ];

  it("sceglie la durata esatta quando disponibile", () => {
    const selected = pickItemByPreference(items, ["a-3", "a-15", "a-1m"], "15s");
    expect(selected?.id).toBe("a-15");
  });

  it("sceglie la durata piu vicina quando quella richiesta non c'e", () => {
    const selected = pickItemByPreference(items, ["a-3", "a-15", "a-1m"], "40s");
    expect(selected?.id).toBe("a-15");
  });

  it("restituisce null quando nessun item e associato alla tappa", () => {
    const selected = pickItemByPreference(items, ["missing"], "15s");
    expect(selected).toBeNull();
  });

  it("gestisce correttamente l'incremento/decremento dei livelli durata", () => {
    expect(nextDuration("15s")).toBe("40s");
    expect(nextDuration("4min")).toBe("4min");
    expect(prevDuration("15s")).toBe("3s");
    expect(prevDuration("3s")).toBe("3s");
  });
});
