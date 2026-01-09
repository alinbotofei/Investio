import { NextRequest, NextResponse } from 'next/server'

const API_CONFIG = {
  OPENAI_MODEL: 'gpt-5-nano',
  MAX_OUTPUT_TOKENS: [1024, 2048, 4096, 8192, 16384],
  MAX_MESSAGE_LENGTH: 4000,
} as const

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()
    
    if (!message) {
      return NextResponse.json({ error: 'Missing message' }, { status: 400 })
    }

    const OPENAI_API_KEY = process.env.OPENAI_API_KEY
    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 })
    }

    const model = process.env.PROXY_MODEL || API_CONFIG.OPENAI_MODEL
    let assistant = ''

    for (const maxOutput of API_CONFIG.MAX_OUTPUT_TOKENS) {
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
      let data: any = {}
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
      if (String(message).length > API_CONFIG.MAX_MESSAGE_LENGTH) {
        assistant = 'Your message is too long to generate a complete response. Please shorten it or use multiple messages.'
      } else {
        assistant = 'Unable to generate a complete response. Try rephrasing your question or using a shorter message.'
      }
    }

    return NextResponse.json({ text: assistant })
  } catch (error) {
    return NextResponse.json(
      { error: 'Server error', details: String(error) },
      { status: 500 }
    )
  }
}
