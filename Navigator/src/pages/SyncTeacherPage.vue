<template>
  <AppShell title="Pannello docente">
    <div class="teacher-page">
      <div v-if="loading" class="widget-box teacher-card">
        <p class="paragraph">Caricamento visita sincronizzata…</p>
      </div>

      <div v-else-if="error" class="widget-box teacher-card">
        <h3 class="teacher-title">Errore</h3>
        <p class="paragraph teacher-error">{{ error }}</p>
        <RouterLink class="button secondary" to="/sync">
          Torna all'accesso
        </RouterLink>
      </div>

      <template v-else-if="visit">
        <div class="widget-box teacher-card">
          <p class="teacher-kicker">Pannello docente</p>

          <h3 class="teacher-title">{{ visit.title }}</h3>

          <p class="paragraph">
            Codice visita: <b>{{ code }}</b>
          </p>

          <div class="teacher-status">
            <span class="teacher-pill" :class="{ 'teacher-pill--active': visit.active }">
              {{ visit.active ? "Visita attiva" : "Visita non attiva" }}
            </span>

            <span class="teacher-pill" :class="{ 'teacher-pill--active': visit.isPlaying }">
              {{ visit.isPlaying ? "Audio in riproduzione" : "Audio fermo" }}
            </span>

            <span class="teacher-pill" :class="{ 'teacher-pill--active': visit.quizOpen }">
              {{ visit.quizOpen ? "Quiz aperto" : "Quiz chiuso" }}
            </span>
          </div>

          <div class="teacher-actions">
            <button class="button primary" type="button" @click="activateVisit">
              Attiva visita
            </button>

            <button
              class="button secondary"
              type="button"
              :disabled="!canGoPrevious"
              @click="goPrevious"
            >
              Tappa precedente
            </button>

            <button
              class="button secondary"
              type="button"
              :disabled="!canGoNext"
              @click="goNext"
            >
              Tappa successiva
            </button>

            <button class="button primary" type="button" @click="playAudio">
              Play
            </button>

            <button class="button secondary" type="button" @click="stopAudio">
              Stop
            </button>

            <button class="button secondary" type="button" @click="toggleQuiz">
              {{ visit.quizOpen ? "Chiudi quiz" : "Apri quiz" }}
            </button>
          </div>

          <p v-if="actionMessage" class="paragraph teacher-confirm">
            {{ actionMessage }}
          </p>
        </div>

        <div class="widget-box teacher-card">
          <p class="teacher-kicker">
            Tappa {{ currentStepNumber }} di {{ totalSteps }}
          </p>

          <h3 class="teacher-title">
            {{ currentItem?.title ?? "Nessuna opera disponibile" }}
          </h3>

          <p v-if="currentItem" class="paragraph teacher-text">
            {{ currentItem.text }}
          </p>

          <p v-if="currentItem" class="paragraph teacher-meta">
            Durata: {{ currentItem.duration ?? "non indicata" }}
            · Livello: {{ currentItem.languageLevel ?? "non indicato" }}
            <span v-if="currentItem.room"> · Sala {{ currentItem.room }}</span>
          </p>
        </div>

        <div class="teacher-grid">
          <div class="widget-box teacher-card">
            <h3 class="teacher-subtitle">
              Studenti collegati
            </h3>

            <p class="paragraph">
              Totale: <b>{{ visit.participants.length }}</b>
            </p>

            <ul v-if="visit.participants.length" class="teacher-list">
              <li v-for="participant in visit.participants" :key="participant.name">
                <b>{{ participant.name }}</b>

                <span
                  class="teacher-mini-pill"
                  :class="{ 'teacher-mini-pill--online': isParticipantOnline(participant.lastSeen) }"
                >
                  {{ isParticipantOnline(participant.lastSeen) ? "online" : "non aggiornato" }}
                </span>

                <span v-if="participant.lastSeen">
                  — ultimo aggiornamento {{ formatDate(participant.lastSeen) }}
                </span>
              </li>
            </ul>

            <p v-else class="paragraph">
              Nessuno studente collegato.
            </p>
          </div>

          <div class="widget-box teacher-card">
            <h3 class="teacher-subtitle">
              Richieste studenti
            </h3>

            <ul v-if="latestRequests.length" class="teacher-list">
              <li v-for="request in latestRequests" :key="request.createdAt + request.studentName">
                <b>{{ request.studentName }}</b>
                — {{ requestLabel(request.requestType) }}
                <span>
                  alla tappa {{ Number(request.stepIndex) + 1 }}
                </span>
                <small v-if="request.createdAt">
                  {{ formatDate(request.createdAt) }}
                </small>
              </li>
            </ul>

            <p v-else class="paragraph">
              Nessuna richiesta ricevuta.
            </p>
          </div>
        </div>

        <div class="widget-box teacher-card">
          <h3 class="teacher-subtitle">
            Risultati quiz
          </h3>

          <p class="paragraph">
            Domande previste: <b>{{ visit.quiz.length }}</b>
          </p>

          <ul v-if="visit.quizAnswers?.length" class="teacher-list">
            <li v-for="answer in visit.quizAnswers" :key="answer.studentName">
              <b>{{ answer.studentName }}</b>
              — voto {{ answer.score }} / {{ visit.quiz.length }}
            </li>
          </ul>

          <p v-else class="paragraph">
            Nessuna risposta al quiz ancora inviata.
          </p>
        </div>
      </template>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { RouterLink, useRoute } from "vue-router";
import AppShell from "../layouts/AppShell.vue";
import { syncApi, type SyncVisit, type SyncRequest } from "../services/syncApi";

const route = useRoute();

const code = computed(() => String(route.params.code ?? ""));

const visit = ref<SyncVisit | null>(null);
const loading = ref(true);
const error = ref("");
const actionMessage = ref("");

let pollingId: number | undefined;

const orderedSequence = computed(() => {
  const sequence = visit.value?.sequence ?? [];

  return [...sequence].sort((a, b) => {
    return Number(a.order ?? 0) - Number(b.order ?? 0);
  });
});

const totalSteps = computed(() => orderedSequence.value.length);

const currentIndex = computed(() => {
  return visit.value?.currentIndex ?? 0;
});

const currentStep = computed(() => {
  return orderedSequence.value[currentIndex.value] ?? null;
});

const currentItem = computed(() => {
  return currentStep.value?.itemId ?? null;
});

const currentStepNumber = computed(() => {
  if (totalSteps.value === 0) {
    return 0;
  }

  return currentIndex.value + 1;
});

const canGoPrevious = computed(() => {
  return currentIndex.value > 0;
});

const canGoNext = computed(() => {
  return currentIndex.value < totalSteps.value - 1;
});

const latestRequests = computed(() => {
  const requests = visit.value?.requests ?? [];

  return [...requests].reverse().slice(0, 10);
});

async function loadVisit() {
  if (!code.value) return;

  visit.value = await syncApi.getVisit(code.value);
}

async function activateVisit() {
  actionMessage.value = "";

  visit.value = await syncApi.activateVisit(code.value);
  actionMessage.value = "Visita attivata. Gli studenti possono collegarsi.";
}

async function updateState(payload: {
  currentIndex?: number;
  isPlaying?: boolean;
}) {
  actionMessage.value = "";

  visit.value = await syncApi.updateState(code.value, payload);
}

async function goPrevious() {
  if (!canGoPrevious.value) return;

  await updateState({
    currentIndex: currentIndex.value - 1,
    isPlaying: false
  });

  actionMessage.value = "Tappa precedente impostata.";
}

async function goNext() {
  if (!canGoNext.value) return;

  await updateState({
    currentIndex: currentIndex.value + 1,
    isPlaying: false
  });

  actionMessage.value = "Tappa successiva impostata.";
}

async function playAudio() {
  await updateState({
    isPlaying: true
  });

  actionMessage.value = "Audio avviato sugli studenti collegati.";
}

async function stopAudio() {
  await updateState({
    isPlaying: false
  });

  actionMessage.value = "Audio fermato.";
}

async function toggleQuiz() {
  if (!visit.value) return;

  const newValue = !visit.value.quizOpen;

  visit.value = await syncApi.setQuizOpen(code.value, newValue);

  actionMessage.value = newValue
    ? "Quiz aperto per gli studenti."
    : "Quiz chiuso.";
}

function requestLabel(requestType: SyncRequest["requestType"]) {
  if (requestType === "more-detail") {
    return "ha chiesto più dettagli";
  }

  if (requestType === "less-detail") {
    return "ha chiesto una versione più breve";
  }

  if (requestType === "language") {
    return "ha chiesto un linguaggio più semplice";
  }

  if (requestType === "replay") {
    return "ha chiesto di riascoltare";
  }

  return "ha inviato una richiesta";
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("it-IT", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function isParticipantOnline(lastSeen?: string) {
  if (!lastSeen) {
    return false;
  }

  const date = new Date(lastSeen);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const secondsSinceLastSeen = (Date.now() - date.getTime()) / 1000;

  return secondsSinceLastSeen <= 8;
}

onMounted(async () => {
  try {
    await loadVisit();

    pollingId = window.setInterval(async () => {
      try {
        await loadVisit();
      } catch {
        // Evitiamo di bloccare il pannello per un errore temporaneo.
      }
    }, 2000);
  } catch (e: any) {
    error.value = e?.message ?? "Errore durante il caricamento della visita.";
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  if (pollingId) {
    window.clearInterval(pollingId);
  }
});
</script>

<style scoped>

.teacher-page {
  display: grid;
  gap: 18px;
  width: 100%;
}

.teacher-card {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 26px;
  box-sizing: border-box;
}

.teacher-card * {
  box-sizing: border-box;
}

.teacher-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  width: 100%;
  margin: 0;
}

.teacher-grid .teacher-card {
  width: 100%;
  margin: 0;
}

.teacher-kicker {
  margin-bottom: 8px;
  color: var(--aa-accent);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.teacher-title {
  margin-bottom: 12px;
  font-size: 24px;
  font-weight: 800;
}

.teacher-subtitle {
  margin-bottom: 12px;
  font-size: 20px;
  font-weight: 800;
}

.teacher-text {
  margin-top: 14px;
  font-size: 17px;
  line-height: 1.65;
}

.teacher-meta {
  margin-top: 16px;
  opacity: 0.72;
}

.teacher-status {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.teacher-pill {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: #f0ebe3;
  color: #555;
  font-size: 13px;
  font-weight: 700;
}

.teacher-pill--active {
  background: var(--aa-accent);
  color: #fff;
}

.teacher-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 22px;
}

.teacher-actions .button {
  width: 100%;
  justify-content: center;
  text-align: center;
}

.teacher-list {
  display: grid;
  gap: 10px;
  margin-top: 14px;
  padding-left: 18px;
}

.teacher-list small {
  display: block;
  margin-top: 4px;
  opacity: 0.65;
}

.teacher-mini-pill {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  margin-left: 8px;
  padding: 0 8px;
  border-radius: 999px;
  background: #f0ebe3;
  color: #555;
  font-size: 12px;
  font-weight: 800;
}

.teacher-mini-pill--online {
  background: #2f855a;
  color: #fff;
}

.teacher-error {
  color: #c0392b;
  font-weight: 700;
}

.teacher-confirm {
  margin-top: 16px;
  color: #2f855a;
  font-weight: 700;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

@media (max-width: 760px) {
  .teacher-grid {
    grid-template-columns: 1fr;
  }

  .teacher-actions {
    grid-template-columns: 1fr;
  }
}
</style>
