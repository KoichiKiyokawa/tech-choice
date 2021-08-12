import { Frameworks } from './framework-list'

export const FRAMEWORK_DATA: { name: Frameworks; codeURL: string; officialURL: string }[] = [
  {
    name: 'react',
    codeURL:
      'https://raw.githubusercontent.com/gothinkster/react-redux-realworld-example-app/master/src/components/Login.js',
    officialURL: 'https://reactjs.org/',
  },
  {
    name: 'vue',
    codeURL:
      'https://raw.githubusercontent.com/gothinkster/vue-realworld-example-app/master/src/views/Login.vue',
    officialURL: 'https://vuejs.org/',
  },
  {
    name: 'svelte',
    codeURL:
      'https://raw.githubusercontent.com/sveltejs/realworld/master/src/routes/login/index.svelte',
    officialURL: 'https://svelte.dev/',
  },
]
