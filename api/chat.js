export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { message } = req.body || {}
  if (!message) {
    return res.status(400).json({ error: 'Missing message' })
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' })
  }

  try {
    const model = process.env.PROXY_MODEL || 'gpt-5-nano'
    const tryTokens = [1024, 2048, 4096, 8192, 16384]
    let assistant = ''

    for (const maxOutput of tryTokens) {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model,
          input: message,
          max_output_tokens: maxOutput
        })
      })

      const raw = await response.text()
      let data = {}
      try {
        data = raw ? JSON.parse(raw) : {}
      } catch (e) {
        data = {}
      }

      if (Array.isArray(data?.output)) {
        for (const item of data.output) {
          if (Array.isArray(item.content)) {
            for (const c of item.content) {
              if (c.type === 'output_text' && typeof c.text === 'string') {
                assistant = c.text
                break
              }
              if (c.type === 'message' && c?.text) {
                assistant = c.text
                break
              }
            }
            if (assistant) break
          }
        }
      }

      if (!assistant) assistant = data?.output_text || ''
      if (assistant) break
    }

    if (!assistant) {
      if (String(message).length > 4000) {
        assistant = 'Mesajul tău este prea lung pentru a primi un răspuns complet. Te rugăm să îl scurtezi sau să îl împarți în mai multe părți.'
      } else {
        assistant = 'Nu am putut genera un răspuns complet. Încearcă să reformulezi întrebarea sau să folosești un mesaj mai scurt.'
      }
    }

    return res.json({ text: assistant })
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: String(err.message) })
  }
}
