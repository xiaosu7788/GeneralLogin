<template>
  <section class="panel-card panel-card--strong feedback-card">
    <div class="feedback-card__header">
      <div>
        <span class="badge">{{ t("feedback.title") }}</span>
        <h1>{{ t("feedback.title") }}</h1>
        <p class="muted">{{ t("feedback.subtitle") }}</p>
      </div>
      <button v-if="embed" class="ghost-btn feedback-close" type="button" @click="emit('close')">
        {{ t("common.close") }}
      </button>
    </div>

    <div class="feedback-layout">
      <aside class="feedback-aside">
        <div class="feedback-aside__block">
          <span class="feedback-aside__icon">⌁</span>
          <strong>问题会被分类处理</strong>
          <p>建议、投诉和缺陷会进入管理员后台，方便快速筛选和跟进。</p>
        </div>
        <div class="feedback-aside__block">
          <span class="feedback-aside__icon">↗</span>
          <strong>当前范围</strong>
          <p>{{ feedbackScope }}</p>
          <div class="feedback-scope-tags">
            <span v-for="chip in scopeChips" :key="chip">{{ chip }}</span>
          </div>
        </div>
      </aside>

      <form v-if="!submitted" class="feedback-form" @submit.prevent="submitFeedback">
        <section class="feedback-field-block">
          <span class="field-label">{{ t("feedback.type") }}</span>
          <div class="feedback-segment" role="radiogroup" :aria-label="t('feedback.type')">
            <button
              v-for="option in feedbackTypeOptions"
              :key="option.value"
              :class="{ active: form.type === option.value }"
              type="button"
              role="radio"
              :aria-checked="form.type === option.value"
              @click="form.type = option.value"
            >
              <strong>{{ option.label }}</strong>
              <span>{{ option.hint }}</span>
            </button>
          </div>
        </section>

        <label v-if="!clientServiceLocked" class="feedback-field-block">
          <span class="field-label">{{ t("feedback.service") }}</span>
          <select v-model="selectedServiceId" class="field-input" :disabled="servicesLoading">
            <option value="">
              {{ servicesLoading ? t("feedback.loadingServices") : t("feedback.noSpecificService") }}
            </option>
            <option
              v-for="service in services"
              :key="service.id"
              :value="service.id"
            >
              {{ service.name }}
            </option>
          </select>
        </label>

        <label class="feedback-field-block">
          <span class="field-label">{{ t("feedback.content") }}</span>
          <textarea
            v-model="form.content"
            class="field-textarea feedback-content-input"
            :placeholder="t('feedback.contentPlaceholder')"
          />
        </label>

        <label class="feedback-field-block">
          <span class="field-label">{{ t("admin.feedbackContact") }}</span>
          <input
            v-model="form.contact"
            class="field-input"
            :placeholder="t('feedback.contactPlaceholder')"
          >
        </label>

        <button class="primary-btn feedback-submit" type="submit" :disabled="submitting">
          {{ submitting ? t("common.loading") : t("feedback.submit") }}
        </button>
      </form>

      <div v-else class="feedback-success">
        <div class="feedback-success__icon">✓</div>
        <span class="badge badge--ok">{{ t("feedback.success") }}</span>
        <h2>{{ t("feedback.success") }}</h2>
        <p class="muted">你的反馈已提交，管理员可在后台继续处理。</p>
        <div class="action-row feedback-success__actions">
          <button v-if="embed" class="ghost-btn" type="button" @click="emit('close')">
            {{ t("common.close") }}
          </button>
          <NuxtLink v-else class="ghost-btn" to="/login">{{ t("common.login") }}</NuxtLink>
        </div>
      </div>
    </div>

    <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";

type FeedbackType = "suggestion" | "complaint" | "bug";

type PublicService = {
  id: string;
  name: string;
  slug: string;
  clientId: string;
};

const props = defineProps<{
  embed?: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const route = useRoute();
const { t, localizeError } = usePortalI18n();
const submitting = ref(false);
const submitted = ref(false);
const errorMessage = ref("");
const embed = computed(() => Boolean(props.embed));
const clientId = computed(() => String(route.query.client_id || route.query.clientId || ""));
const clientServiceLocked = computed(() => Boolean(clientId.value));
const services = ref<PublicService[]>([]);
const servicesLoading = ref(false);
const selectedServiceId = ref(clientServiceLocked.value ? "" : String(route.query.service_id || ""));
const form = reactive({
  type: "suggestion" as FeedbackType,
  content: "",
  contact: ""
});

const feedbackTypeOptions = computed(() => [
  {
    value: "suggestion" as FeedbackType,
    label: t("feedback.typeSuggestion"),
    hint: "优化体验"
  },
  {
    value: "complaint" as FeedbackType,
    label: t("feedback.typeComplaint"),
    hint: "需要跟进"
  },
  {
    value: "bug" as FeedbackType,
    label: t("feedback.typeBug"),
    hint: "功能异常"
  }
]);
const selectedService = computed(() =>
  services.value.find((service) => service.id === selectedServiceId.value)
);
const feedbackScope = computed(() => {
  if (clientServiceLocked.value) {
    return clientId.value ? `已绑定 Client ID：${clientId.value}` : "当前服务已锁定。";
  }

  if (selectedService.value) {
    return `当前反馈会关联到 ${selectedService.value.name}。`;
  }

  return "未指定服务时，反馈会作为全局反馈提交。";
});
const scopeChips = computed(() => {
  if (clientServiceLocked.value) {
    return ["客户端锁定", clientId.value || "指定服务"];
  }

  if (selectedService.value) {
    return ["指定服务", selectedService.value.name];
  }

  return ["全局反馈"];
});

function selectServiceFromQuery() {
  if (clientId.value) {
    selectedServiceId.value =
      services.value.find((service) => service.clientId === clientId.value)?.id || "";
    return;
  }

  if (selectedServiceId.value) {
    return;
  }

  const serviceSlug = String(route.query.service_slug || "");
  if (serviceSlug) {
    selectedServiceId.value =
      services.value.find((service) => service.slug === serviceSlug)?.id || "";
  }
}

async function loadServices() {
  servicesLoading.value = true;

  try {
    const result = await $fetch<{ services: PublicService[] }>("/api/public/services");
    services.value = result.services;
    selectServiceFromQuery();
  } catch {
    services.value = [];
  } finally {
    servicesLoading.value = false;
  }
}

async function submitFeedback() {
  submitting.value = true;
  errorMessage.value = "";

  try {
    await $fetch("/api/public/feedback", {
      method: "POST",
      body: {
        type: form.type,
        content: form.content,
        contact: form.contact || undefined,
        serviceId: selectedServiceId.value || undefined,
        clientId: clientId.value || undefined,
        serviceSlug: !selectedServiceId.value && route.query.service_slug
          ? String(route.query.service_slug)
          : undefined,
        userId: route.query.user_id ? String(route.query.user_id) : undefined,
        sourceUrl: route.query.source_url ? String(route.query.source_url) : undefined
      }
    });
    submitted.value = true;
  } catch (error: any) {
    errorMessage.value = localizeError(error, "error.feedbackFailed");
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  if (!clientServiceLocked.value) {
    loadServices();
  }
});
</script>

<style scoped>
.feedback-card {
  width: min(960px, 100%);
  padding: 28px;
}

.feedback-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 22px;
}

.feedback-card__header h1 {
  margin: 14px 0 8px;
  font-size: clamp(34px, 5vw, 54px);
  line-height: 0.98;
  letter-spacing: -0.045em;
}

.feedback-card__header .muted {
  max-width: 620px;
  margin: 0;
  line-height: 1.65;
}

.feedback-close {
  min-height: 38px;
  padding-inline: 16px;
}

.feedback-layout {
  display: grid;
  grid-template-columns: minmax(240px, 0.76fr) minmax(0, 1.24fr);
  gap: 18px;
  align-items: stretch;
}

.feedback-aside {
  display: grid;
  gap: 12px;
  align-content: start;
}

.feedback-aside__block {
  padding: 18px;
  border: 1px solid var(--page-border);
  border-radius: 24px;
  background: rgba(242, 242, 247, 0.72);
}

.feedback-aside__icon {
  display: grid;
  width: 42px;
  height: 42px;
  margin-bottom: 14px;
  place-items: center;
  border-radius: 15px;
  background: rgba(0, 122, 255, 0.1);
  color: var(--page-accent);
  font-size: 20px;
  font-weight: 800;
}

.feedback-aside__block strong,
.feedback-aside__block p {
  display: block;
  margin: 0;
}

.feedback-aside__block strong {
  color: var(--page-text);
  font-size: 15px;
}

.feedback-aside__block p {
  margin-top: 7px;
  color: var(--page-muted);
  font-size: 13px;
  line-height: 1.65;
  word-break: break-word;
}

.feedback-scope-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.feedback-scope-tags span {
  border-radius: 999px;
  padding: 5px 9px;
  background: rgba(0, 122, 255, 0.1);
  color: var(--page-accent);
  font-size: 12px;
  font-weight: 700;
}

.feedback-form {
  display: grid;
  gap: 14px;
  padding: 18px;
  border: 1px solid var(--page-border);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.6);
}

.feedback-field-block {
  display: grid;
  gap: 8px;
}

.feedback-segment {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.feedback-segment button {
  display: grid;
  gap: 4px;
  min-height: 78px;
  border: 1px solid var(--page-border);
  border-radius: 20px;
  padding: 14px;
  background: rgba(242, 242, 247, 0.78);
  color: var(--page-text);
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.feedback-segment button:hover {
  transform: translateY(-1px);
}

.feedback-segment button.active {
  border-color: rgba(0, 122, 255, 0.18);
  background: rgba(0, 122, 255, 0.1);
  box-shadow: 0 10px 24px rgba(0, 122, 255, 0.1);
}

.feedback-segment strong,
.feedback-segment span {
  display: block;
}

.feedback-segment strong {
  font-size: 14px;
}

.feedback-segment span {
  color: var(--page-muted);
  font-size: 12px;
}

.feedback-content-input {
  min-height: 156px;
}

.feedback-submit {
  width: 100%;
}

.feedback-success {
  display: grid;
  place-items: center;
  min-height: 360px;
  border: 1px solid var(--page-border);
  border-radius: 24px;
  padding: 28px;
  background: rgba(255, 255, 255, 0.64);
  text-align: center;
}

.feedback-success__icon {
  display: grid;
  width: 68px;
  height: 68px;
  margin-bottom: 14px;
  place-items: center;
  border-radius: 22px;
  background: rgba(52, 199, 89, 0.14);
  color: #248a3d;
  font-size: 30px;
  font-weight: 900;
}

.feedback-success h2,
.feedback-success p {
  margin: 0;
}

.feedback-success h2 {
  margin-top: 12px;
  font-size: 30px;
  letter-spacing: -0.03em;
}

.feedback-success p {
  margin-top: 8px;
  line-height: 1.65;
}

.feedback-success__actions {
  justify-content: center;
  margin-top: 18px;
}

.error-text {
  margin: 14px 0 0;
  color: #d70015;
}

@media (max-width: 860px) {
  .feedback-card {
    padding: 20px;
  }

  .feedback-card__header,
  .feedback-layout {
    grid-template-columns: 1fr;
  }

  .feedback-card__header {
    display: grid;
  }

  .feedback-segment {
    grid-template-columns: 1fr;
  }
}
</style>
