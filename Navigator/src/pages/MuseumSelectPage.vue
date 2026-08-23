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
          Il QR deve contenere solo l’identificativo del museo, ad esempio
          <b>demo-museum</b>.
        </p>

        <div class="mt-3">
          <button
            class="button accent"
            type="button"
            @click="startDemoVisit"
          >
            Visita demo
          </button>
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
  const museumId = raw.trim();

  if (!museumId) {
    hint.value = "QR vuoto o non leggibile.";
    return;
  }

  // regola: nel QR c’è solo l'id, quindi non accettiamo url o path
  if (museumId.includes("/") || museumId.includes("?") || museumId.includes("#")) {
    hint.value = "QR non valido: atteso solo l’identificativo del museo.";
    return;
  }
  localStorage.setItem("artarround:selectedMuseumId", museumId);
  router.push(`/museums/${museumId}/visits`);
}

function startDemoVisit() {
  const demoMuseumId = "demo-museum";
  localStorage.setItem("artarround:selectedMuseumId", demoMuseumId);
  router.push(`/museums/${demoMuseumId}/visits`);
}
</script>