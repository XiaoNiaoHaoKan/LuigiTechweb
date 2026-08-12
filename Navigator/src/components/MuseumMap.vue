<template>
  <div class="museum-map">
    <img
      class="museum-map__image"
      :src="src"
      alt="Planimetria del museo"
    />

    <div
      v-if="marker"
      class="museum-map__marker"
      :style="markerStyle"
      aria-label="Posizione corrente"
    >
      <span class="museum-map__dot"></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

type Marker = {
  x: number;
  y: number;
};

const props = defineProps<{
  src: string;
  marker?: Marker;
}>();

const markerStyle = computed(() => ({
  left: `${props.marker?.x ?? 0}%`,
  top: `${props.marker?.y ?? 0}%`
}));
</script>

<style scoped>
.museum-map {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.06);
}

.museum-map__image {
  display: block;
  width: 100%;
  height: auto;
}

.museum-map__marker {
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 2;
}

.museum-map__dot {
  display: block;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e53935;
  border: 3px solid #ffffff;
  box-shadow: 0 0 0 4px rgba(229, 57, 53, 0.25);
}
</style>