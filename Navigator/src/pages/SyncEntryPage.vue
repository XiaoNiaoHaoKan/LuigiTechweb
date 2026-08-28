<template>
  <AppShell title="Visita sincronizzata">
    <div class="widget-box sync-box">
      <h3 class="sync-title">Entra in una visita guidata</h3>

      <p class="paragraph">
        Inserisci il codice comunicato dalla docente e il tuo nome.
      </p>

      <div class="form-row">
        <label class="form-label">Codice visita</label>
        <input v-model="code" class="form-input" type="text" placeholder="Es. RINASCIMENTO" />
      </div>

      <div class="form-row">
        <label class="form-label">Nome studente</label>
        <input v-model="studentName" class="form-input" type="text" placeholder="Es. Mario Rossi" />
      </div>

      <p v-if="error" class="sync-error">{{ error }}</p>

      <div class="sync-actions">
        <button class="button primary" type="button" @click="enterAsStudent">
          Entra come studente
        </button>

        <button class="button secondary" type="button" @click="enterAsTeacher">
          Pannello docente
        </button>
      </div>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppShell from "../layouts/AppShell.vue";

const router = useRouter();
const route = useRoute();

const code = ref(String(route.query.code ?? "RINASCIMENTO"));
const studentName = ref("");
const error = ref("");

function cleanCode() {
  return code.value.trim();
}

function enterAsStudent() {
  error.value = "";

  if (!cleanCode()) {
    error.value = "Inserisci il codice della visita.";
    return;
  }

  if (!studentName.value.trim()) {
    error.value = "Inserisci il nome dello studente.";
    return;
  }

  router.push({
    path: `/sync/${encodeURIComponent(cleanCode())}/student`,
    query: {
      name: studentName.value.trim()
    }
  });
}

function enterAsTeacher() {
  error.value = "";

  if (!cleanCode()) {
    error.value = "Inserisci il codice della visita.";
    return;
  }

  router.push(`/sync/${encodeURIComponent(cleanCode())}/teacher`);
}
</script>

<style scoped>
.sync-box {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 28px;
  box-sizing: border-box;
}

.sync-box * {
  box-sizing: border-box;
}

.sync-title {
  margin-bottom: 12px;
  font-size: 24px;
  font-weight: 700;
}

.form-row {
  margin-top: 18px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 700;
}

.form-input {
  display: block;
  width: 100%;
  min-height: 46px;
  border: 1px solid var(--aa-border);
  border-radius: 12px;
  padding: 0 14px;
  font: inherit;
}

.form-input:focus {
  outline: none;
  border-color: var(--aa-accent);
  box-shadow: 0 0 0 3px rgba(173, 98, 61, 0.18);
}

.sync-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 22px;
}

.sync-actions .button {
  width: 100%;
  justify-content: center;
  text-align: center;
}

.sync-error {
  margin-top: 14px;
  color: #c0392b;
  font-weight: 700;
}

@media (max-width: 760px) {
  .sync-actions {
    grid-template-columns: 1fr;
  }
}
</style>
