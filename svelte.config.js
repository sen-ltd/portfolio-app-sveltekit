import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  kit: {
    adapter: adapter({
      fallback: 'index.html',
    }),
    paths: {
      base: '/portfolio/portfolio-app-sveltekit',
    },
    prerender: {
      handleHttpError: ({ status, path }) => {
        // Ignore missing favicon and other static asset 404s
        if (status === 404 && (path.endsWith('.png') || path.endsWith('.ico') || path.endsWith('.svg'))) {
          return;
        }
        throw new Error(`${status} ${path}`);
      },
    },
  },
};

export default config;
