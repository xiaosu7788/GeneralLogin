# 小溯应用工坊

基于 Nuxt 3、Prisma、MySQL 和 MinIO 的统一登录门户。项目提供账号密码登录、Linux.do OAuth、应用服务授权、邀请码、申请审核、用户管理、反馈和三方网站接口文档。

## 技术要求

- Node.js 22+
- pnpm 10+
- MySQL 8+
- MinIO（头像和三方网站文件存储）
- Docker Compose v2（仅使用 Compose 部署时需要）

## 本地开发

```bash
pnpm install
cp .env.example .env
docker compose up -d mysql minio
pnpm db:generate
pnpm db:push
pnpm db:backfill-accounts
pnpm dev
```

门户默认地址为 `http://localhost:3000`。开发环境的数据库和 MinIO 可以直接使用 Compose 中的本地服务。

## 环境变量

复制 `.env.example` 为 `.env` 后，至少检查以下配置：

- `DATABASE_URL`: MySQL 连接串。
- `NUXT_ADMIN_ACCOUNTS`: 管理员账号，多个账号用英文逗号分隔。
- `NUXT_PUBLIC_APP_URL`: 门户公网地址。
- `NUXT_LINUXDO_CLIENT_ID`、`NUXT_LINUXDO_CLIENT_SECRET`、`NUXT_LINUXDO_REDIRECT_URI`: Linux.do OAuth 配置。
- `NUXT_MINIO_ENDPOINT`、`NUXT_MINIO_PORT`、`NUXT_MINIO_USE_SSL`: MinIO 连接配置。
- `NUXT_MINIO_ACCESS_KEY`、`NUXT_MINIO_SECRET_KEY`: MinIO 服务端凭据。
- `NUXT_MINIO_PUBLIC_BASE_URL`: 浏览器访问头像和文件时使用的公开 URL 前缀。

`.env`、数据库凭据、OAuth Secret 和 MinIO Secret 不要提交到 GitHub。

## Docker Compose 部署

适合单机或测试服务器：

```bash
cp .env.example .env
# 编辑 .env，修改数据库、MinIO、管理员和公网地址配置
docker compose up -d --build
docker compose ps
curl http://127.0.0.1:3000/api/health
```

Compose 会启动 `app`、`mysql`、`minio` 和 `minio-init`。首次启动默认执行数据库结构同步和账号回填。生产环境完成首次初始化并备份数据库后，建议设置：

```env
DB_PUSH_ON_START=false
DB_BACKFILL_ACCOUNTS_ON_START=false
```

完整部署、反向代理、备份和升级说明见 [docs/deployment.md](docs/deployment.md)。

## 从源码构建和运行

```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm db:push
pnpm db:backfill-accounts
pnpm build
HOST=127.0.0.1 PORT=3000 node .output/server/index.mjs
```

生产环境请通过 systemd、进程管理器或容器注入环境变量，不要把 `.env` 复制进公开构建产物。反向代理应将公网 HTTPS 请求转发到本地 `3000` 端口。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 启动开发服务 |
| `pnpm build` | 构建应用和受保护的接口文档 |
| `pnpm preview` | 预览 Nuxt 构建结果 |
| `pnpm docs:dev` | 单独预览 VitePress 文档 |
| `pnpm docs:build` | 构建 VitePress 文档 |
| `pnpm db:push` | 将 Prisma Schema 同步到 MySQL |
| `pnpm db:backfill-accounts` | 回填旧账号兼容字段 |

## 页面和文档

- `/login`: 统一登录入口，也支持外部服务带 `client_id/callback/state` 发起授权。
- `/feedback`: 投诉建议收集页。
- `/onboarding`: 用户填写邀请码或提交访问申请。
- `/pending`: 申请等待审核页。
- `/apps`: 已启用的网站服务列表。
- `/admin`: 管理后台，仅管理员可访问。
- `/docs/`: 平台接口文档，仅管理员可访问；应用服务文档由管理员配置地址后显示在文档列表中。

外部网站接入说明见 [docs/service-auth.md](docs/service-auth.md)。

## GitHub 发布前检查

```bash
git add --dry-run .
git diff --cached --stat
pnpm build
docker compose config --quiet
```

确认没有 `.env`、数据库文件、日志、构建目录或临时截图后，再创建提交和配置远程仓库。项目当前不会自动推送到 GitHub。
