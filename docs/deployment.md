# 部署指南

本文说明如何在本地、Docker Compose 或普通 Linux 服务器上部署小溯应用工坊。

## 1. 首次配置

复制环境变量模板：

```bash
cp .env.example .env
```

生产环境至少修改以下值：

```env
MYSQL_ROOT_PASSWORD=生成强密码
MINIO_ROOT_PASSWORD=生成强密码
NUXT_ADMIN_ACCOUNTS=你的管理员账号
NUXT_PUBLIC_APP_URL=https://portal.example.com
NUXT_LINUXDO_REDIRECT_URI=https://portal.example.com/api/auth/linuxdo/callback
NUXT_MINIO_PUBLIC_BASE_URL=https://files.example.com/zr-access-portal
```

如果 Linux.do OAuth 不使用自定义域名，可以保留空的 Client ID 和 Secret，但账号密码登录仍需要配置管理员账号。

不要把 `.env`、OAuth Secret、MySQL 密码或 MinIO 密钥提交到 GitHub。

## 2. Docker Compose

### 启动

```bash
docker compose up -d --build
docker compose ps
curl http://127.0.0.1:3005/api/health
```

应用容器依赖 MySQL、MinIO 和 bucket 初始化容器。首次启动时，`docker/entrypoint.sh` 默认执行：

```text
prisma db push --accept-data-loss --skip-generate
node scripts/backfill-accounts.mjs
```

完成首次初始化并确认数据库备份后，生产环境建议关闭自动同步：

```env
DB_PUSH_ON_START=false
DB_BACKFILL_ACCOUNTS_ON_START=false
```

再次部署只需要：

```bash
docker compose up -d --build app
```

### 端口

默认端口如下，可在 `.env` 中调整宿主机端口：

| 服务 | 默认端口 | 变量 |
| --- | ---: | --- |
| 门户 | 3005 | `APP_PORT` |
| MySQL | 3306 | `MYSQL_PORT` |
| MinIO API | 9000 | `MINIO_API_PORT` |
| MinIO Console | 9001 | `MINIO_CONSOLE_PORT` |

公网环境建议只暴露反向代理端口，MySQL 和 MinIO 管理端口限制在内网或防火墙白名单内。

### 数据和备份

Compose 使用两个命名卷：`zr-access-mysql` 和 `zr-access-minio`。升级或排障时不要执行 `docker compose down -v`，否则会删除数据库和对象存储数据。

至少备份：

- MySQL 数据库和 Prisma Schema 版本记录。
- MinIO 的 `zr-access-portal` bucket。
- `.env` 的安全副本，单独保存，不提交仓库。

## 3. 非 Docker 部署

适合使用 systemd、Nginx 和已有 MySQL/MinIO 的 Linux 服务器。

### 构建

```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm db:push
pnpm db:backfill-accounts
pnpm build
```

构建会生成 `.output/server` 和私有文档目录 `.output/docs`。平台文档不会放在 `public/docs`，普通用户无法通过静态文件路径绕过管理员鉴权。

### 启动

```bash
HOST=127.0.0.1 PORT=3005 node .output/server/index.mjs
```

systemd 示例：

```ini
[Unit]
Description=Small Trace Application Workshop
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/general-login
EnvironmentFile=/opt/general-login/.env
Environment=NODE_ENV=production
Environment=HOST=127.0.0.1
Environment=PORT=3005
ExecStart=/usr/bin/node /opt/general-login/.output/server/index.mjs
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### Nginx 反向代理

将公网 HTTPS 请求转发到 `127.0.0.1:3005`，并把 OAuth 回调地址配置为：

```text
https://portal.example.com/api/auth/linuxdo/callback
```

至少设置以下请求头：

```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

## 4. 升级流程

```bash
git pull --ff-only
pnpm install --frozen-lockfile
pnpm db:generate
pnpm build
```

Docker 部署执行 `docker compose up -d --build app`；systemd 部署重启应用服务。升级前先备份 MySQL 和 MinIO，并确认 `.env` 没有被覆盖。

## 5. 健康检查和排障

```bash
curl -i http://127.0.0.1:3005/api/health
docker compose logs --tail=200 app
docker compose ps
```

常见问题：

- `DATABASE_URL` 错误：检查 MySQL 地址、端口、用户名、密码和数据库名。
- Linux.do 回调失败：检查公网 URL、Client ID、Secret 和回调地址是否完全一致。
- 头像或文件访问失败：检查 MinIO endpoint、`NUXT_MINIO_USE_SSL` 和 `NUXT_MINIO_PUBLIC_BASE_URL`。
- 首页应用为空：检查数据库服务记录是否为启用状态，以及应用容器是否能访问 MySQL。
- 普通用户访问 `/docs/` 返回 `404`：这是平台接口文档的预期权限行为；管理员登录后才可访问。

## 6. 发布到 GitHub

在项目目录执行，确认 Git 根目录是当前项目：

```bash
git rev-parse --show-toplevel
git add --dry-run .
git diff --cached --stat
```

确认暂存清单中没有 `.env`、`.output`、`.nuxt`、`node_modules`、日志、数据库文件和临时截图后，再创建提交：

```bash
git add .
git commit -m "Prepare deployment documentation"
git branch -M main
git remote add origin https://github.com/<owner>/<repository>.git
git push -u origin main
```

远程仓库地址需要替换为你实际创建的 GitHub 仓库。不要把访问令牌、密码或私钥写入远程 URL、提交信息或仓库文件。
