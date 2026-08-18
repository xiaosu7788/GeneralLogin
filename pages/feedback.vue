<template>
  <div class="page-panel feedback-page" :class="{ 'feedback-page--embed': embed }">
    <header v-if="!embed" class="feedback-topbar">
      <PortalBrand compact subtitle="统一反馈入口" />
      <NuxtLink class="ghost-btn" to="/">{{ t("common.backToApps") }}</NuxtLink>
    </header>

    <FeedbackPanel :embed="embed" @close="closeWindow" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const route = useRoute();
const { t } = usePortalI18n();
const embed = computed(() => String(route.query.embed || "") === "1");

function closeWindow() {
  window.close();
}
</script>

<style scoped>
.feedback-page {
  display: grid;
  width: min(1060px, calc(100vw - 32px));
  min-height: 100vh;
  align-content: center;
  gap: 18px;
  padding-top: 32px;
  padding-bottom: 56px;
}

.feedback-page--embed {
  width: 100%;
  min-height: auto;
  padding: 16px;
}

.feedback-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border: 1px solid rgba(255, 255, 255, 0.88);
  border-radius: 28px;
  padding: 14px 18px;
  background: rgba(255, 255, 255, 0.68);
  box-shadow: 0 16px 40px rgba(64, 96, 128, 0.1);
  backdrop-filter: blur(22px);
}

.feedback-brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.feedback-brand__mark {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid var(--page-border);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.86);
  color: #ff7a2f;
  font-size: 24px;
  font-weight: 900;
}

.feedback-brand strong,
.feedback-brand small {
  display: block;
}

.feedback-brand strong {
  color: var(--page-text);
  font-size: 15px;
  line-height: 1.2;
}

.feedback-brand small {
  margin-top: 3px;
  color: var(--page-muted);
  font-size: 11px;
}

@media (max-width: 640px) {
  .feedback-page {
    width: min(100vw - 20px, 1060px);
    padding-top: 16px;
  }

  .feedback-topbar {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
