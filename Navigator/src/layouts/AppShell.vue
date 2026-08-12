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
                Percorsi museali interattivi, contenuti culturali e visite guidate digitali.
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
          </nav>
        </header>

        <main class="app-shell__main">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { RouterLink, useRoute } from "vue-router";

defineProps<{
  title: string;
}>();

const route = useRoute();

const selectedMuseumId = ref(
  localStorage.getItem("artarround:selectedMuseumId") ?? ""
);

watchEffect(() => {
  const routeMuseumId = route.params.museumId;

  if (typeof routeMuseumId === "string" && routeMuseumId) {
    selectedMuseumId.value = routeMuseumId;
    localStorage.setItem("artarround:selectedMuseumId", routeMuseumId);
  }
});

const showMapLink = computed(() => {
  return route.path.includes("/navigator");
});
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background-image: url("/img/museum-bg.jpg");
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

.app-shell__overlay {
  min-height: 100vh;
  background: rgba(10, 12, 20, 0.55);
  padding: 32px 0;
}

.app-shell__container {
  width: min(1120px, calc(100% - 32px));
  margin: 0 auto;
}

.app-shell__main {
  width: 100%;
}
</style>