<template>
  <nav class="app-nav" aria-label="Menu principale">
    <button
      class="app-nav__item"
      :class="{ 'app-nav__item--active': isScanner }"
      type="button"
      @click="go('/')"
    >
      <span class="app-nav__icon">⌖</span>
      <span class="app-nav__label">Scanner</span>
    </button>

    <button
      class="app-nav__item"
      :class="{
        'app-nav__item--active': isVisits,
        'app-nav__item--disabled': !museumId
      }"
      type="button"
      :disabled="!museumId"
      @click="go(visitsPath)"
    >
      <span class="app-nav__icon">□</span>
      <span class="app-nav__label">Visite</span>
    </button>

    <button
      class="app-nav__item"
      :class="{
        'app-nav__item--active': isItems,
        'app-nav__item--disabled': !museumId
      }"
      type="button"
      :disabled="!museumId"
      @click="go(itemsPath)"
    >
      <span class="app-nav__icon">◎</span>
      <span class="app-nav__label">Opere</span>
    </button>

    <button
      class="app-nav__item"
      :class="{
        'app-nav__item--active': isNavigator,
        'app-nav__item--disabled': !museumId || !visitId
      }"
      type="button"
      :disabled="!museumId || !visitId"
      @click="go(navigatorPath)"
    >
      <span class="app-nav__icon">➤</span>
      <span class="app-nav__label">Navigator</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const museumId = computed(() => {
  const value = route.params.museumId;
  return typeof value === "string" ? value : "";
});

const visitId = computed(() => {
  const value = route.params.visitId;
  return typeof value === "string" ? value : "";
});

const visitsPath = computed(() => {
  if (!museumId.value) return "/";
  return `/museums/${museumId.value}/visits`;
});

const itemsPath = computed(() => {
  if (!museumId.value) return "/";
  return `/museums/${museumId.value}/items`;
});

const navigatorPath = computed(() => {
  if (!museumId.value || !visitId.value) return "/";
  return `/museums/${museumId.value}/visits/${visitId.value}/navigator`;
});

const isScanner = computed(() => route.path === "/");
const isVisits = computed(() => route.path.includes("/visits") && !route.path.includes("/navigator"));
const isItems = computed(() => route.path.includes("/items"));
const isNavigator = computed(() => route.path.includes("/navigator"));

function go(path: string) {
  router.push(path);
}
</script>

<style scoped>
.app-nav {
  position: fixed;
  left: 50%;
  bottom: 10px;
  z-index: 30;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  width: min(460px, calc(100% - 28px));
  padding: 7px;
  border-radius: 18px;
  background: rgba(16, 38, 58, 0.96);
  box-shadow: 0 13px 32px rgba(9, 26, 44, 0.36);
  border: 1px solid rgba(255, 255, 255, 0.14);
}

.app-nav__item {
  flex: 1;
  border: 0;
  border-radius: 12px;
  padding: 9px 4px 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.78);
  font: inherit;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease, transform 0.18s ease;
}

.app-nav__item:hover:not(:disabled) {
  background: rgba(250, 247, 187, 0.14);
}

.app-nav__item--active {
  color: #fff;
  background: var(--aa-accent);
  box-shadow: 0 8px 18px rgba(16, 38, 58, 0.32);
}

.app-nav__item--disabled {
  opacity: 0.42;
  cursor: not-allowed;
}

.app-nav__icon {
  display: block;
  font-size: 18px;
  line-height: 18px;
  margin-bottom: 3px;
}

.app-nav__label {
  display: block;
  font-size: 10.5px;
  font-weight: 800;
  letter-spacing: 0.01em;
}

@media (min-width: 768px) {
  .app-nav {
    bottom: 24px;
  }
}
</style>
