// eslint-disable-next-line @typescript-eslint/no-var-requires
const purgecss = require('@fullhuman/postcss-purgecss')

// FIXME: purgeがうまく効かない
module.exports = {
  ...(process.env.NODE_ENV === 'production' && {
    plugins: [
      purgecss({
        content: ['./src/**/*.svelte'],
      }),
    ],
  }),
}
