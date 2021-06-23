export const FRAMEWORK_WITH_OWNER_LIST = [
  { name: 'svelte', owner: 'sveltejs' },
  { name: 'react', owner: 'facebook' },
  { name: 'vue', owner: 'vuejs' },
] as const

export type Frameworks = typeof FRAMEWORK_WITH_OWNER_LIST[number]['name']
