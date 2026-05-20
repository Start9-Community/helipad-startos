# Updating the upstream version

Helipad ships as a prebuilt Docker image. The only upstream pin is the image tag in the manifest.

## Determining the upstream version

- **Helipad** ([Podcastindex-org/helipad](https://github.com/Podcastindex-org/helipad)) — latest GitHub release:

  ```
  gh release view -R Podcastindex-org/helipad --json tagName -q .tagName
  ```

  Cross-check that the corresponding tag has been published to Docker Hub as `podcastindexorg/podcasting20-helipad`:

  ```
  curl -fsSL "https://hub.docker.com/v2/repositories/podcastindexorg/podcasting20-helipad/tags?page_size=20&ordering=last_updated" | jq -r '.results[].name'
  ```

  Pin lives in `startos/manifest/index.ts` (`images.main.source.dockerTag`).

## Applying the bump

- **`startos/manifest/index.ts`** — set `images.main.source.dockerTag` to `podcastindexorg/podcasting20-helipad:<new version>`.
