import { readFileSync, writeFileSync } from 'fs';

function fix(path, pairs, label) {
  let c = readFileSync(path, 'utf8');
  const nl = c.includes('\r\n') ? '\r\n' : '\n';
  let changed = 0;
  for (const [from, to] of pairs) {
    const f = from.replace(/\n/g, nl);
    const t = to.replace(/\n/g, nl);
    if (c.includes(f)) { c = c.split(f).join(t); changed++; console.log('  ✓', label || path, '→', from.slice(0,55).trim().replace(/\n/g,'↵')); }
    else { console.log('  ✗ MISS [' + (label||path) + ']:', from.slice(0,80).trim().replace(/\n/g,'↵')); }
  }
  if (changed) writeFileSync(path, c, 'utf8');
}

// ── 1. ChatWidget — Fix double placeholder (textarea has placeholder attr AND overlay div)
// Remove placeholder attr from textarea (set to " " space so browser never shows native)
// and also reduce min-height for compact mode — less dead space
fix('app/components/dashboard/ChatWidget.tsx', [
  // Remove the real `placeholder` attribute on textarea — only keep the animated overlay
  [
`          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={dynamicPlaceholder}
            className={`,
`          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder=" "
            className={`
  ],
  // Remove the now-unused dynamicPlaceholder variable line
  [
`  const dynamicPlaceholder = widgetPlaceholders[0]; // fallback for textarea attr
  const [value, setValue]`,
`  const [value, setValue]`
  ],
  // Reduce textarea min-height in compact mode — was 108px (3 lines), now 80px
  [
`className={\`\${TEXTAREA_BASE} w-full pr-14 sm:pr-16 xl:pr-20 min-h-[108px] max-h-[120px] xl:min-h-[120px] xl:max-h-[140px] text-base sm:text-lg xl:text-xl resize-none\`}`,
`className={\`\${TEXTAREA_BASE} w-full pr-12 min-h-[72px] max-h-[120px] text-sm resize-none\`}`
  ],
], 'ChatWidget');

// ── 2. Ticker bookmark — replace amber/yellow with indigo/violet (fits the blue/cyan app theme)
fix('app/ticker/[symbol]/page.tsx', [
  [
`                inWatchlist
                  ? "bg-gradient-to-br from-amber-500 to-yellow-400 border-yellow-300/70 shadow-[0_0_0_3px_rgba(251,191,36,0.3),0_8px_20px_-4px_rgba(251,191,36,0.5)] hover:shadow-[0_0_0_4px_rgba(251,191,36,0.4),0_10px_28px_-4px_rgba(251,191,36,0.65)] hover:scale-105"
                  : "bg-slate-800/90 border-slate-500/70 border-dashed hover:border-amber-400/60 hover:bg-slate-700/80 hover:scale-105"`,
`                inWatchlist
                  ? "bg-gradient-to-br from-violet-600 to-indigo-500 border-violet-400/60 shadow-[0_0_0_2px_rgba(139,92,246,0.25),0_6px_18px_-4px_rgba(99,102,241,0.45)] hover:shadow-[0_0_0_3px_rgba(139,92,246,0.35),0_8px_24px_-4px_rgba(99,102,241,0.6)] hover:scale-105"
                  : "bg-slate-800/90 border-slate-500/70 border-dashed hover:border-violet-400/50 hover:bg-slate-700/80 hover:scale-105"`
  ],
  // Update icon/label colors to match new violet scheme
  [
`              <Icon
                name={inWatchlist ? "bookmark" : "bookmark_add"}
                className={\`text-[20px] sm:text-[22px] leading-none transition-all duration-300 \${
                  inWatchlist ? "text-white" : "text-slate-300 group-hover/watch:text-cyan-400"
                }\`}
              />
              <span className={\`text-xs font-semibold hidden sm:inline transition-colors \${
                inWatchlist ? "text-white" : "text-slate-300 group-hover/watch:text-cyan-400"
              }\`}>`,
`              <Icon
                name={inWatchlist ? "bookmark" : "bookmark_add"}
                className={\`text-[20px] sm:text-[22px] leading-none transition-all duration-300 \${
                  inWatchlist ? "text-white" : "text-slate-300 group-hover/watch:text-violet-400"
                }\`}
              />
              <span className={\`text-xs font-semibold hidden sm:inline transition-colors \${
                inWatchlist ? "text-white" : "text-slate-300 group-hover/watch:text-violet-400"
              }\`}>`
  ],
], 'ticker/page.tsx');

// ── 3. AssetExplorer — update saved colour to match (violet/indigo)
fix('app/components/dashboard/AssetExplorer.tsx', [
  [
`                isInWatchlist(item.symbol)
                  ? "bg-gradient-to-r from-amber-500/80 to-yellow-400/80 border-yellow-400/60 text-white shadow-sm shadow-yellow-500/30 cursor-not-allowed"
                  : "bg-slate-700/60 border-slate-600 text-slate-300 hover:bg-amber-500/10 hover:border-amber-400/50 hover:text-amber-300"`,
`                isInWatchlist(item.symbol)
                  ? "bg-gradient-to-r from-violet-600/80 to-indigo-500/80 border-violet-400/50 text-white shadow-sm shadow-violet-500/20 cursor-not-allowed"
                  : "bg-slate-700/60 border-slate-600 text-slate-300 hover:bg-violet-500/10 hover:border-violet-400/40 hover:text-violet-300"`
  ],
], 'AssetExplorer');

// ── 4. scroll.ts — fix scroll logic: track useScrolledUp properly
// The problem: smoothScrollToBottom checks isNearBottom itself but the caller
// already guards with userScrolledRef. The scroll util should only care about
// scrolling — leave the guard to the caller. Rewrite cleanly.
fix('app/lib/utils/scroll.ts', [
  [
`export const smoothScrollToBottom = (
  element: HTMLElement | null,
  force = false
) => {
  if (!element) return;

  const distanceFromBottom =
    element.scrollHeight - element.scrollTop - element.clientHeight;
  const isNearBottom = distanceFromBottom < 150;

  // Synchronous scroll (no RAF) â€" prevents race condition where user scrolls
  // up during streaming and the queued RAF overrides the user's position.
  if (force || isNearBottom) {
    element.scrollTo({
      top: element.scrollHeight,
      behavior: "smooth",
    });
  }
};`,
`export const smoothScrollToBottom = (
  element: HTMLElement | null,
  force = false
) => {
  if (!element) return;
  const distanceFromBottom =
    element.scrollHeight - element.scrollTop - element.clientHeight;
  if (force || distanceFromBottom < 200) {
    element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
  }
};`
  ],
], 'scroll.ts');

// ── 5. chat/page.tsx — fix scroll: reset userScrolledRef when user sends a msg,
// track scroll correctly, and prevent the scroll calling when user scrolled up.
// Also fix the chat conversation sidebar to be a compact top-bar instead of a
// wide 320px aside that eats layout space.
fix('app/chat/page.tsx', [
  // Fix scroll: currently uses `smoothScrollToBottom(messagesRef.current)` without force —
  // meaning it only scrolls if already near bottom. But after streaming chunks the container
  // height grows so distanceFromBottom grows even though user hasn't scrolled.
  // Solution: in the messages useEffect use the userScrolledRef guard only.
  [
`  useEffect(() => {
    if (!userScrolledRef.current && messages.length > 0) {
      smoothScrollToBottom(messagesRef.current);
    }
  }, [messages]);`,
`  useEffect(() => {
    if (!userScrolledRef.current && messages.length > 0) {
      smoothScrollToBottom(messagesRef.current, true);
    }
  }, [messages]);`
  ],
  // When user sends, reset userScrolledRef so we scroll to new message
  [
`  async function handleSend(messageText?: string) {
    const textToSend = messageText || value.trim();
    if (!textToSend) return;

    userScrolledRef.current = false;`,
`  async function handleSend(messageText?: string) {
    const textToSend = messageText || value.trim();
    if (!textToSend) return;
    userScrolledRef.current = false;`
  ],
  // Replace the wide sidebar aside with a compact collapsible panel
  [
`        <aside
          className={\`fixed md:relative top-0 left-0 h-full md:h-full w-80 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-700/50 z-50 transform transition-transform duration-300 flex flex-col shadow-2xl flex-shrink-0 \${
            showConversations ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }\`}
        >
          <div className="p-5 border-b border-slate-700/30 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-cyan-500/10 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Icon name="chat_bubble" className="text-cyan-400 text-[22px]" />
              <h2 className="text-lg font-bold text-white">Chat History</h2>
            </div>
            <button
              onClick={() => setShowConversations(false)}
              className="md:hidden text-slate-400 hover:text-white transition"
            >
              <Icon name="close" className="text-[20px]" />
            </button>
          </div>

          <button
            onClick={startNewConversation}
            className="m-4 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:scale-[1.02] transition-all shadow-lg hover:shadow-cyan-500/30 flex items-center justify-center gap-2 font-semibold flex-shrink-0"
          >
            <Icon name="add_circle" className="text-[22px]" />
            New Conversation
          </button>

          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 custom-scrollbar min-h-0">
            {conversationsLoading ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="animate-spin w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full mb-3"></div>
                <p className="text-sm text-slate-400">Loading conversations...</p>
              </div>
            ) : conversationsError ? (
              <div className="text-center py-8 px-4">
                <Icon name="error_outline" className="text-red-400 text-[40px] mx-auto mb-3" />
                <p className="text-sm text-red-400 mb-2">{conversationsError}</p>
                <button
                  onClick={loadConversations}
                  className="text-xs text-cyan-400 hover:text-cyan-300 underline"
                >
                  Try again
                </button>
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Icon name="chat_bubble_outline" className="text-slate-600 text-[40px] mx-auto mb-3" />
                <p className="text-sm text-slate-500">No conversations yet</p>
                <p className="text-xs text-slate-600 mt-1">Start chatting to create your first conversation</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const lastMessage = conv.messages?.[0];
                const preview = lastMessage?.text.slice(0, 60) || "New conversation";
                const isActive = conv.id === currentConversationId;

                return (
                  <div key={conv.id} className="relative group">
                    <button
                      onClick={() => loadConversation(conv.id)}
                      className={\`w-full text-left p-3.5 rounded-xl transition-all \${
                        isActive
                          ? "bg-gradient-to-r from-blue-600/20 to-cyan-500/20 border border-blue-500/50 shadow-lg shadow-blue-500/10"
                          : "bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/30 hover:border-slate-600/50"
                      }\`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <Icon name="chat" className={\`text-[16px] mt-0.5 \${
                          isActive ? "text-cyan-400" : "text-slate-500"
                        }\`} />
                        <h3 className="text-sm font-semibold text-white truncate flex-1">
                          {conv.title || "Untitled Conversation"}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-2">{preview}...</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-slate-500">
                          {new Date(conv.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        {isActive && (
                          <span className="text-xs text-cyan-400 font-medium">Active</span>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConversationToDelete(conv.id);
                        setShowDeleteModal(true);
                      }}
                      className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-red-500/50 rounded-lg"
                      title="Delete conversation"
                    >
                      <Icon name="delete" className="text-red-400 hover:text-red-300 text-[16px]" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </aside>`,
`        {showConversations && (
          <div
            className="fixed inset-0 z-40 flex items-start justify-end pt-16 pr-4 sm:pr-6"
            onClick={() => setShowConversations(false)}
          >
            <div
              className="w-80 max-h-[calc(100vh-80px)] bg-slate-900/98 border border-slate-700/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-[expandDown_0.2s_ease-out]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 py-3 border-b border-slate-700/40 flex items-center justify-between flex-shrink-0">
                <span className="text-sm font-semibold text-white">Conversations</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={startNewConversation}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg text-xs font-semibold hover:scale-105 transition-all shadow-sm"
                  >
                    <Icon name="add" className="text-[14px]" />
                    New
                  </button>
                  <button
                    onClick={() => setShowConversations(false)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all"
                  >
                    <Icon name="close" className="text-[18px]" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto py-2 custom-scrollbar min-h-0">
                {conversationsLoading ? (
                  <div className="flex items-center justify-center py-8 gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full"></div>
                    <span className="text-xs text-slate-400">Loading...</span>
                  </div>
                ) : conversationsError ? (
                  <div className="text-center py-6 px-4">
                    <p className="text-xs text-red-400 mb-2">{conversationsError}</p>
                    <button onClick={loadConversations} className="text-xs text-cyan-400 hover:text-cyan-300 underline">
                      Retry
                    </button>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <p className="text-sm text-slate-500">No conversations yet</p>
                    <p className="text-xs text-slate-600 mt-1">Start chatting above</p>
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const isActive = conv.id === currentConversationId;
                    return (
                      <div key={conv.id} className="relative group px-2">
                        <button
                          onClick={() => loadConversation(conv.id)}
                          className={\`w-full text-left px-3 py-2.5 rounded-xl transition-all mb-1 \${
                            isActive
                              ? "bg-gradient-to-r from-blue-600/25 to-cyan-500/25 border border-blue-500/40"
                              : "hover:bg-slate-800/60 border border-transparent hover:border-slate-700/40"
                          }\`}
                        >
                          <div className="flex items-center gap-2 pr-7">
                            <Icon
                              name="chat"
                              className={\`text-[13px] flex-shrink-0 \${isActive ? "text-cyan-400" : "text-slate-500"}\`}
                            />
                            <span className="text-xs font-medium text-white truncate flex-1">
                              {conv.title || "Untitled"}
                            </span>
                            <span className="text-[10px] text-slate-500 flex-shrink-0">
                              {new Date(conv.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setConversationToDelete(conv.id); setShowDeleteModal(true); }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded-md transition-all"
                          title="Delete"
                        >
                          <Icon name="delete" className="text-red-400 text-[14px]" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}`
  ],
], 'chat/page.tsx');

// ── 6. chat/page.tsx — update the history button to work with new dropdown approach
// The old button was inside messages=0 area only on mobile. Now show it always in header area.
fix('app/chat/page.tsx', [
  // Replace old "View History" mobile button with a simpler version
  [
`                <div className="mb-4 sm:mb-6 md:hidden">
                  <button
                    onClick={() => setShowConversations(true)}
                    className="mx-auto px-5 py-3 bg-slate-800/95 hover:bg-slate-700/95 text-white rounded-xl transition-all flex items-center gap-2.5 shadow-lg border border-slate-600/60 font-medium backdrop-blur-md"
                  >
                    <Icon name="history" className="text-[20px]" />
                    View History
                  </button>
                </div>`,
`                <div className="mb-4 sm:mb-6">
                  <button
                    onClick={() => setShowConversations(true)}
                    className="mx-auto px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white rounded-xl transition-all flex items-center gap-2 shadow-md border border-slate-700/50 text-sm font-medium backdrop-blur-md"
                  >
                    <Icon name="history" className="text-[18px] text-slate-400" />
                    History
                    {conversations.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 bg-slate-700 rounded-md text-xs text-slate-300">{conversations.length}</span>
                    )}
                  </button>
                </div>`
  ],
  // Remove old mobile overlay (now replaced by dropdown) — the old fixed overlay backdrop
  [
`        {showConversations && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setShowConversations(false)}
          />
        )}`,
``
  ],
], 'chat/page.tsx sidebar cleanup');

// ── 7. chat/page.tsx — fix the active chat header to show history button properly
fix('app/chat/page.tsx', [
  [
`            <div className="p-3 md:p-4 border-b border-slate-700/30 flex items-center gap-3 bg-gradient-to-r from-slate-900/50 to-slate-800/30 backdrop-blur-sm flex-shrink-0">
              <button
                onClick={() => setShowConversations(true)}
                className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-all"
                title="View conversations"
              >
                <Icon name="menu" className="text-white text-[20px]" />
              </button>
              <div className="flex-1" />
              <button
                onClick={startNewConversation}
                className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-800/60 rounded-lg transition-all text-cyan-400 hover:text-cyan-300"
                title="New conversation"
              >
                <Icon name="add_circle" className="text-[20px]" />
                <span className="text-sm font-medium hidden sm:inline">New Chat</span>
              </button>
            </div>`,
`            <div className="px-4 py-2.5 border-b border-slate-700/30 flex items-center gap-2 bg-gradient-to-r from-slate-900/60 to-slate-800/40 backdrop-blur-sm flex-shrink-0">
              <button
                onClick={() => setShowConversations(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition-all text-xs font-medium border border-slate-700/40 hover:border-slate-600/60"
              >
                <Icon name="history" className="text-[16px]" />
                <span className="hidden sm:inline">History</span>
                {conversations.length > 0 && <span className="text-[10px] text-slate-500">({conversations.length})</span>}
              </button>
              <div className="flex-1" />
              <button
                onClick={startNewConversation}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-blue-600/80 to-cyan-500/80 hover:from-blue-600 hover:to-cyan-500 text-white rounded-lg transition-all text-xs font-semibold shadow-sm"
              >
                <Icon name="add" className="text-[16px]" />
                <span>New Chat</span>
              </button>
            </div>`
  ],
], 'chat/page.tsx active header');

// ── 8. API chat route — improve system prompt so assistant is honest + helpful about data
fix('app/api/chat/route.ts', [
  [
`const INVESTIO_PROMPT = \`You are Investio, an expert investment assistant specializing in financial markets, stocks, cryptocurrencies, and portfolio management.

Core principles:
- Provide clear, actionable financial insights
- Be concise and professional â€" keep responses focused and under 250 words unless the user explicitly asks for detail
- Never guarantee returns or provide financial advice as a licensed advisor
- Acknowledge when data may be time-sensitive

Formatting rules (always apply):
- Use **bold** for key terms, tickers, and important numbers
- Use bullet lists for multi-point analysis
- Use headings (##) only for long detailed responses
- Keep text explanations concise, let charts carry data visually when possible

Data visualization â€" use chart code blocks for visual data:
When presenting comparisons, allocations, or rankings, output an inline chart:

\\\`\\\`\\\`chart
{"type":"comparison","title":"AAPL vs MSFT","items":[{"label":"AAPL","value":189.50,"change":12.3},{"label":"MSFT","value":375.20,"change":8.1}]}
\\\`\\\`\\\`

Available types:
- "comparison": compare 2-5 assets (items with label, value, optional change %)
- "bar": rank by a single metric (items with label, value)
- "allocation": portfolio % breakdown (values are percentages summing to 100)
- "sparkline": price trend (sparkline.values = array of 5-12 numbers)
Place chart blocks BEFORE or AFTER text. Only use for genuine numerical/comparative data.

Data guidelines:
- Your training data has a knowledge cutoff. The current date is provided in the system context.
- For real-time prices or "today's" moves, clearly state: "Live data â€" check current prices via the chart on this platform."
- For general trends, macro analysis, historical data, and fundamental analysis you can provide detailed responses.
- When asked about recent news or events post your cutoff, say you cannot access it and suggest checking the News section of the app.

You help users make informed investment decisions through education and analysis.\`;`,
`const INVESTIO_PROMPT = \`You are Investio, a sharp, concise investment AI built into a real-time financial platform. The platform already shows live charts and prices — users can see live data on screen.

Behavior:
- Be direct and professional. Short answers unless user asks for detail (max 200 words).
- Use **bold** for tickers, numbers, key terms.
- Use bullet lists for structured analysis. Avoid long paragraphs.
- ALWAYS use chart code blocks for any numerical comparisons, rankings, allocations, or trends.
- Do NOT apologize or say you cannot help with visualizations — always provide one when data exists.
- Do NOT say "I cannot provide live data" as a refusal. Instead: give the best analysis you can from your knowledge, show it visually, and add one line like "→ Verify current price on the chart above."

Data visualization — output chart blocks for all numerical data:

\\\`\\\`\\\`chart
{"type":"comparison","title":"AAPL vs MSFT (YTD est.)","items":[{"label":"AAPL","value":189.50,"change":12.3},{"label":"MSFT","value":415.20,"change":8.1}]}
\\\`\\\`\\\`

Chart types:
- "comparison": 2-5 assets side by side (label, value, optional change %)
- "bar": single metric ranking (label, value)  
- "allocation": portfolio % split (values sum to 100)
- "sparkline": trend line (sparkline.values = 5-12 numbers)

Knowledge rules:
- Current date is injected as system context — use it.
- For prices: give your best known estimate, flag it as approximate, and refer user to live chart.
- For macro/fundamentals/strategy: full confident response with charts.
- For events after your cutoff: clearly say "I don't have data past [cutoff]" and analyze what you do know.
- Never refuse data visualization — always try.\`;`
  ],
], 'chat/route.ts prompt');

console.log('\nAll fixes applied ✓');
