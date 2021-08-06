export type Frameworks = 'svelte' | 'react' | 'vue'

export const FRAMEWORK_WITH_OWNER_LIST: { name: Frameworks; owner: string; codeURL: string }[] = [
  {
    name: 'svelte',
    owner: 'sveltejs',
    codeURL:
      'https://raw.githubusercontent.com/sveltejs/realworld/master/src/routes/login/index.svelte',
  },
  {
    name: 'react',
    owner: 'facebook',
    codeURL:
      'https://raw.githubusercontent.com/gothinkster/react-redux-realworld-example-app/master/src/components/Login.js',
  },
  {
    name: 'vue',
    owner: 'vuejs',
    codeURL:
      'https://raw.githubusercontent.com/gothinkster/vue-realworld-example-app/master/src/views/Login.vue',
  },
]
