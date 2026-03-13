const fs = require('fs');

function patchFile(path, patches) {
  let c = fs.readFileSync(path, 'utf8');
  const nl = c.includes('\r\n') ? '\r\n' : '\n';
  let ok = 0;
  for (const [from, to] of patches) {
    const f = from.replace(/\n/g, nl);
    const t = to.replace(/\n/g, nl);
    if (!c.includes(f)) { console.log('  MISS:', JSON.stringify(from.slice(0, 80))); continue; }
    c = c.replace(f, t);
    ok++;
    console.log('  OK:', JSON.stringify(from.slice(0, 60)));
  }
  fs.writeFileSync(path, c, 'utf8');
  console.log(path, '->', ok + '/' + patches.length + ' patches');
}

// ── 1. ChatWidget.tsx ───────────────────────────────────────────────────────
patchFile('app/components/dashboard/ChatWidget.tsx', [
  // Add AnimatedPlaceholder import
  [
    `import Icon from "../ui/Icon";`,
    `import Icon from "../ui/Icon";\nimport AnimatedPlaceholder from "../ui/AnimatedPlaceholder";`,
  ],
  // Remove placeholderIdx state
  [
    `  const [placeholderIdx, setPlaceholderIdx] = useState(0);\n  const [value, setValue] = useState("");`,
    `  const [value, setValue] = useState("");`,
  ],
  // Remove interval useEffect for cycling placeholder
  [
    `  useEffect(() => {\n    if (widgetPlaceholders.length <= 1) return;\n    const timer = setInterval(() => {\n      setPlaceholderIdx((prev) => (prev + 1) % widgetPlaceholders.length);\n    }, 4000);\n    return () => clearInterval(timer);\n  // eslint-disable-next-line react-hooks/exhaustive-deps\n  }, []);\n\n  async function handleSend()`,
    `  async function handleSend()`,
  ],
  // Replace inline animated span with AnimatedPlaceholder component
  [
    `          {!value && (\n            <div className="absolute left-3 sm:left-4 top-3 sm:top-3.5 right-14 pointer-events-none text-slate-400/70 text-sm overflow-hidden">\n              <span\n                key={placeholderIdx}\n                style={{ animation: "placeholderFade 3.6s cubic-bezier(0.4, 0, 0.2, 1) forwards" }}\n                className="inline-block placeholder-animated"\n              >\n                {widgetPlaceholders[placeholderIdx]}\n              </span>\n            </div>\n          )}`,
    `          {!value && (\n            <div className="absolute left-3 sm:left-4 top-3 sm:top-3.5 right-14 pointer-events-none text-slate-400/70 text-sm overflow-hidden">\n              <AnimatedPlaceholder placeholders={widgetPlaceholders} typingSpeed={48} deletingSpeed={24} pauseAfterTyping={1800} />\n            </div>\n          )}`,
  ],
]);

// ── 2. chat/page.tsx ─────────────────────────────────────────────────────────
patchFile('app/chat/page.tsx', [
  // Add AnimatedPlaceholder import after Icon import
  [
    `import Icon from "../components/ui/Icon";\n`,
    `import Icon from "../components/ui/Icon";\nimport AnimatedPlaceholder from "../components/ui/AnimatedPlaceholder";\n`,
  ],
  // Remove placeholderIndex state
  [
    `  const [placeholderIndex, setPlaceholderIndex] = useState(0);\n`,
    ``,
  ],
  // Remove the cyclic interval useEffect
  [
    `  useEffect(() => {\n    const interval = setInterval(() => {\n      setPlaceholderIndex((prev) => (prev + 1) % CHAT_PLACEHOLDERS.length);\n    }, 4000);\n    return () => clearInterval(interval);\n  }, []);\n\n`,
    ``,
  ],
  // Replace inline span placeholder block with AnimatedPlaceholder (exact indentation: 22sp div, 24sp children)
  [
    `{!value && (\n                      <div className="absolute left-4 md:left-6 top-4 md:top-6 right-16 pointer-events-none text-white/60 text-base text-left">\n                        <span>Ask anything about </span>\n                        <span\n                          key={placeholderIndex}\n                          className="inline placeholder-animated"\n                          style={{\n                            animation:\n                              "placeholderFade 3.6s cubic-bezier(0.4, 0, 0.2, 1) forwards",\n                          }}\n                        >\n                          {CHAT_PLACEHOLDERS[placeholderIndex]}...\n                        </span>\n                      </div>\n                    )}`,
    `{!value && (\n                      <div className="absolute left-4 md:left-6 top-4 md:top-6 right-16 pointer-events-none text-white/60 text-base text-left">\n                        <AnimatedPlaceholder\n                          placeholders={CHAT_PLACEHOLDERS.map((p) => \`Ask anything about \${p}...\`)}\n                          typingSpeed={50}\n                          deletingSpeed={25}\n                          pauseAfterTyping={2200}\n                        />\n                      </div>\n                    )}`,
  ],
  // Replace the wide <aside> sidebar with a compact dropdown panel
  [
    `<aside\n          className={\`fixed md:relative top-0 left-0 h-full md:h-full w-80 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-700/50 z-50 transform transition-transform duration-300 flex flex-col shadow-2xl flex-shrink-0 \${\n            showConversations ? "translate-x-0" : "-translate-x-full md:translate-x-0"\n          }\`}\n        >\n          <div className="p-5 border-b border-slate-700/30 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-cyan-500/10 flex-shrink-0">\n            <div className="flex items-center gap-2">\n              <Icon name="chat_bubble" className="text-cyan-400 text-[22px]" />\n              <h2 className="text-lg font-bold text-white">Chat History</h2>\n            </div>\n            <button\n              onClick={() => setShowConversations(false)}\n              className="md:hidden text-slate-400 hover:text-white transition"\n            >\n              <Icon name="close" className="text-[20px]" />\n            </button>\n          </div>\n          \n          <button\n            onClick={startNewConversation}\n            className="m-4 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl hover:scale-[1.02] transition-all shadow-lg hover:shadow-cyan-500/30 flex items-center justify-center gap-2 font-semibold flex-shrink-0"\n          >\n            <Icon name="add_circle" className="text-[22px]" />\n            New Conversation\n          </button>\n\n          <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 custom-scrollbar min-h-0">\n            {conversationsLoading ? (\n              <div className="flex flex-col items-center justify-center py-12 px-4">\n                <div className="animate-spin w-10 h-10 border-3 border-cyan-500 border-t-transparent rounded-full mb-3"></div>\n                <p className="text-sm text-slate-400">Loading conversations...</p>\n              </div>\n            ) : conversationsError ? (\n              <div className="text-center py-8 px-4">\n                <Icon name="error_outline" className="text-red-400 text-[40px] mx-auto mb-3" />\n                <p className="text-sm text-red-400 mb-2">{conversationsError}</p>\n                <button\n                  onClick={loadConversations}\n                  className="text-xs text-cyan-400 hover:text-cyan-300 underline"\n                >\n                  Try again\n                </button>\n              </div>\n            ) : conversations.length === 0 ? (\n              <div className="text-center py-8 px-4">\n                <Icon name="chat_bubble_outline" className="text-slate-600 text-[40px] mx-auto mb-3" />\n                <p className="text-sm text-slate-500">No conversations yet</p>\n                <p className="text-xs text-slate-600 mt-1">Start chatting to create your first conversation</p>\n              </div>\n            ) : (\n              conversations.map((conv) => {\n                const lastMessage = conv.messages?.[0];\n                const preview = lastMessage?.text.slice(0, 60) || "New conversation";\n                const isActive = conv.id === currentConversationId;\n                \n                return (\n                  <div key={conv.id} className="relative group">\n                    <button\n                      onClick={() => loadConversation(conv.id)}\n                      className={\`w-full text-left p-3.5 rounded-xl transition-all \${\n                        isActive\n                          ? "bg-gradient-to-r from-blue-600/20 to-cyan-500/20 border border-blue-500/50 shadow-lg shadow-blue-500/10"\n                          : "bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/30 hover:border-slate-600/50"\n                      }\`}\n                    >\n                      <div className="flex items-start gap-2 mb-2">\n                        <Icon name="chat" className={\`text-[16px] mt-0.5 \${\n                          isActive ? "text-cyan-400" : "text-slate-500"\n                        }\`} />\n                        <h3 className="text-sm font-semibold text-white truncate flex-1">\n                          {conv.title || "Untitled Conversation"}\n                        </h3>\n                      </div>\n                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-2">{preview}...</p>\n                      <div className="flex items-center justify-between">\n                        <p className="text-xs text-slate-500">\n                          {new Date(conv.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}\n                        </p>\n                        {isActive && (\n                          <span className="text-xs text-cyan-400 font-medium">Active</span>\n                        )}\n                      </div>\n                    </button>\n                    <button\n                      onClick={(e) => {\n                        e.stopPropagation();\n                        setConversationToDelete(conv.id);\n                        setShowDeleteModal(true);\n                      }}\n                      className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-red-500/50 rounded-lg"\n                      title="Delete conversation"\n                    >\n                      <Icon name="delete" className="text-red-400 hover:text-red-300 text-[16px]" />\n                    </button>\n                  </div>\n                );\n              })\n            )}\n          </div>\n        </aside>`,
    `{showConversations && (\n          <div\n            className="fixed inset-0 z-40 flex items-start justify-end pt-14"\n            onClick={() => setShowConversations(false)}\n          >\n            <div\n              className="relative mr-2 mt-1 w-72 max-h-[calc(100dvh-80px)] bg-slate-900/95 backdrop-blur-md border border-slate-700/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden"\n              onClick={(e) => e.stopPropagation()}\n            >\n              {/* Header */}\n              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/40">\n                <div className="flex items-center gap-2">\n                  <Icon name="history" className="text-cyan-400 text-[18px]" />\n                  <span className="text-sm font-semibold text-white">History</span>\n                  {conversations.length > 0 && (\n                    <span className="text-xs bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-full">{conversations.length}</span>\n                  )}\n                </div>\n                <button\n                  onClick={startNewConversation}\n                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-2.5 py-1.5 rounded-lg transition"\n                >\n                  <Icon name="add" className="text-[14px]" />\n                  New\n                </button>\n              </div>\n              {/* Conversation list */}\n              <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1 custom-scrollbar">\n                {conversationsLoading ? (\n                  <div className="flex items-center justify-center py-8 gap-2 text-slate-400 text-sm">\n                    <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />\n                    Loading...\n                  </div>\n                ) : conversationsError ? (\n                  <div className="text-center py-6 px-3">\n                    <p className="text-xs text-red-400 mb-2">{conversationsError}</p>\n                    <button onClick={loadConversations} className="text-xs text-cyan-400 hover:underline">Retry</button>\n                  </div>\n                ) : conversations.length === 0 ? (\n                  <div className="text-center py-8 px-3">\n                    <Icon name="chat_bubble_outline" className="text-slate-600 text-[32px] mx-auto mb-2" />\n                    <p className="text-xs text-slate-500">No conversations yet</p>\n                  </div>\n                ) : (\n                  conversations.map((conv) => {\n                    const preview = conv.messages?.[0]?.text.slice(0, 50) || "New conversation";\n                    const isActive = conv.id === currentConversationId;\n                    return (\n                      <div key={conv.id} className="relative group">\n                        <button\n                          onClick={() => { loadConversation(conv.id); setShowConversations(false); }}\n                          className={\`w-full text-left px-3 py-2.5 rounded-xl transition-all \${\n                            isActive\n                              ? "bg-cyan-500/15 border border-cyan-500/40"\n                              : "hover:bg-slate-800/70 border border-transparent hover:border-slate-700/50"\n                          }\`}\n                        >\n                          <p className="text-xs font-medium text-white truncate">{conv.title || "Untitled"}</p>\n                          <p className="text-xs text-slate-500 truncate mt-0.5">{preview}...</p>\n                        </button>\n                        <button\n                          onClick={(e) => { e.stopPropagation(); setConversationToDelete(conv.id); setShowDeleteModal(true); }}\n                          className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/30 rounded-lg transition"\n                        >\n                          <Icon name="delete" className="text-red-400 text-[14px]" />\n                        </button>\n                      </div>\n                    );\n                  })\n                )}\n              </div>\n            </div>\n          </div>\n        )}`,
  ],
]);

// ── 3. scroll.ts ─────────────────────────────────────────────────────────────
const newScroll = `export const smoothScrollToBottom = (\r\n  element: HTMLElement | null,\r\n  force = false\r\n) => {\r\n  if (!element) return;\r\n  const distanceFromBottom =\r\n    element.scrollHeight - element.scrollTop - element.clientHeight;\r\n  if (force || distanceFromBottom < 200) {\r\n    element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });\r\n  }\r\n};\r\n`;
fs.writeFileSync('app/lib/utils/scroll.ts', newScroll, 'utf8');
console.log('app/lib/utils/scroll.ts -> rewritten');

// ── 4. chat/route.ts — already has correct em-dash, nothing to do ───────────
console.log('app/api/chat/route.ts -> already correct (em-dash OK)');

console.log('All done.');
