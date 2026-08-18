<template>
  <NuxtLink class="portal-brand" :class="{ 'portal-brand--compact': compact }" to="/" aria-label="小溯应用工坊">
    <span class="portal-brand__mark" aria-hidden="true">
      <img src="/logo.svg" alt="">
    </span>
    <span class="portal-brand__copy">
      <strong>小溯应用工坊</strong>
      <small v-if="subtitle">{{ subtitle }}</small>
    </span>
  </NuxtLink>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  compact?: boolean;
  subtitle?: string;
}>(), {
  compact: false,
  subtitle: ""
});
</script>

<style scoped>
.portal-brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  width: fit-content;
  min-width: 0;
}

.portal-brand__mark {
  position: relative;
  display: block;
  flex: 0 0 auto;
  width: 42px;
  height: 42px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 13px;
  background: linear-gradient(145deg, #24262b 0%, #111215 64%, #363942 100%);
  box-shadow:
    0 10px 22px rgba(33, 39, 51, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.14);
}

.portal-brand__mark img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.portal-brand__copy,
.portal-brand strong,
.portal-brand small {
  display: block;
}

.portal-brand strong {
  color: #1d1d1f;
  font-size: 16px;
  font-weight: 780;
  line-height: 1.2;
  white-space: nowrap;
}

.portal-brand small {
  margin-top: 3px;
  color: #86868b;
  font-size: 11px;
  line-height: 1.2;
  white-space: nowrap;
}

.portal-brand--compact .portal-brand__mark {
  width: 38px;
  height: 38px;
  border-radius: 12px;
}

.portal-brand--compact strong {
  font-size: 15px;
}
</style>
