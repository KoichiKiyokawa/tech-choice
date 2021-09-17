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
  | 'solid'
  | 'angular'
  | 'apprun'
  | 'dojo'
  | 'preact'
  | 'riot'
  | 'stencil'
// | 'wesib' // スター数0でマイナーすぎる & web componentsを使っているせいでテンプレート部分のコードが違いすぎるのでスキップ

export const FRAMEWORK_WITH_OWNER_LIST: {
  name: Frameworks
  repoName?: string
  npmName?: string
  owner: string
}[] = [
  { name: 'react', owner: 'facebook' },
  { name: 'vue', owner: 'vuejs' },
  { name: 'svelte', owner: 'sveltejs' },
  { name: 'aurelia', owner: 'aurelia' },
  { name: 'ember.js', npmName: 'ember-cli', owner: 'emberjs' },
  { name: 'hyperapp', owner: 'jorgebucaran' },
  { name: 'imba', owner: 'imba' },
  { name: 'neo', owner: 'neomjs' },
  { name: 'owl', owner: 'odoo', npmName: '@odoo/owl' },
  { name: 'san', owner: 'baidu' },
  { name: 'solid', owner: 'solidjs', npmName: 'solid-js' },
  { name: 'angular', owner: 'angular', npmName: '@angular/core' },
  { name: 'apprun', owner: 'yysun' },
  { name: 'dojo', repoName: 'framework', npmName: '@dojo/framework', owner: 'yysun' },
  { name: 'preact', owner: 'preactjs' },
  { name: 'riot', owner: 'riot' },
  { name: 'stencil', owner: 'ionic-team', npmName: '@stencil/core' },
]
