import DashboardLayout from '../templates/DashboardLayout'
import Card from '../molecules/Card'
import Text from '../atoms/Text'

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div>
          <Text variant="h1" className="mb-2">
            Dashboard
          </Text>
          <Text variant="caption">Welcome to your investment assistant</Text>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Portfolio Value">
            <Text variant="h2" className="text-blue-600">
              $12,500
            </Text>
          </Card>
          <Card title="Today's Change">
            <Text variant="h2" className="text-green-600">
              +$240 (+1.9%)
            </Text>
          </Card>
          <Card title="Total Assets">
            <Text variant="h2" className="text-gray-900">
              5
            </Text>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
