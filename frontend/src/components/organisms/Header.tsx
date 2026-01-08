import Icon from '../atoms/Icon'
import { useState } from 'react'

export default function Header() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <>
      <header
        className="w-full shadow-sm relative z-10 bg-gradient-to-r from-cyan-500 to-blue-600"
        style={{
          boxShadow: '0 2px 16px 0 rgba(30,144,255,0.10)'
        }}
      >
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
          {/* Burger menu left - only visible on mobile */}
          <button
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/30 transition-all shadow-sm"
            aria-label="Open sidebar"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="5" cy="6" r="1.5" fill="white"/>
              <circle cx="12" cy="6" r="1.5" fill="white"/>
              <circle cx="19" cy="6" r="1.5" fill="white"/>
              <circle cx="5" cy="12" r="1.5" fill="white"/>
              <circle cx="12" cy="12" r="1.5" fill="white"/>
              <circle cx="19" cy="12" r="1.5" fill="white"/>
              <circle cx="5" cy="18" r="1.5" fill="white"/>
              <circle cx="12" cy="18" r="1.5" fill="white"/>
              <circle cx="19" cy="18" r="1.5" fill="white"/>
            </svg>
          </button>
          {/* Logo and text - center on mobile, right on desktop */}
          <div className="flex items-center gap-2.5 md:gap-3 md:ml-auto">
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-md bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg">
              <Icon name="insights" />
            </div>
            <div className="text-base md:text-lg font-extrabold text-white drop-shadow-sm tracking-wide font-['Plus Jakarta Sans','Inter','system-ui','sans-serif']">Investio</div>
          </div>
          {/* Invisible spacer for balance on mobile */}
          <div className="w-10 md:hidden"></div>
        </div>
      </header>
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}>
          <aside 
            className="fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl transform transition-transform duration-300 ease-out overflow-y-auto" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header section with logo and close */}
            <div className="sticky top-0 bg-gradient-to-b from-slate-900 to-slate-900/95 backdrop-blur-sm p-6 border-b border-white/5 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-md bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-lg">
                    <Icon name="insights" />
                  </div>
                  <div className="text-base font-extrabold text-white tracking-wide font-['Plus Jakarta Sans','Inter','system-ui','sans-serif']">Investio</div>
                </div>
                <button
                  className="w-9 h-9 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition"
                  aria-label="Close sidebar"
                  onClick={() => setSidebarOpen(false)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
            {/* Navigation content */}
            <nav className="p-6 space-y-2">
              <a href="/" className="flex items-center gap-3 px-4 py-3 text-white bg-white/10 rounded-lg transition">
                <Icon name="dashboard" />
                <span className="font-semibold">Dashboard</span>
              </a>
              <a href="/chat" className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition">
                <Icon name="chat" />
                <span className="font-medium">Chat</span>
              </a>
            </nav>
          </aside>
        </div>
      )}
    </>
  )
}
