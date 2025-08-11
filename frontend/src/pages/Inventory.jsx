import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from "../components/ui/button"
import Layout from '../components/layout/Layout'
import { ArrowLeft, Warehouse } from "lucide-react"

const Inventory = () => {
    const navigate = useNavigate()
    const { user } = useAuth()

    const handleBackToModules = () => {
        navigate(`/${user?.shop?.username}/modules`)
    }

    return (
        <Layout>
            <div className="max-w-6xl mx-auto p-4">
                <div className="flex flex-col sm:flex-row sm:items-center mb-6 gap-4">
                    <Button
                        variant="outline"
                        onClick={handleBackToModules}
                        className="w-fit"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        <span className="hidden xs:inline">Back to </span>Modules
                    </Button>
                    <div className="flex items-center">
                        <Warehouse className="mr-3 h-6 w-6 text-green-600" />
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Inventory Management</h1>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6 sm:p-8 text-center">
                    <Warehouse className="mx-auto h-12 sm:h-16 w-12 sm:w-16 text-green-600 mb-4" />
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                        Inventory Management Module
                    </h2>
                    <p className="text-gray-600 mb-4 text-sm sm:text-base">
                        This module will include stock tracking, inventory levels, low stock alerts, and inventory management features.
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500">
                        Coming soon - This functionality will be implemented in future updates.
                    </p>
                </div>
            </div>
        </Layout>
    )
}

export default Inventory