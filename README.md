# portfolio-app-sveltekit

[![Demo](https://img.shields.io/badge/demo-sen.ltd%2Fportfolio%2Fportfolio--app--sveltekit%2F-7cc4ff)](https://sen.ltd/portfolio/portfolio-app-sveltekit/)

SEN Portfolio ブラウザの **SvelteKit 実装**。`adapter-static` による SPA モード、Svelte 5 Runes、ファイルベースルーティングを使った比較シリーズ第 6 弾。

**Live demo**: https://sen.ltd/portfolio/portfolio-app-sveltekit/

![Screenshot](./docs/screenshot.png)

## バンドルサイズ比較（更新）

| 実装 | main JS | gzip | 対 React |
|---|---|---|---|
| React 18 (021) | 151.01 kB | 48.84 kB | — |
| Vue 3 (022) | 73.65 kB | 28.76 kB | −41% |
| Svelte 5 (023) | 49.78 kB | 18.92 kB | −61% |
| SolidJS (024) | 21.97 kB | 8.33 kB | −83% |
| Nuxt 3 (025) | 138.96 kB | 52.01 kB | +6% |
| **SvelteKit (026)** | **86.75 kB** | **32.50 kB** | **−33%** |

SvelteKit は素の Svelte 5 よりバンドルが大きくなります。Svelte 5 単体（entry 023）が 18.92 kB gzip だったのに対し、SvelteKit は 32.50 kB と約 13 kB 増えています。この差分は SvelteKit のルーター・プリレンダラー・クライアントナビゲーション等の基盤コードです。それでも React や Nuxt より小さく、フルフレームワークとしては軽量な部類です。

## 共通コード

`src/types.ts`, `src/filter.ts`, `src/data.ts`, `src/style.css`, `tests/filter.test.ts` は他の実装と byte-identical。差分は `src/routes/+page.svelte` と `src/i18n.ts`（framework 名のみ差分）。

## SvelteKit 独自のポイント

### ファイルベースルーティングと `+page.svelte`
SvelteKit では `src/routes/` 以下のファイル構造がそのままルートになります。今回は単一ページなので `+page.svelte` 1 枚だけですが、将来的に `/entries/[slug]` のような詳細ページを追加する場合でも `src/routes/entries/[slug]/+page.svelte` を置くだけで対応できます。Nuxt の `pages/` と同じ思想ですが、ファイル名の規約（`+page.svelte`、`+layout.ts`、`+server.ts`）が明示的でディレクトリ内の役割が把握しやすい点が特徴です。

### `adapter-static` と SPA モード
`+layout.ts` に `export const ssr = false; export const prerender = true;` を書くと、SvelteKit は SSR なしの静的 SPA として動作します。`adapter-static` の `fallback: 'index.html'` と組み合わせることで、任意の URL への直接アクセスも `index.html` にフォールバックされ、クライアントサイドルーティングが機能します。今回は CloudFront + S3 への静的デプロイを前提としているため、このモードが最適です。

### Svelte 5 Runes モード
entry 023 の素の Svelte 5 ポートと同じく Runes（`$state`、`$derived`、`$effect`）を使っています。`$derived` で派生値を宣言的に書けるため、SolidJS の `createMemo` に相当する表現が自然に書けます。SvelteKit 環境でも Svelte 4 の `writable`/`readable` ストアではなく Runes を選ぶことで、コンポーネントローカルな状態管理が完結し、ストアのボイラープレートが不要です。

### ローカル開発のデータ配信
Nuxt のように専用サーバーレイヤーはありませんが、`vite.config.ts` の `configureServer` フックで `/data.json` を `../../data/entries.json` から配信するミドルウェアを差し込んでいます。これは SolidJS・React・Vue ポートと同じパターンです。本番では `/portfolio/data.json`（CDN）から取得するため、ビルド成果物には一切含まれません。

## ローカル起動

```sh
npm install
npm run dev
# → http://localhost:5173/portfolio/portfolio-app-sveltekit/
```

## テスト

```sh
npm test
```

14 vitest ケース（共有の `filter.ts` を node environment で実行）。

## ライセンス

MIT. See [LICENSE](./LICENSE).

---

Part of the [SEN portfolio series](https://sen.ltd/portfolio/). Entry 026.
