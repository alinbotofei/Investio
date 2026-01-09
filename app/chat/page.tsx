'use client'

import { useEffect, useRef, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import Icon from '../components/ui/Icon'
import { Message } from '../lib/types'
import { SUGGESTION_BTN_PRIMARY, SUGGESTION_BTN_SECONDARY } from '../lib/constants'

export default function ChatPage() {
  const [value, setValue] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const messagesRef = useRef<HTMLDivElement | null>(null)
  const landingTextareaRef = useRef<HTMLTextAreaElement | null>(null)
  const chatTextareaRef = useRef<HTMLTextAreaElement | null>(null)

  const placeholderWords = ['your portfolio', 'market trends', 'investment strategies', 'crypto opportunities', 'stock analysis', 'financial goals']

  useEffect(() => {
    const el = messagesRef.current
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight
      })
    }
  }, [messages, loading])

  useEffect(() => {
    const ta = landingTextareaRef.current || chatTextareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(140, ta.scrollHeight)}px`
  }, [value])

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholderWords.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [placeholderWords.length])

  useEffect(() => {
    if (messages.length === 0) {
      landingTextareaRef.current?.focus()
    } else {
      chatTextareaRef.current?.focus()
    }
  }, [messages.length])

  async function send() {
    if (!value.trim()) return
    
    const id = String(Date.now())
    const userMsg: Message = { id, role: 'user', text: value.trim(), time: Date.now(), fresh: true }
    setMessages((m) => [...m, userMsg])
    setValue('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.text })
      })

      const textBody = await res.text()
      let bodyJson: any = null
      try { 
        bodyJson = textBody ? JSON.parse(textBody) : null 
      } catch (_e) { 
        bodyJson = null 
      }

      if (!res.ok) {
        const openaiErr = bodyJson?.error ?? bodyJson ?? textBody
        const errMsg = `API error: ${res.status} ${res.statusText} - ${typeof openaiErr === 'string' ? openaiErr : JSON.stringify(openaiErr)}`
        console.error('Chat request failed', { status: res.status, body: bodyJson ?? textBody })
        setMessages((m) => [...m, { id: String(Date.now() + 2), role: 'assistant', text: errMsg }])
        return
      }

      const data = bodyJson ?? { text: textBody }
      const assistant: Message = { id: String(Date.now() + 1), role: 'assistant', text: data.text ?? 'No response' }
      setMessages((m) => [...m, assistant])

      setTimeout(() => {
        setMessages((current) => current.map((x) => (x.id === id ? { ...x, fresh: false } : x)))
      }, 300)
    } catch (e: any) {
      console.error('Network error', e)
      setMessages((m) => [...m, { id: String(Date.now() + 3), role: 'assistant', text: `Network error: ${String(e.message ?? e)}` }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="w-full h-full flex flex-col bg-transparent">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-8 py-6 md:py-0">
            <div className="max-w-3xl w-full text-center">
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-semibold text-white mb-3 md:mb-4 leading-tight bg-gradient-to-r from-white via-cyan-100 to-blue-100 bg-clip-text text-transparent">Your AI Investment Partner</h1>
              <p className="text-slate-300 text-sm sm:text-base md:text-lg lg:text-xl mb-6 md:mb-8">Let&apos;s chat about your investments, explore market insights, and build your financial future together.</p>

              <div className="mt-6 md:mt-10 flex items-center justify-center">
                <div className="relative w-full md:mx-auto md:max-w-3xl">
                  <div className="relative">
                    <textarea
                      ref={landingTextareaRef}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder=" "
                      className="w-full bg-slate-800/60 border border-slate-600/40 border-[0.8px] text-white placeholder:text-white/60 p-5 md:p-8 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/20 text-base md:text-lg shadow-xl backdrop-blur-sm transition-all hover:bg-slate-800/70 min-h-[180px] md:min-h-[240px] max-h-[400px] md:max-h-[520px] input-focus input-hoverable"
                      rows={5}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                    />
                    {!value && (
                      <div className="absolute left-5 md:left-8 top-5 md:top-8 pointer-events-none text-white/60 text-base md:text-lg">
                        <span>Ask anything about </span>
                        <span
                          key={placeholderIndex}
                          className="inline-block"
                          style={{
                            animation: 'fadeScale 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                          }}
                        >
                          {placeholderWords[placeholderIndex]}
                        </span>
                        <span>...</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={send}
                    disabled={loading}
                    aria-label="Send message"
                    className="absolute right-3 bottom-3 md:right-4 md:bottom-4 w-11 h-11 md:w-12 md:h-12 flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-60"
                  >
                    {loading ? (
                      <div className="w-6 h-6">
                        <svg className="animate-spin text-white" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.18)" strokeWidth="4"></circle>
                          <path d="M22 12a10 10 0 0 0-10-10" stroke="white" strokeWidth="4" strokeLinecap="round"></path>
                        </svg>
                      </div>
                    ) : (
                      <Icon name="send" className="text-[20px]" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-5 md:mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                <button className={SUGGESTION_BTN_PRIMARY} onClick={() => setValue('What are the top technology stocks to watch?')}>
                  <Icon name="trending_up" className="text-[18px]" />
                  <span className="text-sm">Top tech stocks</span>
                </button>

                <button className={SUGGESTION_BTN_SECONDARY} onClick={() => setValue('Summarize the latest Bitcoin market drivers.')}>
                  <Icon name="currency_bitcoin" className="text-[18px]" />
                  <span className="text-sm">Crypto market summary</span>
                </button>

                <button className={SUGGESTION_BTN_SECONDARY} onClick={() => setValue('How should I allocate a $10,000 portfolio for moderate risk?')}>
                  <Icon name="pie_chart" className="text-[18px]" />
                  <span className="text-sm">Portfolio allocation</span>
                </button>

                <button className={SUGGESTION_BTN_SECONDARY} onClick={() => setValue('Compare AAPL and MSFT performance over the last year.')}>
                  <Icon name="compare_arrows" className="text-[18px]" />
                  <span className="text-sm">Compare tickers</span>
                </button>

                <button className={SUGGESTION_BTN_SECONDARY} onClick={() => setValue('Generate a watchlist for fintech stocks with strong earnings momentum.')}>
                  <Icon name="list" className="text-[18px]" />
                  <span className="text-sm">Build watchlist</span>
                </button>

                <button className={SUGGESTION_BTN_SECONDARY} onClick={() => setValue('Explain how recent CPI data could affect equity markets.')}>
                  <Icon name="insights" className="text-[18px]" />
                  <span className="text-sm">Explain macro impact</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col h-full">
            <div ref={messagesRef} className="flex-1 overflow-auto px-6 py-8 space-y-6 scroll-smooth">
              {messages.map((m, i) => (
                <div key={m.id ?? i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} items-start gap-2`}> 
                  {m.role === 'user' && (
                    <>
                      <div className="rounded-2xl px-4 py-3.5 max-w-[75vw] bg-slate-900/90 text-white font-medium font-['Plus Jakarta Sans','Inter','system-ui','sans-serif'] text-[0.95rem] leading-relaxed shadow animate-fade-in whitespace-pre-wrap border border-blue-700/30 break-words" style={{width:'fit-content'}}>{m.text}</div>
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">U</div>
                    </>
                  )}
                  {m.role !== 'user' && (
                    <>
                      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-base shadow-md flex-shrink-0">🤖</div>
                      <div className="rounded-2xl px-4 py-3.5 max-w-[75vw] bg-gradient-to-br from-blue-400/80 to-cyan-400/80 text-white font-medium font-['Plus Jakarta Sans','Inter','system-ui','sans-serif'] text-[0.95rem] leading-relaxed shadow animate-fade-in whitespace-pre-wrap break-words text-left" style={{minWidth:'60px'}}>{m.text}</div>
                    </>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex items-start justify-start gap-2">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-base shadow-md flex-shrink-0">🤖</div>
                  <div className="rounded-2xl px-4 py-3.5 bg-gradient-to-br from-blue-400/80 to-cyan-400/80 text-white font-medium font-['Plus Jakarta Sans','Inter','system-ui','sans-serif'] text-[0.95rem] leading-relaxed shadow animate-fade-in" style={{width:'fit-content'}}>
                    <div className="typing-dots">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-6 border-t border-slate-700 bg-gradient-to-t from-transparent to-black/5">
              <div className="relative flex items-end gap-3">
                <textarea
                  ref={chatTextareaRef}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Ask another question..."
                  className="flex-1 bg-slate-800/60 border border-slate-600/40 border-[0.8px] text-white p-4 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition hover:bg-slate-800/70 min-h-[88px] max-h-[300px] text-base shadow-inner input-focus input-hoverable"
                  rows={1}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                />

                <button
                  onClick={send}
                  disabled={loading}
                  aria-label="Send message"
                  className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-full shadow-md hover:scale-105 transition-transform disabled:opacity-60 self-end mb-4"
                >
                  {loading ? (
                    <div className="w-5 h-5">
                      <svg className="animate-spin text-white" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.2)" strokeWidth="4"></circle>
                        <path d="M22 12a10 10 0 0 0-10-10" stroke="white" strokeWidth="4" strokeLinecap="round"></path>
                      </svg>
                    </div>
                  ) : (
                    <Icon name="send" className="text-[20px]" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
