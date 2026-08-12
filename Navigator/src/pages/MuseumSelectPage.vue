<template>
  <AppShell title="Accesso al museo">
    <div class="aa-page-stack">
      <div class="aa-panel">
        <h2 class="aa-card__title">Scansiona il museo</h2>
        <p class="aa-card__meta">
          Carica o inquadra il QR code del museo per iniziare la visita.
        </p>
      </div>

      <QrScanner @decoded="handleDecoded" />

      <div class="aa-panel">
        <p class="aa-card__meta">
          Il QR deve contenere solo l’identificativo del museo, ad esempio
          <b>demo-museum</b>.
        </p>

        <p v-if="hint" class="aa-card__meta mt-3" style="color:#c0392b;">
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
</script>