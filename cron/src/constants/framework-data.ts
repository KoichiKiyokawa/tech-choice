import { Frameworks } from './framework-list'

export const FRAMEWORK_DATA: { name: Frameworks; codeURLs: string[]; officialURL: string }[] = [
  {
    name: 'react',
    codeURLs: [
      'https://raw.githubusercontent.com/gothinkster/react-redux-realworld-example-app/master/src/components/Login.js',
    ],
    officialURL: 'https://reactjs.org/',
  },
  {
    name: 'vue',
    codeURLs: [
      'https://raw.githubusercontent.com/gothinkster/vue-realworld-example-app/master/src/views/Login.vue',
    ],
    officialURL: 'https://vuejs.org/',
  },
  {
    name: 'svelte',
    codeURLs: [
      'https://raw.githubusercontent.com/sveltejs/realworld/master/src/routes/login/index.svelte',
    ],
    officialURL: 'https://svelte.dev/',
  },
  {
    name: 'aurelia',
    codeURLs: [
      'https://raw.githubusercontent.com/gothinkster/aurelia-realworld-example-app/master/src/components/auth/auth-component.html',
      'https://raw.githubusercontent.com/gothinkster/aurelia-realworld-example-app/master/src/components/auth/auth-component.js',
    ],
    officialURL: 'http://aurelia.io/',
  },
  {
    name: 'ember.js',
    codeURLs: [
      'https://github.com/gothinkster/ember-realworld/raw/master/app/components/login-form.hbs',
      'https://github.com/gothinkster/ember-realworld/raw/master/app/components/login-form.js',
    ],
    officialURL: 'https://emberjs.com/',
  },
  {
    name: 'hyperapp',
    codeURLs: [
      'https://raw.githubusercontent.com/kwasniew/hyperapp2-real-world-example/master/src/pages/auth.js',
    ],
    officialURL: 'https://github.com/jorgebucaran/hyperapp',
  },
  {
    name: 'imba',
    codeURLs: [
      'https://raw.githubusercontent.com/cartonalexandre/imba-realworld-example-app/master/src/components/login.imba',
    ],
    officialURL: 'https://imba.io/',
  },
  {
    name: 'neo',
    codeURLs: [
      'https://github.com/neomjs/neomjs-realworld-example-app/raw/master/apps/realworld/view/user/SignUpComponent.mjs',
    ],
    officialURL:
      'https://neomjs.github.io/pages/node_modules/neo.mjs/dist/production/apps/website/index.html#mainview=blog',
  },
  {
    name: 'owl',
    codeURLs: ['https://github.com/Coding-Dodo/owl-realworld-app/raw/main/src/pages/LogIn.js'],
    officialURL: 'https://odoo.github.io/owl/',
  },
  {
    name: 'san',
    codeURLs: ['https://github.com/ecomfe/san-realworld-app/raw/master/src/user/login.js'],
    officialURL: 'https://baidu.github.io/san/',
  },
]
