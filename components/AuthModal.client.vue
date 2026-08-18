<template>
  <Teleport to="body" :disabled="embedded">
    <div v-if="modelValue" :class="['auth-modal', { 'auth-modal--embedded': embedded }]" role="dialog" aria-modal="true">
      <button v-if="!embedded" class="auth-modal__backdrop" type="button" aria-label="Close" @click="close" />
      <section :class="['auth-modal__panel', { 'auth-modal__panel--embedded': embedded }]">
        <button v-if="!embedded" class="auth-modal__close" type="button" :aria-label="t('common.close')" @click="close">×</button>
        <div class="auth-modal__header">
          <p class="eyebrow">{{ externalLogin ? t('login.externalLoginPrefix') + externalServiceName : t('login.eyebrow') }}</p>
          <h2>{{ mode === 'login' ? t('login.accountLogin') : t('login.accountRegister') }}</h2>
          <p class="muted">{{ targetServiceName ? t('portal.authForService', { name: targetServiceName }) : t('portal.authIntro') }}</p>
        </div>

        <div class="auth-tabs" role="tablist" :aria-label="t('login.authModeLabel')">
          <button :class="{ active: mode === 'login' }" type="button" @click="mode = 'login'">
            {{ t('login.loginTab') }}
          </button>
          <button :class="{ active: mode === 'register' }" type="button" @click="mode = 'register'">
            {{ t('login.registerTab') }}
          </button>
        </div>

        <form class="auth-form" @submit.prevent="submitEmailAuth">
          <label v-if="mode === 'register'">
            <span class="field-label">{{ t('common.name') }}</span>
            <input v-model="form.name" class="field-input" autocomplete="name" :placeholder="t('login.namePlaceholder')" />
          </label>
          <label>
            <span class="field-label">{{ t('common.account') }}</span>
            <input v-model="form.account" class="field-input" autocomplete="username" :placeholder="t('login.accountPlaceholder')" />
          </label>
          <label>
            <span class="field-label">{{ t('common.password') }}</span>
            <input
              v-model="form.password"
              class="field-input"
              :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
              :placeholder="t('login.passwordPlaceholder')"
              type="password"
            />
          </label>

          <div class="agreement-row">
            <input id="auth-agreement" v-model="agreementAccepted" type="checkbox" />
            <label for="auth-agreement">{{ t('login.agreementPrefix') }}</label>
            <button class="agreement-link" type="button" @click="termsVisible = true">
              {{ t('login.agreementLink') }}
            </button>
            <label for="auth-agreement">{{ t('login.agreementSuffix') }}</label>
          </div>

          <button class="primary-btn auth-submit" type="submit" :disabled="submitting">
            {{ mode === 'login' ? t('login.accountLogin') : t('login.accountRegister') }}
          </button>
        </form>

        <div class="divider"><span>{{ t('login.or') }}</span></div>

        <button class="linuxdo-btn" type="button" :disabled="submitting" @click="startLinuxdoLogin">
          {{ t('login.linuxdoLogin') }}
        </button>

        <p v-if="errorMessage" class="error-text">{{ errorMessage }}</p>
      </section>

      <el-dialog v-model="termsVisible" :title="t('login.agreementTitle')" width="680px">
        <div class="terms-copy">
          <p>{{ t('login.agreementIntro') }}</p>
          <section class="terms-section">
            <h3>{{ t('login.agreementDataTitle') }}</h3>
            <p>{{ t('login.agreementDataBody') }}</p>
          </section>
          <section class="terms-section">
            <h3>{{ t('login.agreementUseTitle') }}</h3>
            <p>{{ t('login.agreementUseBody') }}</p>
          </section>
          <section class="terms-section">
            <h3>{{ t('login.agreementContentTitle') }}</h3>
            <p>{{ t('login.agreementContentBody') }}</p>
          </section>
          <section class="terms-section">
            <h3>{{ t('login.agreementResponsibilityTitle') }}</h3>
            <p>{{ t('login.agreementResponsibilityBody') }}</p>
          </section>
          <p class="terms-footnote">{{ t('login.agreementFooter') }}</p>
        </div>
      </el-dialog>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from "vue";

type PublicService = {
  id: string;
  name: string;
  clientId: string;
};

const props = defineProps<{
  modelValue: boolean;
  targetServiceId?: string;
  targetServiceName?: string;
  embedded?: boolean;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  authenticated: [];
}>();

const route = useRoute();
const { t, localizeError, theme, locale } = usePortalI18n();
const embedded = computed(() => Boolean(props.embedded));
const mode = ref<"login" | "register">("login");
const submitting = ref(false);
const errorMessage = ref("");
const services = ref<PublicService[]>([]);
const termsVisible = ref(false);
const agreementAccepted = ref(false);
const form = reactive({
  account: "",
  password: "",
  name: ""
});

const clientId = computed(() => String(route.query.client_id || ""));
const callbackUrl = computed(() => String(route.query.callback || ""));
const state = computed(() => String(route.query.state || ""));
const externalLogin = computed(() => Boolean(clientId.value && callbackUrl.value));
const targetServiceName = computed(() => props.targetServiceName || "");
const externalServiceName = computed(() =>
  services.value.find((service) => service.clientId === clientId.value)?.name || t("login.unknownService")
);

function close() {
  emit("update:modelValue", false);
}

async function loadServices() {
  try {
    const result = await $fetch<{ services: PublicService[] }>("/api/public/services");
    services.value = result.services;
  } catch {
    services.value = [];
  }
}

async function continueAfterAuth() {
  if (externalLogin.value) {
    const result = await $fetch<{
      status: "authorized" | "needs_onboarding" | "needs_access";
      redirectUrl: string;
    }>("/api/portal/authorize", {
      method: "POST",
      body: {
        clientId: clientId.value,
        callbackUrl: callbackUrl.value,
        state: state.value || undefined,
        theme: theme.value,
        locale: locale.value
      }
    });

    if (result.status === "authorized") {
      await navigateTo(result.redirectUrl, { external: true });
      return;
    }

    await navigateTo(result.redirectUrl);
    return;
  }

  if (props.targetServiceId) {
    const result = await $fetch<{
      status: "authorized" | "needs_onboarding" | "needs_access";
      redirectUrl: string;
    }>("/api/portal/authorize", {
      method: "POST",
      body: {
        serviceId: props.targetServiceId,
        theme: theme.value,
        locale: locale.value
      }
    });

    if (result.status === "authorized") {
      await navigateTo(result.redirectUrl, { external: true });
      return;
    }

    await navigateTo(result.redirectUrl);
    return;
  }

  const me = await $fetch<{ status: string; isAdmin?: boolean }>("/api/portal/me");
  if (me.isAdmin) {
    await navigateTo("/admin");
    return;
  }

  emit("authenticated");
  close();
}

async function submitEmailAuth() {
  errorMessage.value = "";

  if (!agreementAccepted.value) {
    errorMessage.value = t("error.agreementRequired");
    return;
  }

  submitting.value = true;

  try {
    const endpoint = mode.value === "login" ? "/api/auth/login" : "/api/auth/register";
    await $fetch(endpoint, {
      method: "POST",
      body: {
        account: form.account,
        password: form.password,
        name: form.name || undefined,
        agreementAccepted: true
      }
    });
    await continueAfterAuth();
  } catch (error: any) {
    errorMessage.value = localizeError(error, "error.authFailed");
  } finally {
    submitting.value = false;
  }
}

function startLinuxdoLogin() {
  errorMessage.value = "";

  if (!agreementAccepted.value) {
    errorMessage.value = t("error.agreementRequired");
    return;
  }

  const params = new URLSearchParams();
  if (clientId.value) {
    params.set("client_id", clientId.value);
  }
  if (callbackUrl.value) {
    params.set("callback", callbackUrl.value);
  }
  if (state.value) {
    params.set("state", state.value);
  }
  if (props.targetServiceId) {
    params.set("service_id", props.targetServiceId);
  }
  params.set("theme", theme.value);
  params.set("locale", locale.value);
  params.set("agreement_accepted", "1");
  window.location.href = `/api/auth/linuxdo/start${params.toString() ? `?${params}` : ""}`;
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      errorMessage.value = "";
    }
  }
);

onMounted(loadServices);
</script>

<style scoped>
.auth-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 18px;
}

.auth-modal--embedded {
  position: relative;
  inset: auto;
  z-index: 1;
  place-items: stretch;
  width: 100%;
  padding: 0;
}

.auth-modal__backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  background:
    radial-gradient(circle at 50% 10%, rgba(0, 122, 255, 0.16), transparent 34%),
    rgba(245, 247, 251, 0.82);
  backdrop-filter: blur(18px);
  cursor: pointer;
}

.auth-modal__panel {
  position: relative;
  z-index: 1;
  width: min(500px, 100%);
  border: 1px solid rgba(255, 255, 255, 0.88);
  border-radius: 30px;
  padding: 28px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 26px 72px rgba(64, 96, 128, 0.18);
  backdrop-filter: blur(22px);
}

.auth-modal__panel--embedded {
  width: 100%;
  border-radius: 32px;
  padding: 30px;
}

.auth-modal__close {
  position: absolute;
  top: 14px;
  right: 14px;
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 50%;
  background: rgba(242, 242, 247, 0.92);
  color: #1d1d1f;
  cursor: pointer;
  font-size: 20px;
}

.auth-modal__header {
  padding-right: 34px;
}

.auth-modal__header h2 {
  margin: 8px 0 8px;
  color: #1d1d1f;
  font-size: clamp(30px, 4vw, 38px);
  line-height: 1.02;
  letter-spacing: -0.04em;
}

.auth-tabs {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 6px;
  margin: 22px 0 16px;
  padding: 4px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 999px;
  background: rgba(242, 242, 247, 0.9);
}

.auth-tabs button {
  border: 0;
  border-radius: 999px;
  padding: 10px 12px;
  background: transparent;
  color: #6e6e73;
  cursor: pointer;
  font-weight: 700;
}

.auth-tabs button.active {
  background: #fff;
  color: #1d1d1f;
  box-shadow: 0 10px 22px rgba(64, 96, 128, 0.08);
}

.auth-form {
  display: grid;
  gap: 12px;
}

.agreement-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  color: #6e6e73;
  font-size: 12px;
  line-height: 1.55;
}

.agreement-row input {
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
  margin: 2px 2px 0 0;
  accent-color: var(--page-accent);
}

.agreement-link {
  border: 0;
  padding: 0;
  background: transparent;
  color: #1d1d1f;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.auth-submit,
.linuxdo-btn {
  width: 100%;
}

.divider {
  position: relative;
  display: grid;
  place-items: center;
  margin: 18px 0;
  color: #86868b;
  font-size: 12px;
}

.divider::before {
  position: absolute;
  inset: 50% 0 auto;
  height: 1px;
  background: rgba(0, 0, 0, 0.07);
  content: "";
}

.divider span {
  position: relative;
  padding: 0 10px;
  background: rgba(255, 255, 255, 0.84);
}

.linuxdo-btn {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 999px;
  padding: 13px 18px;
  background: rgba(242, 242, 247, 0.95);
  color: #1d1d1f;
  cursor: pointer;
  font-weight: 700;
}

.error-text {
  margin: 14px 0 0;
  color: #d70015;
}

.terms-copy {
  display: grid;
  gap: 12px;
  color: #1d1d1f;
  line-height: 1.7;
}

.terms-copy p {
  margin: 0;
}

.terms-section {
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 16px;
  padding: 12px 14px;
  background: rgba(242, 242, 247, 0.82);
}

.terms-section h3 {
  margin: 0 0 6px;
  font-size: 14px;
}

.terms-footnote {
  color: #6e6e73;
  font-size: 12px;
}

:deep(.el-dialog) {
  max-width: calc(100vw - 28px);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.96);
}

:deep(.el-dialog__title),
:deep(.el-dialog__body) {
  color: #1d1d1f;
}

@media (max-width: 640px) {
  .auth-modal {
    padding: 12px;
  }

  .auth-modal__panel,
  .auth-modal__panel--embedded {
    padding: 22px;
  }
}
</style>
