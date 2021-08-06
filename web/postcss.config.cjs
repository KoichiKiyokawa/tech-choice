// eslint-disable-next-line @typescript-eslint/no-var-requires
const purgecss = require('@fullhuman/postcss-purgecss')

module.exports = {
  ...(process.env.NODE_ENV === 'production' && {
    plugins: [
      // FIXME: purgeがうまく効かない
      // purgecss({
      //   content: ['./src/**/*.svelte'],
      // }),
    ],
  }),
}
