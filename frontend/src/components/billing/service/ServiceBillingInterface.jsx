import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { serviceBillsAPI } from '../../../api/serviceBills'
import { Button } from '../../ui/button'
import { Plus, Receipt, RefreshCw } from 'lucide-react'
import DashboardCards from './DashboardCards'
import ServiceBillModal from './ServiceBillModal'
import BillHistoryTable from './BillHistoryTable'

const ServiceBillingInterface = () => {
    const { user } = useAuth()
    const [bills, setBills] = useState([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [stats, setStats] = useState({
        dailyCollection: 0,
        totalPending: 0
    })

    useEffect(() => {
        fetchBills()
        fetchStats()
    }, [])

    const fetchBills = async () => {
        try {
            setLoading(true)
            const data = await serviceBillsAPI.getServiceBills()
            setBills(data.bills || [])
        } catch (error) {
            console.error('Error fetching bills:', error)
            setBills([])
        } finally {
            setLoading(false)
        }
    }

    const fetchStats = async () => {
        try {
            const data = await serviceBillsAPI.getStats()
            setStats(data)
        } catch (error) {
            console.error('Error fetching stats:', error)
            setStats({ dailyCollection: 0, totalPending: 0 })
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await Promise.all([fetchBills(), fetchStats()])
        setRefreshing(false)
    }

    const handleBillCreated = (newBill) => {
        setBills(prev => [newBill, ...prev])
        fetchStats() // Refresh stats
    }

    const handleBillUpdated = (updatedBill) => {
        setBills(prev => prev.map(bill =>
            bill._id === updatedBill._id ? updatedBill : bill
        ))
        fetchStats() // Refresh stats
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="space-y-6">
                {/* Header Section */}
                <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <Receipt className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Service Billing</h1>
                                <p className="text-gray-600">Manage your service bills and payments</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="border-green-300 text-green-700 hover:bg-green-50"
                            >
                                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                            <ServiceBillModal
                                onBillCreated={handleBillCreated}
                                trigger={
                                    <Button className="bg-green-600 hover:bg-green-700 text-white shadow-md">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Create Service Bill
                                    </Button>
                                }
                            />
                        </div>
                    </div>
                </div>

                {/* Dashboard Cards */}
                <DashboardCards stats={stats} />

                {/* Bill History Table */}
                <BillHistoryTable
                    bills={bills}
                    loading={loading}
                    onBillUpdated={handleBillUpdated}
                    onRefresh={fetchBills}
                />
            </div>
        </div>
    )
}

export default ServiceBillingInterface