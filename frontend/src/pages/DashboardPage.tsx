import DashboardLayout from '../templates/DashboardLayout'
import Card from '../components/molecules/Card'
import Text from '../components/atoms/Text'
import Icon from '../components/atoms/Icon'

const mockStocks = [
  { symbol: 'AAPL', price: 172.3, change: 1.2 },
  { symbol: 'TSLA', price: 187.6, change: -0.8 },
  { symbol: 'MSFT', price: 330.1, change: 0.7 },
]

const mockCrypto = [
  { symbol: 'BTC', price: 43000, change: 0.5 },
  { symbol: 'ETH', price: 3200, change: -1.1 },
]

const mockForex = [
  { symbol: 'EUR/USD', price: 1.08, change: 0.02 },
  { symbol: 'USD/JPY', price: 134.5, change: -0.12 },
]

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="app-container space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <Text variant="h1" className="mb-1 md:mb-2 text-2xl md:text-3xl lg:text-4xl">Dashboard</Text>
            <Text variant="caption" className="text-sm md:text-base">Overview of your assets and latest financial news</Text>
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <button className="px-3 py-2 rounded-md bg-white/5 text-white flex items-center gap-2 hover:bg-white/8 text-sm md:text-base">
              <Icon name="calendar_today" /> <span className="hidden sm:inline">Today</span>
            </button>
            <button className="px-3 py-2 rounded-md bg-primary-600 text-white flex items-center gap-2 hover:opacity-95 text-sm md:text-base">
              <Icon name="insights" /> Analyze
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded bg-primary-700/20 flex items-center justify-center text-white"><Icon name="trending_up" /></div>
                <div>
                  <Text variant="h3">Portfolio Value</Text>
                  <Text variant="caption">Total across accounts</Text>
                </div>
              </div>
              <div className="text-right">
                <Text variant="h2" className="text-white">$12,500</Text>
                <Text variant="caption" className="text-green-400">+1.9%</Text>
              </div>
            </div>
          </Card>

          <Card className="card">
            <Text variant="h3" className="mb-3">Stocks</Text>
            <ul className="space-y-2">
              {mockStocks.map((s) => (
                <li key={s.symbol} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-white">{s.symbol[0]}</div>
                    <div>
                      <div className="font-medium">{s.symbol}</div>
                      <div className="text-sm text-white/70">Price</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-white">${s.price}</div>
                    <div className={s.change >= 0 ? 'text-green-400 text-sm' : 'text-red-400 text-sm'}>{s.change}%</div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="card">
            <Text variant="h3" className="mb-3">Crypto</Text>
            <ul className="space-y-2">
              {mockCrypto.map((c) => (
                <li key={c.symbol} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-white">{c.symbol[0]}</div>
                    <div>
                      <div className="font-medium">{c.symbol}</div>
                      <div className="text-sm text-white/70">Market</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-white">${c.price}</div>
                    <div className={c.change >= 0 ? 'text-green-400 text-sm' : 'text-red-400 text-sm'}>{c.change}%</div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="card lg:col-span-2">
            <Text variant="h3" className="mb-3 text-white">Market News</Text>
            <ul className="space-y-3">
              <li>
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium text-white">Macro outlook brightens as CPI cools</div>
                    <div className="text-sm text-white/70">Summary of the article goes here — mocked data.</div>
                  </div>
                  <div className="text-sm text-white/60">2h</div>
                </div>
              </li>
              <li>
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium text-white">Tech earnings beat expectations</div>
                    <div className="text-sm text-white/70">Quarterly results show growth across major cap names.</div>
                  </div>
                  <div className="text-sm text-white/60">1d</div>
                </div>
              </li>
            </ul>
          </Card>

          <Card className="card">
            <Text variant="h3" className="mb-3 text-white">Forex</Text>
            <ul className="space-y-2">
              {mockForex.map((f) => (
                <li key={f.symbol} className="flex justify-between">
                  <div className="text-white">{f.symbol}</div>
                  <div className={f.change >= 0 ? 'text-green-400' : 'text-red-400'}>{f.price}</div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
