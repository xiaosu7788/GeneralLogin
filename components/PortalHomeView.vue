<template>
  <div class="portal-page simple-home">
    <header class="simple-shell simple-topbar">
      <PortalBrand compact />

      <nav class="simple-primary-nav" aria-label="首页功能">
        <button type="button" @click="scrollToApps">
          {{ t("portal.apps") }}
        </button>
        <button type="button" @click="openFeedback">
          {{ t("login.feedback") }}
        </button>
        <div ref="docsRoot" class="simple-docs" :class="{ open: docsMenuOpen }">
          <button
            type="button"
            :aria-expanded="docsMenuOpen"
            aria-haspopup="menu"
            @click="docsMenuOpen = !docsMenuOpen"
          >
            {{ t("login.docsList") }}
          </button>
          <div v-if="docsMenuOpen" class="simple-docs__menu" role="menu">
            <a
              v-if="me?.isAdmin"
              href="/docs/"
              target="_blank"
              rel="noreferrer"
              role="menuitem"
              @click="docsMenuOpen = false"
            >
              {{ t("portal.docsPlatform") }}
            </a>
            <a
              v-for="service in docsServices"
              :key="service.id"
              :href="service.docsUrl || undefined"
              target="_blank"
              rel="noreferrer"
              role="menuitem"
              @click="docsMenuOpen = false"
            >
              {{ serviceTitle(service) }}{{ t("portal.docsServiceSuffix") }}
            </a>
            <p v-if="docsServices.length === 0 && !me?.isAdmin" class="simple-docs__empty">
              {{ t("login.noDocs") }}
            </p>
          </div>
        </div>
      </nav>

      <div class="simple-top-actions">
        <NuxtLink v-if="me?.isAdmin" class="simple-nav-pill" to="/admin">
          {{ t("apps.admin") }}
        </NuxtLink>
        <ClientOnly v-if="me">
          <AuthActions />
        </ClientOnly>
        <button v-else class="simple-user-pill" type="button" @click="openAuth()">
          {{ t("common.login") }}
        </button>
      </div>
    </header>

    <main class="simple-shell simple-main">
      <section v-if="featuredService" class="simple-featured" aria-labelledby="featured-app-title">
        <div class="simple-featured__content">
          <div class="simple-featured__icon" :style="iconStyle(featuredService)">
            <span>{{ serviceInitial(featuredService) }}</span>
          </div>
          <div>
            <div class="simple-featured__tags">
              <span v-for="tag in serviceTags(featuredService).slice(0, 3)" :key="tag">{{ tag }}</span>
            </div>
            <h1 id="featured-app-title">{{ serviceTitle(featuredService) }}</h1>
            <p>{{ serviceIntro(featuredService) }}</p>
          </div>
          <button
            class="simple-open-btn simple-featured__action"
            type="button"
            :disabled="featuredService.status !== 'online' || authorizingServiceId === featuredService.id"
            @click="openService(featuredService)"
          >
            {{ authorizingServiceId === featuredService.id ? t("common.loading") : t("portal.openApp") }}
          </button>
        </div>
        <div class="simple-featured__media">
          <video
            v-if="featuredService.videoUrl && featuredService.mediaType === 'video'"
            :src="featuredService.videoUrl"
            autoplay
            muted
            loop
            playsinline
          />
          <img
            v-else-if="featuredService.coverImageUrl"
            :src="featuredService.coverImageUrl"
            :alt="serviceTitle(featuredService)"
          >
          <div v-else class="simple-featured__fallback" :style="iconStyle(featuredService)">
            <span>{{ serviceInitial(featuredService) }}</span>
          </div>
        </div>
      </section>

      <section ref="appsSection" class="simple-filter-card" aria-label="应用筛选">
        <label class="simple-search" for="portal-service-search-inline">
          <span>⌕</span>
          <input
            id="portal-service-search-inline"
            v-model.trim="serviceQuery"
            type="search"
            autocomplete="off"
            placeholder="输入应用名称、标签或 Client ID"
          >
        </label>
        <div class="simple-filter-tabs" role="tablist" aria-label="应用状态筛选">
          <button
            :class="{ active: activeFilter === 'all' }"
            type="button"
            @click="activeFilter = 'all'"
          >
            全部
          </button>
          <button
            :class="{ active: activeFilter === 'online' }"
            type="button"
            @click="activeFilter = 'online'"
          >
            已上线
          </button>
          <button
            :class="{ active: activeFilter === 'offline' }"
            type="button"
            @click="activeFilter = 'offline'"
          >
            异常
          </button>
        </div>
        <span class="simple-count">{{ filteredServices.length }} 个应用</span>
      </section>

      <section v-if="loading" class="simple-state-card">
        {{ t("login.loadingServices") }}
      </section>
      <section v-else-if="filteredServices.length === 0" class="simple-state-card">
        <h2>{{ services.length ? "没有匹配的应用" : t("login.noServices") }}</h2>
        <p>{{ services.length ? "换一个关键词或筛选条件试试。" : "管理员配置应用后会显示在这里。" }}</p>
      </section>
      <section v-else class="simple-app-grid" aria-label="应用列表">
        <article v-for="service in filteredServices" :key="service.id" class="simple-app-card">
          <div class="simple-app-card__icon" :style="iconStyle(service)">
            <img v-if="service.coverImageUrl" :src="service.coverImageUrl" :alt="serviceTitle(service)">
            <span v-else>{{ serviceInitial(service) }}</span>
          </div>
          <div class="simple-app-card__content">
            <h2>{{ serviceTitle(service) }}</h2>
            <p>{{ serviceIntro(service) }}</p>
            <div class="simple-app-card__tags">
              <span v-for="tag in serviceTags(service).slice(0, 2)" :key="tag">{{ tag }}</span>
            </div>
          </div>
          <footer class="simple-app-card__footer">
            <span class="simple-status" :class="`simple-status--${service.status}`">
              {{ service.status === "online" ? t("login.serviceOnline") : t("login.serviceOffline") }}
            </span>
            <button
              class="simple-open-btn"
              type="button"
              :disabled="service.status !== 'online' || authorizingServiceId === service.id"
              @click="openService(service)"
            >
              {{ authorizingServiceId === service.id ? t("common.loading") : t("portal.openApp") }}
            </button>
          </footer>
        </article>
      </section>
    </main>

    <ClientOnly>
      <AuthModal
        v-model="authVisible"
        :target-service-id="selectedService?.id"
        :target-service-name="selectedService ? serviceTitle(selectedService) : ''"
        @authenticated="loadUser"
      />
    </ClientOnly>

    <div v-if="feedbackVisible" class="simple-modal" role="dialog" aria-modal="true" :aria-label="t('feedback.title')">
      <button class="simple-modal__backdrop" type="button" aria-label="关闭" @click="feedbackVisible = false" />
      <section class="simple-modal__panel">
        <FeedbackPanel embed @close="feedbackVisible = false" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus/es/components/message/index";
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";

type PortalService = {
  id: string;
  name: string;
  slug: string;
  clientId: string;
  description?: string | null;
  displayTitle?: string | null;
  shortIntro?: string | null;
  coverImageUrl?: string | null;
  videoUrl?: string | null;
  mediaType?: string | null;
  tags?: string[];
  featured?: boolean;
  host?: string;
  status: "online" | "offline";
  docsUrl?: string | null;
};

const route = useRoute();
const { t, localizeError, theme, locale } = usePortalI18n();
const loading = ref(true);
const services = ref<PortalService[]>([]);
const feedbackVisible = ref(false);
const docsMenuOpen = ref(false);
const docsRoot = ref<HTMLElement | null>(null);
const appsSection = ref<HTMLElement | null>(null);
const serviceQuery = ref("");
const activeFilter = ref<"all" | "online" | "offline">("all");
const selectedService = ref<PortalService | null>(null);
const authVisible = ref(false);
const authorizingServiceId = ref("");
const me = ref<{ isAdmin?: boolean } | null>(null);
const featuredService = computed(() =>
  services.value.find((service) => service.featured)
  || services.value.find((service) => service.status === "online")
  || services.value[0]
  || null
);
const docsServices = computed(() => services.value.filter((service) => Boolean(service.docsUrl)));

const filteredServices = computed(() => {
  const keyword = serviceQuery.value.trim().toLowerCase();
  return services.value.filter((service) => {
    if (activeFilter.value !== "all" && service.status !== activeFilter.value) {
      return false;
    }

    if (!keyword) {
      return true;
    }

    const searchable = [
      service.name,
      service.displayTitle,
      service.shortIntro,
      service.description,
      service.slug,
      service.clientId,
      service.host,
      ...(service.tags || [])
    ].filter(Boolean).join(" ").toLowerCase();

    return searchable.includes(keyword);
  });
});

function serviceTitle(service?: PortalService | null) {
  return service?.displayTitle || service?.name || "ZR Access";
}

function serviceIntro(service?: PortalService | null) {
  return service?.shortIntro || service?.description || t("apps.defaultDescription");
}

function serviceTags(service?: PortalService | null) {
  const tags = service?.tags?.filter(Boolean) || [];
  if (tags.length) {
    return tags.slice(0, 4);
  }

  const fallback = service?.host || service?.slug || "portal";
  return fallback ? [fallback] : [];
}

function serviceInitial(service?: PortalService | null) {
  const title = serviceTitle(service).trim();
  return title.slice(0, 2).toUpperCase() || "ZR";
}

function iconStyle(service: PortalService) {
  const colorSeeds = ["#007aff", "#5856d6", "#34c759", "#ff9500", "#ff2d55", "#32ade6"];
  const index = Math.abs(service.id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0)) % colorSeeds.length;
  const color = colorSeeds[index];
  return {
    "--card-accent": color,
    "--card-accent-soft": `${color}1f`
  };
}

function openAuth(service?: PortalService | null) {
  selectedService.value = service || null;
  authVisible.value = true;
}

function scrollToApps() {
  docsMenuOpen.value = false;
  appsSection.value?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function openFeedback() {
  docsMenuOpen.value = false;
  feedbackVisible.value = true;
}

function closeFloatingUi(event: MouseEvent) {
  if (docsRoot.value && !docsRoot.value.contains(event.target as Node)) {
    docsMenuOpen.value = false;
  }
}

function handleEscape(event: KeyboardEvent) {
  if (event.key !== "Escape") {
    return;
  }

  docsMenuOpen.value = false;
  feedbackVisible.value = false;
}

async function openService(service?: PortalService | null) {
  if (!service) {
    openAuth();
    return;
  }

  if (service.status !== "online") {
    return;
  }

  if (!me.value) {
    openAuth(service);
    return;
  }

  authorizingServiceId.value = service.id;

  try {
    const result = await $fetch<{
      status: "authorized" | "needs_onboarding" | "needs_access";
      redirectUrl: string;
    }>("/api/portal/authorize", {
      method: "POST",
      body: {
        serviceId: service.id,
        theme: theme.value,
        locale: locale.value
      }
    });

    if (result.status === "authorized") {
      await navigateTo(result.redirectUrl, { external: true });
      return;
    }

    await navigateTo(result.redirectUrl);
  } catch (error: any) {
    if (error?.statusCode === 401 || error?.response?.status === 401) {
      me.value = null;
      openAuth(service);
      return;
    }

    ElMessage.error(localizeError(error, "error.serviceAuthorizeFailed"));
  } finally {
    authorizingServiceId.value = "";
  }
}

async function load() {
  loading.value = true;

  try {
    const result = await $fetch<{ services: PortalService[] }>("/api/public/services");
    services.value = result.services;
  } catch {
    services.value = [];
  } finally {
    loading.value = false;
  }

  await loadUser();

  const serviceId = String(route.query.service_id || "");
  const externalLogin = Boolean(route.query.client_id && route.query.callback);
  const target = services.value.find((service) => service.id === serviceId) || null;
  if (target && me.value && externalLogin) {
    await openService(target);
    return;
  }

  if (externalLogin || route.path === "/login") {
    openAuth(target);
  }
}

async function loadUser() {
  try {
    const result = await $fetch<{ user: { isAdmin?: boolean } }>("/api/auth/me");
    me.value = result.user;
  } catch {
    me.value = null;
  }
}

watch(
  () => route.fullPath,
  () => {
    docsMenuOpen.value = false;
  }
);

onMounted(() => {
  document.addEventListener("click", closeFloatingUi);
  document.addEventListener("keydown", handleEscape);
  load();
});

onBeforeUnmount(() => {
  document.removeEventListener("click", closeFloatingUi);
  document.removeEventListener("keydown", handleEscape);
});
</script>

<style scoped>
.simple-home {
  --simple-bg: #f5f7fb;
  --simple-panel: rgba(255, 255, 255, 0.72);
  --simple-panel-strong: rgba(255, 255, 255, 0.86);
  --simple-text: #1d1d1f;
  --simple-muted: #6e6e73;
  --simple-subtle: #86868b;
  --simple-border: rgba(0, 0, 0, 0.07);
  --simple-blue: #007aff;
  min-height: 100vh;
  padding: 46px 48px 72px;
  background:
    radial-gradient(circle at 10% 7%, rgba(255, 149, 0, 0.18), transparent 28%),
    radial-gradient(circle at 82% 12%, rgba(0, 122, 255, 0.14), transparent 34%),
    linear-gradient(135deg, #fbfbfd 0%, #f4f8ff 54%, #fff8ef 100%);
  color: var(--simple-text);
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", "Microsoft YaHei", sans-serif;
}

.simple-shell {
  width: min(1344px, 100%);
  margin: 0 auto;
}

.simple-topbar {
  position: sticky;
  top: 18px;
  z-index: 20;
  display: grid;
  grid-template-columns: minmax(220px, 1fr) auto minmax(220px, 1fr);
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

.simple-primary-nav {
  display: inline-flex;
  align-items: center;
  justify-self: center;
  min-height: 44px;
  border: 1px solid var(--simple-border);
  border-radius: 999px;
  padding: 4px;
  background: rgba(242, 242, 247, 0.86);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.simple-primary-nav > button,
.simple-docs > button {
  min-height: 36px;
  border: 0;
  border-radius: 999px;
  padding: 0 18px;
  background: transparent;
  color: #3a3a3c;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  transition: background 0.2s ease, color 0.2s ease;
}

.simple-primary-nav > button:hover,
.simple-docs > button:hover,
.simple-docs.open > button {
  background: #fff;
  color: var(--simple-text);
}

.simple-docs {
  position: relative;
}

.simple-docs__menu {
  position: absolute;
  top: calc(100% + 12px);
  left: 50%;
  z-index: 30;
  display: grid;
  width: 280px;
  max-height: 320px;
  overflow-y: auto;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 18px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 22px 60px rgba(40, 50, 68, 0.2);
  transform: translateX(-50%);
  backdrop-filter: blur(24px);
}

.simple-docs__menu a,
.simple-docs__empty {
  margin: 0;
  border-radius: 12px;
  padding: 12px 14px;
  color: var(--simple-text);
  font-size: 13px;
  line-height: 1.4;
  text-decoration: none;
}

.simple-docs__menu a:hover {
  background: #f2f2f7;
}

.simple-docs__empty {
  color: var(--simple-subtle);
}

.simple-brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.simple-brand__mark {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border: 1px solid var(--simple-border);
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 8px 18px rgba(64, 80, 106, 0.1);
  color: #ff7a2f;
  font-size: 24px;
  font-weight: 900;
  line-height: 1;
}

.simple-brand strong,
.simple-brand small {
  display: block;
}

.simple-brand strong {
  color: var(--simple-text);
  font-size: 15px;
  line-height: 1.2;
}

.simple-brand small {
  margin-top: 3px;
  color: var(--simple-subtle);
  font-size: 11px;
}

.simple-search {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--simple-border);
  background: rgba(242, 242, 247, 0.84);
  color: var(--simple-subtle);
}

.simple-search input {
  min-width: 0;
  width: 100%;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--simple-text);
  font-size: 13px;
}

.simple-search input::placeholder {
  color: #9a9aa0;
}

.simple-top-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  min-width: 0;
}

.simple-nav-pill,
.simple-user-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  border: 1px solid var(--simple-border);
  border-radius: 999px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.72);
  color: #3a3a3c;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

.simple-user-pill {
  min-width: 44px;
  border-color: rgba(0, 0, 0, 0.1);
  background: #1d1d1f;
  color: #fff;
}

.simple-main {
  margin-top: 24px;
  padding: 40px 56px 44px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 36px;
  background: rgba(255, 255, 255, 0.46);
  box-shadow: 0 30px 80px rgba(64, 96, 128, 0.12);
  backdrop-filter: blur(22px);
}

.simple-featured {
  display: grid;
  grid-template-columns: minmax(320px, 0.82fr) minmax(420px, 1.18fr);
  min-height: 364px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 30px;
  background: #1d1d1f;
  box-shadow: 0 24px 60px rgba(33, 42, 58, 0.2);
  color: #f5f5f7;
}

.simple-featured__content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-width: 0;
  padding: 40px 44px;
}

.simple-featured__icon {
  display: none;
}

.simple-featured__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.simple-featured__tags span {
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  padding: 5px 9px;
  color: #d2d2d7;
  font-size: 11px;
}

.simple-featured h1 {
  margin: 0;
  color: #f5f5f7;
  font-size: 42px;
  font-weight: 760;
  line-height: 1.08;
}

.simple-featured p {
  display: -webkit-box;
  margin: 14px 0 0;
  overflow: hidden;
  color: #a1a1a6;
  font-size: 15px;
  line-height: 1.65;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.simple-featured__action {
  margin-top: 26px;
  min-height: 44px;
  padding: 0 24px;
}

.simple-featured__media {
  position: relative;
  min-height: 364px;
  overflow: hidden;
  background: #2c2c2e;
}

.simple-featured__media::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(29, 29, 31, 0.34), transparent 25%);
  pointer-events: none;
  content: "";
}

.simple-featured__media img,
.simple-featured__media video,
.simple-featured__fallback {
  width: 100%;
  height: 100%;
  min-height: 364px;
}

.simple-featured__media img,
.simple-featured__media video {
  display: block;
  object-fit: cover;
}

.simple-featured__fallback {
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 72% 32%, var(--card-accent-soft), transparent 24%),
    linear-gradient(135deg, #232326, #343438);
  color: var(--card-accent, #64d2ff);
  font-size: 80px;
  font-weight: 800;
}

.simple-hero {
  max-width: 760px;
}

.simple-kicker {
  margin: 0 0 10px;
  color: var(--simple-subtle);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.simple-hero h1 {
  margin: 0;
  color: var(--simple-text);
  font-size: clamp(52px, 6.2vw, 82px);
  font-weight: 760;
  line-height: 0.96;
  letter-spacing: -0.05em;
}

.simple-hero p:last-child {
  margin: 18px 0 0;
  color: var(--simple-muted);
  font-size: 18px;
  line-height: 1.65;
}

.simple-filter-card {
  display: grid;
  grid-template-columns: minmax(260px, 486px) auto 1fr;
  align-items: center;
  gap: 28px;
  margin-top: 42px;
  border-radius: 28px;
  padding: 18px 28px;
  background: var(--simple-panel);
  box-shadow: 0 18px 44px rgba(64, 96, 128, 0.08);
  backdrop-filter: blur(20px);
}

.simple-search {
  min-height: 42px;
  border-radius: 999px;
  padding: 0 18px;
}

.simple-filter-tabs {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.simple-filter-tabs button {
  min-height: 42px;
  border: 1px solid var(--simple-border);
  border-radius: 999px;
  padding: 0 28px;
  background: #fff;
  color: var(--simple-text);
  cursor: pointer;
  font-weight: 700;
}

.simple-filter-tabs button.active {
  border-color: rgba(0, 122, 255, 0.12);
  background: var(--simple-blue);
  color: #fff;
}

.simple-count {
  justify-self: end;
  color: var(--simple-subtle);
  font-size: 13px;
}

.simple-app-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 28px 36px;
  margin-top: 38px;
}

.simple-app-card {
  display: grid;
  min-height: 224px;
  border: 1px solid rgba(255, 255, 255, 0.92);
  border-radius: 30px;
  padding: 28px;
  background: var(--simple-panel-strong);
  box-shadow: 0 18px 42px rgba(64, 96, 128, 0.12);
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease;
}

.simple-app-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 26px 58px rgba(64, 96, 128, 0.16);
}

.simple-app-card__icon {
  display: grid;
  width: 62px;
  height: 62px;
  place-items: center;
  overflow: hidden;
  border-radius: 20px;
  background: var(--card-accent-soft, rgba(0, 122, 255, 0.12));
  color: var(--card-accent, var(--simple-blue));
  font-size: 18px;
  font-weight: 900;
}

.simple-app-card__icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.simple-app-card__content {
  min-width: 0;
  margin-top: 18px;
}

.simple-app-card__content h2 {
  margin: 0;
  color: var(--simple-text);
  font-size: 24px;
  font-weight: 760;
  line-height: 1.15;
}

.simple-app-card__content p {
  display: -webkit-box;
  min-height: 22px;
  margin: 10px 0 0;
  overflow: hidden;
  color: var(--simple-muted);
  font-size: 14px;
  line-height: 1.55;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.simple-app-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 9px;
}

.simple-app-card__tags span {
  color: var(--simple-subtle);
  font-size: 12px;
}

.simple-app-card__tags span + span::before {
  margin-right: 6px;
  content: "·";
}

.simple-app-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 18px;
}

.simple-status {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #248a3d;
  font-size: 13px;
  font-weight: 700;
}

.simple-status::before {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: currentColor;
  content: "";
}

.simple-status--offline {
  color: #bf5f00;
}

.simple-open-btn {
  min-width: 84px;
  min-height: 38px;
  border: 1px solid rgba(0, 122, 255, 0.12);
  border-radius: 999px;
  padding: 0 18px;
  background: var(--simple-blue);
  color: #fff;
  cursor: pointer;
  font-weight: 800;
}

.simple-open-btn:disabled {
  border-color: rgba(0, 122, 255, 0.18);
  background: rgba(0, 122, 255, 0.1);
  color: var(--simple-blue);
  cursor: not-allowed;
}

.simple-state-card {
  display: grid;
  min-height: 280px;
  place-items: center;
  margin-top: 38px;
  border-radius: 30px;
  padding: 28px;
  background: var(--simple-panel-strong);
  color: var(--simple-muted);
  text-align: center;
  box-shadow: 0 18px 42px rgba(64, 96, 128, 0.1);
}

.simple-state-card h2,
.simple-state-card p {
  margin: 0;
}

.simple-state-card h2 {
  color: var(--simple-text);
  font-size: 24px;
}

.simple-state-card p {
  margin-top: 8px;
}

.simple-modal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-items: center;
  padding: 24px;
}

:global(body:has(.simple-modal)) {
  overflow: hidden;
}

.simple-modal__backdrop {
  position: absolute;
  inset: 0;
  border: 0;
  background: rgba(18, 20, 24, 0.48);
  cursor: default;
  backdrop-filter: blur(8px);
}

.simple-modal__panel {
  position: relative;
  z-index: 1;
  width: min(1040px, calc(100vw - 48px));
  max-height: min(760px, calc(100vh - 48px));
  overflow: hidden;
  border-radius: 28px;
  box-shadow: 0 32px 96px rgba(16, 24, 40, 0.3);
}

.simple-modal__panel :deep(.feedback-card) {
  margin: 0;
  max-height: min(760px, calc(100vh - 48px));
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-color: rgba(60, 60, 67, 0.32) transparent;
  scrollbar-width: thin;
}

.simple-modal__panel :deep(.feedback-card)::-webkit-scrollbar {
  width: 8px;
}

.simple-modal__panel :deep(.feedback-card)::-webkit-scrollbar-track {
  margin-block: 18px;
  background: transparent;
}

.simple-modal__panel :deep(.feedback-card)::-webkit-scrollbar-thumb {
  border: 2px solid transparent;
  border-radius: 999px;
  background: rgba(60, 60, 67, 0.32);
  background-clip: padding-box;
}

.simple-modal__panel :deep(.feedback-card)::-webkit-scrollbar-thumb:hover {
  background: rgba(60, 60, 67, 0.5);
  background-clip: padding-box;
}

:deep(.auth-actions .account-button) {
  min-height: 34px;
  border-color: var(--simple-border);
  border-radius: 999px;
  background: #1d1d1f;
  color: #fff;
}

:deep(.auth-actions .auth-actions__name) {
  color: #fff;
}

:deep(.auth-actions .account-avatar) {
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}

@media (max-width: 1180px) {
  .simple-topbar {
    grid-template-columns: minmax(200px, 1fr) auto;
  }

  .simple-primary-nav {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  .simple-top-actions {
    flex-wrap: wrap;
  }

  .simple-featured {
    grid-template-columns: minmax(300px, 0.9fr) minmax(360px, 1.1fr);
  }

  .simple-filter-card {
    grid-template-columns: 1fr;
  }

  .simple-count {
    justify-self: start;
  }

  .simple-app-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .simple-home {
    padding: 16px;
  }

  .simple-main {
    margin-top: 16px;
    padding: 20px;
  }

  .simple-topbar {
    grid-template-columns: 1fr;
    border-radius: 24px;
  }

  .simple-primary-nav {
    grid-column: 1;
    grid-row: auto;
    justify-self: stretch;
  }

  .simple-primary-nav > button,
  .simple-docs {
    flex: 1 1 0;
  }

  .simple-docs > button {
    width: 100%;
    padding: 0 10px;
  }

  .simple-docs__menu {
    right: 0;
    left: auto;
    width: min(280px, calc(100vw - 32px));
    transform: none;
  }

  .simple-top-actions {
    justify-content: flex-start;
  }

  .simple-filter-tabs {
    flex-wrap: wrap;
  }

  .simple-featured {
    grid-template-columns: 1fr;
    min-height: 0;
  }

  .simple-featured__content {
    padding: 32px 24px 28px;
  }

  .simple-featured h1 {
    font-size: 34px;
  }

  .simple-featured__media,
  .simple-featured__media img,
  .simple-featured__media video,
  .simple-featured__fallback {
    min-height: 220px;
  }

  .simple-filter-card {
    margin-top: 24px;
    padding: 18px;
  }

  .simple-modal {
    padding: 12px;
  }

  .simple-modal__panel {
    width: calc(100vw - 24px);
    max-height: calc(100vh - 24px);
    border-radius: 22px;
  }

  .simple-modal__panel :deep(.feedback-card) {
    max-height: calc(100vh - 24px);
  }

  .simple-app-grid {
    grid-template-columns: 1fr;
  }
}
</style>
