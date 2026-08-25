<template>
  <AppShell title="Visita sincronizzata">
    <div class="sync-page">
      <div v-if="loading" class="widget-box sync-card">
        <p class="paragraph">Collegamento alla visita in corso…</p>
      </div>

      <div v-else-if="error" class="widget-box sync-card">
        <h3 class="sync-title">Impossibile entrare nella visita</h3>
        <p class="paragraph sync-error">{{ error }}</p>
        <RouterLink class="button secondary" to="/sync">
          Torna all'accesso
        </RouterLink>
      </div>

      <template v-else-if="visit && currentItem">
        <div class="widget-box sync-card">
          <p class="sync-kicker">Studente collegato</p>

          <h3 class="sync-title">{{ visit.title }}</h3>

          <p class="paragraph">
            Codice visita: <b>{{ code }}</b>
          </p>

          <p class="paragraph">
            Studente: <b>{{ studentName }}</b>
          </p>

          <div class="sync-status">
            <span class="sync-pill" :class="{ 'sync-pill--active': visit.active }">
              {{ visit.active ? "Visita attiva" : "In attesa della docente" }}
            </span>

            <span class="sync-pill" :class="{ 'sync-pill--active': visit.isPlaying }">
              {{ visit.isPlaying ? "Audio in riproduzione" : "Audio fermo" }}
            </span>

            <span class="sync-pill" :class="{ 'sync-pill--active': visit.quizOpen }">
              {{ visit.quizOpen ? "Quiz aperto" : "Quiz non aperto" }}
            </span>
          </div>
        </div>

        <div class="widget-box sync-card">
          <p class="sync-kicker">
            Tappa {{ currentStepNumber }} di {{ totalSteps }}
          </p>

          <h3 class="sync-title">{{ currentItem.title }}</h3>

          <p class="paragraph sync-text">
            {{ currentItem.text }}
          </p>

          <p class="paragraph sync-meta">
            Durata: {{ currentItem.duration ?? "non indicata" }}
            · Livello: {{ currentItem.languageLevel ?? "non indicato" }}
            <span v-if="currentItem.room"> · Sala {{ currentItem.room }}</span>
          </p>

          <div class="sync-actions">
            <button class="button primary" type="button" @click="replayCurrent">
              Riascolta
            </button>

            <button class="button secondary" type="button" @click="sendRequest('more-detail')">
              Chiedi più dettagli
            </button>

            <button class="button secondary" type="button" @click="sendRequest('language')">
              Linguaggio più semplice
            </button>
          </div>

          <p v-if="requestMessage" class="paragraph sync-confirm">
            {{ requestMessage }}
          </p>
        </div>

        <div v-if="visit.quizOpen" class="widget-box sync-card">
          <h3 class="sync-title">Quiz finale</h3>

          <p v-if="!visit.quiz.length" class="paragraph">
            La docente ha aperto il quiz, ma non sono presenti domande.
          </p>

          <template v-else>
            <div
              v-for="(question, questionIndex) in visit.quiz"
              :key="questionIndex"
              class="quiz-question"
            >
              <p class="quiz-question-title">
                {{ questionIndex + 1 }}. {{ question.question }}
              </p>

              <label
                v-for="(answer, answerIndex) in question.answers"
                :key="answerIndex"
                class="quiz-answer"
              >
                <input
                  v-model="selectedAnswers[questionIndex]"
                  type="radio"
                  :name="`question-${questionIndex}`"
                  :value="answerIndex"
                  :disabled="quizSubmitted"
                />
                <span>{{ answer }}</span>
              </label>
            </div>

            <p v-if="quizError" class="paragraph sync-error">
              {{ quizError }}
            </p>

            <p v-if="quizResult" class="paragraph sync-confirm">
              Quiz inviato. Punteggio: {{ quizResult.score }} / {{ quizResult.total }}
            </p>

            <button
              class="button primary"
              type="button"
              :disabled="quizSubmitted"
              @click="submitQuiz"
            >
              Invia quiz
            </button>
          </template>
        </div>
      </template>

      <div v-else class="widget-box sync-card">
        <h3 class="sync-title">Nessun contenuto disponibile</h3>
        <p class="paragraph">
          La visita è stata trovata, ma non contiene tappe utilizzabili.
        </p>
      </div>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";
import AppShell from "../layouts/AppShell.vue";
import { syncApi, type SyncVisit } from "../services/syncApi";

const route = useRoute();

const code = computed(() => String(route.params.code ?? ""));
const studentName = computed(() => String(route.query.name ?? ""));

const visit = ref<SyncVisit | null>(null);
const loading = ref(true);
const error = ref("");
const requestMessage = ref("");

const selectedAnswers = ref<number[]>([]);
const quizSubmitted = ref(false);
const quizError = ref("");
const quizResult = ref<{
  studentName: string;
  score: number;
  total: number;
} | null>(null);

let pollingId: number | undefined;
let lastSpokenKey = "";

const currentIndex = computed(() => {
  return visit.value?.currentIndex ?? 0;
});

const orderedSequence = computed(() => {
  const sequence = visit.value?.sequence ?? [];

  return [...sequence].sort((a, b) => {
    return Number(a.order ?? 0) - Number(b.order ?? 0);
  });
});

const totalSteps = computed(() => orderedSequence.value.length);

const currentStep = computed(() => {
  return orderedSequence.value[currentIndex.value] ?? null;
});

const currentStepNumber = computed(() => {
  return currentIndex.value + 1;
});

const currentItem = computed(() => {
  return currentStep.value?.itemId ?? null;
});

const allQuizQuestionsAnswered = computed(() => {
  const questions = visit.value?.quiz ?? [];

  if (!questions.length) {
    return false;
  }

  return questions.every((_, index) => {
    return typeof selectedAnswers.value[index] === "number";
  });
});

async function loadVisit() {
  if (!code.value) return;

  visit.value = await syncApi.getVisit(code.value);
}

async function joinVisit() {
  if (!studentName.value.trim()) {
    throw new Error("Nome studente mancante.");
  }

  visit.value = await syncApi.joinVisit(code.value, studentName.value.trim());
}

function speak(text: string) {
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "it-IT";

  window.speechSynthesis.speak(utterance);
}

function replayCurrent() {
  if (!currentItem.value) return;

  speak(currentItem.value.text);
}

async function sendRequest(requestType: "more-detail" | "language") {
  if (!visit.value || !currentItem.value) return;

  requestMessage.value = "";

  await syncApi.createRequest(code.value, {
    studentName: studentName.value,
    stepIndex: currentIndex.value,
    itemId: currentItem.value._id,
    requestType,
    requestedDuration: requestType === "more-detail" ? "40s" : undefined,
    requestedLanguageLevel: requestType === "language" ? "semplice" : undefined
  });

  requestMessage.value =
    requestType === "more-detail"
      ? "Richiesta di approfondimento inviata alla docente."
      : "Richiesta di linguaggio più semplice inviata alla docente.";
}

async function submitQuiz() {
  quizError.value = "";

  if (!visit.value) return;

  if (!allQuizQuestionsAnswered.value) {
    quizError.value = "Rispondi a tutte le domande prima di inviare il quiz.";
    return;
  }

  const result = await syncApi.submitQuizAnswer(code.value, {
    studentName: studentName.value,
    answers: selectedAnswers.value
  });

  quizResult.value = result;
  quizSubmitted.value = true;
}

function handleTeacherPlayback() {
  if (!visit.value || !currentItem.value) return;

  const spokenKey = `${visit.value.currentIndex}-${visit.value.isPlaying}-${currentItem.value._id}`;

  if (!visit.value.isPlaying) {
    window.speechSynthesis.cancel();
    lastSpokenKey = "";
    return;
  }

  if (spokenKey !== lastSpokenKey) {
    lastSpokenKey = spokenKey;
    speak(currentItem.value.text);
  }
}

onMounted(async () => {
  try {
    await joinVisit();

    pollingId = window.setInterval(async () => {
      try {
        visit.value = await syncApi.joinVisit(code.value, studentName.value.trim());
      } catch {
        // Evitiamo di bloccare la pagina per un errore temporaneo di rete.
      }
    }, 2000);
    
  } catch (e: any) {
    error.value = e?.message ?? "Errore durante l'accesso alla visita.";
  } finally {
    loading.value = false;
  }
});

watch(
  () => [visit.value?.currentIndex, visit.value?.isPlaying, currentItem.value?._id],
  () => {
    handleTeacherPlayback();
  }
);

onUnmounted(() => {
  if (pollingId) {
    window.clearInterval(pollingId);
  }

  window.speechSynthesis.cancel();
});
</script>

<style scoped>
.sync-page {
  display: grid;
  gap: 18px;
}

.sync-card {
  max-width: 780px;
  margin: 0 auto;
  padding: 26px;
}

.sync-kicker {
  margin-bottom: 8px;
  color: #615dfa;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.sync-title {
  margin-bottom: 12px;
  font-size: 24px;
  font-weight: 800;
}

.sync-text {
  margin-top: 14px;
  font-size: 17px;
  line-height: 1.65;
}

.sync-meta {
  margin-top: 16px;
  opacity: 0.72;
}

.sync-status {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

.sync-pill {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  background: #ececf5;
  color: #555;
  font-size: 13px;
  font-weight: 700;
}

.sync-pill--active {
  background: #615dfa;
  color: #fff;
}

.sync-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
}

.sync-error {
  color: #c0392b;
  font-weight: 700;
}

.sync-confirm {
  margin-top: 16px;
  color: #2f855a;
  font-weight: 700;
}

.quiz-question {
  padding: 18px 0;
  border-top: 1px solid #ececf5;
}

.quiz-question-title {
  margin-bottom: 12px;
  font-weight: 800;
}

.quiz-answer {
  display: flex;
  gap: 10px;
  align-items: center;
  margin: 10px 0;
  cursor: pointer;
}

.quiz-answer input {
  width: 18px;
  height: 18px;
}
</style>