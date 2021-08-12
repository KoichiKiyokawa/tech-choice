export type Frameworks =
  | 'svelte'
  | 'react'
  | 'vue'
  | 'aurelia'
  | 'ember.js'
  | 'hyperapp'
  | 'imba'
  | 'neo'
  | 'owl'
  | 'san'

export const FRAMEWORK_WITH_OWNER_LIST: { name: Frameworks; owner: string }[] = [
  { name: 'react', owner: 'facebook' },
  { name: 'vue', owner: 'vuejs' },
  { name: 'svelte', owner: 'sveltejs' },
  { name: 'aurelia', owner: 'aurelia' },
  { name: 'ember.js', owner: 'emberjs' },
  { name: 'hyperapp', owner: 'jorgebucaran' },
  { name: 'imba', owner: 'imba' },
  { name: 'neo', owner: 'neomjs' },
  { name: 'owl', owner: 'odoo' },
  { name: 'san', owner: 'baidu' },
]
