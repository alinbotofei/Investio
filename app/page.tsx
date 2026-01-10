import DashboardLayout from './components/layout/DashboardLayout'
import Card from './components/ui/Card'
import Text from './components/ui/Text'
import Icon from './components/ui/Icon'
import Link from 'next/link'

export default function HomePage() {
  const portfolioValue = 125430.50
  const dailyChange = 2.34

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 md:p-8">
        <div className="mb-6 md:mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
              Dashboard
            </h1>
            <p className="text-sm sm:text-base text-slate-300">Welcome back to your investment overview</p>
          </div>
          <Link 
            href="/dashboard"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Icon name="show_chart" />
            <span className="hidden sm:inline">Live Dashboard</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-6 md:mb-8">
          <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <Text variant="caption" className="text-slate-400 uppercase tracking-wide">Portfolio Value</Text>
              <Icon name="account_balance_wallet" className="text-cyan-400 text-xl sm:text-2xl" />
            </div>
            <Text variant="h2" className="text-white mb-1">${portfolioValue.toLocaleString()}</Text>
            <div className="flex items-center gap-2">
              <span className={`text-xs sm:text-sm font-medium ${dailyChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {dailyChange >= 0 ? '+' : ''}{dailyChange}%
              </span>
              <span className="text-slate-500 text-xs sm:text-sm">today</span>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50 hover:border-blue-500/30 transition-colors">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <Text variant="caption" className="text-slate-400 uppercase tracking-wide">Active Positions</Text>
              <Icon name="trending_up" className="text-blue-400 text-xl sm:text-2xl" />
            </div>
            <Text variant="h2" className="text-white mb-1">12</Text>
            <Text variant="caption" className="text-slate-500">3 stocks, 5 crypto, 4 forex</Text>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50 hover:border-purple-500/30 transition-colors">
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <Text variant="caption" className="text-slate-400 uppercase tracking-wide">Total Gain/Loss</Text>
              <Icon name="analytics" className="text-purple-400 text-xl sm:text-2xl" />
            </div>
            <Text variant="h2" className="text-green-400 mb-1">+$12,430</Text>
            <Text variant="caption" className="text-slate-500">+10.98% all time</Text>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          <Card title="Top Stocks" className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
            <div className="space-y-2 sm:space-y-3">
              {[
                { symbol: 'AAPL', name: 'Apple Inc.', price: 178.50, change: 2.3 },
                { symbol: 'MSFT', name: 'Microsoft', price: 412.20, change: 1.8 },
                { symbol: 'GOOGL', name: 'Alphabet', price: 142.80, change: -0.5 },
              ].map((stock) => (
                <div key={stock.symbol} className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors">
                  <div>
                    <Text className="text-white font-semibold text-sm sm:text-base">{stock.symbol}</Text>
                    <Text variant="caption" className="text-slate-400">{stock.name}</Text>
                  </div>
                  <div className="text-right">
                    <Text className="text-white text-sm sm:text-base">${stock.price}</Text>
                    <Text variant="caption" className={stock.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {stock.change >= 0 ? '+' : ''}{stock.change}%
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Crypto Holdings" className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
            <div className="space-y-2 sm:space-y-3">
              {[
                { symbol: 'BTC', name: 'Bitcoin', price: 45200, change: 3.2 },
                { symbol: 'ETH', name: 'Ethereum', price: 2350, change: 2.1 },
                { symbol: 'SOL', name: 'Solana', price: 98.50, change: -1.2 },
              ].map((crypto) => (
                <div key={crypto.symbol} className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-900/50 rounded-lg hover:bg-slate-900/70 transition-colors">
                  <div>
                    <Text className="text-white font-semibold text-sm sm:text-base">{crypto.symbol}</Text>
                    <Text variant="caption" className="text-slate-400">{crypto.name}</Text>
                  </div>
                  <div className="text-right">
                    <Text className="text-white text-sm sm:text-base">${crypto.price.toLocaleString()}</Text>
                    <Text variant="caption" className={crypto.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {crypto.change >= 0 ? '+' : ''}{crypto.change}%
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
