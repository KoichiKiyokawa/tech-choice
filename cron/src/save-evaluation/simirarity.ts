import { calcCodeSimilarity } from '../evaluation/similarity'
import { combinationIterator } from '../utils/math'

async function fetchCodeFromUrl(url: string): Promise<string> {
  return fetch(url).then((res) => res.text())
}

const frameworkNameToURL: { name: string; url: string }[] = [
  {
    name: 'react',
    url: 'https://raw.githubusercontent.com/gothinkster/react-redux-realworld-example-app/master/src/components/Login.js',
  },
  {
    name: 'vue',
    url: 'https://raw.githubusercontent.com/gothinkster/vue-realworld-example-app/master/src/views/Login.vue',
  },
  {
    name: 'svelte',
    url: 'https://raw.githubusercontent.com/sveltejs/realworld/master/src/routes/login/index.svelte',
  },
]

;(async function () {
  for (const [fwA, fwB] of combinationIterator(frameworkNameToURL)) {
    const [codeA, codeB] = await Promise.all([fwA.url, fwB.url].map(fetchCodeFromUrl))
    const sim = calcCodeSimilarity(codeA, codeB)
    console.log(`${fwA.name} vs ${fwB.name} : ${sim}`)
  }
})()
