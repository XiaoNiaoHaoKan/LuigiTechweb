<template>
  <div class="app-shell">
    <div class="app-shell__overlay">
      <div class="app-shell__container">
        <header class="aa-banner">
          <div class="aa-banner__brand">
            <div class="aa-logo">
              <span>A</span>
            </div>

            <div>
              <p class="aa-banner__eyebrow">Museum navigator</p>
              <h1 class="aa-banner__title">ArtAround</h1>
              <p class="aa-banner__subtitle">
                {{ title }}
              </p>
            </div>
          </div>

          <nav class="aa-nav">
            <RouterLink class="aa-nav__link" to="/">
              Home
            </RouterLink>

            <RouterLink
              v-if="selectedMuseumId"
              class="aa-nav__link"
              :to="`/museums/${selectedMuseumId}/visits`"
            >
              Visite
            </RouterLink>

            <a
              v-if="showMapLink"
              class="aa-nav__link"
              href="#mappa"
            >
              Mappa
            </a>

            <a
              v-if="museumMapUrl"
              class="aa-nav__link"
              :href="museumMapUrl"
              target="_blank"
              rel="noopener"
            >
              Mappa del museo
            </a>
          </nav>
        </header>

        <main class="app-shell__main">
          <slot />
        </main>

        <AppNav />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { RouterLink, useRoute } from "vue-router";
import AppNav from "../components/AppNav.vue";
import { api } from "../services/api";

defineProps<{
  title: string;
}>();

const route = useRoute();

const selectedMuseumId = ref(
  localStorage.getItem("artarround:selectedMuseumId") ?? ""
);

const museumMapUrl = ref("");

watchEffect(() => {
  const routeMuseumId = route.params.museumId;

  if (typeof routeMuseumId === "string" && routeMuseumId) {
    selectedMuseumId.value = routeMuseumId;
    localStorage.setItem("artarround:selectedMuseumId", routeMuseumId);
  }
});

watchEffect(async () => {
  const museumId = selectedMuseumId.value;
  museumMapUrl.value = "";

  if (!museumId) return;

  const museum = await api.getMuseum(museumId);
  museumMapUrl.value = museum?.mapUrl || "";
});

const showMapLink = computed(() => {
  return route.path.includes("/navigator");
});
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background:
    radial-gradient(
      circle at 12% 0%,
      rgba(173, 98, 61, 0.1),
      transparent 30rem
    ),
    radial-gradient(
      circle at 88% 8%,
      rgba(23, 50, 77, 0.1),
      transparent 34rem
    ),
    var(--aa-ivory);
}

.app-shell__overlay {
  min-height: 100vh;
  padding: 16px 0 94px;
  background: transparent;
}

.app-shell__container {
  width: min(1100px, calc(100% - 20px));
  margin: 0 auto;
}

.app-shell__main {
  width: 100%;
}

@media (min-width: 768px) {
  .app-shell__overlay {
    padding: 22px 0 108px;
  }

  .app-shell__container {
    width: min(1100px, calc(100% - 34px));
  }
}
</style>
