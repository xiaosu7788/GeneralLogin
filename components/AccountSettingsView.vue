<template>
  <div class="account-page">
    <header class="account-shell account-topbar">
      <PortalBrand compact subtitle="账户中心" />

      <div class="account-topbar__context">
        <span>{{ t("account.eyebrow") }}</span>
      </div>

      <div class="account-topbar__actions">
        <NuxtLink class="account-nav-pill account-nav-pill--active" to="/">
          {{ t("common.backToApps") }}
        </NuxtLink>
        <NuxtLink v-if="user?.isAdmin" class="account-nav-pill" to="/admin">
          {{ t("apps.admin") }}
        </NuxtLink>
        <ClientOnly>
          <AuthActions />
        </ClientOnly>
      </div>
    </header>

    <main class="account-shell account-main">
      <section class="account-heading" aria-labelledby="account-title">
        <p class="account-eyebrow">{{ t("account.eyebrow") }}</p>
        <h1 id="account-title">{{ title }}</h1>
        <p>{{ subtitle }}</p>
      </section>

      <section v-if="loading" class="account-state panel-card panel-card--strong">
        {{ t("common.loading") }}
      </section>

      <section v-else-if="!user" class="account-state panel-card panel-card--strong">
        <h2>{{ t("common.relogin") }}</h2>
        <NuxtLink class="primary-btn" to="/login">{{ t("common.login") }}</NuxtLink>
      </section>

      <form v-else class="account-layout" @submit.prevent="submit">
        <aside class="account-card account-card--identity panel-card panel-card--strong">
          <div class="account-avatar-wrap">
            <span class="account-avatar">
              <img v-if="user.avatarUrl" :src="user.avatarUrl" alt="">
              <span v-else>{{ avatarInitial }}</span>
            </span>
            <button
              v-if="mode === 'profile'"
              class="account-avatar-edit"
              type="button"
              :disabled="uploadingAvatar"
              :aria-label="t('common.upload')"
              @click="chooseAvatar"
            >
              <span aria-hidden="true">+</span>
            </button>
          </div>
          <h2>{{ displayName }}</h2>
          <p class="account-identity-muted">{{ user.email || user.username || user.account || "-" }}</p>
          <div class="account-divider" />
          <div class="account-fact">
            <span>{{ t("common.account") }}</span>
            <strong>{{ user.account || user.username || "-" }}</strong>
          </div>
          <div class="account-fact">
            <span>{{ t("account.accountId") }}</span>
            <strong>{{ user.id }}</strong>
          </div>
          <p class="account-card-help">{{ t("account.identityHelp") }}</p>
          <input
            ref="avatarInput"
            class="account-hidden-input"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            @change="uploadAvatar"
          >
        </aside>

        <section class="account-card account-card--form panel-card panel-card--strong">
          <div class="account-card-header">
            <div>
              <span class="account-section-label">{{ t("account.eyebrow") }}</span>
              <h2>{{ title }}</h2>
            </div>
            <span class="account-section-icon" aria-hidden="true">{{ mode === "profile" ? "i" : "•" }}</span>
          </div>

          <template v-if="mode === 'profile'">
            <label class="account-field">
              <span>{{ t("common.name") }}</span>
              <input v-model="profileForm.name" class="field-input" :placeholder="t('profile.namePlaceholder')" autocomplete="name">
            </label>
            <label class="account-field">
              <span>{{ t("common.username") }}</span>
              <input :value="user.username || '-'" class="field-input" readonly>
            </label>
            <label class="account-field">
              <span>{{ t("common.email") }}</span>
              <input :value="user.email || '-'" class="field-input" readonly>
            </label>
            <p class="account-help">{{ t("profile.avatarHelp") }}</p>
          </template>

          <template v-else>
            <label class="account-field">
              <span>{{ t("common.currentPassword") }}</span>
              <input
                v-model="passwordForm.currentPassword"
                class="field-input"
                type="password"
                autocomplete="current-password"
                :placeholder="t('profile.currentPasswordPlaceholder')"
              >
            </label>
            <label class="account-field">
              <span>{{ t("common.newPassword") }}</span>
              <input
                v-model="passwordForm.newPassword"
                class="field-input"
                type="password"
                autocomplete="new-password"
                :placeholder="t('profile.newPasswordPlaceholder')"
              >
            </label>
            <label class="account-field">
              <span>{{ t("account.confirmPassword") }}</span>
              <input
                v-model="passwordForm.confirmPassword"
                class="field-input"
                type="password"
                autocomplete="new-password"
                :placeholder="t('account.confirmPasswordPlaceholder')"
              >
            </label>
            <p class="account-help">{{ t("account.passwordHelp") }}</p>
          </template>

          <div class="account-form-footer">
            <NuxtLink class="ghost-btn" to="/">{{ t("account.back") }}</NuxtLink>
            <button class="primary-btn" type="submit" :disabled="saving">
              {{ saving ? t("common.loading") : t("common.save") }}
            </button>
          </div>
        </section>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus/es/components/message/index";
import { computed, onMounted, reactive, ref } from "vue";

const props = defineProps<{ mode: "profile" | "password" }>();
type User = {
  id: string;
  account?: string | null;
  email?: string | null;
  username?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  isAdmin?: boolean;
};

const { t, localizeError } = usePortalI18n();
const user = ref<User | null>(null);
const loading = ref(true);
const saving = ref(false);
const uploadingAvatar = ref(false);
const avatarInput = ref<HTMLInputElement | null>(null);
const profileForm = reactive({ name: "" });
const passwordForm = reactive({ currentPassword: "", newPassword: "", confirmPassword: "" });

const mode = computed(() => props.mode);
const title = computed(() => mode.value === "profile" ? t("profile.title") : t("profile.passwordTitle"));
const subtitle = computed(() => mode.value === "profile" ? t("account.profileSubtitle") : t("account.passwordSubtitle"));
const displayName = computed(() => user.value?.name || user.value?.account || user.value?.username || user.value?.email || t("common.user"));
const avatarInitial = computed(() => displayName.value.trim().slice(0, 1).toUpperCase() || "U");

async function load() {
  try {
    const result = await $fetch<{ user: User }>("/api/auth/me");
    user.value = result.user;
    profileForm.name = result.user.name || "";
  } catch {
    user.value = null;
  } finally {
    loading.value = false;
  }
}

function chooseAvatar() {
  avatarInput.value?.click();
}

async function uploadAvatar(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !user.value) return;

  uploadingAvatar.value = true;
  try {
    const form = new FormData();
    form.append("file", file);
    const result = await $fetch<{ user: User }>("/api/auth/avatar", { method: "POST", body: form });
    user.value = { ...user.value, ...result.user };
    ElMessage.success(t("notice.avatarUploaded"));
  } catch (error: any) {
    ElMessage.error(localizeError(error, "error.avatarFailed"));
  } finally {
    uploadingAvatar.value = false;
    input.value = "";
  }
}

async function submit() {
  if (!user.value) return;
  if (mode.value === "password" && passwordForm.newPassword !== passwordForm.confirmPassword) {
    ElMessage.error(t("account.passwordMismatch"));
    return;
  }

  saving.value = true;
  try {
    if (mode.value === "profile") {
      const result = await $fetch<{ user: User }>("/api/auth/profile", {
        method: "PATCH",
        body: { name: profileForm.name, avatarUrl: user.value.avatarUrl }
      });
      user.value = { ...user.value, ...result.user };
      ElMessage.success(t("notice.profileSaved"));
    } else {
      await $fetch<{ user: User }>("/api/auth/password", {
        method: "PATCH",
        body: {
          currentPassword: passwordForm.currentPassword || undefined,
          newPassword: passwordForm.newPassword
        }
      });
      passwordForm.currentPassword = "";
      passwordForm.newPassword = "";
      passwordForm.confirmPassword = "";
      ElMessage.success(t("notice.passwordChanged"));
    }
  } catch (error: any) {
    ElMessage.error(localizeError(error, mode.value === "profile" ? "error.profileFailed" : "error.passwordFailed"));
  } finally {
    saving.value = false;
  }
}

onMounted(load);

useHead(() => ({ title: `${title.value} · 小溯应用工坊` }));
</script>

<style scoped>
.account-page {
  min-height: 100vh;
  padding: 46px 48px 72px;
  background:
    radial-gradient(circle at 10% 7%, rgba(255, 149, 0, 0.18), transparent 28%),
    radial-gradient(circle at 82% 12%, rgba(0, 122, 255, 0.14), transparent 34%),
    linear-gradient(135deg, #fbfbfd 0%, #f4f8ff 54%, #fff8ef 100%);
  color: var(--page-text);
}

.account-shell {
  width: min(1344px, 100%);
  margin: 0 auto;
}

.account-topbar {
  position: sticky;
  top: 18px;
  z-index: 20;
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(120px, 0.5fr) minmax(300px, 1fr);
  align-items: center;
  gap: 18px;
  min-height: 78px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 36px;
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0 22px 56px rgba(64, 96, 128, 0.14);
  backdrop-filter: blur(26px);
}

.account-brand,
.account-topbar__actions {
  display: flex;
  align-items: center;
}

.account-brand {
  gap: 12px;
  min-width: 0;
}

.account-brand__mark {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid var(--page-border);
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 8px 18px rgba(64, 80, 106, 0.1);
  color: #ff7a2f;
  font-size: 24px;
  font-weight: 900;
  line-height: 1;
}

.account-brand strong,
.account-brand small {
  display: block;
}

.account-brand strong {
  font-size: 15px;
  line-height: 1.2;
}

.account-brand small {
  margin-top: 3px;
  color: var(--page-muted);
  font-size: 11px;
}

.account-topbar__context {
  color: var(--page-muted);
  font-size: 13px;
  font-weight: 700;
  text-align: center;
}

.account-topbar__actions {
  justify-content: flex-end;
  gap: 10px;
  min-width: 0;
}

.account-nav-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  border: 1px solid var(--page-border);
  border-radius: 999px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.72);
  color: #3a3a3c;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.account-nav-pill--active {
  border-color: rgba(0, 122, 255, 0.28);
  background: rgba(0, 122, 255, 0.09);
  color: #0066c0;
}

.account-main {
  padding: 62px 56px 0;
}

.account-heading {
  margin-bottom: 30px;
}

.account-eyebrow,
.account-section-label {
  color: var(--page-muted);
  font-size: 13px;
  font-weight: 750;
}

.account-eyebrow {
  margin: 0 0 10px;
}

.account-heading h1 {
  margin: 0;
  font-size: clamp(42px, 5vw, 64px);
  font-weight: 780;
  letter-spacing: -0.045em;
  line-height: 1;
}

.account-heading p:last-child {
  max-width: 620px;
  margin: 14px 0 0;
  color: var(--page-muted);
  font-size: 16px;
  line-height: 1.6;
}

.account-layout {
  display: grid;
  grid-template-columns: minmax(260px, 0.72fr) minmax(420px, 1.28fr);
  align-items: start;
  gap: 20px;
}

.account-card {
  padding: 28px;
}

.account-card--identity {
  min-height: 430px;
  text-align: center;
}

.account-avatar-wrap {
  position: relative;
  display: inline-block;
  margin-bottom: 18px;
}

.account-avatar {
  display: grid;
  width: 96px;
  height: 96px;
  place-items: center;
  overflow: hidden;
  border: 4px solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  background: linear-gradient(135deg, #1d1d1f, #5f6368);
  box-shadow: 0 14px 28px rgba(64, 80, 106, 0.18);
  color: #fff;
  font-size: 34px;
  font-weight: 800;
}

.account-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.account-avatar-edit {
  position: absolute;
  right: -2px;
  bottom: 1px;
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 3px solid #fff;
  border-radius: 50%;
  background: var(--page-accent);
  color: #fff;
  cursor: pointer;
  font-size: 20px;
  line-height: 1;
}

.account-card--identity h2,
.account-card--form h2 {
  margin: 0;
  color: var(--page-text);
  font-size: 22px;
  font-weight: 780;
}

.account-identity-muted,
.account-card-help,
.account-help {
  color: var(--page-muted);
  font-size: 13px;
  line-height: 1.6;
}

.account-identity-muted {
  margin: 7px 0 0;
  overflow-wrap: anywhere;
}

.account-divider {
  height: 1px;
  margin: 24px 0;
  background: rgba(0, 0, 0, 0.08);
}

.account-fact {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 13px;
  text-align: left;
}

.account-fact span {
  color: var(--page-muted);
  font-size: 12px;
}

.account-fact strong {
  max-width: 65%;
  overflow-wrap: anywhere;
  color: var(--page-text);
  font-size: 12px;
  text-align: right;
}

.account-card-help {
  margin: 24px 0 0;
  text-align: left;
}

.account-hidden-input {
  display: none;
}

.account-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 28px;
}

.account-section-label {
  display: block;
  margin-bottom: 7px;
}

.account-section-icon {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 13px;
  background: rgba(0, 122, 255, 0.1);
  color: var(--page-accent);
  font-size: 20px;
  font-weight: 800;
}

.account-field {
  display: block;
  margin-top: 18px;
}

.account-field:first-of-type {
  margin-top: 0;
}

.account-field > span {
  display: block;
  margin-bottom: 8px;
  color: var(--page-muted);
  font-size: 13px;
  font-weight: 700;
}

.account-field .field-input[readonly] {
  color: var(--page-muted);
  background: rgba(242, 242, 247, 0.62);
}

.account-help {
  margin: 18px 0 0;
}

.account-form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 30px;
  padding-top: 22px;
  border-top: 1px solid rgba(0, 0, 0, 0.07);
}

.account-state {
  display: grid;
  min-height: 220px;
  place-items: center;
  gap: 18px;
  text-align: center;
}

.account-state h2 {
  margin: 0;
}

@media (max-width: 960px) {
  .account-page {
    padding: 20px 16px 48px;
  }

  .account-topbar {
    position: relative;
    top: 0;
    grid-template-columns: 1fr auto;
    border-radius: 24px;
  }

  .account-topbar__context {
    display: none;
  }

  .account-topbar__actions {
    grid-column: 2;
    grid-row: 1;
  }

  .account-nav-pill {
    padding-inline: 11px;
  }

  .account-main {
    padding: 44px 0 0;
  }

  .account-layout {
    grid-template-columns: 1fr;
  }

  .account-card--identity {
    min-height: 0;
  }
}

@media (max-width: 620px) {
  .account-topbar {
    align-items: start;
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .account-topbar__actions {
    grid-column: auto;
    grid-row: auto;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .account-heading h1 {
    font-size: 44px;
  }

  .account-card {
    padding: 22px 18px;
  }
}
</style>
