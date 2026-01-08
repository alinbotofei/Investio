import DashboardPage from './pages/DashboardPage'
import ChatPage from './pages/ChatPage'
import './styles/index.css'

export default function App() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/'

  if (path.startsWith('/chat')) return <ChatPage />
  return <DashboardPage />
}
