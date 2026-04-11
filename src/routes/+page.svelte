<script lang="ts">
  import '../style.css';
  import type { Lang } from '../types';
  import type { FilterState, SortKey } from '../filter';
  import { filterAndSort } from '../filter';
  import { loadPortfolioData } from '../data';
  import { MESSAGES, detectDefaultLang } from '../i18n';
  import type { PortfolioData } from '../types';

  // ---- State (Svelte 5 Runes) -----------------------------------------------

  let lang = $state<Lang>(readLangFromQuery() ?? detectDefaultLang());
  let filter = $state<FilterState>(readQuery());

  let data = $state<PortfolioData | null>(null);
  let loadError = $state<string | null>(null);

  $effect(() => {
    loadPortfolioData()
      .then((d) => { data = d; })
      .catch((e: unknown) => { loadError = String(e); });
  });

  let m = $derived(MESSAGES[lang]);

  let visible = $derived(data ? filterAndSort(data.entries, filter, lang) : []);

  let stackMap = $derived(() => {
    const map = new Map<string, { id: string; name: string; color: string }>();
    if (data) for (const s of data.stacks) map.set(s.id, s);
    return map;
  });

  let stageMap = $derived(() => {
    const map = new Map<string, { id: string; icon: string; name: { ja: string; en: string } }>();
    if (data) for (const s of data.stages) map.set(s.id, s);
    return map;
  });

  let categoryMap = $derived(() => {
    const map = new Map<string, { id: string; name: { ja: string; en: string } }>();
    if (data) for (const c of data.categories) map.set(c.id, c);
    return map;
  });

  $effect(() => {
    writeQuery(filter, lang);
  });

  function updateFilter<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    filter = { ...filter, [key]: value };
  }

  // ---- URL query sync -------------------------------------------------------

  function readLangFromQuery(): Lang | null {
    if (typeof window === 'undefined') return null;
    const q = new URLSearchParams(window.location.search);
    const v = q.get('lang');
    return v === 'ja' || v === 'en' ? v : null;
  }

  function readQuery(): FilterState {
    if (typeof window === 'undefined') return defaultFilter();
    const q = new URLSearchParams(window.location.search);
    return {
      query: q.get('q') ?? '',
      category: q.get('category') ?? 'all',
      stack: q.get('stack') ?? 'all',
      stage: q.get('stage') ?? 'all',
      sort: (q.get('sort') as SortKey) ?? 'number',
    };
  }

  function writeQuery(f: FilterState, l: Lang) {
    if (typeof window === 'undefined') return;
    const q = new URLSearchParams();
    if (f.query) q.set('q', f.query);
    if (f.category !== 'all') q.set('category', f.category);
    if (f.stack !== 'all') q.set('stack', f.stack);
    if (f.stage !== 'all') q.set('stage', f.stage);
    if (f.sort !== 'number') q.set('sort', f.sort);
    q.set('lang', l);
    const qs = q.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', url);
  }

  function defaultFilter(): FilterState {
    return { query: '', category: 'all', stack: 'all', stage: 'all', sort: 'number' };
  }
</script>

{#if loadError}
  <div class="state state-error">
    {m.errorLabel}: {loadError}
  </div>
{:else if !data}
  <div class="state state-loading">{m.loadingLabel}</div>
{:else}
  <header class="site-header">
    <div class="header-top">
      <a class="home-link" href="/">{m.homeLabel}</a>
      <div class="lang-switch">
        <label for="lang-select">{m.langLabel}</label>
        <select id="lang-select" value={lang} onchange={(e) => (lang = (e.currentTarget as HTMLSelectElement).value as Lang)}>
          <option value="ja">JA</option>
          <option value="en">EN</option>
        </select>
      </div>
    </div>
    <h1>{m.title}</h1>
    <p class="subtitle">{m.subtitle}</p>
    <p class="meta">
      {m.totalCount(data.entries.length)}　·　{m.lastUpdated(data.updatedAt)}　·
      {m.framework}
    </p>
  </header>

  <main>
    <section class="controls">
      <input
        type="text"
        class="search"
        placeholder={m.searchPlaceholder}
        value={filter.query}
        oninput={(e) => updateFilter('query', (e.currentTarget as HTMLInputElement).value)}
      />

      <div class="filters">
        <label class="select-wrap">
          <span class="select-label">{m.categoryLabel}</span>
          <select
            value={filter.category}
            onchange={(e) => updateFilter('category', (e.currentTarget as HTMLSelectElement).value)}
          >
            <option value="all">{m.allLabel}</option>
            {#each data.categories as c}
              <option value={c.id}>{c.name[lang]}</option>
            {/each}
          </select>
        </label>

        <label class="select-wrap">
          <span class="select-label">{m.stackLabel}</span>
          <select
            value={filter.stack}
            onchange={(e) => updateFilter('stack', (e.currentTarget as HTMLSelectElement).value)}
          >
            <option value="all">{m.allLabel}</option>
            {#each data.stacks as s}
              <option value={s.id}>{s.name}</option>
            {/each}
          </select>
        </label>

        <label class="select-wrap">
          <span class="select-label">{m.stageLabel}</span>
          <select
            value={filter.stage}
            onchange={(e) => updateFilter('stage', (e.currentTarget as HTMLSelectElement).value)}
          >
            <option value="all">{m.allLabel}</option>
            {#each data.stages as s}
              <option value={s.id}>{s.icon} {s.name[lang]}</option>
            {/each}
          </select>
        </label>

        <label class="select-wrap">
          <span class="select-label">{m.sortLabel}</span>
          <select
            value={filter.sort}
            onchange={(e) => updateFilter('sort', (e.currentTarget as HTMLSelectElement).value as SortKey)}
          >
            <option value="number">{m.sortNumber}</option>
            <option value="newest">{m.sortNewest}</option>
            <option value="oldest">{m.sortOldest}</option>
            <option value="name">{m.sortName}</option>
          </select>
        </label>
      </div>

      <div class="result-count">
        {m.filteredCount(visible.length, data.entries.length)}
      </div>
    </section>

    {#if visible.length > 0}
      <section class="grid">
        {#each visible as entry}
          {@const stage = stageMap().get(entry.stage)}
          {@const category = categoryMap().get(entry.category)}
          <article class="card">
            <div class="card-head">
              <span class="entry-number">#{String(entry.number).padStart(3, '0')}</span>
              {#if stage}
                <span class="stage-badge">{stage.icon} {stage.name[lang]}</span>
              {/if}
            </div>
            <h2 class="entry-name">{entry.name[lang]}</h2>
            {#if category}
              <div class="category">{category.name[lang]}</div>
            {/if}
            <p class="pitch">{entry.pitch[lang]}</p>
            <div class="tech-row">
              {#each entry.tech as techId}
                {@const stack = stackMap().get(techId)}
                <span
                  class="tech-chip"
                  style="border-left-color: {stack?.color ?? '#272b35'}"
                >
                  {stack?.name ?? techId}
                </span>
              {/each}
            </div>
            <div class="actions">
              {#if entry.demo}
                <a href={entry.demo} class="action-btn primary" target="_blank" rel="noopener">
                  ↗ {m.demoLabel}
                </a>
              {/if}
              {#if entry.github}
                <a href={entry.github} class="action-btn" target="_blank" rel="noopener">
                  {m.githubLabel}
                </a>
              {/if}
              {#if entry.articles.length > 0}
                <div class="articles">
                  {#each entry.articles as a}
                    <a href={a.url} class="article-link" target="_blank" rel="noopener">
                      {a.platform}
                    </a>
                  {/each}
                </div>
              {/if}
              {#if entry.testCount && entry.testCount > 0}
                <span class="tests-badge">{m.testsLabel(entry.testCount)}</span>
              {/if}
            </div>
          </article>
        {/each}
      </section>
    {:else}
      <p class="empty">{m.noResults}</p>
    {/if}
  </main>

  <footer class="site-footer">
    <span>SEN 合同会社 · SvelteKit (adapter-static + TypeScript + Vite) · entry 026</span>
  </footer>
{/if}
