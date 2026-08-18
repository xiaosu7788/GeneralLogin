<template>
  <div class="page-panel state-page">
    <section class="panel-card panel-card--strong state-card relogin-card">
      <div class="state-icon state-icon--blue">↻</div>
      <h1>{{ t('relogin.title') }}</h1>
      <p class="muted">{{ t('relogin.text') }}</p>
      <div class="state-progress">
        <span></span>
      </div>
      <p class="state-hint">{{ t('common.loading') }}</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";

const route = useRoute();
const { t, theme, locale } = usePortalI18n();

function buildLoginUrl() {
  const params = new URLSearchParams();
  for (const key of ["client_id", "callback", "state"]) {
    const value = route.query[key];
    if (value) {
      params.set(key, String(value));
    }
  }
  params.set("theme", theme.value);
  params.set("locale", locale.value);

  const query = params.toString();
  return query ? `/login?${query}` : "/login";
}

onMounted(async () => {
  await $fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
  await navigateTo(buildLoginUrl());
});
</script>

<style scoped>
.state-page {
  display: grid;
  min-height: 100vh;
  place-items: center;
}

.state-card {
  width: min(580px, 100%);
  padding: 38px;
  text-align: center;
}

.state-icon {
  display: grid;
  width: 68px;
  height: 68px;
  margin: 0 auto 18px;
  place-items: center;
  border-radius: 22px;
  font-size: 30px;
  box-shadow: 0 14px 30px rgba(64, 96, 128, 0.12);
}

.state-icon--blue {
  background: rgba(0, 122, 255, 0.14);
  color: #007aff;
}

h1 {
  margin: 12px 0 10px;
  font-size: clamp(30px, 4vw, 40px);
  line-height: 1.05;
}

.state-progress {
  width: min(340px, 100%);
  height: 10px;
  margin: 24px auto 10px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.06);
}

.state-progress span {
  display: block;
  width: 62%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #007aff, #5856d6);
}

.state-hint {
  margin: 0;
  color: var(--page-muted);
  font-size: 13px;
}
</style>
