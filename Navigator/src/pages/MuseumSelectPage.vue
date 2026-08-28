<template>
  <AppShell title="Accesso al museo">
    <div class="aa-page-stack">
      <div class="aa-panel">
        <h2 class="aa-card__title">Inizia la visita</h2>
        <p class="aa-card__meta">
          Inquadra o carica il QR del museo per aprire subito visite, opere e mappa guidata.
        </p>

        <div class="tag-row mt-3">
          <span class="tag">Interessi personalizzati</span>
          <span class="tag">Linguaggio adattivo</span>
          <span class="tag">Contenuti accessibili</span>
        </div>
      </div>

      <QrScanner @decoded="handleDecoded" />

      <div class="aa-panel">
        <p class="aa-card__meta">
          Puoi usare il QR del museo o quello di una visita specifica.
        </p>

        <div class="home-actions mt-3">
          <button
            class="button accent"
            type="button"
            @click="startDemoVisit"
          >
            Visita demo
          </button>

          <button
            class="button secondary"
            type="button"
            @click="openSyncVisit"
          >
            Entra in una visita sincronizzata
          </button>
        </div>

        <div class="sync-info-box">
          <p class="aa-card__meta">
            Hai un codice fornito dalla docente o dalla guida? Usa l’accesso alla visita sincronizzata.
          </p>
        </div>

        <p v-if="hint" class="aa-card__meta mt-3 error-text">
          {{ hint }}
        </p>
      </div>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import AppShell from "../layouts/AppShell.vue";
import QrScanner from "../components/QrScanner.vue";

const router = useRouter();
const hint = ref("");

function handleDecoded(raw: string) {
  const value = raw.trim();

  if (!value) {
    hint.value = "QR vuoto o non leggibile.";
    return;
  }

  let museumId = value;
  let visitId = "";

  if (value.startsWith("{")) {
    try {
      const payload = JSON.parse(value) as {
        type?: string;
        museumId?: string;
        visitId?: string;
        syncCode?: string;
      };

      if (payload.type === "artaroud-museum" && payload.museumId) {
        museumId = payload.museumId;
      } else if (
        payload.type === "artaroud-visit" &&
        payload.museumId &&
        payload.visitId
      ) {
        museumId = payload.museumId;
        visitId = payload.visitId;
        if (payload.syncCode) {
          router.push(`/sync?code=${encodeURIComponent(payload.syncCode)}`);
          return;
        }
      } else {
        throw new Error("Payload QR non riconosciuto");
      }
    } catch {
      hint.value = "QR non valido: payload ArtAround non riconosciuto.";
      return;
    }
  }

  if (
    !museumId ||
    museumId.includes("/") ||
    museumId.includes("?") ||
    museumId.includes("#") ||
    visitId.includes("/") ||
    visitId.includes("?") ||
    visitId.includes("#")
  ) {
    hint.value = "QR non valido: identificativo museo o visita non valido.";
    return;
  }

  localStorage.setItem("artarround:selectedMuseumId", museumId);
  router.push(
    visitId
      ? `/museums/${museumId}/visits/${visitId}/navigator`
      : `/museums/${museumId}/visits/all-items/navigator`
  );
}

function startDemoVisit() {
  const demoMuseumId = "demo-museum";
  localStorage.setItem("artarround:selectedMuseumId", demoMuseumId);
  router.push(`/museums/${demoMuseumId}/visits`);
}

function openSyncVisit() {
  router.push("/sync");
}
</script>

<style scoped>
.home-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.home-actions .button {
  width: 100%;
  justify-content: center;
  text-align: center;
}

.sync-info-box {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

@media (max-width: 760px) {
  .home-actions {
    grid-template-columns: 1fr;
  }
}
</style>
