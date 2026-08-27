<template>
  <AppShell title="Navigator">
    <div class="aa-page-stack">
      <div v-if="loading" class="aa-panel">
        <p class="aa-card__meta">Caricamento visita...</p>
      </div>

      <div v-else-if="error" class="aa-panel">
        <p class="aa-card__meta error-text">
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

          <div class="tag-row mt-3">
            <span class="tag">Guida vocale</span>
            <span class="tag">Indicazioni logistiche</span>
            <span class="tag">Comandi rapidi</span>
          </div>
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

            <img
              v-if="currentImage"
              :src="currentImage"
              :alt="currentItemTitle"
              class="navigator-page__image"
            />

            <p class="aa-card__text" style="white-space: pre-wrap;">
              {{ currentText || "Nessun contenuto disponibile per questa tappa." }}
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
                class="button accent"
                type="button"
                @click="moreDetail"
              >
                Di più
              </button>
            </div>

            <p
              v-if="hint"
              class="aa-card__meta mt-3"
              style="opacity:0.86;"
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
import { api, type Museum } from "../services/api";
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

const museum = ref<Museum | null>(null);

const roomFloorplanUrl = computed(() => {
  const roomName = currentItem.value?.room;
  if (!roomName) return "";
  const room = museum.value?.rooms.find((r) => r.name === roomName);
  return room?.floorplanUrl || "";
});

const floorplanSrc = computed(() => {
  return (
    roomFloorplanUrl.value ||
    visit.value?.floorplan ||
    `${import.meta.env.BASE_URL}img/museo1-planimetria.png`
  );
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
const currentImage = computed(() => currentItem.value?.image ?? "");
const currentItemTitle = computed(() => currentItem.value?.title ?? "Immagine opera");

onMounted(async () => {
  try {
    loading.value = true;
    visit.value = await api.getVisit(museumId, visitId);
    items.value = await api.getItems(museumId);
    museum.value = await api.getMuseum(museumId);
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
  if (next === preferredDuration.value) {
    hint.value = "Sei gia al massimo livello di dettaglio.";
    return;
  }

  preferredDuration.value = next;
  hint.value = "Maggiore dettaglio attivato.";
}

function lessDetail() {
  const prev = prevDuration(preferredDuration.value);
  if (prev === preferredDuration.value) {
    hint.value = "Sei gia al livello minimo di dettaglio.";
    return;
  }

  preferredDuration.value = prev;
  hint.value = "Dettaglio ridotto.";
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

<style scoped>
.navigator-page__footer {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.navigator-page__footer .button {
  flex: 1;
}

.navigator-page__image {
  width: 100%;
  max-height: 260px;
  object-fit: cover;
  border-radius: 12px;
  margin-top: 10px;
  border: 1px solid rgba(19, 52, 88, 0.15);
}
</style>