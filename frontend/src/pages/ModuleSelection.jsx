import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import Layout from '../components/layout/Layout'
import {
    Package,
    Warehouse,
    Receipt,
    BarChart3,
    Smartphone,
    Settings,
    ArrowRight
} from "lucide-react"

const ModuleSelection = () => {
    const navigate = useNavigate()
    const { user } = useAuth()

    const modules = [
        {
            id: 'product-management',
            title: 'Product Management',
            description: 'Manage categories, add products, edit and organize your catalog',
            icon: Package,
            color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
            iconColor: 'text-blue-600',
            route: `/${user?.shop?.username}/products`
        },
        {
            id: 'inventory-view',
            title: 'Inventory View',
            description: 'Track stock levels, manage inventory and get low stock alerts',
            icon: Warehouse,
            color: 'bg-green-50 border-green-200 hover:bg-green-100',
            iconColor: 'text-green-600',
            route: `/${user?.shop?.username}/inventory`
        },
        {
            id: 'billing-view',
            title: 'Billing View',
            description: 'Create bills, process payments and manage transactions',
            icon: Receipt,
            color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
            iconColor: 'text-purple-600',
            route: `/${user?.shop?.username}/billing`
        },
        {
            id: 'reports-analytics',
            title: 'Reports & Analytics',
            description: 'View sales reports, analytics and business insights',
            icon: BarChart3,
            color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
            iconColor: 'text-orange-600',
            route: `/${user?.shop?.username}/reports`
        },
        {
            id: 'mobile-pos',
            title: 'Mobile POS',
            description: 'Access POS features optimized for mobile devices',
            icon: Smartphone,
            color: 'bg-pink-50 border-pink-200 hover:bg-pink-100',
            iconColor: 'text-pink-600',
            route: `/${user?.shop?.username}/mobile-pos`
        },
        {
            id: 'shop-settings',
            title: 'Shop Settings',
            description: 'Manage shop information and configuration settings',
            icon: Settings,
            color: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
            iconColor: 'text-gray-600',
            route: `/${user?.shop?.username}/settings`
        }
    ]

    const handleModuleClick = (moduleRoute) => {
        navigate(moduleRoute)
    }

    const handleGoToDashboard = () => {
        navigate(`/${user?.shop?.username}/dashboard`)
    }

    return (
        <Layout>
            <div className="max-w-6xl mx-auto p-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                        Welcome to {user?.shop?.name || 'Your Shop'}
                    </h1>
                    <p className="text-gray-600 mb-6 px-4">
                        Choose a module to get started with managing your business
                    </p>
                    <Button
                        variant="outline"
                        onClick={handleGoToDashboard}
                        className="mb-8"
                    >
                        <span className="hidden xs:inline">Go to </span>Full Dashboard
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
                    {modules.map((module) => {
                        const IconComponent = module.icon
                        return (
                            <Card
                                key={module.id}
                                className={`cursor-pointer transition-all duration-200 ${module.color} hover:shadow-lg hover:scale-105`}
                                onClick={() => handleModuleClick(module.route)}
                            >
                                <CardHeader className="pb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                                            <IconComponent className={`h-6 w-6 ${module.iconColor}`} />
                                        </div>
                                        <CardTitle className="text-lg font-semibold text-gray-900">
                                            {module.title}
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <CardDescription className="text-gray-600 text-sm leading-relaxed">
                                        {module.description}
                                    </CardDescription>
                                    <div className="mt-4 flex items-center text-sm font-medium text-gray-700">
                                        Open Module
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* Footer */}
                <div className="text-center mt-12 text-gray-500 text-sm">
                    <p>Need help getting started? Check out our user guide or contact support.</p>
                </div>
            </div>
        </Layout>
    )
}

export default ModuleSelection