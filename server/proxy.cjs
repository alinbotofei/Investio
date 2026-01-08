require('dotenv').config()
const express = require('express')
const cors = require('cors')
const fetch = global.fetch || require('node-fetch')

const app = express()
app.use(cors())
app.use(express.json())

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
if (!OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY not set — /api/chat will return 500 until configured')
}

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body || {}
    if (!message) return res.status(400).json({ error: 'Missing message' })
    if (!OPENAI_API_KEY) return res.status(500).json({ error: 'OpenAI API key not configured' })
    const model = process.env.PROXY_MODEL || 'gpt-5-nano'
    if (typeof model !== 'string' || !model.startsWith('gpt-5')) {
      return res.status(400).json({ error: 'Only gpt-5-nano is supported by this proxy. Set PROXY_MODEL=gpt-5-nano.' })
    }
    // Încearcă automat cu max_output_tokens mari, pentru răspunsuri normale
    const tryTokens = [1024, 2048, 4096, 8192, 16384]
    let assistant = ''
    let lastDebug = ''
    for (const maxOutput of tryTokens) {
      const responsesBody = {
        model,
        input: message,
        max_output_tokens: maxOutput
      }
      console.log('Calling Responses API with body:', JSON.stringify(responsesBody))
      const resp = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify(responsesBody)
      })
      const raw = await resp.text()
      console.log('OpenAI raw response:', raw)
      let data = {}
      try { data = raw ? JSON.parse(raw) : {} } catch (e) { data = {} }
      // Extrage orice text util
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
      assistant = assistant || data?.output_text || ''
      if (assistant) break
      // Salvează motivul pentru debugging
      const debug = []
      if (data.status) debug.push('status: ' + data.status)
      if (data.incomplete_details?.reason) debug.push('reason: ' + data.incomplete_details.reason)
      if (data.error) debug.push('error: ' + JSON.stringify(data.error))
      lastDebug = debug.length ? debug.join(' | ') : ''
    }
    if (!assistant) {
      // Dacă mesajul e foarte lung, anunță politicos
      if (String(message).length > 4000) {
        assistant = 'Mesajul tău este prea lung pentru a primi un răspuns complet. Te rugăm să îl scurtezi sau să îl împarți în mai multe părți.'
      } else {
        assistant = 'Nu am putut genera un răspuns complet. Încearcă să reformulezi întrebarea sau să folosești un mesaj mai scurt.'
        if (lastDebug) assistant += `\n[Detalii tehnice: ${lastDebug}]`
      }
    }
    return res.json({ text: assistant })
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: String(err) })
  }
})

const port = process.env.PROXY_PORT || 3001
const server = app.listen(port, () => console.log(`Proxy server listening on http://localhost:${port}`))

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${port} already in use. If another proxy is running, stop it or set PROXY_PORT.`)
    process.exit(1)
  }
  console.error('Proxy server error', err)
  process.exit(1)
})
