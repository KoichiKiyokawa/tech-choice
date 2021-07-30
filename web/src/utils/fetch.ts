import { BACKEND_ORIGIN } from '~/env'

export async function baseFetch<Body = Record<string, unknown>, Resp = void>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  data?: Body,
): Promise<{ data: Resp | null; error: Error | null; status: number }> {
  let res: Response
  try {
    res = await fetch(`${BACKEND_ORIGIN}/${endpoint}`, {
      headers: {
        ...(data && { 'Content-Type': 'application/json' }),
      },
      method,
      ...(data && { body: JSON.stringify(data) }),
      // credentials: 'include', // keep cookies for any domain
    })
  } catch (err) {
    return { data: null, error: err, status: 500 }
  }

  if (!res.ok) return { data: null, error: new Error(res.statusText), status: res.status }

  return { data: await res.json().catch(() => res.text), error: null, status: res.status }
}
