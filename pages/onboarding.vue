<template>
  <div class="page-panel onboarding-page">
    <div class="panel-header onboarding-page__header">
      <div>
        <p class="page-eyebrow">{{ t("onboarding.title") }}</p>
        <h1 class="panel-title">{{ t("onboarding.title") }}</h1>
        <p class="panel-subtitle">
          {{ t("onboarding.subtitle") }}
        </p>
      </div>
      <div class="action-row">
        <NuxtLink class="ghost-btn" to="/">{{ t("common.backToApps") }}</NuxtLink>
        <ClientOnly>
          <AuthActions />
        </ClientOnly>
      </div>
    </div>

    <section class="panel-card panel-card--strong onboarding-hero">
      <div class="onboarding-hero__select">
        <label class="field-label" for="service-select">{{ t("onboarding.service") }}</label>
        <select id="service-select" v-model="selectedServiceId" class="field-input">
          <option value="">{{ t("onboarding.selectService") }}</option>
          <option
            v-for="service in onboardingServices"
            :key="service.id"
            :value="service.id"
          >
            {{ service.name }}
          </option>
        </select>
        <p v-if="selectedService" class="muted">
          {{ t("onboarding.currentService", { name: selectedService.name, hint: accessHint(selectedService) }) }}
        </p>
      </div>

      <div class="onboarding-hero__chips">
        <span v-for="chip in accessChips" :key="chip" class="status-chip">{{ chip }}</span>
      </div>
    </section>

    <section class="onboarding-grid">
      <article class="panel-card panel-card--strong onboarding-card onboarding-card--guide">
        <span class="badge">{{ t("portal.eyebrow") }}</span>
        <h2>{{ selectedService ? selectedService.name : t("onboarding.title") }}</h2>
        <p class="muted">{{ selectedService ? accessHint(selectedService) : t("onboarding.selectService") }}</p>

        <ol class="onboarding-steps">
          <li v-for="step in guideSteps" :key="step.title" class="onboarding-step">
            <span class="onboarding-step__index">{{ step.index }}</span>
            <div>
              <strong>{{ step.title }}</strong>
              <p>{{ step.description }}</p>
            </div>
          </li>
        </ol>

        <div class="onboarding-meta">
          <div>
            <span>{{ t("onboarding.service") }}</span>
            <strong>{{ selectedService?.name || t("onboarding.selectService") }}</strong>
          </div>
          <div>
            <span>Client ID</span>
            <strong>{{ selectedService?.clientId || "-" }}</strong>
          </div>
          <div>
            <span>{{ t("common.status") }}</span>
            <strong>{{ selectedService ? accessHint(selectedService) : t("onboarding.hintNotOpen") }}</strong>
          </div>
        </div>
      </article>

      <article class="panel-card panel-card--strong onboarding-card onboarding-card--form">
        <span class="badge">{{ selectedService ? selectedService.name : t("onboarding.title") }}</span>

        <section v-if="canUseInvite" class="onboarding-form-block">
          <div class="onboarding-form-block__header">
            <h2>{{ t("onboarding.inviteTitle") }}</h2>
            <p class="muted">{{ t("onboarding.inviteHelp") }}</p>
          </div>
          <label class="field-label" for="invite-code">{{ t("onboarding.inviteCode") }}</label>
          <input
            id="invite-code"
            v-model="inviteCode"
            class="field-input"
            autocomplete="off"
            placeholder="ZR-..."
          >
          <button class="primary-btn onboarding-submit" type="button" :disabled="submitting" @click="submitInvite">
            {{ submitting ? t("common.loading") : t("onboarding.useInvite") }}
          </button>
        </section>

        <section v-else-if="canRequestAccess" class="onboarding-form-block">
          <div class="onboarding-form-block__header">
            <h2>{{ t("onboarding.requestTitle") }}</h2>
            <p class="muted">{{ t("onboarding.requestHelp") }}</p>
          </div>
          <label class="field-label" for="request-message">{{ t("onboarding.requestMessage") }}</label>
          <textarea
            id="request-message"
            v-model="message"
            class="field-textarea"
            :placeholder="t('onboarding.requestPlaceholder')"
          />
          <button class="ghost-btn onboarding-submit" type="button" :disabled="submitting" @click="submitRequest">
            {{ submitting ? t("common.loading") : t("common.submit") }}
          </button>
        </section>

        <section v-else class="onboarding-empty">
          <h2>{{ t("onboarding.notOpenTitle") }}</h2>
          <p class="muted">{{ t("onboarding.notOpenHelp") }}</p>
          <NuxtLink class="primary-btn onboarding-submit" to="/">
            {{ t("common.backToApps") }}
          </NuxtLink>
        </section>
      </article>
    </section>

    <p v-if="notice" class="portal-note">{{ notice }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

type AppItem = {
  id: string;
  clientId: string;
  name: string;
  canAccess: boolean;
  requiresInvite: boolean;
  requiresRequest: boolean;
  hasPendingRequest: boolean;
};

const route = useRoute();
const { t, localizeError, theme, locale } = usePortalI18n();
const inviteCode = ref("");
const message = ref("");
const notice = ref("");
const submitting = ref(false);
const apps = ref<AppItem[]>([]);
const selectedServiceId = ref(String(route.query.service_id || ""));

const selectedService = computed(() =>
  apps.value.find((service) => service.id === selectedServiceId.value)
);
const accessCandidates = computed(() =>
  apps.value.filter(
    (service) =>
      !service.canAccess &&
      !service.hasPendingRequest &&
      (service.requiresInvite || service.requiresRequest)
  )
);
const onboardingServices = computed(() => {
  const list = [...accessCandidates.value];
  if (selectedService.value && !list.some((service) => service.id === selectedService.value?.id)) {
    list.unshift(selectedService.value);
  }
  return list;
});
const canUseInvite = computed(() =>
  selectedService.value ? selectedService.value.requiresInvite : apps.value.some((service) => service.requiresInvite)
);
const canRequestAccess = computed(() =>
  Boolean(selectedService.value?.requiresRequest && !selectedService.value.hasPendingRequest)
);
const accessChips = computed(() => {
  const chips: string[] = [];

  if (!selectedService.value) {
    chips.push("请选择服务");
    return chips;
  }

  if (selectedService.value.canAccess) {
    chips.push("已可直接访问");
  }

  if (selectedService.value.requiresInvite) {
    chips.push("需要邀请码");
  }

  if (selectedService.value.requiresRequest) {
    chips.push("可提交申请");
  }

  if (selectedService.value.hasPendingRequest) {
    chips.push("申请处理中");
  }

  return chips.length ? chips : ["当前服务无需额外权限"];
});
const guideSteps = computed(() => {
  const serviceName = selectedService.value?.name || "服务";

  return [
    {
      index: "01",
      title: "选择服务",
      description: selectedService.value
        ? `当前已选中 ${serviceName}。`
        : "从下拉框中选中需要开通的服务。"
    },
    {
      index: "02",
      title: canUseInvite.value ? "输入邀请码" : "提交访问申请",
      description: canUseInvite.value
        ? "邀请码通过后会自动继续打开应用。"
        : "填写申请说明后等待管理员审核。"
    },
    {
      index: "03",
      title: "进入应用",
      description: "授权完成后会直接进入应用，无需重复登录。"
    }
  ];
});

function accessHint(service: AppItem) {
  if (service.hasPendingRequest) return t("onboarding.hintPending");
  if (service.requiresInvite && service.requiresRequest) return t("onboarding.hintInviteRequest");
  if (service.requiresInvite) return t("onboarding.hintInvite");
  if (service.requiresRequest) return t("onboarding.hintRequest");
  return t("onboarding.hintNotOpen");
}

async function continueAfterInvite() {
  const clientId = String(route.query.client_id || "");
  const callbackUrl = String(route.query.callback || "");

  if (!clientId || !callbackUrl) {
    await navigateTo("/");
    return;
  }

  const result = await $fetch<{
    status: "authorized" | "needs_onboarding" | "needs_access";
    redirectUrl: string;
  }>("/api/portal/authorize", {
    method: "POST",
    body: {
      clientId,
      callbackUrl,
      state: String(route.query.state || "") || undefined,
      theme: theme.value,
      locale: locale.value
    }
  });

  await navigateTo(result.redirectUrl, { external: result.status === "authorized" });
}

async function loadApps() {
  try {
    const result = await $fetch<{ apps: AppItem[] }>("/api/portal/apps");
    apps.value = result.apps;

    const clientId = String(route.query.client_id || "");
    if (!selectedServiceId.value && clientId) {
      selectedServiceId.value =
        apps.value.find((service) => service.clientId === clientId)?.id || "";
    }

    if (!selectedServiceId.value) {
      selectedServiceId.value =
        accessCandidates.value[0]?.id || apps.value[0]?.id || "";
    }
  } catch (error: any) {
    notice.value = localizeError(error, "error.loadApps");
  }
}

async function submitInvite() {
  submitting.value = true;
  notice.value = "";

  try {
    await $fetch("/api/portal/onboarding", {
      method: "POST",
      body: {
        inviteCode: inviteCode.value
      }
    });
    await continueAfterInvite();
  } catch (error: any) {
    notice.value = localizeError(error, "error.inviteFailed");
  } finally {
    submitting.value = false;
  }
}

async function submitRequest() {
  if (!selectedServiceId.value) {
    notice.value = t("error.selectService");
    return;
  }

  submitting.value = true;
  notice.value = "";

  try {
    await $fetch("/api/portal/onboarding", {
      method: "POST",
      body: {
        message: message.value,
        serviceId: selectedServiceId.value
      }
    });
    const params = new URLSearchParams({
      service: selectedService.value?.name || "",
      theme: theme.value,
      locale: locale.value
    });
    await navigateTo(`/pending?${params}`);
  } catch (error: any) {
    notice.value = localizeError(error, "error.requestFailed");
  } finally {
    submitting.value = false;
  }
}

onMounted(loadApps);
</script>

<style scoped>
.onboarding-page {
  width: min(1060px, calc(100vw - 32px));
  padding-bottom: 84px;
}

.page-eyebrow {
  margin: 0 0 10px;
  color: #007aff;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.onboarding-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 18px;
  padding: 22px 24px;
}

.onboarding-hero__select {
  flex: 1 1 auto;
  min-width: 0;
}

.onboarding-hero__select .muted {
  margin: 10px 0 0;
}

.onboarding-hero__chips {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  border: 1px solid var(--page-border);
  border-radius: 999px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.72);
  color: var(--page-muted);
  font-size: 13px;
  font-weight: 700;
}

.onboarding-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  gap: 18px;
}

.onboarding-card {
  padding: 24px;
}

.onboarding-card h2 {
  margin: 10px 0 8px;
  font-size: 26px;
  line-height: 1.08;
  letter-spacing: -0.03em;
}

.onboarding-steps {
  display: grid;
  gap: 12px;
  margin: 22px 0 0;
  padding: 0;
  list-style: none;
}

.onboarding-step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--page-border);
  border-radius: 20px;
  background: rgba(242, 242, 247, 0.72);
}

.onboarding-step__index {
  display: grid;
  flex: 0 0 auto;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 12px;
  background: rgba(0, 122, 255, 0.1);
  color: var(--page-accent);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.onboarding-step strong,
.onboarding-step p {
  display: block;
  margin: 0;
}

.onboarding-step strong {
  color: var(--page-text);
  font-size: 14px;
}

.onboarding-step p {
  margin-top: 5px;
  color: var(--page-muted);
  font-size: 13px;
  line-height: 1.6;
}

.onboarding-meta {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.onboarding-meta div {
  padding: 14px 16px;
  border: 1px solid var(--page-border);
  border-radius: 18px;
  background: rgba(242, 242, 247, 0.72);
}

.onboarding-meta span {
  display: block;
  margin-bottom: 6px;
  color: var(--page-muted);
  font-size: 12px;
  font-weight: 700;
}

.onboarding-meta strong {
  display: block;
  color: var(--page-text);
  font-size: 14px;
  line-height: 1.45;
  word-break: break-word;
}

.onboarding-form-block {
  display: grid;
  gap: 14px;
}

.onboarding-form-block__header h2 {
  margin: 0 0 6px;
  font-size: 24px;
  line-height: 1.1;
}

.onboarding-form-block__header .muted {
  margin: 0;
}

.onboarding-submit {
  width: 100%;
  margin-top: 2px;
}

.onboarding-empty {
  display: grid;
  align-content: center;
  gap: 12px;
  min-height: 100%;
}

.onboarding-empty h2 {
  margin: 0;
  font-size: 24px;
}

@media (max-width: 960px) {
  .onboarding-page {
    width: min(100vw - 20px, 1060px);
  }

  .onboarding-hero,
  .onboarding-grid {
    grid-template-columns: 1fr;
  }

  .onboarding-hero {
    display: grid;
    align-items: start;
  }

  .onboarding-hero__chips {
    justify-content: flex-start;
  }

  .onboarding-meta {
    grid-template-columns: 1fr;
  }
}
</style>
