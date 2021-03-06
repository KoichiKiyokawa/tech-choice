import adapter from '@sveltejs/adapter-static'
import { resolve } from 'path'
import preprocess from 'svelte-preprocess'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess({ postcss: false }), // TODO: purge css

  kit: {
    // hydrate the <div id="svelte"> element in src/app.html
    target: '#svelte',
    adapter: adapter(),
    ssr: false,
    vite: {
      resolve: {
        alias: {
          '~': resolve('src'),
        },
      },
    },
  },
}

export default config
