<!--
  Icon row for an entry card. Replaces text-only github + article links with
  brand-colored SVG icons so platforms stay visually distinguishable (Qiita in
  particular is hard to recognize silhouette-only).

  Rendered order (anchor with title for hover tooltips):
    GitHub -> X -> Qiita -> dev.to -> JA article badge (sen-only fallback)
-->
<script lang="ts">
  import type { Entry, Lang } from '../types';
  import GitHubIcon from './icons/GitHubIcon.svelte';
  import XIcon from './icons/XIcon.svelte';
  import QiitaIcon from './icons/QiitaIcon.svelte';
  import DevToIcon from './icons/DevToIcon.svelte';

  type Props = { entry: Entry; lang: Lang };
  let { entry, lang }: Props = $props();

  let qiita = $derived(entry.articles.find((a) => a.platform === 'qiita'));
  let devto = $derived(entry.articles.find((a) => a.platform === 'devto'));
  let sen = $derived(entry.articles.find((a) => a.platform === 'sen'));
  let twitter = $derived(entry.social?.twitter);

  let hasAny = $derived(
    !!(entry.github || twitter || qiita || devto || sen)
  );
</script>

{#if hasAny}
  <div class="icon-links">
    {#if entry.github}
      <a
        href={entry.github}
        class="icon-link"
        target="_blank"
        rel="noopener"
        title="GitHub"
      >
        <GitHubIcon />
      </a>
    {/if}
    {#if twitter}
      <a
        href={twitter}
        class="icon-link"
        target="_blank"
        rel="noopener"
        title="X (Twitter)"
      >
        <XIcon />
      </a>
    {/if}
    {#if qiita}
      <a
        href={qiita.url}
        class="icon-link"
        target="_blank"
        rel="noopener"
        title="Qiita"
      >
        <QiitaIcon />
      </a>
    {/if}
    {#if devto}
      <a
        href={devto.url}
        class="icon-link"
        target="_blank"
        rel="noopener"
        title="dev.to"
      >
        <DevToIcon />
      </a>
    {/if}
    {#if sen && !qiita}
      <a
        href={sen.url}
        class="article-badge"
        target="_blank"
        rel="noopener"
        title={lang === 'ja' ? 'JA 記事' : 'Japanese article'}
      >
        {lang === 'ja' ? '記事' : 'JA'}
      </a>
    {/if}
  </div>
{/if}
