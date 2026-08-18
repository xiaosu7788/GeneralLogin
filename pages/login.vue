<template>
  <div class="login-page">
    <main class="login-page__shell">
      <section class="login-hero">
        <PortalBrand />

        <p class="login-kicker">{{ t('login.eyebrow') }}</p>
        <h1>一次登录，进入全部已授权服务。</h1>
        <p class="login-copy">
          登录后可继续访问当前服务、完成 OAuth 回跳或申请访问权限。
        </p>

        <div class="login-points">
          <div>
            <strong>账号登录</strong>
            <span>邮箱 / 用户名 / 密码</span>
          </div>
          <div>
            <strong>Linux.do 登录</strong>
            <span>外部账号快捷授权</span>
          </div>
          <div>
            <strong>安全提示</strong>
            <span>登录会自动携带回跳参数</span>
          </div>
        </div>
      </section>

      <section class="login-card-wrap">
        <AuthModal
          v-model="authVisible"
          embedded
          :target-service-id="targetServiceId || undefined"
          :target-service-name="targetServiceName"
          @authenticated="handleAuthenticated"
        />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

const route = useRoute();
const { t, theme, locale } = usePortalI18n();
const authVisible = ref(true);

const targetServiceId = computed(() => String(route.query.service_id || ""));
const targetServiceName = computed(() => String(route.query.service_name || ""));

function buildHomeUrl() {
  const params = new URLSearchParams();
  if (route.query.theme) {
    params.set("theme", String(route.query.theme));
  }
  if (route.query.locale) {
    params.set("locale", String(route.query.locale));
  }
  const query = params.toString();
  return query ? `/?${query}` : "/";
}

async function handleAuthenticated() {
  await navigateTo(buildHomeUrl());
}

onMounted(() => {
  authVisible.value = true;
});
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  padding: 28px;
}

.login-page__shell {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(420px, 520px);
  gap: 28px;
  align-items: center;
  width: min(1320px, 100%);
  min-height: calc(100vh - 56px);
  margin: 0 auto;
}

.login-hero {
  display: grid;
  align-content: center;
  gap: 18px;
  max-width: 640px;
}

.login-brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  width: fit-content;
}

.login-brand__mark {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 10px 22px rgba(64, 96, 128, 0.1);
  color: #ff7a2f;
  font-size: 26px;
  font-weight: 900;
  line-height: 1;
}

.login-brand strong,
.login-brand small {
  display: block;
}

.login-brand strong {
  color: #1d1d1f;
  font-size: 16px;
  line-height: 1.2;
}

.login-brand small {
  margin-top: 3px;
  color: #86868b;
  font-size: 11px;
}

.login-kicker {
  margin: 0;
  color: #007aff;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.login-hero h1 {
  margin: 0;
  color: #1d1d1f;
  font-size: clamp(52px, 6vw, 84px);
  font-weight: 780;
  line-height: 0.96;
  letter-spacing: -0.05em;
}

.login-copy {
  max-width: 560px;
  margin: 0;
  color: #6e6e73;
  font-size: 18px;
  line-height: 1.7;
}

.login-points {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-top: 10px;
}

.login-points > div {
  border: 1px solid rgba(255, 255, 255, 0.86);
  border-radius: 22px;
  padding: 18px;
  background: rgba(255, 255, 255, 0.64);
  box-shadow: 0 12px 28px rgba(64, 96, 128, 0.08);
}

.login-points strong,
.login-points span {
  display: block;
}

.login-points strong {
  color: #1d1d1f;
  font-size: 14px;
  font-weight: 750;
}

.login-points span {
  margin-top: 6px;
  color: #6e6e73;
  font-size: 12px;
  line-height: 1.5;
}

.login-card-wrap {
  display: grid;
  align-items: center;
}

:deep(.auth-modal) {
  position: relative;
  inset: auto;
  padding: 0;
}

:deep(.auth-modal__panel--embedded) {
  width: 100%;
}

:deep(.auth-modal__panel) {
  width: 100%;
}

@media (max-width: 1100px) {
  .login-page__shell {
    grid-template-columns: 1fr;
    min-height: auto;
    padding: 24px 0 56px;
  }

  .login-hero h1 {
    font-size: clamp(44px, 9vw, 68px);
  }
}

@media (max-width: 760px) {
  .login-page {
    padding: 16px;
  }

  .login-points {
    grid-template-columns: 1fr;
  }
}
</style>

