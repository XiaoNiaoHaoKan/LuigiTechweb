<template>
  <div class="widget-box">
    <p class="paragraph"><b>Scansiona il QR del museo</b></p>

    <video
      ref="videoRef"
      autoplay
      playsinline
      muted
      style="width:100%; border-radius:12px;"
    ></video>

    <div class="mt-3 d-flex gap-2 flex-wrap">
      <button class="button primary" type="button" @click="start" :disabled="running">
        Avvia camera
      </button>

      <button class="button secondary" type="button" @click="stop" :disabled="!running">
        Ferma
      </button>

      <label class="button secondary mb-0" style="cursor:pointer;">
        Carica immagine QR
        <input type="file" accept="image/*" @change="onFile" hidden />
      </label>
    </div>

    <p v-if="error" class="paragraph mt-3" style="color:#c0392b;">
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import { BrowserQRCodeReader } from "@zxing/browser";

const emit = defineEmits<{ (e: "decoded", value: string): void }>();

const videoRef = ref<HTMLVideoElement | null>(null);
const running = ref(false);
const error = ref("");

const reader = new BrowserQRCodeReader();
let controls: { stop: () => void } | null = null;

async function start() {
  error.value = "";

  const video = videoRef.value;
  if (!video) return;

  try {
    running.value = true;

    controls = await reader.decodeFromVideoDevice(
      undefined,
      video,
      (result) => {
        if (result) {
          emit("decoded", result.getText());
          stop();
        }
      }
    );
  } catch (e: any) {
    running.value = false;
    error.value = e?.message ?? "Impossibile avviare la fotocamera.";
  }
}

function stop() {
  if (controls) {
    controls.stop();
    controls = null;
  }
  running.value = false;
}

async function onFile(ev: Event) {
  error.value = "";

  const input = ev.target as HTMLInputElement;
  const file = input.files?.item(0);

  if (!file) return;

  const imageUrl = URL.createObjectURL(file);

  try {
    const result = await reader.decodeFromImageUrl(imageUrl);
    emit("decoded", result.getText());
  } catch {
    error.value = "QR non riconosciuto nell’immagine.";
  } finally {
    URL.revokeObjectURL(imageUrl);
    input.value = "";
  }
}
onBeforeUnmount(() => stop());
</script>