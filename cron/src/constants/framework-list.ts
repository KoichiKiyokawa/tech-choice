export type Frameworks = 'svelte' | 'react' | 'vue'

export const FRAMEWORK_WITH_OWNER_LIST: { name: Frameworks; owner: string }[] = [
  { name: 'svelte', owner: 'sveltejs' },
  { name: 'react', owner: 'facebook' },
  { name: 'vue', owner: 'vuejs' },
]
