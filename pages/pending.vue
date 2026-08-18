<template>
  <div class="page-panel state-page">
    <section class="panel-card panel-card--strong state-card pending-card">
      <div class="state-icon state-icon--warn">⏳</div>
      <span class="badge badge--warn">{{ t('pending.badge') }}</span>
      <h1>{{ t('pending.title') }}</h1>
      <p class="muted">
        {{ t('pending.text') }}
      </p>
      <div class="action-row state-actions">
        <NuxtLink class="ghost-btn" to="/">{{ t('pending.refresh') }}</NuxtLink>
        <NuxtLink class="ghost-btn" to="/login">{{ t('pending.backLogin') }}</NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = usePortalI18n();
</script>

<style scoped>
.state-page {
  display: grid;
  min-height: 100vh;
  place-items: center;
}

.state-card {
  width: min(620px, 100%);
  padding: 36px;
  text-align: center;
}

.state-icon {
  display: grid;
  width: 68px;
  height: 68px;
  margin: 0 auto 18px;
  place-items: center;
  border-radius: 22px;
  font-size: 28px;
  box-shadow: 0 14px 30px rgba(64, 96, 128, 0.12);
}

.state-icon--warn {
  background: rgba(255, 149, 0, 0.14);
  color: #bf5f00;
}

h1 {
  margin: 12px 0 10px;
  font-size: clamp(32px, 4vw, 42px);
  line-height: 1.05;
}

.state-actions {
  justify-content: center;
  margin-top: 20px;
}
</style>
