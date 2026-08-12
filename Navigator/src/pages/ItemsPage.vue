<template>
  <AppShell title="Opere del museo">
    <div v-if="loading" class="widget-box">
      <p class="paragraph">Caricamento opere…</p>
    </div>

    <div v-else-if="error" class="widget-box">
      <p class="paragraph" style="color:#c0392b;">{{ error }}</p>
    </div>

    <div v-else-if="items.length === 0" class="widget-box">
      <p class="paragraph">Nessuna opera disponibile.</p>
    </div>

    <div v-else class="grid grid-3-3-3-3 centered">
      <div v-for="item in items" :key="item.id" class="widget-box">
        <p class="paragraph">
          <b>{{ item.title || "Opera" }}</b>
        </p>

        <p class="paragraph small">
          {{ item.text }}
        </p>

        <p class="paragraph small" style="opacity:0.7;">
          Durata: {{ item.duration }} · Livello: {{ item.languageLevel }}
        </p>
      </div>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import AppShell from "../layouts/AppShell.vue";
import { api } from "../services/api";

type ItemView = {
  id: string;
  title?: string;
  duration: string;
  languageLevel: string;
  text: string;
};

const route = useRoute();
const museumId = String(route.params.museumId);

const items = ref<ItemView[]>([]);
const loading = ref(true);
const error = ref("");

onMounted(async () => {
  try {
    items.value = await api.getItems(museumId);
  } catch (e: any) {
    error.value = e?.message ?? "Errore nel caricamento delle opere.";
  } finally {
    loading.value = false;
  }
});
</script>