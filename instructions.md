# Helipad

Helipad needs a login password before you can open it. On first install StartOS posts a critical task to generate one — save the value it returns, because it is shown only once.

## Documentation

- [Helipad upstream README](https://github.com/Podcastindex-org/helipad) — the upstream project page, with feature overview, screenshots, and notes on how Helipad works with Podcasting 2.0 apps.

## What you get on StartOS

- A **Web UI** for browsing Lightning boosts, boostagram messages, and streaming sats that listeners send to your podcasts via Podcasting 2.0 apps.
- A pre-wired connection to your **LND** node — Helipad reads the admin macaroon and TLS cert from LND's volume on every start, so there is nothing to copy or paste in.
- A login password generated and stored by StartOS. Helipad's other behavior (database, sounds, webhook config, web-UI preferences) is left to the upstream defaults and can be tuned from inside the Helipad UI.

## Getting set up

Install **LND** first — Helipad will not start without it.

1. After install, run the **Set/Reset Password** task that StartOS surfaces as a critical task. It generates a random 22-character password and shows it once. Copy it to a password manager before dismissing.
2. Start the service.
3. Open the **Web UI** interface and log in with the password from step 1.

## Using Helipad

### Web UI

The **Web UI** is Helipad's full interface: incoming boosts and boostagrams, streaming-sats counters, sound notifications, webhook configuration, and all other settings live there. Configure podcasts, alerts, and display options from inside the Helipad UI.

### Actions

- **Set/Reset Password** — generates a new random Helipad login password and shows it once. Run this if you lose the password or want to rotate it. After running, restart Helipad and log in with the new password.
