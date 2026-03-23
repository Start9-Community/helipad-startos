<p align="center">
  <img src="icon.svg" alt="Helipad Logo" width="21%">
</p>

# Helipad on StartOS

> **Upstream docs:** <https://github.com/Podcastindex-org/helipad>
>
> Everything not listed in this document should behave the same as upstream
> Helipad. If a feature, setting, or behavior is not mentioned here,
> the upstream documentation is accurate and fully applicable.

Helipad shows boosts and boostagram messages coming in to your Lightning node from listeners using Podcasting 2.0 apps.

---

## Table of Contents

- [Container Runtime](#container-runtime)
- [Volumes](#volumes)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Interfaces](#network-interfaces)
- [Dependencies](#dependencies)
- [Actions](#actions)
- [Backups](#backups)
- [Health Checks](#health-checks)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Contributing](#contributing)

---

## Container Runtime

| Property | Value |
|----------|-------|
| Image | `podcastindexorg/podcasting20-helipad` |
| Architectures | x86_64, aarch64 |
| Entrypoint | Upstream default (via `sdk.useEntrypoint()`) |

A root oneshot runs before the daemon to:
1. Set ownership of `/data` to the `helipad` user
2. Copy the LND admin macaroon to `/data/admin.macaroon` (the LND volume's `data/` tree is root-only)
3. Install the LND TLS certificate into the system CA store (`update-ca-certificates`)

## Volumes

| Volume | Mount Point | Purpose |
|--------|-------------|---------|
| `main` | `/data` | Database, copied macaroon, sounds |
| LND `main` (dependency) | `/mnt/lnd` (readonly) | TLS cert and admin macaroon source |

StartOS-specific files in `main` volume:
- `store.json` — persists the login password

## Installation and First-Run Flow

1. On first install, a **critical task** prompts the user to generate a login password via the "Set/Reset Password" action
2. No upstream setup wizard — all configuration is handled via environment variables
3. The password task is automatically re-created if the password is ever removed from `store.json`

## Configuration Management

| Setting | Managed By | Method |
|---------|-----------|--------|
| Login password | StartOS | Action: "Set/Reset Password" |
| Listen port | StartOS | Env var `HELIPAD_LISTEN_PORT` (2112) |
| Database path | StartOS | Env var `HELIPAD_DATABASE_DIR` |
| LND connection | StartOS | Env vars `LND_URL`, `LND_TLSCERT`, `LND_ADMINMACAROON` |
| Run-as user | StartOS | Env var `HELIPAD_RUNAS_USER` (helipad) |
| All other settings | Upstream | Helipad web UI or config file |

## Network Interfaces

| Interface | Port | Protocol | Purpose |
|-----------|------|----------|---------|
| Web UI | 2112 | HTTP | Helipad web interface |

## Dependencies

| Service | Required | Health Checks |
|---------|----------|---------------|
| LND | Yes | `lnd`, `sync-progress` |

LND's main volume is mounted readonly at `/mnt/lnd` for access to `tls.cert` and `data/chain/bitcoin/mainnet/admin.macaroon`.

## Actions

### Set/Reset Password

| Property | Value |
|----------|-------|
| ID | `set-password` |
| Allowed statuses | Any |
| Visibility | Enabled |
| Input | None |
| Output | Generated 22-character password (masked, copyable) |

Generates a random alphanumeric password and saves it to `store.json`. The password is displayed once for the user to save.

## Backups

The `main` volume is backed up, which includes:
- SQLite database (`database.db`)
- Sound files
- `store.json` (password)

## Health Checks

| Check | Method | Messages |
|-------|--------|----------|
| Web Interface | Port listening (2112) | Ready: "Helipad is ready" / Not ready: "Helipad is not ready" |

---

## Limitations and Differences

1. LND is the only supported Lightning backend (no CLN support)
2. The admin macaroon is copied to `/data/` on each start because the LND volume's `data/` directory has restrictive permissions
3. The LND TLS certificate must be added to the system CA store on each start (Helipad uses standard OpenSSL verification)

## What Is Unchanged from Upstream

- Web UI functionality (boost display, boostagrams, streaming stats)
- Database schema and format (SQLite)
- Sound notifications
- Webhook support
- All web UI settings and preferences

---

## Contributing

Contributions welcome. Clone the repository, make your changes, and submit a pull request.

---

## Quick Reference for AI Consumers

```yaml
package_id: helipad
image: podcastindexorg/podcasting20-helipad
architectures: [x86_64, aarch64]
volumes:
  main: /data
dependency_mounts:
  lnd_main: /mnt/lnd (readonly)
ports:
  ui: 2112
dependencies:
  - lnd
startos_managed_env_vars:
  - HELIPAD_DATABASE_DIR
  - HELIPAD_LISTEN_PORT
  - HELIPAD_RUNAS_USER
  - HELIPAD_PASSWORD
  - LND_ADMINMACAROON
  - LND_TLSCERT
  - LND_URL
actions:
  - set-password
health_checks:
  - port_listening: 2112
backup_volumes:
  - main
```
