declare const process: {
  env: Record<string, string | undefined>
}

const ALLOWED_ENDPOINTS = new Set([
  'audio/transcriptions',
  'chat/completions',
])

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: { Allow: 'POST' },
    })
  }

  const endpoint = new URL(request.url).pathname.replace(/^\/api\/groq\/?/, '')
  if (!ALLOWED_ENDPOINTS.has(endpoint)) {
    return Response.json({ error: 'Unsupported Groq endpoint.' }, { status: 404 })
  }

  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'Groq API is not configured on the server.' }, { status: 503 })
  }

  const headers = new Headers()
  const contentType = request.headers.get('content-type')
  if (contentType) headers.set('Content-Type', contentType)
  headers.set('Authorization', `Bearer ${apiKey}`)

  try {
    const upstream = await fetch(`https://api.groq.com/openai/v1/${endpoint}`, {
      method: 'POST',
      headers,
      body: await request.arrayBuffer(),
    })
    const responseHeaders = new Headers()
    const upstreamContentType = upstream.headers.get('content-type')
    if (upstreamContentType) responseHeaders.set('Content-Type', upstreamContentType)

    return new Response(await upstream.arrayBuffer(), {
      status: upstream.status,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('Groq API proxy request failed:', error)
    return Response.json({ error: 'Could not reach the Groq API.' }, { status: 502 })
  }
}
