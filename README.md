<p align="center">
  <img src="icon.svg" alt="Helipad Logo" width="21%">
</p>

# Helipad on StartOS

> Everything not listed in this document should behave the same as upstream
> Helipad. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[Helipad](https://github.com/Podcastindex-org/helipad) watches your Lightning node for Podcasting 2.0 boostagrams — the messages listeners attach to payments — and shows them in a web interface. This package wires it to the LND on the same server and manages the one credential it needs.

- **Upstream repo:** <https://github.com/Podcastindex-org/helipad>
- **Wrapper repo:** <https://github.com/Start9-Community/helipad-startos>

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

One upstream image, with its CA store upgraded by the root `Dockerfile`, a temporary layer that comes out once upstream ships an image built on a fixed store.

| Property      | Value                                                      |
| ------------- | ---------------------------------------------------------- |
| Image         | `podcastindexorg/podcasting20-helipad` + root `Dockerfile` |
| Architectures | x86_64, aarch64                                            |
| Entrypoint    | The image's own, via `sdk.useEntrypoint()`                 |

| Subcontainer  | Purpose                                                   |
| ------------- | --------------------------------------------------------- |
| `helipad-sub` | The setup oneshot and the daemon — the one to `attach` to |

**A oneshot runs as root before the daemon**, and does two things the application cannot do for itself: it takes ownership of the data directory, and installs LND's certificate into the container's trust store.

**Helipad reads LND's admin macaroon in place, from the mount.** LND's credentials are root-owned and not world-readable, and Helipad runs unprivileged, so the mount remaps their owner (uid 0) to the `helipad` user (uid 1000).

## Volume and Data Layout

One volume, plus a read-only view of LND's.

| Volume                        | Mount Point | Purpose                                                 |
| ----------------------------- | ----------- | ------------------------------------------------------- |
| `main`                        | `/data`     | The boostagram database and the store                   |
| LND's `public` (ro), `admin/` | `/mnt/lnd`  | LND's TLS certificate and admin macaroon — nothing else |

| Path          | Written by  | Holds                                                        |
| ------------- | ----------- | ------------------------------------------------------------ |
| `database.db` | Helipad     | Every boostagram it has seen, plus the triggers and settings |
| `store.json`  | The package | The web login password                                       |

The StartOS 0.3.5 package kept the database at `db/database.db`. Updating to `0.2.2:11` or later moves it to `database.db` in the version migration. **An install that has already run Helipad on `database.db` is left as it is**: Helipad created that file empty on its first start and refilled the boosts from LND, so both files hold data and the migration cannot tell which one is wanted. The triggers and settings from before the update stay in `db/database.db`.

## File Models

One model, holding one value.

| File         | Format | Modelled                | Written by                    |
| ------------ | ------ | ----------------------- | ----------------------------- |
| `store.json` | JSON   | Yes — `FileHelper.json` | The Set/Reset Password action |

It records the web login password, in plaintext, and hands it to the application as environment. There is no hash: Helipad takes the password itself rather than a digest, so the package has nothing to hash it into.

`main` reads it reactively and **refuses to start without it**, which is what makes the setup task genuinely blocking rather than advisory.

Everything else — the boostagram history, triggers, display settings — is the application's, in its own database, and is not modelled.

## Dependencies

One, and it is required.

| Dependency | Required | Health checks required | Mounted                                         | Why                              |
| ---------- | -------- | ---------------------- | ----------------------------------------------- | -------------------------------- |
| LND        | Yes      | `lnd`, `sync-progress` | `public` tier `admin/`, read-only at `/mnt/lnd` | The node whose payments it reads |

**This package uses LND's admin macaroon.** Helipad only reads, but the credential it is given is not read-only. It stays on LND's volume and never reaches this service's volume or backups.

**LND's sync check is required as well as its liveness.** StartOS reports the dependency unmet while LND is stopped or still catching up; the declaration itself does not hold Helipad's start.

LND's gRPC address is resolved over the internal bridge, and **the service refuses to start if it does not resolve** rather than coming up disconnected. LND publishes that binding only after its wallet has first been unlocked, so the reactive read heals onto the real address at that point and then stays stable across later lock and unlock cycles.

The certificate is pinned from the mount, and covers the bridge address LND is dialed at.

## Network Access and Interfaces

One interface.

| Interface | Id   | Type | Port | Description               |
| --------- | ---- | ---- | ---- | ------------------------- |
| Web UI    | `ui` | ui   | 2112 | The Helipad web interface |

Bound on the `ui-multi` MultiHost over HTTP and not masked. Helipad's own login gates it, using the password from the store.

The StartOS 0.3.5 package served the UI from a host named `main`. Updating to `0.2.2:8` or later retires that leftover host in the version migration, freeing its port; nothing is moved, and the Web UI's own addresses are unaffected.

## Installation and First-Run Flow

Install raises a critical task to set the password. **Nothing runs until it is done** — `main` throws without one, so this is not a prompt that can be ignored.

After that, LND has to have been unlocked at least once so its gRPC binding exists — `main` refuses to start until it does. LND not running or not synced is reported as an unmet dependency.

Once running, Helipad begins recording boostagrams as they arrive. It shows what it has seen since it started — there is no backfill of payments that arrived before it was installed.

## Actions

One action.

### Set/Reset Password

Generates a new web login password and shows it once. Run it when its task appears, or to rotate the credential.

- **What it changes:** the password in the store. When a password already exists, the action asks for confirmation first.
- **Cost:** the service restarts, since the password is read into the application's environment at start.
- **Repeat safety:** each run generates a **new** password and invalidates the previous one. There is no way to set a chosen value.
- **Outputs:** the password, shown once.

## Tasks

One, and it is reactive.

| Task               | Severity   | Raised when                     | Cleared when    |
| ------------------ | ---------- | ------------------------------- | --------------- |
| Set/Reset Password | `critical` | Any init that finds no password | The action runs |

It is re-raised on any init that finds the store empty, not only on install, so deleting the password brings the prompt back rather than leaving a service that cannot start with nothing to click.

`critical` blocks the service from starting and suspends the ordinary controls.

## Health Checks

One check, on the only daemon.

| Check     | Displayed as    | Method                 |
| --------- | --------------- | ---------------------- |
| `primary` | "Web Interface" | Port 2112 is listening |

It reports that the interface is serving, not that the node connection is working. A green check with no boostagrams appearing is either genuinely no boosts, or a gRPC connection failing after start-up — the service logs distinguish them.

## Backups and Restore

The `main` volume is copied wholesale — `sdk.Backups.ofVolumes('main')`. That is the boostagram history and the password; no LND credential.

A restored instance comes back with its history and its password, and reads the macaroon from whatever LND is present on the new server. It still needs LND installed, unlocked, and synced before it will start.

## Limitations and Differences

1. **The password cannot be chosen**, only generated — and rotating it restarts the service.
2. **The service will not start without a password**, without LND, or before LND's wallet has been unlocked once.
3. **No backfill.** Helipad records boostagrams from when it starts; earlier payments are not imported.
4. **Mainnet only.** LND's `admin/` tier carries the mainnet admin macaroon.
5. **No configuration surface** beyond the password; everything else is Helipad's own.

---

## Quick Reference for AI Consumers

```yaml
package_id: helipad
image: podcastindexorg/podcasting20-helipad + root Dockerfile (CA store upgrade)
architectures:
  - x86_64
  - aarch64
subcontainers:
  - helipad-sub # the setup oneshot and the daemon
volumes:
  main: /data # LND's public volume, tier admin/ (admin.macaroon, tls.cert), is mounted read-only at /mnt/lnd
file_models:
  - store.json # the web login password, in plaintext
startos_managed_env_vars:
  - HELIPAD_DATABASE_DIR
  - HELIPAD_LISTEN_PORT
  - HELIPAD_RUNAS_USER
  - HELIPAD_PASSWORD
  - LND_ADMINMACAROON # /mnt/lnd/admin.macaroon, read in place
  - LND_TLSCERT
  - LND_URL
dependencies:
  - lnd # required, kind: running, checks: lnd + sync-progress
interfaces:
  ui: { type: ui, port: 2112 }
actions:
  - set-password
tasks:
  - { action: set-password, severity: critical } # reactive
health_checks:
  - primary # displayed "Web Interface"
```
