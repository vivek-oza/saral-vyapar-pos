import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { Card, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import Layout from '../components/layout/Layout'
import { filterByBusinessType, normalizeBusinessTypeForDisplay } from '../utils/businessTypeUtils'
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
    const { t } = useLanguage()

    const allModules = [
        {
            id: 'product-management',
            title: t('nav.products'),
            description: t('desc.products'),
            // icon: Package,
            color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
            iconColor: 'text-blue-600',
            route: `/${user?.shop?.username}/products`,
            businessTypes: ['Retail']
        },
        {
            id: 'inventory-view',
            title: t('nav.inventory'),
            description: t('desc.inventory'),
            // icon: Warehouse,
            color: 'bg-green-50 border-green-200 hover:bg-green-100',
            iconColor: 'text-green-600',
            route: `/${user?.shop?.username}/inventory`,
            businessTypes: ['Retail']
        },
        {
            id: 'billing-view',
            title: t('nav.billing'),
            description: t('desc.billing'),
            // icon: Receipt,
            color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
            iconColor: 'text-purple-600',
            route: `/${user?.shop?.username}/billing`,
            businessTypes: ['Freelancer or Service', 'Retail']
        },
        {
            id: 'reports-analytics',
            title: t('nav.reports'),
            description: t('desc.reports'),
            // icon: BarChart3,
            color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
            iconColor: 'text-orange-600',
            route: `/${user?.shop?.username}/reports`,
            businessTypes: ['Freelancer or Service', 'Retail']
        },
        {
            id: 'mobile-pos',
            title: t('nav.mobilePOS'),
            description: t('desc.mobilePOS'),
            // icon: Smartphone,
            color: 'bg-pink-50 border-pink-200 hover:bg-pink-100',
            iconColor: 'text-pink-600',
            route: `/${user?.shop?.username}/mobile-pos`,
            businessTypes: ['Retail']
        },
        {
            id: 'shop-settings',
            title: t('nav.settings'),
            description: t('desc.settings'),
            // icon: Settings,
            color: 'bg-gray-50 border-gray-200 hover:bg-gray-100',
            iconColor: 'text-gray-600',
            route: `/${user?.shop?.username}/settings`,
            businessTypes: ['Freelancer or Service', 'Retail']
        }
    ]

    // Filter modules based on business type with backward compatibility
    const businessType = user?.shop?.business_type
    const modules = filterByBusinessType(allModules, businessType)

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
                        {t('nav.welcome')}, {user?.shop?.name || 'Your Business'}
                    </h1>
                    {user?.shop?.business_type && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 mb-2">
                            {normalizeBusinessTypeForDisplay(user.shop.business_type)} Business
                        </div>
                    )}
                    {/* <p className="text-gray-600 mb-6 px-4">
                        {t('desc.chooseModule')}
                    </p> */}
                    {/* <Button
                        variant="outline"
                        onClick={handleGoToDashboard}
                        className="mb-8"
                    >
                        <span className="hidden xs:inline">{t('common.goTo')} </span>{t('nav.dashboard')}
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button> */}
                </div>

                {/* Module Cards - Horizontally Aligned */}
                <div className="flex flex-wrap justify-center items-center gap-6">
                    {modules.map((module) => {
                        const IconComponent = module.icon
                        return (
                            <Card
                                key={module.id}
                                className={`cursor-pointer flex items-center justify-center transition-all duration-200 w-64 h-48 ${module.color} hover:shadow-lg hover:scale-105`}
                                onClick={() => handleModuleClick(module.route)}
                            >
                                <CardHeader className="pb-4 text-center">
                                    <div className="flex flex-col items-center space-y-4">
                                        {/* <div className="p-3 rounded-lg bg-white shadow-sm">
                                            <IconComponent className={`h-8 w-8 ${module.iconColor}`} />
                                        </div> */}
                                        <CardTitle className="text-lg font-semibold text-gray-900 leading-tight">
                                            {module.title}
                                        </CardTitle>
                                    </div>
                                </CardHeader>
                            </Card>
                        )
                    })}
                </div>

                {/* Footer */}
                {/* <div className="text-center mt-12 text-gray-500 text-sm">
                    <p>{t('common.needHelp')}</p>
                </div> */}
            </div>
        </Layout>
    )
}

export default ModuleSelection;