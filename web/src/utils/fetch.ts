import { BACKEND_ORIGIN } from '~/env.sample'

export async function baseFetch<Body = Record<string, unknown>, Response = void>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  data?: Body,
): Promise<{ data: Response | null; error: Error | null; status: number }> {
  const res = await fetch(`${BACKEND_ORIGIN}/${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method,
    ...(data && { body: JSON.stringify(data) }),
    credentials: 'include', // keep cookies for any domain
  })

  if (!res.ok) return { data: null, error: new Error(res.statusText), status: res.status }

  try {
    return { data: await res.json(), error: null, status: res.status }
  } catch (err) {
    return { data: null, error: err, status: -1 }
  }
}
