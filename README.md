<p align="center">
  <img src="icon.png" alt="Helipad Logo" width="21%">
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

One upstream image, consumed unmodified.

| Property      | Value                                      |
| ------------- | ------------------------------------------ |
| Image         | `podcastindexorg/podcasting20-helipad`     |
| Architectures | x86_64, aarch64                            |
| Entrypoint    | The image's own, via `sdk.useEntrypoint()` |

| Subcontainer  | Purpose                                                   |
| ------------- | --------------------------------------------------------- |
| `helipad-sub` | The setup oneshot and the daemon — the one to `attach` to |

**A oneshot runs as root before the daemon**, and does three things the application cannot do for itself: it takes ownership of the data directory, **copies LND's macaroon onto its own volume**, and installs LND's certificate into the container's trust store.

The copy matters. LND's macaroon is root-owned and mode `0600` on a read-only mount, and Helipad runs unprivileged — so it cannot read the original. A copy with its ownership changed is what makes the credential usable without running the application as root.

## Volume and Data Layout

One volume, plus a read-only view of LND's.

| Volume            | Mount Point | Purpose                                                 |
| ----------------- | ----------- | ------------------------------------------------------- |
| `main`            | `/data`     | The boostagram database, the store, and a macaroon copy |
| LND's `main` (ro) | `/mnt/lnd`  | LND's TLS certificate and admin macaroon                |

| Path             | Written by  | Holds                                   |
| ---------------- | ----------- | --------------------------------------- |
| `database.db`    | Helipad     | Every boostagram it has seen            |
| `store.json`     | The package | The web login password                  |
| `admin.macaroon` | The oneshot | A readable copy of LND's admin macaroon |

**A copy of LND's admin macaroon lives on this volume**, which means the volume — and every backup of it — carries full authority over your Lightning node. That is a consequence of how the credential has to be made readable, and it is worth knowing before deciding where backups go.

## File Models

One model, holding one value.

| File         | Format | Modelled                | Written by                    |
| ------------ | ------ | ----------------------- | ----------------------------- |
| `store.json` | JSON   | Yes — `FileHelper.json` | The Set/Reset Password action |

It records the web login password, in plaintext, and hands it to the application as environment. There is no hash: Helipad takes the password itself rather than a digest, so the package has nothing to hash it into.

`main` reads it reactively and **refuses to start without it**, which is what makes the setup task genuinely blocking rather than advisory.

Everything else — the boostagram history, display settings — is the application's, in its own database, and is not modelled.

## Dependencies

One, and it is required.

| Dependency | Required | Health checks required | Mounted                         | Why                              |
| ---------- | -------- | ---------------------- | ------------------------------- | -------------------------------- |
| LND        | Yes      | `lnd`, `sync-progress` | `main`, read-only at `/mnt/lnd` | The node whose payments it reads |

**This package uses LND's admin macaroon.** Helipad only reads, but the credential it is given is not read-only — anyone with this service's volume has full control of the node.

**LND's sync check is required as well as its liveness**, so Helipad does not start against a node that is still catching up and would show an incomplete picture.

LND's gRPC address is resolved over the internal bridge, and **the service refuses to start if it does not resolve** rather than coming up disconnected. LND publishes that binding only after its wallet has first been unlocked, so the reactive read heals onto the real address at that point and then stays stable across later lock and unlock cycles.

The certificate is pinned from the mount, and covers the bridge address LND is dialed at.

## Network Access and Interfaces

One interface.

| Interface | Id   | Type | Port | Description               |
| --------- | ---- | ---- | ---- | ------------------------- |
| Web UI    | `ui` | ui   | 2112 | The Helipad web interface |

Bound on the `ui-multi` MultiHost over HTTP and not masked. Helipad's own login gates it, using the password from the store.

## Installation and First-Run Flow

Install raises a critical task to set the password. **Nothing runs until it is done** — `main` throws without one, so this is not a prompt that can be ignored.

After that the ordering is LND's: the service will not start until LND is running, synced, and has been unlocked at least once so its gRPC binding exists. All three are enforced rather than assumed.

Once running, Helipad begins recording boostagrams as they arrive. It shows what it has seen since it started — there is no backfill of payments that arrived before it was installed.

## Actions

One action.

### Set/Reset Password

Generates a new web login password and shows it once. Run it when its task appears, or to rotate the credential.

- **What it changes:** the password in the store.
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

The `main` volume is copied wholesale — `sdk.Backups.ofVolumes('main')`. That is the boostagram history, the password, **and the copy of LND's admin macaroon**.

**Treat this backup as a Lightning credential**, not just an application backup. The macaroon copy in it grants full control of the node it came from.

A restored instance comes back with its history and its password, and re-copies the macaroon from whatever LND is present on the new server — so the stale copy in the backup is replaced rather than used. It still needs LND installed, unlocked, and synced before it will start.

## Limitations and Differences

1. **A copy of LND's admin macaroon is on the volume**, and therefore in every backup.
2. **The password cannot be chosen**, only generated — and rotating it restarts the service.
3. **The service will not start without a password**, without LND, or before LND's wallet has been unlocked once.
4. **No backfill.** Helipad records boostagrams from when it starts; earlier payments are not imported.
5. **Mainnet only.** The macaroon path is pinned to Bitcoin mainnet.
6. **No configuration surface** beyond the password; everything else is Helipad's own.

---

## Quick Reference for AI Consumers

```yaml
package_id: helipad
image: podcastindexorg/podcasting20-helipad
architectures:
  - x86_64
  - aarch64
subcontainers:
  - helipad-sub # the setup oneshot and the daemon
volumes:
  main: /data # LND's main volume is mounted read-only at /mnt/lnd
file_models:
  - store.json # the web login password, in plaintext
startos_managed_env_vars:
  - HELIPAD_DATABASE_DIR
  - HELIPAD_LISTEN_PORT
  - HELIPAD_RUNAS_USER
  - HELIPAD_PASSWORD
  - LND_ADMINMACAROON # a copy on this package's own volume
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
