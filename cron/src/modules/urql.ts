import { createClient } from '@urql/core'
import fetch from 'node-fetch'
import { GITHUB_TOKEN } from '../env'

export const urql = createClient({
  url: 'https://api.github.com/graphql',
  // @ts-ignore
  fetch,
  fetchOptions: {
    headers: {
      authorization: `Bearer ${GITHUB_TOKEN}`, // なんの権限も付与していないトークンでOK
    },
  },
})
