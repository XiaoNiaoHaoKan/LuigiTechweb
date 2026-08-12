<template>
  <AppShell title="Navigator">
    <div class="aa-page-stack">
      <div v-if="loading" class="aa-panel">
        <p class="aa-card__meta">Caricamento visita…</p>
      </div>

      <div v-else-if="error" class="aa-panel">
        <p class="aa-card__meta" style="color:#c0392b;">
          {{ error }}
        </p>
      </div>

      <template v-else>
        <!-- Intestazione visita -->
        <section class="aa-panel">
          <h2 class="aa-card__title">
            {{ visitTitle }}
          </h2>

          <p class="aa-card__meta">
            Tappa {{ stepIndex + 1 }} di {{ steps.length }} · Livello dettaglio:
            <b>{{ preferredDuration }}</b>
          </p>
        </section>

        <!-- Contenuto + mappa -->
        <div class="aa-page-grid">
          <!-- Colonna sinistra: contenuto/opera -->
          <article class="aa-card">
            <h3 class="aa-card__title">
              Contenuto dell’opera
            </h3>

            <p class="aa-card__meta">
              Testo selezionato per il livello di dettaglio corrente.
            </p>

            <p class="aa-card__text" style="white-space: pre-wrap;">
              {{ currentText }}
            </p>

            <div class="aa-actions">
              <button
                class="button primary"
                type="button"
                @click="speak"
                :disabled="!currentText"
              >
                ▶ Ascolta
              </button>

              <button
                class="button secondary"
                type="button"
                @click="stopSpeaking"
                :disabled="!speaking"
              >
                ■ Stop
              </button>
            </div>

            <hr class="mt-4 mb-4" />

            <div class="aa-actions">
              <button
                class="button secondary"
                type="button"
                @click="lessDetail"
              >
                Di meno
              </button>

              <button
                class="button secondary"
                type="button"
                @click="moreDetail"
              >
                Di più
              </button>
            </div>

            <p
              v-if="hint"
              class="aa-card__meta mt-3"
              style="opacity:0.8;"
            >
              {{ hint }}
            </p>
          </article>

          <!-- Colonna destra: mappa -->
          <aside id="mappa" class="aa-card">
            <h3 class="aa-card__title">
              Mappa del museo
            </h3>

            <p class="aa-card__meta">
              Il marker indica la posizione corrente nella visita.
            </p>

            <div class="mt-3">
              <MuseumMap
                :src="floorplanSrc"
                :marker="currentMarker"
              />
            </div>

            <div class="mt-3">
              <p class="aa-card__meta">
                <b>Indicazioni</b>
              </p>

              <p class="aa-card__text">
                {{ currentStep?.directions ?? "" }}
              </p>
            </div>
          </aside>
        </div>

        <!-- Navigazione tra tappe -->
        <section class="aa-panel navigator-page__footer">
          <button
            class="button secondary"
            type="button"
            @click="prevStep"
            :disabled="stepIndex === 0"
          >
            ← Precedente
          </button>

          <button
            class="button primary"
            type="button"
            @click="nextStep"
            :disabled="stepIndex === steps.length - 1"
          >
            Successivo →
          </button>
        </section>
      </template>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import AppShell from "../layouts/AppShell.vue";
import { api } from "../services/api";
import { nextDuration, prevDuration, pickItemByPreference, type Item } from "../utils/itemSelect";
import MuseumMap from "../components/MuseumMap.vue";


type VisitStep = {
  directions: string;
  items: string[];
  map?: {
    x: number;
    y: number;
  };
};

type Visit = {
  id: string;
  title: string;
  floorplan?: string;
  steps: VisitStep[];
};

const floorplanSrc = computed(() => {
  return visit.value?.floorplan ?? `${import.meta.env.BASE_URL}img/museo1-planimetria.png`;
});

const currentMarker = computed(() => currentStep.value?.map);


const route = useRoute();
const museumId = String(route.params.museumId);
const visitId = String(route.params.visitId);

const loading = ref(true);
const error = ref("");

const visit = ref<Visit | null>(null);
const items = ref<Item[]>([]);

const stepIndex = ref(0);
const preferredDuration = ref("15s"); // default “umano”
const hint = ref("");

const speaking = ref(false);
let utterance: SpeechSynthesisUtterance | null = null;

const steps = computed(() => visit.value?.steps ?? []);
const currentStep = computed(() => steps.value[stepIndex.value] ?? null);

const visitTitle = computed(() => visit.value?.title ?? "");

const currentItem = computed(() => {
  const step = currentStep.value;
  if (!step) return null;
  return pickItemByPreference(items.value, step.items, preferredDuration.value);
});

const currentText = computed(() => currentItem.value?.text ?? "");

onMounted(async () => {
  try {
    loading.value = true;
    visit.value = await api.getVisit(museumId, visitId);
    items.value = await api.getItems(museumId);
  } catch (e: any) {
    error.value = e?.message ?? "Errore nel caricamento della visita.";
  } finally {
    loading.value = false;
  }
});

watch([stepIndex, preferredDuration], () => {
  hint.value = "";
  stopSpeaking();
});

function nextStep() {
  if (stepIndex.value < steps.value.length - 1) stepIndex.value += 1;
}

function prevStep() {
  if (stepIndex.value > 0) stepIndex.value -= 1;
}

function moreDetail() {
  const next = nextDuration(preferredDuration.value);
  preferredDuration.value = next;
  hint.value = next === preferredDuration.value ? "" : "";
}

function lessDetail() {
  preferredDuration.value = prevDuration(preferredDuration.value);
}

function speak() {
  stopSpeaking();

  const text = currentText.value;
  if (!text) return;

  utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "it-IT";

  utterance.onend = () => {
    speaking.value = false;
    utterance = null;
  };
  utterance.onerror = () => {
    speaking.value = false;
    utterance = null;
  };

  speaking.value = true;
  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
  speaking.value = false;
  utterance = null;
}

onBeforeUnmount(() => stopSpeaking());
</script>