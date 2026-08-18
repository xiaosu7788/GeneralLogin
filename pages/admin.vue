<template>
  <div class="page-panel admin-page">
    <div class="panel-header admin-page__header">
      <div class="admin-page__identity">
        <PortalBrand compact subtitle="管理工作台" />
        <div class="admin-page__heading">
          <h1 class="panel-title">{{ t("admin.title") }}</h1>
          <p class="panel-subtitle">
            {{ t("admin.subtitle") }}
          </p>
        </div>
      </div>
      <div class="action-row">
        <NuxtLink class="ghost-btn" to="/">{{ t("admin.backApps") }}</NuxtLink>
        <ClientOnly>
          <AuthActions />
        </ClientOnly>
      </div>
    </div>

    <section v-if="errorMessage" class="panel-card panel-card--strong admin-error">
      <h2>{{ errorMessage }}</h2>
      <NuxtLink class="primary-btn" to="/login">{{ t("common.relogin") }}</NuxtLink>
    </section>

    <template v-else>
      <section class="panel-card panel-card--strong admin-hero">
        <div class="admin-hero__copy">
          <span class="badge">{{ t("admin.title") }}</span>
          <h2>高频操作集中处理，列表保持清晰。</h2>
          <p class="muted">
            快速创建邀请码和服务，优先处理待审申请，并在同一工作台查看用户、反馈与系统状态。
          </p>
        </div>
        <div class="admin-hero__actions">
          <button class="primary-btn compact-admin-btn" type="button" @click="openInviteCreate">
            {{ t("admin.createInvite") }}
          </button>
          <button class="ghost-btn compact-admin-btn" type="button" @click="openServiceCreate">
            {{ t("admin.createService") }}
          </button>
          <button class="ghost-btn compact-admin-btn" type="button" @click="openAnnouncementCreate">
            {{ t("admin.createAnnouncement") }}
          </button>
        </div>
      </section>

      <section class="stat-strip">
        <div class="stat-chip">
          <p class="stat-chip__label">{{ t("admin.statUsers") }}</p>
          <p class="stat-chip__value">{{ summary.users }}</p>
        </div>
        <div class="stat-chip">
          <p class="stat-chip__label">{{ t("admin.statSuspendedUsers") }}</p>
          <p class="stat-chip__value">{{ summary.suspendedUsers }}</p>
        </div>
        <div class="stat-chip">
          <p class="stat-chip__label">{{ t("admin.statServices") }}</p>
          <p class="stat-chip__value">{{ summary.services }}</p>
        </div>
        <div class="stat-chip">
          <p class="stat-chip__label">{{ t("admin.statPendingRequests") }}</p>
          <p class="stat-chip__value">{{ summary.pendingRequests }}</p>
        </div>
      </section>

      <section class="panel-card panel-card--strong admin-card">
        <div class="admin-workspace-shell">
          <aside class="admin-workspace-sidebar" aria-label="管理导航">
            <nav class="admin-workspace-nav" aria-label="管理功能">
              <button
                class="admin-workspace-nav__item"
                :class="{ 'is-active': activeTab === 'growth' }"
                type="button"
                role="tab"
                :aria-selected="activeTab === 'growth'"
                @click="activeTab = 'growth'"
              >
                {{ t("admin.userGrowth") }}
              </button>
              <button
                class="admin-workspace-nav__item"
                :class="{ 'is-active': activeTab === 'server' }"
                type="button"
                role="tab"
                :aria-selected="activeTab === 'server'"
                @click="activeTab = 'server'"
              >
                {{ t("admin.serverInfo") }}
              </button>
              <button
                class="admin-workspace-nav__item"
                :class="{ 'is-active': activeTab === 'requests' }"
                type="button"
                role="tab"
                :aria-selected="activeTab === 'requests'"
                @click="activeTab = 'requests'"
              >
                {{ t("admin.tabRequests") }}
              </button>
              <button
                class="admin-workspace-nav__item"
                :class="{ 'is-active': activeTab === 'users' }"
                type="button"
                role="tab"
                :aria-selected="activeTab === 'users'"
                @click="activeTab = 'users'"
              >
                {{ t("admin.tabUsers") }}
              </button>
              <button
                class="admin-workspace-nav__item"
                :class="{ 'is-active': activeTab === 'invites' }"
                type="button"
                role="tab"
                :aria-selected="activeTab === 'invites'"
                @click="activeTab = 'invites'"
              >
                {{ t("admin.tabInvites") }}
              </button>
              <button
                class="admin-workspace-nav__item"
                :class="{ 'is-active': activeTab === 'services' }"
                type="button"
                role="tab"
                :aria-selected="activeTab === 'services'"
                @click="activeTab = 'services'"
              >
                {{ t("admin.tabServices") }}
              </button>
              <button
                class="admin-workspace-nav__item"
                :class="{ 'is-active': activeTab === 'announcements' }"
                type="button"
                role="tab"
                :aria-selected="activeTab === 'announcements'"
                @click="activeTab = 'announcements'"
              >
                {{ t("admin.tabAnnouncements") }}
              </button>
              <button
                class="admin-workspace-nav__item"
                :class="{ 'is-active': activeTab === 'open-source' }"
                type="button"
                role="tab"
                :aria-selected="activeTab === 'open-source'"
                @click="activeTab = 'open-source'"
              >
                {{ t("admin.tabOpenSource") }}
              </button>
              <button
                class="admin-workspace-nav__item"
                :class="{ 'is-active': activeTab === 'feedback' }"
                type="button"
                role="tab"
                :aria-selected="activeTab === 'feedback'"
                @click="activeTab = 'feedback'"
              >
                {{ t("admin.tabFeedback") }}
              </button>
            </nav>
          </aside>

          <div class="admin-workspace-content">
            <div class="admin-data-view">
              <section v-if="activeTab === 'growth'" class="admin-tab-pane admin-tab-pane--growth">
                <ClientOnly>
                  <AdminUserGrowthChart />
                  <template #fallback>
                    <section class="panel-card panel-card--strong growth-card-fallback">
                      <h2>{{ t("admin.userGrowth") }}</h2>
                      <p>{{ t("common.loading") }}</p>
                    </section>
                  </template>
                </ClientOnly>
              </section>

              <section v-show="activeTab === 'server'" class="admin-tab-pane admin-tab-pane--server">
                <section class="panel-card panel-card--strong server-card">
                  <div class="server-card__header">
                    <div>
                      <h2 class="server-card__title">{{ t("admin.serverInfo") }}</h2>
                      <p class="server-card__meta">
                        {{ t("admin.serverUpdatedAt", { time: formatDateTime(serverInfo.sampledAt) }) }}
                      </p>
                    </div>
                    <button class="ghost-btn compact-admin-btn" type="button" :disabled="serverLoading" @click="loadServerInfo">
                      {{ serverLoading ? t("common.loading") : t("admin.refreshServerInfo") }}
                    </button>
                  </div>

                  <p v-if="serverError" class="server-card__error">{{ serverError }}</p>

                  <div class="server-metrics">
                    <div v-for="metric in serverMetrics" :key="metric.key" class="server-metric">
                      <div class="server-metric__header">
                        <span>{{ metric.label }}</span>
                        <strong>{{ metric.percent }}%</strong>
                      </div>
                      <el-progress :percentage="metric.percent" :color="metric.color" :show-text="false" />
                      <p class="server-metric__detail">{{ metric.detail }}</p>
                    </div>
                  </div>

                  <div class="server-facts">
                    <div>
                      <span>{{ t("admin.hostname") }}</span>
                      <strong>{{ serverInfo.hostname || "-" }}</strong>
                    </div>
                    <div>
                      <span>{{ t("admin.platform") }}</span>
                      <strong>{{ serverInfo.platform || "-" }} / {{ serverInfo.arch || "-" }}</strong>
                    </div>
                    <div>
                      <span>{{ t("admin.nodeVersion") }}</span>
                      <strong>{{ serverInfo.nodeVersion || "-" }}</strong>
                    </div>
                    <div>
                      <span>{{ t("admin.uptime") }}</span>
                      <strong>{{ formatUptime(serverInfo.uptimeSeconds) }}</strong>
                    </div>
                  </div>
                </section>
              </section>

              <section v-show="activeTab === 'requests'" class="admin-tab-pane">
            <div class="admin-toolbar">
              <input
                v-model="requestQuery.q"
                class="field-input admin-search"
                :placeholder="t('admin.requestSearchPlaceholder')"
                @keyup.enter="applyFilters(requestQuery)"
              />
              <select v-model="requestQuery.status" class="field-input admin-filter" @change="applyFilters(requestQuery)">
                <option value="">{{ t("admin.allStatuses") }}</option>
                <option value="PENDING">PENDING</option>
                <option value="APPROVED">APPROVED</option>
                <option value="REJECTED">REJECTED</option>
              </select>
              <select v-model="requestQuery.serviceId" class="field-input admin-filter" @change="applyFilters(requestQuery)">
                <option value="">{{ t("admin.allServices") }}</option>
                <option v-for="service in serviceOptions" :key="service.id" :value="service.id">
                  {{ service.name }}
                </option>
              </select>
              <button class="ghost-btn compact-admin-btn" type="button" @click="applyFilters(requestQuery)">
                {{ t("common.search") }}
              </button>
              <button class="ghost-btn compact-admin-btn" type="button" @click="resetFilters(requestQuery)">
                {{ t("common.reset") }}
              </button>
            </div>

            <el-table v-loading="loading" :data="requests" stripe>
              <el-table-column :label="t('common.user')" min-width="210">
                <template #default="{ row }">
                  <strong>{{ row.requester.account || row.requester.email || row.requester.username || row.requester.id }}</strong>
                  <div class="muted">{{ row.requester.name || row.requester.status }}</div>
                </template>
              </el-table-column>
              <el-table-column :label="t('common.service')" min-width="160">
                <template #default="{ row }">
                  {{ row.service?.name || "-" }}
                </template>
              </el-table-column>
              <el-table-column prop="message" :label="t('admin.requestMessage')" min-width="260" />
              <el-table-column :label="t('common.status')" width="120">
                <template #default="{ row }">
                  <el-tag :type="requestTag(row.status)">{{ row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column :label="t('common.actions')" width="190" fixed="right">
                <template #default="{ row }">
                  <el-button
                    size="small"
                    type="success"
                    :disabled="row.status !== 'PENDING'"
                    @click="reviewRequest(row.id, 'APPROVED')"
                  >
                    {{ t("admin.approve") }}
                  </el-button>
                  <el-button
                    size="small"
                    type="danger"
                    plain
                    :disabled="row.status !== 'PENDING'"
                    @click="reviewRequest(row.id, 'REJECTED')"
                  >
                    {{ t("admin.reject") }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="admin-pagination">
              <el-pagination
                background
                layout="total, sizes, prev, pager, next, jumper"
                :total="requestQuery.total"
                :current-page="requestQuery.page"
                :page-size="requestQuery.pageSize"
                :page-sizes="pageSizes"
                @current-change="setPage(requestQuery, $event)"
                @size-change="setPageSize(requestQuery, $event)"
              />
            </div>
          </section>

          <section v-show="activeTab === 'users'" class="admin-tab-pane">
            <div class="admin-toolbar">
              <input
                v-model="userQuery.q"
                class="field-input admin-search"
                :placeholder="t('admin.userSearchPlaceholder')"
                @keyup.enter="applyFilters(userQuery)"
              />
              <select v-model="userQuery.status" class="field-input admin-filter" @change="applyFilters(userQuery)">
                <option value="">{{ t("admin.allStatuses") }}</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="SUSPENDED">SUSPENDED</option>
              </select>
              <select v-model="userQuery.serviceId" class="field-input admin-filter" @change="applyFilters(userQuery)">
                <option value="">{{ t("admin.allServices") }}</option>
                <option v-for="service in serviceOptions" :key="service.id" :value="service.id">
                  {{ service.name }}
                </option>
              </select>
              <button class="ghost-btn compact-admin-btn" type="button" @click="applyFilters(userQuery)">
                {{ t("common.search") }}
              </button>
              <button class="ghost-btn compact-admin-btn" type="button" @click="resetFilters(userQuery)">
                {{ t("common.reset") }}
              </button>
            </div>

            <el-table v-loading="loading" :data="users" stripe>
              <el-table-column :label="t('common.user')" min-width="260">
                <template #default="{ row }">
                  <el-space wrap>
                    <strong>{{ row.account || row.email || row.username || row.id }}</strong>
                    <el-tag v-if="row.isAdmin" size="small" type="primary">
                      {{ t("admin.adminRole") }}
                    </el-tag>
                  </el-space>
                  <div class="muted">{{ row.name || row.email || row.username || t("common.thirdPartyAccount") }}</div>
                </template>
              </el-table-column>
              <el-table-column :label="t('common.status')" width="130">
                <template #default="{ row }">
                  <el-tag :type="userTag(row.status)">{{ userStatusText(row.status) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column :label="t('admin.serviceAccess')" min-width="260">
                <template #default="{ row }">
                  <el-tag v-if="row.isAdmin" type="success">
                    {{ t("admin.allServicesAccess") }}
                  </el-tag>
                  <el-space v-else-if="allowedServiceAccess(row).length" wrap>
                    <el-tag
                      v-for="access in allowedServiceAccess(row)"
                      :key="access.id"
                      type="info"
                    >
                      {{ access.service.name }}
                    </el-tag>
                  </el-space>
                  <span v-else class="muted">{{ t("admin.noServiceAccess") }}</span>
                </template>
              </el-table-column>
              <el-table-column :label="t('common.actions')" width="250" fixed="right">
                <template #default="{ row }">
                  <el-button size="small" type="warning" plain @click="openPasswordReset(row)">
                    {{ t("admin.resetUserPassword") }}
                  </el-button>
                  <el-button
                    v-if="row.status === 'SUSPENDED'"
                    size="small"
                    type="success"
                    @click="updateUser(row.id, 'ACTIVE')"
                  >
                    {{ t("common.enabled") }}
                  </el-button>
                  <el-button v-else size="small" type="danger" plain @click="updateUser(row.id, 'SUSPENDED')">
                    {{ t("common.disabled") }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="admin-pagination">
              <el-pagination
                background
                layout="total, sizes, prev, pager, next, jumper"
                :total="userQuery.total"
                :current-page="userQuery.page"
                :page-size="userQuery.pageSize"
                :page-sizes="pageSizes"
                @current-change="setPage(userQuery, $event)"
                @size-change="setPageSize(userQuery, $event)"
              />
            </div>
          </section>

          <section v-show="activeTab === 'invites'" class="admin-tab-pane">
            <div class="admin-toolbar">
              <button class="primary-btn compact-admin-btn" type="button" @click="openInviteCreate">
                {{ t("admin.createInvite") }}
              </button>
              <input
                v-model="inviteQuery.q"
                class="field-input admin-search"
                :placeholder="t('admin.inviteSearchPlaceholder')"
                @keyup.enter="applyFilters(inviteQuery)"
              />
              <select v-model="inviteQuery.enabled" class="field-input admin-filter" @change="applyFilters(inviteQuery)">
                <option value="">{{ t("admin.allEnabledStates") }}</option>
                <option value="enabled">{{ t("common.enabled") }}</option>
                <option value="disabled">{{ t("common.disabled") }}</option>
              </select>
              <select v-model="inviteQuery.serviceId" class="field-input admin-filter" @change="applyFilters(inviteQuery)">
                <option value="">{{ t("admin.allServices") }}</option>
                <option v-for="service in serviceOptions" :key="service.id" :value="service.id">
                  {{ service.name }}
                </option>
              </select>
              <button class="ghost-btn compact-admin-btn" type="button" @click="applyFilters(inviteQuery)">
                {{ t("common.search") }}
              </button>
              <button class="ghost-btn compact-admin-btn" type="button" @click="resetFilters(inviteQuery)">
                {{ t("common.reset") }}
              </button>
            </div>

            <section v-if="latestInviteCodes.length" class="invite-code-results" aria-live="polite">
              <div class="invite-code-results__header">
                <div>
                  <strong>{{ t("admin.generatedInviteCodes") }}</strong>
                  <span>{{ t("admin.generatedInviteCodesHint") }}</span>
                </div>
                <button
                  v-if="latestInviteCodes.length > 1"
                  class="ghost-btn compact-admin-btn"
                  type="button"
                  @click="copyInviteCodes(latestInviteCodes.map((invite) => invite.code))"
                >
                  {{ t("admin.copyAllInviteCodes") }}
                </button>
              </div>
              <div class="invite-code-results__list">
                <div v-for="invite in latestInviteCodes" :key="invite.id || invite.code" class="invite-code-row">
                  <code>{{ invite.code }}</code>
                  <div class="invite-code-row__actions">
                    <button class="ghost-btn invite-code-row__remove" type="button" @click="removeGeneratedInviteCode(invite)">
                      {{ invite.id ? t("common.delete") : t("admin.removeGeneratedInviteCode") }}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <el-table v-loading="loading" :data="invites" stripe>
              <el-table-column prop="label" :label="t('common.name')" min-width="180" />
              <el-table-column :label="t('admin.uses')" width="120">
                <template #default="{ row }">{{ row.usedCount }} / {{ row.maxUses }}</template>
              </el-table-column>
              <el-table-column :label="t('admin.authorizedServices')" min-width="240">
                <template #default="{ row }">
                  <el-space wrap>
                    <el-tag v-for="service in row.services" :key="service.id" type="info">
                      {{ service.name }}
                    </el-tag>
                  </el-space>
                </template>
              </el-table-column>
              <el-table-column :label="t('common.status')" width="120">
                <template #default="{ row }">
                  <el-tag :type="row.enabled ? 'success' : 'info'">{{ row.enabled ? t("common.enabled") : t("common.disabled") }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column :label="t('admin.createdBy')" min-width="180">
                <template #default="{ row }">{{ row.createdBy?.account || row.createdBy?.email || row.createdBy?.name || "-" }}</template>
              </el-table-column>
              <el-table-column :label="t('common.actions')" width="170" fixed="right">
                <template #default="{ row }">
                  <el-space :size="8">
                    <el-button
                      size="small"
                      plain
                      :disabled="!hasGeneratedInviteCode(row.id)"
                      :title="hasGeneratedInviteCode(row.id) ? t('common.copy') : t('admin.generatedInviteCodesHint')"
                      @click="copyGeneratedInviteCode(row.id)"
                    >
                      {{ t("common.copy") }}
                    </el-button>
                    <el-button size="small" type="danger" plain @click="deleteInvite(row.id)">
                      {{ t("common.delete") }}
                    </el-button>
                  </el-space>
                </template>
              </el-table-column>
            </el-table>
            <div class="admin-pagination">
              <el-pagination
                background
                layout="total, sizes, prev, pager, next, jumper"
                :total="inviteQuery.total"
                :current-page="inviteQuery.page"
                :page-size="inviteQuery.pageSize"
                :page-sizes="pageSizes"
                @current-change="setPage(inviteQuery, $event)"
                @size-change="setPageSize(inviteQuery, $event)"
              />
            </div>
          </section>

          <section v-show="activeTab === 'services'" class="admin-tab-pane">
            <div class="admin-toolbar">
              <button class="primary-btn compact-admin-btn" type="button" @click="openServiceCreate">
                {{ t("admin.createService") }}
              </button>
              <span v-if="lastServiceSecret" class="badge badge--warn">{{ t("admin.newSecret", { secret: lastServiceSecret }) }}</span>
              <input
                v-model="serviceQuery.q"
                class="field-input admin-search"
                :placeholder="t('admin.serviceSearchPlaceholder')"
                @keyup.enter="applyFilters(serviceQuery)"
              />
              <select v-model="serviceQuery.enabled" class="field-input admin-filter" @change="applyFilters(serviceQuery)">
                <option value="">{{ t("admin.allEnabledStates") }}</option>
                <option value="enabled">{{ t("common.enabled") }}</option>
                <option value="disabled">{{ t("common.disabled") }}</option>
              </select>
              <select v-model="serviceQuery.accessMode" class="field-input admin-filter" @change="applyFilters(serviceQuery)">
                <option value="">{{ t("admin.allAccessModes") }}</option>
                <option value="direct">{{ t("admin.direct") }}</option>
                <option value="invite">{{ t("admin.invite") }}</option>
                <option value="request">{{ t("admin.request") }}</option>
              </select>
              <button class="ghost-btn compact-admin-btn" type="button" @click="applyFilters(serviceQuery)">
                {{ t("common.search") }}
              </button>
              <button class="ghost-btn compact-admin-btn" type="button" @click="resetFilters(serviceQuery)">
                {{ t("common.reset") }}
              </button>
            </div>

            <el-table v-loading="loading" :data="services" stripe>
              <el-table-column :label="t('common.service')" min-width="220">
                <template #default="{ row }">
                  <strong>{{ row.displayTitle || row.name }}</strong>
                  <div class="muted">{{ row.slug }} · {{ row.featured ? t("admin.featured") : t("portal.showcaseEyebrow") }}</div>
                </template>
              </el-table-column>
              <el-table-column :label="t('admin.appSortOrder')" width="110" align="center">
                <template #default="{ row }">
                  <span class="sort-order-chip">{{ Number(row.showcaseOrder || 0) }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="clientId" :label="t('admin.clientId')" min-width="240" />
              <el-table-column :label="t('admin.callback')" min-width="280">
                <template #default="{ row }">
                  <div v-for="url in row.callbackUrls" :key="url" class="muted">{{ url }}</div>
                </template>
              </el-table-column>
              <el-table-column :label="t('admin.docsUrl')" min-width="220">
                <template #default="{ row }">
                  <a v-if="row.docsUrl" class="muted inline-link" :href="row.docsUrl" target="_blank" rel="noreferrer">
                    {{ row.docsUrl }}
                  </a>
                  <span v-else class="muted">-</span>
                </template>
              </el-table-column>
              <el-table-column :label="t('common.enabled')" width="100">
                <template #default="{ row }">
                  <el-switch v-model="row.enabled" @change="updateService(row)" />
                </template>
              </el-table-column>
              <el-table-column :label="t('admin.accessModes')" min-width="220">
                <template #default="{ row }">
                  <el-space wrap>
                    <el-tag :type="row.allowDirectAccess ? 'success' : 'info'">{{ t("admin.direct") }}</el-tag>
                    <el-tag :type="row.allowInviteAccess ? 'success' : 'info'">{{ t("admin.invite") }}</el-tag>
                    <el-tag :type="row.allowAccessRequest ? 'success' : 'info'">{{ t("admin.request") }}</el-tag>
                  </el-space>
                </template>
              </el-table-column>
              <el-table-column :label="t('admin.switches')" width="230">
                <template #default="{ row }">
                  <el-space wrap>
                    <el-switch v-model="row.allowDirectAccess" :active-text="t('admin.direct')" @change="updateService(row)" />
                    <el-switch v-model="row.allowInviteAccess" :active-text="t('admin.invite')" @change="updateService(row)" />
                    <el-switch v-model="row.allowAccessRequest" :active-text="t('admin.request')" @change="updateService(row)" />
                  </el-space>
                </template>
              </el-table-column>
              <el-table-column :label="t('common.actions')" width="160" fixed="right">
                <template #default="{ row }">
                  <el-space wrap>
                    <el-button size="small" @click="openServiceEdit(row)">{{ t("admin.editService") }}</el-button>
                    <el-button size="small" @click="rotateSecret(row.id)">{{ t("admin.rotateSecret") }}</el-button>
                  </el-space>
                </template>
              </el-table-column>
            </el-table>
            <div class="admin-pagination">
              <el-pagination
                background
                layout="total, sizes, prev, pager, next, jumper"
                :total="serviceQuery.total"
                :current-page="serviceQuery.page"
                :page-size="serviceQuery.pageSize"
                :page-sizes="pageSizes"
                @current-change="setPage(serviceQuery, $event)"
                @size-change="setPageSize(serviceQuery, $event)"
              />
            </div>
          </section>

          <section v-show="activeTab === 'announcements'" class="admin-tab-pane">
            <div class="admin-toolbar">
              <button class="primary-btn compact-admin-btn" type="button" @click="openAnnouncementCreate">
                {{ t("admin.createAnnouncement") }}
              </button>
              <input
                v-model="announcementQuery.q"
                class="field-input admin-search"
                :placeholder="t('admin.announcementSearchPlaceholder')"
                @keyup.enter="applyFilters(announcementQuery)"
              />
              <select v-model="announcementQuery.enabled" class="field-input admin-filter" @change="applyFilters(announcementQuery)">
                <option value="">{{ t("admin.allEnabledStates") }}</option>
                <option value="enabled">{{ t("common.enabled") }}</option>
                <option value="disabled">{{ t("common.disabled") }}</option>
              </select>
              <select v-model="announcementQuery.serviceId" class="field-input admin-filter" @change="applyFilters(announcementQuery)">
                <option value="">{{ t("admin.allServices") }}</option>
                <option :value="globalAnnouncementServiceId">{{ t("admin.announcementAllServices") }}</option>
                <option v-for="service in serviceOptions" :key="service.id" :value="service.id">
                  {{ service.name }}
                </option>
              </select>
              <button class="ghost-btn compact-admin-btn" type="button" @click="applyFilters(announcementQuery)">
                {{ t("common.search") }}
              </button>
              <button class="ghost-btn compact-admin-btn" type="button" @click="resetFilters(announcementQuery)">
                {{ t("common.reset") }}
              </button>
            </div>

            <el-table v-loading="loading" :data="announcements" stripe>
              <el-table-column :label="t('admin.announcementTitle')" min-width="210">
                <template #default="{ row }">
                  <strong>{{ row.title }}</strong>
                  <div class="muted">{{ formatDateTime(row.createdAt) }}</div>
                </template>
              </el-table-column>
              <el-table-column :label="t('admin.announcementContent')" min-width="320">
                <template #default="{ row }">
                  <div class="feedback-content">{{ row.content }}</div>
                </template>
              </el-table-column>
              <el-table-column :label="t('admin.announcementScope')" min-width="170">
                <template #default="{ row }">
                  <el-tag :type="row.serviceId ? 'info' : 'success'">
                    {{ row.service?.name || t("admin.announcementAllServices") }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="sortOrder" :label="t('admin.sortOrder')" width="110" />
              <el-table-column :label="t('common.status')" width="120">
                <template #default="{ row }">
                  <el-tag :type="row.enabled ? 'success' : 'info'">{{ row.enabled ? t("common.enabled") : t("common.disabled") }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column :label="t('common.actions')" width="170" fixed="right">
                <template #default="{ row }">
                  <el-button size="small" @click="openAnnouncementEdit(row)">{{ t("common.edit") }}</el-button>
                  <el-button size="small" type="danger" plain @click="deleteAnnouncement(row.id)">{{ t("common.delete") }}</el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="admin-pagination">
              <el-pagination
                background
                layout="total, sizes, prev, pager, next, jumper"
                :total="announcementQuery.total"
                :current-page="announcementQuery.page"
                :page-size="announcementQuery.pageSize"
                :page-sizes="pageSizes"
                @current-change="setPage(announcementQuery, $event)"
                @size-change="setPageSize(announcementQuery, $event)"
              />
            </div>
          </section>

          <section v-show="activeTab === 'open-source'" class="admin-tab-pane">
            <div class="admin-toolbar">
              <button class="primary-btn compact-admin-btn" type="button" @click="openOpenSourceCreate">
                {{ t("admin.createOpenSource") }}
              </button>
              <input
                v-model="openSourceQuery.q"
                class="field-input admin-search"
                :placeholder="t('admin.openSourceSearchPlaceholder')"
                @keyup.enter="applyFilters(openSourceQuery)"
              />
              <select v-model="openSourceQuery.enabled" class="field-input admin-filter" @change="applyFilters(openSourceQuery)">
                <option value="">{{ t("admin.allEnabledStates") }}</option>
                <option value="enabled">{{ t("common.enabled") }}</option>
                <option value="disabled">{{ t("common.disabled") }}</option>
              </select>
              <button class="ghost-btn compact-admin-btn" type="button" @click="applyFilters(openSourceQuery)">
                {{ t("common.search") }}
              </button>
              <button class="ghost-btn compact-admin-btn" type="button" @click="resetFilters(openSourceQuery)">
                {{ t("common.reset") }}
              </button>
            </div>

            <el-table v-loading="loading" :data="openSourceCredits" stripe>
              <el-table-column prop="name" :label="t('common.name')" min-width="180" />
              <el-table-column :label="t('admin.openSourceUrl')" min-width="260">
                <template #default="{ row }">
                  <a class="muted inline-link" :href="row.url" target="_blank" rel="noreferrer">{{ row.url }}</a>
                </template>
              </el-table-column>
              <el-table-column prop="sortOrder" :label="t('admin.sortOrder')" width="110" />
              <el-table-column :label="t('common.status')" width="120">
                <template #default="{ row }">
                  <el-tag :type="row.enabled ? 'success' : 'info'">{{ row.enabled ? t("common.enabled") : t("common.disabled") }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column :label="t('common.actions')" width="170" fixed="right">
                <template #default="{ row }">
                  <el-button size="small" @click="openOpenSourceEdit(row)">{{ t("common.edit") }}</el-button>
                  <el-button size="small" type="danger" plain @click="deleteOpenSourceCredit(row.id)">{{ t("common.delete") }}</el-button>
                </template>
              </el-table-column>
            </el-table>
            <div class="admin-pagination">
              <el-pagination
                background
                layout="total, sizes, prev, pager, next, jumper"
                :total="openSourceQuery.total"
                :current-page="openSourceQuery.page"
                :page-size="openSourceQuery.pageSize"
                :page-sizes="pageSizes"
                @current-change="setPage(openSourceQuery, $event)"
                @size-change="setPageSize(openSourceQuery, $event)"
              />
            </div>
          </section>

          <section v-show="activeTab === 'feedback'" class="admin-tab-pane">
            <div class="admin-toolbar">
              <input
                v-model="feedbackQuery.q"
                class="field-input admin-search"
                :placeholder="t('admin.feedbackSearchPlaceholder')"
                @keyup.enter="applyFilters(feedbackQuery)"
              />
              <select v-model="feedbackQuery.status" class="field-input admin-filter" @change="applyFilters(feedbackQuery)">
                <option value="">{{ t("admin.allStatuses") }}</option>
                <option value="NEW">{{ t("admin.feedbackStatusNew") }}</option>
                <option value="REVIEWING">{{ t("admin.feedbackStatusReviewing") }}</option>
                <option value="RESOLVED">{{ t("admin.feedbackStatusResolved") }}</option>
              </select>
              <select v-model="feedbackQuery.type" class="field-input admin-filter" @change="applyFilters(feedbackQuery)">
                <option value="">{{ t("admin.allFeedbackTypes") }}</option>
                <option value="suggestion">{{ t("feedback.typeSuggestion") }}</option>
                <option value="complaint">{{ t("feedback.typeComplaint") }}</option>
                <option value="bug">{{ t("feedback.typeBug") }}</option>
              </select>
              <select v-model="feedbackQuery.serviceId" class="field-input admin-filter" @change="applyFilters(feedbackQuery)">
                <option value="">{{ t("admin.allServices") }}</option>
                <option v-for="service in serviceOptions" :key="service.id" :value="service.id">
                  {{ service.name }}
                </option>
              </select>
              <button class="ghost-btn compact-admin-btn" type="button" @click="applyFilters(feedbackQuery)">
                {{ t("common.search") }}
              </button>
              <button class="ghost-btn compact-admin-btn" type="button" @click="resetFilters(feedbackQuery)">
                {{ t("common.reset") }}
              </button>
            </div>

            <el-table v-loading="loading" :data="feedbackList" stripe>
              <el-table-column :label="t('admin.feedbackType')" width="120">
                <template #default="{ row }">{{ feedbackTypeText(row.type) }}</template>
              </el-table-column>
              <el-table-column :label="t('admin.feedbackContent')" min-width="300">
                <template #default="{ row }">
                  <div class="feedback-content">{{ row.content }}</div>
                  <div v-if="row.contact" class="muted">{{ t("admin.feedbackContact") }}: {{ row.contact }}</div>
                </template>
              </el-table-column>
              <el-table-column :label="t('common.service')" min-width="160">
                <template #default="{ row }">{{ row.service?.name || "-" }}</template>
              </el-table-column>
              <el-table-column :label="t('common.user')" min-width="170">
                <template #default="{ row }">
                  {{ row.user?.account || row.user?.name || row.user?.username || row.user?.email || "-" }}
                </template>
              </el-table-column>
              <el-table-column :label="t('common.status')" width="120">
                <template #default="{ row }">
                  <el-tag :type="feedbackTag(row.status)">{{ feedbackStatusText(row.status) }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column :label="t('common.actions')" width="210" fixed="right">
                <template #default="{ row }">
                  <el-space wrap>
                    <el-button size="small" @click="updateFeedback(row.id, 'REVIEWING')">{{ t("admin.markReviewing") }}</el-button>
                    <el-button size="small" type="success" @click="updateFeedback(row.id, 'RESOLVED')">{{ t("admin.markResolved") }}</el-button>
                  </el-space>
                </template>
              </el-table-column>
            </el-table>
            <div class="admin-pagination">
              <el-pagination
                background
                layout="total, sizes, prev, pager, next, jumper"
                :total="feedbackQuery.total"
                :current-page="feedbackQuery.page"
                :page-size="feedbackQuery.pageSize"
                :page-sizes="pageSizes"
                @current-change="setPage(feedbackQuery, $event)"
                @size-change="setPageSize(feedbackQuery, $event)"
              />
            </div>
          </section>
            </div>
          </div>
        </div>
      </section>
    </template>

    <el-dialog
      v-model="passwordResetDialogVisible"
      class="admin-dialog admin-dialog--password"
      :title="t('admin.resetUserPassword')"
      width="460px"
      @closed="resetPasswordResetForm"
    >
      <div class="form-grid admin-form-grid">
        <label class="wide-field">
          <span class="field-label">{{ t("common.user") }}</span>
          <strong>{{ passwordResetUser ? userLabel(passwordResetUser) : "-" }}</strong>
        </label>
        <label class="wide-field">
          <span class="field-label">{{ t("common.newPassword") }}</span>
          <input
            v-model="passwordResetForm.newPassword"
            class="field-input"
            type="password"
            autocomplete="new-password"
            :placeholder="t('login.passwordPlaceholder')"
          />
        </label>
        <label class="wide-field">
          <span class="field-label">{{ t("admin.confirmPassword") }}</span>
          <input
            v-model="passwordResetForm.confirmPassword"
            class="field-input"
            type="password"
            autocomplete="new-password"
            :placeholder="t('admin.confirmPasswordPlaceholder')"
          />
        </label>
      </div>
      <p class="muted">{{ t("admin.passwordResetSessionNotice") }}</p>
      <template #footer>
        <button class="ghost-btn" type="button" :disabled="passwordResetting" @click="passwordResetDialogVisible = false">
          {{ t("common.cancel") }}
        </button>
        <button class="primary-btn" type="button" :disabled="passwordResetting" @click="resetUserPassword">
          {{ passwordResetting ? t("common.loading") : t("admin.resetUserPassword") }}
        </button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="inviteDialogVisible"
      class="admin-dialog admin-dialog--invite"
      :title="t('admin.createInvite')"
      width="680px"
      @closed="resetInviteForm"
    >
      <div class="form-grid admin-form-grid">
        <label>
          <span class="field-label">{{ t("admin.inviteLabel") }}</span>
          <input v-model="inviteForm.label" class="field-input" :placeholder="t('admin.inviteLabelPlaceholder')" />
        </label>
        <label>
          <span class="field-label">{{ t("admin.maxUses") }}</span>
          <input v-model.number="inviteForm.maxUses" class="field-input" type="number" min="1" />
        </label>
        <label class="wide-field">
          <span class="field-label">{{ t("admin.inviteGenerationMode") }}</span>
          <el-radio-group v-model="inviteGenerationMode">
            <el-radio label="single">{{ t("admin.inviteGenerationSingle") }}</el-radio>
            <el-radio label="batch">{{ t("admin.inviteGenerationBatch") }}</el-radio>
          </el-radio-group>
        </label>
        <label v-if="inviteGenerationMode === 'batch'">
          <span class="field-label">{{ t("admin.inviteQuantity") }}</span>
          <input
            v-model.number="inviteQuantity"
            class="field-input"
            type="number"
            min="2"
            :placeholder="t('admin.inviteQuantityPlaceholder')"
          />
        </label>
        <label>
          <span class="field-label">{{ t("admin.expiresAt") }}</span>
          <input v-model="inviteForm.expiresAt" class="field-input" type="datetime-local" />
        </label>
        <label class="wide-field">
          <span class="field-label">{{ t("admin.inviteServices") }}</span>
          <el-select v-model="inviteForm.serviceIds" multiple filterable :placeholder="t('admin.inviteServicesPlaceholder')">
            <el-option
              v-for="service in inviteableServices"
              :key="service.id"
              :label="service.name"
              :value="service.id"
            />
          </el-select>
        </label>
      </div>
      <template #footer>
        <button class="ghost-btn" type="button" :disabled="inviteCreating" @click="inviteDialogVisible = false">{{ t("common.cancel") }}</button>
        <button class="primary-btn" type="button" :disabled="inviteCreating" @click="createInvite">
          {{ inviteCreating ? t("common.loading") : t("admin.createInvite") }}
        </button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="serviceDialogVisible"
      class="admin-dialog admin-dialog--service"
      :title="serviceForm.id ? t('admin.editService') : t('admin.createService')"
      width="680px"
    >
      <div class="form-grid admin-form-grid">
        <label>
          <span class="field-label">{{ t("admin.serviceName") }}</span>
          <input v-model="serviceForm.name" class="field-input" :placeholder="t('admin.serviceNamePlaceholder')" />
        </label>
        <label>
          <span class="field-label">Slug</span>
          <input v-model="serviceForm.slug" class="field-input" placeholder="docs" />
        </label>
        <label>
          <span class="field-label">{{ t("admin.homeUrl") }}</span>
          <input v-model="serviceForm.homeUrl" class="field-input" placeholder="https://app.example.com" />
        </label>
        <label>
          <span class="field-label">{{ t("admin.healthCheckUrl") }}</span>
          <input v-model="serviceForm.healthCheckUrl" class="field-input" :placeholder="t('admin.healthCheckUrlPlaceholder')" />
          <small class="admin-field-note">{{ t("admin.healthCheckUrlHint") }}</small>
        </label>
        <label>
          <span class="field-label">{{ t("admin.docsUrl") }}</span>
          <input v-model="serviceForm.docsUrl" class="field-input" :placeholder="t('admin.docsUrlPlaceholder')" />
        </label>
        <label>
          <span class="field-label">{{ t("admin.serviceDescription") }}</span>
          <input v-model="serviceForm.description" class="field-input" :placeholder="t('admin.serviceDescriptionPlaceholder')" />
        </label>
        <label>
          <span class="field-label">{{ t("admin.displayTitle") }}</span>
          <input v-model="serviceForm.displayTitle" class="field-input" :placeholder="t('admin.displayTitlePlaceholder')" />
        </label>
        <label>
          <span class="field-label">{{ t("admin.shortIntro") }}</span>
          <input v-model="serviceForm.shortIntro" class="field-input" :placeholder="t('admin.shortIntroPlaceholder')" />
        </label>
        <label>
          <span class="field-label">{{ t("admin.coverImageUrl") }}</span>
          <input v-model="serviceForm.coverImageUrl" class="field-input" :placeholder="t('admin.coverImageUrlPlaceholder')" />
        </label>
        <label>
          <span class="field-label">{{ t("admin.videoUrl") }}</span>
          <input v-model="serviceForm.videoUrl" class="field-input" :placeholder="t('admin.videoUrlPlaceholder')" />
        </label>
        <label>
          <span class="field-label">{{ t("admin.mediaType") }}</span>
          <select v-model="serviceForm.mediaType" class="field-input">
            <option value="image">{{ t("admin.mediaImage") }}</option>
            <option value="video">{{ t("admin.mediaVideo") }}</option>
          </select>
        </label>
        <label>
          <span class="field-label">{{ t("admin.appSortOrder") }}</span>
          <input
            v-model.number="serviceForm.showcaseOrder"
            class="field-input"
            min="0"
            step="1"
            type="number"
            :placeholder="t('admin.appSortOrderPlaceholder')"
          />
        </label>
        <label class="wide-field">
          <span class="field-label">{{ t("admin.tags") }}</span>
          <input v-model="serviceForm.tagsText" class="field-input" :placeholder="t('admin.tagsPlaceholder')" />
        </label>
        <label class="wide-field">
          <span class="field-label">{{ t("admin.callbackUrls") }}</span>
          <textarea
            v-model="serviceForm.callbackUrlsText"
            class="field-textarea"
            placeholder="https://app.example.com/auth/callback"
          />
        </label>
        <label class="checkbox-line">
          <input v-model="serviceForm.enabled" type="checkbox" />
          <span>{{ t("common.enabled") }}</span>
        </label>
        <label class="checkbox-line">
          <input v-model="serviceForm.featured" type="checkbox" />
          <span>{{ t("admin.featured") }}</span>
        </label>
        <label class="checkbox-line">
          <input v-model="serviceForm.allowDirectAccess" type="checkbox" />
          <span>{{ t("admin.allowDirect") }}</span>
        </label>
        <label class="checkbox-line">
          <input v-model="serviceForm.allowInviteAccess" type="checkbox" />
          <span>{{ t("admin.allowInvite") }}</span>
        </label>
        <label class="checkbox-line">
          <input v-model="serviceForm.allowAccessRequest" type="checkbox" />
          <span>{{ t("admin.allowRequest") }}</span>
        </label>
      </div>
      <template #footer>
        <button class="ghost-btn" type="button" :disabled="serviceSaving" @click="serviceDialogVisible = false">{{ t("common.cancel") }}</button>
        <button class="primary-btn" type="button" :disabled="serviceSaving" @click="saveService">
          {{ serviceSaving ? t("common.loading") : serviceForm.id ? t("admin.saveService") : t("admin.createService") }}
        </button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="announcementDialogVisible"
      class="admin-dialog admin-dialog--announcement"
      :title="announcementForm.id ? t('admin.editAnnouncement') : t('admin.createAnnouncement')"
      width="640px"
    >
      <div class="form-grid admin-form-grid">
        <label>
          <span class="field-label">{{ t("admin.announcementTitle") }}</span>
          <input
            v-model="announcementForm.title"
            class="field-input"
            :placeholder="t('admin.announcementTitlePlaceholder')"
          />
        </label>
        <label>
          <span class="field-label">{{ t("admin.announcementService") }}</span>
          <select v-model="announcementForm.serviceId" class="field-input">
            <option value="">{{ t("admin.announcementAllServices") }}</option>
            <option v-for="service in serviceOptions" :key="service.id" :value="service.id">
              {{ service.name }}
            </option>
          </select>
        </label>
        <label>
          <span class="field-label">{{ t("admin.sortOrder") }}</span>
          <input v-model.number="announcementForm.sortOrder" class="field-input" type="number" />
        </label>
        <label class="checkbox-line">
          <input v-model="announcementForm.enabled" type="checkbox" />
          <span>{{ t("common.enabled") }}</span>
        </label>
        <label class="wide-field">
          <span class="field-label">{{ t("admin.announcementContent") }}</span>
          <textarea
            v-model="announcementForm.content"
            class="field-textarea"
            :placeholder="t('admin.announcementContentPlaceholder')"
          />
        </label>
      </div>
      <template #footer>
        <button class="ghost-btn" type="button" @click="announcementDialogVisible = false">{{ t("common.cancel") }}</button>
        <button class="primary-btn" type="button" @click="saveAnnouncement">
          {{ announcementForm.id ? t("common.save") : t("admin.createAnnouncement") }}
        </button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="openSourceDialogVisible"
      class="admin-dialog admin-dialog--compact"
      :title="openSourceForm.id ? t('admin.editOpenSource') : t('admin.createOpenSource')"
      width="560px"
    >
      <div class="form-grid admin-form-grid">
        <label>
          <span class="field-label">{{ t("admin.openSourceName") }}</span>
          <input v-model="openSourceForm.name" class="field-input" placeholder="Vue / Nuxt / Prisma" />
        </label>
        <label>
          <span class="field-label">{{ t("admin.openSourceUrl") }}</span>
          <input v-model="openSourceForm.url" class="field-input" placeholder="https://github.com/..." />
        </label>
        <label>
          <span class="field-label">{{ t("admin.sortOrder") }}</span>
          <input v-model.number="openSourceForm.sortOrder" class="field-input" type="number" />
        </label>
        <label class="checkbox-line">
          <input v-model="openSourceForm.enabled" type="checkbox" />
          <span>{{ t("common.enabled") }}</span>
        </label>
      </div>
      <template #footer>
        <button class="ghost-btn" type="button" @click="openSourceDialogVisible = false">{{ t("common.cancel") }}</button>
        <button class="primary-btn" type="button" @click="saveOpenSourceCredit">
          {{ openSourceForm.id ? t("common.save") : t("admin.createOpenSource") }}
        </button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus/es/components/message/index";
import { computed, onMounted, reactive, ref } from "vue";

type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";
type UserStatus = "ACTIVE" | "PENDING" | "APPROVED" | "SUSPENDED";
type FeedbackStatus = "NEW" | "REVIEWING" | "RESOLVED";

type ResourceUsage = {
  total: number;
  used: number;
  free: number;
  usagePercent: number;
  path?: string;
};

type ServerInfo = {
  sampledAt: string;
  hostname: string;
  platform: string;
  arch: string;
  nodeVersion: string;
  uptimeSeconds: number;
  cpu: {
    model: string;
    cores: number;
    usagePercent: number;
  };
  memory: ResourceUsage;
  disk: ResourceUsage | null;
};

type ServerMetric = {
  key: string;
  label: string;
  percent: number;
  detail: string;
  color: string;
};

type ListQuery = {
  page: number;
  pageSize: number;
  total: number;
  q: string;
  status?: string;
  serviceId?: string;
  enabled?: string;
  accessMode?: string;
  type?: string;
};

type ServiceOption = {
  id: string;
  name: string;
  slug: string;
  enabled: boolean;
  allowInviteAccess: boolean;
};

const activeTab = ref("requests");
const loading = ref(true);
const errorMessage = ref("");
const { t, localizeError, locale } = usePortalI18n();
const pageSizes = [10, 20, 50, 100];
const globalAnnouncementServiceId = "__global";
const summary = reactive({
  users: 0,
  suspendedUsers: 0,
  services: 0,
  pendingRequests: 0,
  invites: 0
});
const serverLoading = ref(true);
const serverError = ref("");
const serverInfo = reactive<ServerInfo>({
  sampledAt: "",
  hostname: "",
  platform: "",
  arch: "",
  nodeVersion: "",
  uptimeSeconds: 0,
  cpu: {
    model: "",
    cores: 0,
    usagePercent: 0
  },
  memory: {
    total: 0,
    used: 0,
    free: 0,
    usagePercent: 0
  },
  disk: null
});
const users = ref<any[]>([]);
const services = ref<any[]>([]);
const invites = ref<any[]>([]);
const requests = ref<any[]>([]);
const openSourceCredits = ref<any[]>([]);
const announcements = ref<any[]>([]);
const feedbackList = ref<any[]>([]);
const serviceOptions = ref<ServiceOption[]>([]);
const lastServiceSecret = ref("");
const inviteDialogVisible = ref(false);
const serviceDialogVisible = ref(false);
const inviteCreating = ref(false);
const serviceSaving = ref(false);
const announcementDialogVisible = ref(false);
const openSourceDialogVisible = ref(false);
const passwordResetDialogVisible = ref(false);
const passwordResetting = ref(false);
const passwordResetUser = ref<any | null>(null);

const requestQuery = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
  q: "",
  status: "",
  serviceId: ""
});
const userQuery = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
  q: "",
  status: "",
  serviceId: ""
});
const inviteQuery = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
  q: "",
  enabled: "",
  serviceId: ""
});
const serviceQuery = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
  q: "",
  enabled: "",
  accessMode: ""
});
const openSourceQuery = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
  q: "",
  enabled: ""
});
const announcementQuery = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
  q: "",
  enabled: "",
  serviceId: ""
});
const feedbackQuery = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
  q: "",
  status: "",
  type: "",
  serviceId: ""
});

const inviteForm = reactive({
  label: "",
  maxUses: 1,
  expiresAt: "",
  serviceIds: [] as string[]
});

const passwordResetForm = reactive({
  newPassword: "",
  confirmPassword: ""
});
const inviteGenerationMode = ref<"single" | "batch">("single");
const inviteQuantity = ref(2);
type GeneratedInviteCode = { code: string; id?: string };
const latestInviteCodes = ref<GeneratedInviteCode[]>([]);
const inviteCodeStorageKey = "admin-latest-invite-codes";

const serviceForm = reactive({
  id: "",
  name: "",
  slug: "",
  description: "",
  displayTitle: "",
  shortIntro: "",
  coverImageUrl: "",
  videoUrl: "",
  mediaType: "image",
  tagsText: "",
  showcaseOrder: 0,
  featured: false,
  homeUrl: "",
  healthCheckUrl: "",
  docsUrl: "",
  callbackUrlsText: "",
  enabled: true,
  allowDirectAccess: false,
  allowInviteAccess: true,
  allowAccessRequest: true
});

const openSourceForm = reactive({
  id: "",
  name: "",
  url: "",
  sortOrder: 0,
  enabled: true
});

const announcementForm = reactive({
  id: "",
  title: "",
  content: "",
  serviceId: "",
  sortOrder: 0,
  enabled: true
});

function userTag(status: UserStatus) {
  if (status === "SUSPENDED") return "danger";
  if (status === "PENDING") return "warning";
  return "success";
}

function userStatusText(status: UserStatus) {
  if (status === "SUSPENDED") return t("common.disabled");
  if (status === "PENDING") return "PENDING";
  if (status === "APPROVED") return "APPROVED";
  return t("common.enabled");
}

function requestTag(status: RequestStatus) {
  if (status === "APPROVED") return "success";
  if (status === "REJECTED") return "danger";
  return "warning";
}

function splitCallbackUrls(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function feedbackTag(status: FeedbackStatus) {
  if (status === "RESOLVED") return "success";
  if (status === "REVIEWING") return "warning";
  return "info";
}

function feedbackStatusText(status: FeedbackStatus) {
  if (status === "RESOLVED") return t("admin.feedbackStatusResolved");
  if (status === "REVIEWING") return t("admin.feedbackStatusReviewing");
  return t("admin.feedbackStatusNew");
}

function feedbackTypeText(type: string) {
  if (type === "complaint") return t("feedback.typeComplaint");
  if (type === "bug") return t("feedback.typeBug");
  return t("feedback.typeSuggestion");
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  let value = bytes;
  let index = 0;

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }

  return index === 0 ? `${Math.round(value)} ${units[index]}` : `${value.toFixed(1)} ${units[index]}`;
}

function formatUptime(totalSeconds: number) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (locale.value === "en") {
    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || parts.length > 0) parts.push(`${hours}h`);
    parts.push(`${minutes}m`);
    return parts.join(" ");
  }

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} 天`);
  if (hours > 0 || parts.length > 0) parts.push(`${hours} 小时`);
  parts.push(`${minutes} 分钟`);
  return parts.join(" ");
}

function formatDateTime(value: string) {
  if (!value) return "-";
  return new Intl.DateTimeFormat(locale.value === "en" ? "en-US" : "zh-CN", {
    dateStyle: "medium",
    timeStyle: "medium",
    hour12: false
  }).format(new Date(value));
}

const serverMetrics = computed<ServerMetric[]>(() => {
  const disk = serverInfo.disk;
  return [
    {
      key: "cpu",
      label: t("admin.cpuUsage"),
      percent: serverInfo.cpu.usagePercent,
      detail: t("admin.cpuDetail", {
        cores: serverInfo.cpu.cores,
        model: serverInfo.cpu.model || "-"
      }),
      color: "#2158f5"
    },
    {
      key: "memory",
      label: t("admin.memoryUsage"),
      percent: serverInfo.memory.usagePercent,
      detail: t("admin.memoryDetail", {
        used: formatBytes(serverInfo.memory.used),
        total: formatBytes(serverInfo.memory.total)
      }),
      color: "#0f766e"
    },
    {
      key: "disk",
      label: t("admin.diskUsage"),
      percent: disk?.usagePercent || 0,
      detail: disk
        ? t("admin.diskDetail", {
            used: formatBytes(disk.used),
            total: formatBytes(disk.total),
            path: disk.path || "-"
          })
        : t("admin.diskUnavailable"),
      color: "#b45309"
    }
  ];
});

const inviteableServices = computed(() =>
  serviceOptions.value.filter((service) => service.enabled && service.allowInviteAccess)
);

function allowedServiceAccess(row: any) {
  return row.serviceAccess.filter((item: any) => item.allowed);
}

function userLabel(user: any) {
  return user.account || user.email || user.username || user.id;
}

function splitTags(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function listQueryParams(state: ListQuery) {
  const params: Record<string, string | number> = {
    page: state.page,
    pageSize: state.pageSize
  };

  for (const key of ["q", "status", "serviceId", "enabled", "accessMode", "type"] as const) {
    const value = state[key];
    if (value) {
      params[key] = value;
    }
  }

  return params;
}

function resetListFilters(state: ListQuery) {
  state.q = "";
  if ("status" in state) state.status = "";
  if ("serviceId" in state) state.serviceId = "";
  if ("enabled" in state) state.enabled = "";
  if ("accessMode" in state) state.accessMode = "";
  if ("type" in state) state.type = "";
  state.page = 1;
}

function setPage(state: ListQuery, page: number) {
  state.page = page;
  loadAll();
}

function setPageSize(state: ListQuery, pageSize: number) {
  state.page = 1;
  state.pageSize = pageSize;
  loadAll();
}

function applyFilters(state: ListQuery) {
  state.page = 1;
  loadAll();
}

function resetFilters(state: ListQuery) {
  resetListFilters(state);
  loadAll();
}

function formatInviteFileStamp(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join("") + `-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
}

function downloadInviteCodes(codes: string[]) {
  if (!codes.length) {
    throw new Error("No invite codes to download");
  }

  const content = `${codes.join("\n")}\n`;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `invite-codes-${formatInviteFileStamp()}.txt`;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function rememberInviteCodes(records: GeneratedInviteCode[]) {
  const existing = new Map(latestInviteCodes.value.map((record) => [record.code, record]));
  for (const record of records) {
    if (record.code) {
      existing.set(record.code, record);
    }
  }
  latestInviteCodes.value = [...existing.values()].slice(0, 500);
  sessionStorage.setItem(inviteCodeStorageKey, JSON.stringify(latestInviteCodes.value));
}

function forgetGeneratedInviteCode(record: GeneratedInviteCode) {
  latestInviteCodes.value = latestInviteCodes.value.filter((item) => item.code !== record.code);
  sessionStorage.setItem(inviteCodeStorageKey, JSON.stringify(latestInviteCodes.value));
}

function hasGeneratedInviteCode(id: string) {
  return latestInviteCodes.value.some((record) => record.id === id);
}

function copyGeneratedInviteCode(id: string) {
  const record = latestInviteCodes.value.find((item) => item.id === id);
  if (record) {
    void copyInviteCodes([record.code]);
  }
}

async function removeGeneratedInviteCode(record: GeneratedInviteCode) {
  if (!record.id) {
    forgetGeneratedInviteCode(record);
    return;
  }

  if (!window.confirm(t("admin.deleteInviteConfirm"))) {
    return;
  }

  try {
    await $fetch(`/api/admin/invites/${record.id}`, { method: "DELETE" });
    forgetGeneratedInviteCode(record);
    ElMessage.success(t("notice.inviteDeleted"));
    await loadAll();
  } catch (error: any) {
    ElMessage.error(localizeError(error, "error.inviteDeleteFailed"));
  }
}

async function copyInviteCodes(codes: string[]) {
  const text = codes.join("\n");
  try {
    if (!navigator.clipboard?.writeText) {
      throw new Error("Clipboard API unavailable");
    }
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "-9999px";
    textarea.setAttribute("readonly", "");
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const copied = document.execCommand("copy");
    textarea.remove();

    if (!copied) {
      ElMessage.warning(t("notice.inviteCodeCopyManual"));
      return;
    }
  }
  ElMessage.success(codes.length > 1 ? t("notice.inviteCodesCopied") : t("notice.inviteCodeCopied"));
}

async function deleteInvite(id: string) {
  if (!window.confirm(t("admin.deleteInviteConfirm"))) {
    return;
  }

  try {
    await $fetch(`/api/admin/invites/${id}`, { method: "DELETE" });
    const generatedInvite = latestInviteCodes.value.find((record) => record.id === id);
    if (generatedInvite) {
      forgetGeneratedInviteCode(generatedInvite);
    }
    ElMessage.success(t("notice.inviteDeleted"));
    await loadAll();
  } catch (error: any) {
    ElMessage.error(localizeError(error, "error.inviteDeleteFailed"));
  }
}

async function loadAll() {
  loading.value = true;
  errorMessage.value = "";

  try {
    const [
      summaryResult,
      userResult,
      serviceResult,
      inviteResult,
      requestResult,
      announcementResult,
      openSourceResult,
      feedbackResult,
      serviceOptionResult
    ] = await Promise.all([
      $fetch<typeof summary>("/api/admin/summary"),
      $fetch<{ users: any[]; total: number }>("/api/admin/users", { query: listQueryParams(userQuery) }),
      $fetch<{ services: any[]; total: number }>("/api/admin/services", { query: listQueryParams(serviceQuery) }),
      $fetch<{ invites: any[]; total: number }>("/api/admin/invites", { query: listQueryParams(inviteQuery) }),
      $fetch<{ requests: any[]; total: number }>("/api/admin/requests", { query: listQueryParams(requestQuery) }),
      $fetch<{ announcements: any[]; total: number }>("/api/admin/announcements", { query: listQueryParams(announcementQuery) }),
      $fetch<{ credits: any[]; total: number }>("/api/admin/open-source-credits", { query: listQueryParams(openSourceQuery) }),
      $fetch<{ feedback: any[]; total: number }>("/api/admin/feedback", { query: listQueryParams(feedbackQuery) }),
      $fetch<{ services: ServiceOption[] }>("/api/admin/service-options")
    ]);

    Object.assign(summary, summaryResult);
    users.value = userResult.users;
    userQuery.total = userResult.total;
    services.value = serviceResult.services;
    serviceQuery.total = serviceResult.total;
    invites.value = inviteResult.invites;
    inviteQuery.total = inviteResult.total;
    requests.value = requestResult.requests;
    requestQuery.total = requestResult.total;
    announcements.value = announcementResult.announcements;
    announcementQuery.total = announcementResult.total;
    openSourceCredits.value = openSourceResult.credits;
    openSourceQuery.total = openSourceResult.total;
    feedbackList.value = feedbackResult.feedback;
    feedbackQuery.total = feedbackResult.total;
    serviceOptions.value = serviceOptionResult.services;
  } catch (error: any) {
    errorMessage.value = localizeError(error, "error.loadAdmin");
  } finally {
    loading.value = false;
  }
}

async function updateUser(id: string, status: UserStatus) {
  try {
    await $fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      body: { status }
    });
    ElMessage.success(t("notice.userStatusUpdated"));
    await loadAll();
  } catch (error: any) {
    ElMessage.error(localizeError(error, "error.operationFailed"));
  }
}

async function reviewRequest(id: string, status: RequestStatus) {
  try {
    await $fetch(`/api/admin/requests/${id}`, {
      method: "PATCH",
      body: { status }
    });
    ElMessage.success(status === "APPROVED" ? t("notice.requestApproved") : t("notice.requestRejected"));
    await loadAll();
  } catch (error: any) {
    ElMessage.error(localizeError(error, "error.operationFailed"));
  }
}

function resetInviteForm() {
  inviteForm.label = "";
  inviteForm.maxUses = 1;
  inviteForm.expiresAt = "";
  inviteForm.serviceIds = [];
  inviteGenerationMode.value = "single";
  inviteQuantity.value = 2;
}

function resetPasswordResetForm() {
  passwordResetForm.newPassword = "";
  passwordResetForm.confirmPassword = "";
  passwordResetUser.value = null;
}

function openPasswordReset(user: any) {
  resetPasswordResetForm();
  passwordResetUser.value = user;
  passwordResetDialogVisible.value = true;
}

async function resetUserPassword() {
  if (!passwordResetUser.value) {
    return;
  }

  if (passwordResetForm.newPassword !== passwordResetForm.confirmPassword) {
    ElMessage.error(t("error.passwordConfirmationMismatch"));
    return;
  }

  passwordResetting.value = true;
  try {
    const result = await $fetch<{ currentSessionRevoked: boolean }>(
      `/api/admin/users/${passwordResetUser.value.id}/password`,
      {
        method: "POST",
        body: { newPassword: passwordResetForm.newPassword }
      }
    );
    passwordResetDialogVisible.value = false;
    ElMessage.success(t("notice.userPasswordReset"));

    if (result.currentSessionRevoked) {
      await navigateTo("/relogin");
      return;
    }
  } catch (error: any) {
    ElMessage.error(localizeError(error, "error.passwordResetFailed"));
  } finally {
    passwordResetting.value = false;
  }
}

function openInviteCreate() {
  resetInviteForm();
  inviteDialogVisible.value = true;
}

async function createInvite() {
  const label = inviteForm.label.trim();
  const maxUses = Number(inviteForm.maxUses);
  const expiresAt = inviteForm.expiresAt ? new Date(inviteForm.expiresAt) : null;

  if (!label) {
    ElMessage.error(t("error.inviteLabelRequired"));
    return;
  }
  if (!Number.isInteger(maxUses) || maxUses < 1) {
    ElMessage.error(t("error.inviteMaxUsesInvalid"));
    return;
  }
  if (!inviteForm.serviceIds.length) {
    ElMessage.error(t("error.inviteServicesRequired"));
    return;
  }
  if (expiresAt && (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now())) {
    ElMessage.error(t("error.inviteExpiryPast"));
    return;
  }

  inviteCreating.value = true;
  try {
    const body: Record<string, string | number | string[] | undefined> = {
      label,
      maxUses,
      expiresAt: expiresAt?.toISOString(),
      serviceIds: inviteForm.serviceIds
    };

    if (inviteGenerationMode.value === "batch") {
      const quantity = Number(inviteQuantity.value);
      if (!Number.isInteger(quantity) || quantity < 2) {
        ElMessage.error(t("error.inviteQuantityInvalid"));
        return;
      }

      if (quantity > 500) {
        ElMessage.error(t("error.inviteQuantityTooLarge", { max: 500 }));
        return;
      }

      body.generationMode = "batch";
      body.quantity = quantity;
    }

    const result = await $fetch<{
      code?: string;
      codes?: string[];
      invite?: { id: string };
      invites?: Array<{ id: string }>;
      createdCount?: number;
    }>("/api/admin/invites", {
      method: "POST",
      body
    });

    if (result.codes?.length) {
      rememberInviteCodes(
        result.codes.map((code, index) => ({
          code,
          id: result.invites?.[index]?.id
        }))
      );
      try {
        downloadInviteCodes(result.codes);
      } catch {
        ElMessage.error(t("error.inviteDownloadFailed"));
      }
      ElMessage.success(
        t("notice.inviteBatchCreated", {
          count: result.createdCount || result.codes.length
        })
      );
    } else if (result.code) {
      rememberInviteCodes([{ code: result.code, id: result.invite?.id }]);
      ElMessage.success(t("notice.inviteCreated"));
    } else {
      throw new Error("Invalid invite response");
    }

    resetInviteForm();
    inviteDialogVisible.value = false;
    inviteQuery.page = 1;
    await loadAll();
  } catch (error: any) {
    ElMessage.error(localizeError(error, "error.operationFailed"));
  } finally {
    inviteCreating.value = false;
  }
}

function resetServiceForm() {
  serviceForm.id = "";
  serviceForm.name = "";
  serviceForm.slug = "";
  serviceForm.description = "";
  serviceForm.displayTitle = "";
  serviceForm.shortIntro = "";
  serviceForm.coverImageUrl = "";
  serviceForm.videoUrl = "";
  serviceForm.mediaType = "image";
  serviceForm.tagsText = "";
  serviceForm.showcaseOrder = nextServiceOrder();
  serviceForm.featured = false;
  serviceForm.homeUrl = "";
  serviceForm.healthCheckUrl = "";
  serviceForm.docsUrl = "";
  serviceForm.callbackUrlsText = "";
  serviceForm.enabled = true;
  serviceForm.allowDirectAccess = false;
  serviceForm.allowInviteAccess = true;
  serviceForm.allowAccessRequest = true;
}

function openServiceCreate() {
  resetServiceForm();
  serviceDialogVisible.value = true;
}

function nextServiceOrder() {
  const maxOrder = services.value.reduce((max, service) => {
    const order = Number(service.showcaseOrder || 0);
    return Number.isFinite(order) && order > max ? order : max;
  }, 0);

  return maxOrder + 10;
}

function openServiceEdit(row: any) {
  serviceForm.id = row.id;
  serviceForm.name = row.name || "";
  serviceForm.slug = row.slug || "";
  serviceForm.description = row.description || "";
  serviceForm.displayTitle = row.displayTitle || "";
  serviceForm.shortIntro = row.shortIntro || "";
  serviceForm.coverImageUrl = row.coverImageUrl || "";
  serviceForm.videoUrl = row.videoUrl || "";
  serviceForm.mediaType = row.mediaType === "video" ? "video" : "image";
  serviceForm.tagsText = (row.tags || []).join(", ");
  serviceForm.showcaseOrder = Number(row.showcaseOrder || 0);
  serviceForm.featured = Boolean(row.featured);
  serviceForm.homeUrl = row.homeUrl || "";
  serviceForm.healthCheckUrl = row.healthCheckUrl || "";
  serviceForm.docsUrl = row.docsUrl || "";
  serviceForm.callbackUrlsText = (row.callbackUrls || []).join("\n");
  serviceForm.enabled = row.enabled !== false;
  serviceForm.allowDirectAccess = Boolean(row.allowDirectAccess);
  serviceForm.allowInviteAccess = row.allowInviteAccess !== false;
  serviceForm.allowAccessRequest = row.allowAccessRequest !== false;
  serviceDialogVisible.value = true;
}

async function saveService() {
  const name = serviceForm.name.trim();
  const slug = serviceForm.slug.trim().toLowerCase();
  const homeUrl = serviceForm.homeUrl.trim();
  const callbackUrls = splitCallbackUrls(serviceForm.callbackUrlsText);

  if (!name || !slug || !homeUrl || !callbackUrls.length) {
    ElMessage.error(t("error.serviceRequiredFields"));
    return;
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    ElMessage.error(t("error.serviceSlugInvalid"));
    return;
  }

  serviceSaving.value = true;
  try {
    const body = {
      name,
      slug,
      description: serviceForm.description,
      displayTitle: serviceForm.displayTitle,
      shortIntro: serviceForm.shortIntro,
      coverImageUrl: serviceForm.coverImageUrl,
      videoUrl: serviceForm.videoUrl,
      mediaType: serviceForm.mediaType,
      tags: splitTags(serviceForm.tagsText),
      showcaseOrder: Number(serviceForm.showcaseOrder || 0),
      featured: serviceForm.featured,
      homeUrl,
      healthCheckUrl: serviceForm.healthCheckUrl,
      docsUrl: serviceForm.docsUrl,
      callbackUrls,
      enabled: serviceForm.enabled,
      allowDirectAccess: serviceForm.allowDirectAccess,
      allowInviteAccess: serviceForm.allowInviteAccess,
      allowAccessRequest: serviceForm.allowAccessRequest
    };

    if (serviceForm.id) {
      await $fetch(`/api/admin/services/${serviceForm.id}`, {
        method: "PATCH",
        body
      });
      ElMessage.success(t("notice.serviceSaved"));
    } else {
      const result = await $fetch<{ clientSecret: string }>("/api/admin/services", {
        method: "POST",
        body
      });
      lastServiceSecret.value = result.clientSecret;
      serviceQuery.page = 1;
      ElMessage.success(t("notice.serviceCreated"));
    }

    resetServiceForm();
    serviceDialogVisible.value = false;
    await loadAll();
  } catch (error: any) {
    ElMessage.error(localizeError(error, "error.operationFailed"));
  } finally {
    serviceSaving.value = false;
  }
}

async function updateService(row: any) {
  try {
    await $fetch(`/api/admin/services/${row.id}`, {
      method: "PATCH",
      body: {
        enabled: row.enabled,
        allowDirectAccess: row.allowDirectAccess,
        allowInviteAccess: row.allowInviteAccess,
        allowAccessRequest: row.allowAccessRequest
      }
    });
    ElMessage.success(t("notice.serviceUpdated"));
    await loadAll();
  } catch (error: any) {
    ElMessage.error(localizeError(error, "error.operationFailed"));
    await loadAll();
  }
}

async function rotateSecret(id: string) {
  try {
    const result = await $fetch<{ clientSecret: string }>(
      `/api/admin/services/${id}/secret`,
      { method: "POST" }
    );
    lastServiceSecret.value = result.clientSecret;
    ElMessage.success(t("notice.secretRotated"));
  } catch (error: any) {
    ElMessage.error(localizeError(error, "error.operationFailed"));
  }
}

function resetAnnouncementForm() {
  announcementForm.id = "";
  announcementForm.title = "";
  announcementForm.content = "";
  announcementForm.serviceId = "";
  announcementForm.sortOrder = 0;
  announcementForm.enabled = true;
}

function openAnnouncementCreate() {
  resetAnnouncementForm();
  announcementDialogVisible.value = true;
}

function openAnnouncementEdit(row: any) {
  announcementForm.id = row.id;
  announcementForm.title = row.title || "";
  announcementForm.content = row.content || "";
  announcementForm.serviceId = row.serviceId || "";
  announcementForm.sortOrder = row.sortOrder || 0;
  announcementForm.enabled = row.enabled !== false;
  announcementDialogVisible.value = true;
}

async function saveAnnouncement() {
  try {
    const body = {
      title: announcementForm.title,
      content: announcementForm.content,
      serviceId: announcementForm.serviceId || null,
      sortOrder: announcementForm.sortOrder,
      enabled: announcementForm.enabled
    };

    if (announcementForm.id) {
      await $fetch(`/api/admin/announcements/${announcementForm.id}`, {
        method: "PATCH",
        body
      });
    } else {
      await $fetch("/api/admin/announcements", {
        method: "POST",
        body
      });
      announcementQuery.page = 1;
    }

    resetAnnouncementForm();
    announcementDialogVisible.value = false;
    ElMessage.success(t("notice.announcementSaved"));
    await loadAll();
  } catch (error: any) {
    ElMessage.error(localizeError(error, "error.announcementFailed"));
  }
}

async function deleteAnnouncement(id: string) {
  try {
    await $fetch(`/api/admin/announcements/${id}`, {
      method: "DELETE"
    });
    ElMessage.success(t("notice.announcementDeleted"));
    await loadAll();
  } catch (error: any) {
    ElMessage.error(localizeError(error, "error.operationFailed"));
  }
}

function resetOpenSourceForm() {
  openSourceForm.id = "";
  openSourceForm.name = "";
  openSourceForm.url = "";
  openSourceForm.sortOrder = 0;
  openSourceForm.enabled = true;
}

function openOpenSourceCreate() {
  resetOpenSourceForm();
  openSourceDialogVisible.value = true;
}

function openOpenSourceEdit(row: any) {
  openSourceForm.id = row.id;
  openSourceForm.name = row.name || "";
  openSourceForm.url = row.url || "";
  openSourceForm.sortOrder = row.sortOrder || 0;
  openSourceForm.enabled = row.enabled !== false;
  openSourceDialogVisible.value = true;
}

async function saveOpenSourceCredit() {
  try {
    const body = {
      name: openSourceForm.name,
      url: openSourceForm.url,
      sortOrder: openSourceForm.sortOrder,
      enabled: openSourceForm.enabled
    };
    if (openSourceForm.id) {
      await $fetch(`/api/admin/open-source-credits/${openSourceForm.id}`, {
        method: "PATCH",
        body
      });
    } else {
      await $fetch("/api/admin/open-source-credits", {
        method: "POST",
        body
      });
      openSourceQuery.page = 1;
    }

    resetOpenSourceForm();
    openSourceDialogVisible.value = false;
    ElMessage.success(t("notice.openSourceSaved"));
    await loadAll();
  } catch (error: any) {
    ElMessage.error(localizeError(error, "error.openSourceFailed"));
  }
}

async function deleteOpenSourceCredit(id: string) {
  try {
    await $fetch(`/api/admin/open-source-credits/${id}`, {
      method: "DELETE"
    });
    ElMessage.success(t("notice.openSourceDeleted"));
    await loadAll();
  } catch (error: any) {
    ElMessage.error(localizeError(error, "error.operationFailed"));
  }
}

async function updateFeedback(id: string, status: FeedbackStatus) {
  try {
    await $fetch(`/api/admin/feedback/${id}`, {
      method: "PATCH",
      body: { status }
    });
    ElMessage.success(t("notice.feedbackUpdated"));
    await loadAll();
  } catch (error: any) {
    ElMessage.error(localizeError(error, "error.operationFailed"));
  }
}

async function loadServerInfo() {
  serverLoading.value = true;
  serverError.value = "";

  try {
    const result = await $fetch<ServerInfo>("/api/admin/server-info");
    Object.assign(serverInfo, result);
  } catch (error: any) {
    serverError.value = localizeError(error, "error.loadServerInfo");
  } finally {
    serverLoading.value = false;
  }
}

onMounted(() => {
  try {
    const storedCodes = JSON.parse(sessionStorage.getItem(inviteCodeStorageKey) || "[]");
    latestInviteCodes.value = Array.isArray(storedCodes)
      ? storedCodes
          .map((item): GeneratedInviteCode | null => {
            if (typeof item === "string") return { code: item };
            if (item && typeof item.code === "string") {
              return { code: item.code, id: typeof item.id === "string" ? item.id : undefined };
            }
            return null;
          })
          .filter((item): item is GeneratedInviteCode => Boolean(item))
          .slice(0, 500)
      : [];
  } catch {
    latestInviteCodes.value = [];
  }
  void loadAll();
  void loadServerInfo();
});
</script>

<style scoped>
.admin-page {
  width: min(1400px, calc(100vw - 24px));
  height: 100vh;
  height: 100dvh;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-top: 24px;
  padding-bottom: 24px;
}

.admin-page__header {
  flex: 0 0 auto;
  align-items: center;
  margin-bottom: 16px;
}

.admin-page__identity {
  display: flex;
  align-items: center;
  gap: 28px;
  min-width: 0;
}

.admin-page__heading {
  min-width: 0;
  padding-left: 28px;
  border-left: 1px solid var(--page-border);
}

.admin-page__heading .panel-title {
  font-size: clamp(32px, 4vw, 48px);
}

.admin-page__heading .panel-subtitle {
  margin-top: 8px;
}

.admin-hero {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 16px;
  padding: 22px 24px;
}

.admin-hero__copy {
  max-width: 720px;
}

.admin-hero__copy h2 {
  margin: 12px 0 8px;
  font-size: clamp(28px, 3vw, 40px);
  line-height: 1.02;
  letter-spacing: -0.04em;
}

.admin-hero__copy .muted {
  margin: 0;
  font-size: 15px;
  line-height: 1.65;
}

.admin-hero__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.admin-card {
  flex: 1 1 auto;
  min-height: 0;
  margin-top: 0;
  padding: 0;
  overflow: hidden;
}

.server-card {
  margin-top: 0;
  padding: 18px;
}

.growth-card-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 8px;
  min-height: 414px;
  margin-top: 0;
  padding: 18px;
  color: var(--page-muted);
}

.growth-card-fallback h2,
.growth-card-fallback p {
  margin: 0;
}

.growth-card-fallback h2 {
  color: var(--page-text);
  font-size: 18px;
}

.server-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
}

.server-card__title {
  margin: 0;
  font-size: 18px;
  line-height: 1.2;
}

.server-card__meta {
  margin: 6px 0 0;
  color: var(--page-muted);
  font-size: 13px;
}

.server-card__error {
  margin: 0 0 12px;
  color: #b91c1c;
  font-size: 13px;
}

html[data-theme="dark"] .server-card__error {
  color: #fca5a5;
}

.server-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.server-metric {
  padding: 14px;
  border-radius: 14px;
  background: var(--page-surface-soft);
  border: 1px solid var(--page-border);
}

.server-metric__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.server-metric__header span {
  font-size: 13px;
  color: var(--page-muted);
}

.server-metric__header strong {
  font-size: 18px;
  line-height: 1;
}

.server-metric__detail {
  margin: 8px 0 0;
  color: var(--page-muted);
  font-size: 12px;
  line-height: 1.55;
  word-break: break-word;
}

.server-facts {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.server-facts div {
  padding: 12px 14px;
  border-radius: 14px;
  background: var(--page-surface-soft);
  border: 1px solid var(--page-border);
}

.server-facts span {
  display: block;
  margin-bottom: 6px;
  color: var(--page-muted);
  font-size: 12px;
}

.server-facts strong {
  display: block;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
}

.admin-error {
  width: min(540px, 100%);
  padding: 28px;
}

.admin-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 14px;
  padding: 14px;
  border: 1px solid var(--page-border);
  border-radius: 22px;
  background: rgba(242, 242, 247, 0.72);
}

.admin-search {
  flex: 1 1 240px;
  min-width: 180px;
}

.admin-filter {
  width: 180px;
  min-width: 150px;
}

.compact-admin-btn {
  min-height: 44px;
  white-space: nowrap;
}

.compact-admin-btn:disabled {
  cursor: not-allowed;
  opacity: 0.62;
  transform: none;
}

.invite-code-results {
  display: grid;
  gap: 12px;
  margin-bottom: 14px;
  padding: 14px;
  border: 1px solid rgba(0, 122, 255, 0.2);
  border-radius: 16px;
  background: rgba(0, 122, 255, 0.055);
}

.invite-code-results__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.invite-code-results__header strong,
.invite-code-results__header span {
  display: block;
}

.invite-code-results__header strong {
  color: var(--page-text);
  font-size: 14px;
}

.invite-code-results__header span {
  margin-top: 4px;
  color: var(--page-muted);
  font-size: 12px;
  line-height: 1.5;
}

.invite-code-results__list {
  display: grid;
  gap: 8px;
  max-height: 220px;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-right: 4px;
  scrollbar-color: rgba(60, 60, 67, 0.26) transparent;
  scrollbar-width: thin;
}

.invite-code-results__list::-webkit-scrollbar {
  width: 8px;
}

.invite-code-results__list::-webkit-scrollbar-thumb {
  border: 2px solid transparent;
  border-radius: 999px;
  background: rgba(60, 60, 67, 0.26);
  background-clip: padding-box;
}

.invite-code-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  padding: 7px 8px 7px 14px;
  border: 1px solid var(--page-border);
  border-radius: 12px;
  background: var(--page-surface);
}

.invite-code-row code {
  min-width: 0;
  overflow-wrap: anywhere;
  color: var(--page-text);
  font-family: ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", monospace;
  font-size: 13px;
  font-weight: 700;
}

.invite-code-row__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.invite-code-row__remove {
  min-width: 68px;
  min-height: 34px;
  padding: 6px 12px;
  color: #b91c1c;
}

.admin-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
  overflow-x: auto;
}

.admin-page > .stat-strip {
  flex: 0 0 auto;
}

.admin-workspace-shell {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  width: 100%;
  height: 100%;
  min-height: 0;
}

.admin-workspace-sidebar {
  min-height: 0;
  overflow-y: auto;
  padding: 16px;
  border-right: 1px solid var(--page-border);
  background: rgba(248, 249, 252, 0.72);
  overscroll-behavior: contain;
  scrollbar-width: thin;
}

.admin-workspace-nav {
  display: grid;
  gap: 6px;
}

.admin-workspace-nav__item {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 44px;
  border: 0;
  border-radius: 12px;
  padding: 0 14px;
  background: transparent;
  color: var(--page-muted);
  cursor: pointer;
  font-weight: 720;
  text-align: left;
  transition: background-color 160ms ease, color 160ms ease;
}

.admin-workspace-nav__item:hover,
.admin-workspace-nav__item:focus-visible {
  background: rgba(0, 122, 255, 0.06);
  color: var(--page-text);
}

.admin-workspace-nav__item:focus-visible {
  outline: 2px solid rgba(0, 122, 255, 0.34);
  outline-offset: -2px;
}

.admin-workspace-nav__item.is-active {
  background: rgba(0, 122, 255, 0.11);
  color: var(--page-accent);
}

.admin-workspace-content {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  padding: 18px 20px 24px;
  overscroll-behavior: contain;
  scrollbar-color: rgba(60, 60, 67, 0.28) transparent;
  scrollbar-width: thin;
}

.admin-workspace-content::-webkit-scrollbar,
.admin-workspace-sidebar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.admin-workspace-content::-webkit-scrollbar-thumb,
.admin-workspace-sidebar::-webkit-scrollbar-thumb {
  border: 2px solid transparent;
  border-radius: 999px;
  background: rgba(60, 60, 67, 0.28);
  background-clip: padding-box;
}

.admin-data-view,
.admin-tab-pane {
  min-width: 0;
}

.admin-tab-pane--growth :deep(.growth-card) {
  margin-top: 0;
}

.admin-data-view {
  margin-top: 0;
}

:deep(.admin-dialog.el-dialog) {
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 48px);
  margin: 24px auto !important;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 28px 90px rgba(37, 52, 74, 0.24);
  backdrop-filter: blur(24px);
}

:deep(.admin-dialog--invite.el-dialog) {
  width: min(680px, calc(100vw - 32px)) !important;
  height: min(560px, calc(100vh - 48px));
}

:deep(.admin-dialog--service.el-dialog) {
  width: min(760px, calc(100vw - 32px)) !important;
  height: min(760px, calc(100vh - 48px));
}

:deep(.admin-dialog--announcement.el-dialog) {
  width: min(640px, calc(100vw - 32px)) !important;
  height: min(560px, calc(100vh - 48px));
}

:deep(.admin-dialog--compact.el-dialog),
:deep(.admin-dialog--password.el-dialog) {
  width: min(560px, calc(100vw - 32px)) !important;
  height: min(480px, calc(100vh - 48px));
}

:deep(.admin-dialog .el-dialog__header) {
  flex: 0 0 auto;
  margin: 0;
  padding: 22px 24px 16px;
  border-bottom: 1px solid var(--page-border);
}

:deep(.admin-dialog .el-dialog__body) {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 20px 24px;
  scrollbar-color: rgba(60, 60, 67, 0.26) transparent;
  scrollbar-width: thin;
}

:deep(.admin-dialog .el-dialog__footer) {
  flex: 0 0 auto;
  padding: 16px 24px 20px;
  border-top: 1px solid var(--page-border);
  background: rgba(255, 255, 255, 0.92);
}

:deep(.admin-dialog .el-dialog__body::-webkit-scrollbar) {
  width: 8px;
}

:deep(.admin-dialog .el-dialog__body::-webkit-scrollbar-thumb) {
  border: 2px solid transparent;
  border-radius: 999px;
  background: rgba(60, 60, 67, 0.26);
  background-clip: padding-box;
}

.admin-form-grid {
  margin-bottom: 12px;
}

.admin-form-grid :deep(.el-select) {
  width: 100%;
}

.admin-field-note {
  display: block;
  margin-top: 6px;
  color: var(--page-muted);
  font-size: 12px;
  line-height: 1.5;
}

.wide-field {
  grid-column: 1 / -1;
}

.checkbox-line {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  color: var(--page-muted);
}

.inline-link {
  word-break: break-all;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.feedback-content {
  max-width: 520px;
  white-space: pre-wrap;
}

.sort-order-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 42px;
  min-height: 28px;
  border: 1px solid var(--page-border);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.07);
  color: var(--page-text);
  font-weight: 700;
}

@media (max-width: 960px) {
  .admin-page {
    width: min(100vw - 20px, 1400px);
    padding-top: 16px;
    padding-bottom: 16px;
  }

  .admin-hero {
    display: grid;
    align-items: start;
  }

  .admin-page__header,
  .admin-page__identity {
    align-items: flex-start;
    flex-direction: column;
  }

  .admin-page__identity {
    gap: 16px;
  }

  .admin-page__heading {
    padding-left: 0;
    border-left: 0;
  }

  .admin-page > .stat-strip {
    grid-template-columns: repeat(4, minmax(150px, 1fr));
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: thin;
  }

  .admin-workspace-shell {
    grid-template-columns: 1fr;
    grid-template-rows: auto minmax(0, 1fr);
  }

  .admin-workspace-sidebar {
    display: flex;
    align-items: center;
    gap: 14px;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 12px 14px;
    border-right: 0;
    border-bottom: 1px solid var(--page-border);
  }

  .admin-workspace-nav {
    display: flex;
    flex-direction: row;
    gap: 6px;
    width: max-content;
  }

  .admin-workspace-nav__item {
    width: auto;
    min-width: max-content;
    padding: 0 15px;
    text-align: center;
  }

  .admin-workspace-content {
    padding: 16px 16px 22px;
  }

  .admin-hero__actions {
    justify-content: flex-start;
  }

  .server-metrics,
  .server-facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .admin-page__header {
    align-items: center;
    flex-direction: row;
    margin-bottom: 10px;
  }

  .admin-page__identity {
    align-items: center;
    flex-direction: row;
  }

  .admin-page__heading {
    display: none;
  }

  .admin-page__header .action-row {
    margin-left: auto;
  }

  .admin-page__header .ghost-btn {
    min-height: 40px;
    padding: 8px 14px;
  }

  .admin-hero {
    margin-bottom: 10px;
    padding: 12px;
  }

  .admin-hero__copy {
    display: none;
  }

  .admin-hero__actions {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    width: 100%;
  }

  .admin-hero__actions .compact-admin-btn {
    width: 100%;
    min-height: 40px;
    padding: 8px 6px;
    font-size: 13px;
  }

  .admin-page > .stat-strip {
    grid-template-columns: repeat(4, minmax(128px, 1fr));
    gap: 8px;
    margin-bottom: 10px;
  }

  .admin-page .stat-chip {
    padding: 12px 14px;
  }

  .growth-card-fallback {
    min-height: 320px;
  }

  .admin-toolbar {
    align-items: stretch;
  }

  .invite-code-results__header {
    align-items: stretch;
    flex-direction: column;
  }

  .invite-code-results__header .compact-admin-btn {
    width: 100%;
  }

  .server-card__header {
    flex-direction: column;
  }

  .server-metrics,
  .server-facts {
    grid-template-columns: 1fr;
  }

  .admin-search,
  .admin-filter,
  .compact-admin-btn {
    width: 100%;
    flex: 1 1 100%;
  }

  :deep(.admin-dialog.el-dialog) {
    width: calc(100vw - 24px) !important;
    height: calc(100vh - 24px);
    max-height: calc(100vh - 24px);
    margin: 12px auto !important;
    border-radius: 20px;
  }

  :deep(.admin-dialog .el-dialog__header),
  :deep(.admin-dialog .el-dialog__body),
  :deep(.admin-dialog .el-dialog__footer) {
    padding-right: 18px;
    padding-left: 18px;
  }

  :deep(.admin-dialog .form-grid) {
    grid-template-columns: 1fr;
  }

  :deep(.admin-dialog .wide-field) {
    grid-column: auto;
  }
}
</style>
