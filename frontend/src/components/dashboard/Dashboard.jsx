import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import Layout from '../layout/Layout'
import { normalizeBusinessTypeForDisplay } from '../../utils/businessTypeUtils'
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Plus,
  BarChart3
} from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()

  const kpiData = [
    {
      title: "Total Sales",
      value: "₹0",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Orders Today",
      value: "0",
      icon: ShoppingCart,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Total Customers",
      value: "0",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ]

  const quickActions = [
    {
      title: "New Sale",
      description: "Create a new sale transaction",
      icon: Plus,
      variant: "default"
    },
    {
      title: "Add Product",
      description: "Add new product to inventory",
      icon: Package,
      variant: "secondary"
    },
    {
      title: "View Reports",
      description: "Check sales and inventory reports",
      icon: BarChart3,
      variant: "outline"
    }
  ]

  return (
    <Layout>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
              {user?.shop?.business_type && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {normalizeBusinessTypeForDisplay(user.shop.business_type)}
                </span>
              )}
            </div>
            <p className="text-muted-foreground">
              Welcome to your business dashboard. Here's an overview of your {normalizeBusinessTypeForDisplay(user?.shop?.business_type)?.toLowerCase() || 'business'}.
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {kpiData.map((kpi, index) => {
              const Icon = kpi.icon
              return (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {kpi.title}
                    </CardTitle>
                    <div className={`p-2 rounded-md ${kpi.bgColor}`}>
                      <Icon className={`h-4 w-4 ${kpi.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{kpi.value}</div>
                    <p className="text-xs text-muted-foreground">
                      No data available yet
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to help you manage your business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action, index) => {
                  const Icon = action.icon
                  return (
                    <Button
                      key={index}
                      variant={action.variant}
                      className="h-auto p-4 flex flex-col items-start gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{action.title}</span>
                      </div>
                      <span className="text-xs text-left opacity-70">
                        {action.description}
                      </span>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Shop Info */}
          {user?.shop && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Your registered business details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Business Name</p>
                    <p className="text-sm text-muted-foreground">{user.shop.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Business Type</p>
                    <p className="text-sm text-muted-foreground">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {normalizeBusinessTypeForDisplay(user.shop.business_type) || 'Not set'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Address</p>
                    <p className="text-sm text-muted-foreground">{user.shop.address}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Username</p>
                    <p className="text-sm text-muted-foreground">/{user.shop.username}</p>
                  </div>
                  {user.shop.gst_number && (
                    <div>
                      <p className="text-sm font-medium">GST Number</p>
                      <p className="text-sm text-muted-foreground">{user.shop.gst_number}</p>
                    </div>
                  )}
                  {user.shop.phone && (
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{user.shop.phone}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard