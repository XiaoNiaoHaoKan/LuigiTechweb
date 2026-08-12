<template>
  <AppShell title="Seleziona visita">
    <div class="aa-page-stack">
      <div class="aa-panel">
        <h2 class="aa-card__title">Visite disponibili</h2>
        <p class="aa-card__meta">
          Scegli il percorso da seguire all’interno del museo.
        </p>
      </div>

      <div v-if="loading" class="aa-panel">
        <p class="aa-card__meta">Caricamento visite...</p>
      </div>

      <div v-else-if="error" class="aa-panel">
        <p class="aa-card__meta" style="color:#c0392b;">
          {{ error }}
        </p>
      </div>

      <div v-else-if="visits.length === 0" class="aa-panel">
        <p class="aa-card__meta">
          Non ci sono visite disponibili per questo museo.
        </p>
      </div>

      <div v-else class="aa-page-stack">
        <button
          v-for="visit in visits"
          :key="visit.id"
          class="aa-card aa-card--clickable"
          type="button"
          @click="openVisit(visit.id)"
        >
          <h3 class="aa-card__title">{{ visit.title }}</h3>
          <p class="aa-card__meta">
            Tocca per iniziare la visita guidata.
          </p>
        </button>
      </div>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppShell from "../layouts/AppShell.vue";
import { api } from "../services/api";

type VisitSummary = { id: string; title: string };

const route = useRoute();
const router = useRouter();

const museumId = String(route.params.museumId);

const visits = ref<VisitSummary[]>([]);
const loading = ref(true);
const error = ref("");

onMounted(async () => {
  try {
    visits.value = await api.getVisits(museumId);
  } catch (e: any) {
    error.value = e?.message ?? "Errore nel caricamento delle visite.";
  } finally {
    loading.value = false;
  }
});

function openVisit(visitId: string) {
  router.push(`/museums/${museumId}/visits/${visitId}/navigator`);
}
</script>