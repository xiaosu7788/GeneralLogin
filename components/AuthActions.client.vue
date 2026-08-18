<template>
  <div class="auth-actions">
    <template v-if="user">
      <el-dropdown trigger="click" @command="handleCommand">
        <button class="account-button" type="button">
          <span class="account-avatar">
            <img v-if="user.avatarUrl" :src="user.avatarUrl" alt="">
            <span v-else>{{ avatarInitial }}</span>
          </span>
          <span class="auth-actions__name">{{ displayName }}</span>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">{{ t("common.profile") }}</el-dropdown-item>
            <el-dropdown-item command="password">{{ t("common.changePassword") }}</el-dropdown-item>
            <el-dropdown-item command="locale">
              {{ locale === "zh" ? t("common.en") : t("common.zh") }}
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">{{ t("common.logout") }}</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </template>
    <NuxtLink v-else class="ghost-btn auth-actions__button" to="/login">{{ t("common.login") }}</NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

type User = {
  id: string;
  account?: string | null;
  email?: string | null;
  username?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
};

const user = ref<User | null>(null);
const { t, locale, setLocale } = usePortalI18n();

const displayName = computed(
  () =>
    user.value?.name ||
    user.value?.account ||
    user.value?.username ||
    user.value?.email ||
    t("common.profile")
);
const avatarInitial = computed(() => displayName.value.trim().slice(0, 1).toUpperCase() || "U");

async function load() {
  try {
    const result = await $fetch<{ user: User }>("/api/auth/me");
    user.value = result.user;
  } catch {
    user.value = null;
  }
}

async function logout() {
  await $fetch("/api/auth/logout", { method: "POST" });
  await navigateTo("/login");
}

async function handleCommand(command: string) {
  if (command === "profile") {
    await navigateTo("/profile");
  } else if (command === "password") {
    await navigateTo("/password");
  } else if (command === "locale") {
    setLocale(locale.value === "zh" ? "en" : "zh");
  } else if (command === "logout") {
    await logout();
  }
}

onMounted(load);
</script>

<style scoped>
.auth-actions {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.account-button {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  max-width: 260px;
  border: 1px solid var(--page-border);
  border-radius: 12px;
  padding: 6px 10px 6px 6px;
  background: var(--page-surface-strong);
  color: var(--page-text);
  cursor: pointer;
}

.account-avatar {
  display: inline-grid;
  place-items: center;
  flex: 0 0 auto;
  overflow: hidden;
  border: 1px solid var(--page-border);
  border-radius: 50%;
  background: var(--page-surface-muted);
  color: var(--page-text);
  font-weight: 700;
}

.account-avatar {
  width: 30px;
  height: 30px;
  font-size: 13px;
}

.account-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.auth-actions__name {
  min-width: 0;
  overflow: hidden;
  color: var(--page-text);
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.auth-actions__button {
  padding: 8px 12px;
}
</style>
