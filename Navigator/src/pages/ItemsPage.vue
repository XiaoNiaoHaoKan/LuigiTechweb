<template>
  <AppShell title="Opere del museo">
    <div class="aa-page-stack">
      <div class="aa-panel">
        <h2 class="aa-card__title">Archivio opere</h2>
        <p class="aa-card__meta">
          Ogni opera include varianti di durata e linguaggio per adattarsi al visitatore.
        </p>
      </div>

      <div v-if="loading" class="aa-panel">
        <p class="aa-card__meta">Caricamento opere...</p>
      </div>

      <div v-else-if="error" class="aa-panel">
        <p class="aa-card__meta error-text">{{ error }}</p>
      </div>

      <div v-else-if="items.length === 0" class="aa-panel">
        <p class="aa-card__meta">Nessuna opera disponibile.</p>
      </div>

      <div v-else class="grid grid-3-3-3-3 centered">
        <article v-for="item in items" :key="item.id" class="aa-card">
          <h3 class="aa-card__title">{{ item.title || "Opera" }}</h3>

          <img
            v-if="item.image"
            :src="item.image"
            :alt="item.title || 'Immagine opera'"
            class="items-page__image"
          />

          <p class="aa-card__text">{{ item.text }}</p>

          <div class="tag-row mt-3">
            <span class="tag">Durata: {{ item.duration }}</span>
            <span class="tag">Livello: {{ item.languageLevel }}</span>
            <span v-if="item.room" class="tag">Sala: {{ item.room }}</span>
          </div>

          <img
            v-if="roomFloorplanFor(item.room)"
            :src="roomFloorplanFor(item.room)"
            :alt="`Planimetria sala ${item.room}`"
            class="items-page__image mt-2"
          />
        </article>
      </div>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import AppShell from "../layouts/AppShell.vue";
import { api, type Museum } from "../services/api";

type ItemView = {
  id: string;
  title?: string;
  duration: string;
  languageLevel: string;
  text: string;
  image?: string;
  room?: string;
};

const route = useRoute();
const museumId = String(route.params.museumId);

const items = ref<ItemView[]>([]);
const museum = ref<Museum | null>(null);
const loading = ref(true);
const error = ref("");

function roomFloorplanFor(roomName?: string): string {
  if (!roomName) return "";
  const room = museum.value?.rooms.find((r) => r.name === roomName);
  return room?.floorplanUrl || "";
}

onMounted(async () => {
  try {
    items.value = await api.getItems(museumId);
    museum.value = await api.getMuseum(museumId);
  } catch (e: any) {
    error.value = e?.message ?? "Errore nel caricamento delle opere.";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.items-page__image {
  width: 100%;
  max-height: 220px;
  object-fit: cover;
  border-radius: 12px;
  margin-top: 6px;
  border: 1px solid rgba(19, 52, 88, 0.15);
}
</style>