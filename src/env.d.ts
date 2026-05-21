// oxlint-disable-next-line @typescript-eslint/triple-slash-reference -- Astro requires this
/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    /** Current project slug, set by src/pages/works/[id].astro */
    project?: string
  }
}
