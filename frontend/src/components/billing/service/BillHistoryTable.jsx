import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Badge } from "../../ui/badge"
import PrintableBill from "./PrintableBill"
import { serviceBillsAPI } from '../../../api/serviceBills'
import { Search, Printer, ChevronLeft, ChevronRight, Receipt } from "lucide-react"

const BillHistoryTable = ({ bills, loading, onBillUpdated, onRefresh }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [printBill, setPrintBill] = useState(null)
    const itemsPerPage = 10

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-GB')
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount || 0)
    }

    const handleStatusChange = async (billId, newStatus) => {
        try {
            const response = await serviceBillsAPI.updateBillStatus(billId, newStatus)
            onBillUpdated(response.bill)
        } catch (error) {
            console.error('Error updating bill status:', error)
        }
    }

    const handlePaymentModeChange = async (billId, newPaymentMode) => {
        try {
            const response = await serviceBillsAPI.updatePaymentMode(billId, newPaymentMode)
            onBillUpdated(response.bill)
        } catch (error) {
            console.error('Error updating payment mode:', error)
        }
    }

    const handlePrint = (bill) => {
        setPrintBill(bill)
    }

    // Filter bills based on search term and status
    const filteredBills = bills.filter(bill => {
        const matchesSearch = bill.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bill.serviceItems.some(item =>
                item.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
        const matchesStatus = statusFilter === 'all' || bill.status.toLowerCase() === statusFilter.toLowerCase()
        return matchesSearch && matchesStatus
    })

    // Pagination
    const totalPages = Math.ceil(filteredBills.length / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const paginatedBills = filteredBills.slice(startIndex, startIndex + itemsPerPage)

    const handlePageChange = (newPage) => {
        setCurrentPage(Math.max(1, Math.min(newPage, totalPages)))
    }

    return (
        <>
            {printBill && (
                <PrintableBill
                    bill={printBill}
                    onClose={() => setPrintBill(null)}
                />
            )}
            <Card className="bg-white shadow-md border-green-100">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle className="text-green-800 flex items-center gap-2">
                            <Receipt className="h-5 w-5" />
                            Bill History
                        </CardTitle>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search bills..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 w-full sm:w-64 border-green-300 focus:border-green-500 focus:ring-green-500"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="flex h-10 w-full sm:w-32 rounded-md border border-green-300 bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="received">Received</option>
                            </select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading bills...</div>
                    ) : filteredBills.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            {bills.length === 0 ? 'No bills created yet' : 'No bills match your search criteria'}
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className="hidden md:block">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-2">Date</th>
                                                <th className="text-left py-3 px-2">Invoice</th>
                                                <th className="text-left py-3 px-2">Amount</th>
                                                <th className="text-left py-3 px-2">Status</th>
                                                <th className="text-left py-3 px-2">Payment Mode</th>
                                                <th className="text-left py-3 px-2">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedBills.map((bill) => (
                                                <tr key={bill._id} className="border-b hover:bg-muted/50">
                                                    <td className="py-3 px-2">
                                                        {formatDate(bill.createdAt)}
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <div>
                                                            <div className="font-medium">{bill.customer.name}</div>
                                                            <div className="text-sm text-muted-foreground">
                                                                {bill.invoiceNumber}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-2 font-medium">
                                                        {formatCurrency(bill.totalAmount)}
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <select
                                                            value={bill.status}
                                                            onChange={(e) => handleStatusChange(bill._id, e.target.value)}
                                                            className="text-sm border rounded px-2 py-1"
                                                        >
                                                            <option value="Pending">Pending</option>
                                                            <option value="Received">Received</option>
                                                        </select>
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <Input
                                                            value={bill.paymentMode}
                                                            onChange={(e) => handlePaymentModeChange(bill._id, e.target.value)}
                                                            className="text-sm w-24"
                                                            placeholder="Payment mode"
                                                        />
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handlePrint(bill)}
                                                        >
                                                            <Printer className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden space-y-4">
                                {paginatedBills.map((bill) => (
                                    <div key={bill._id} className="border rounded-lg p-4 space-y-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-medium">{bill.customer.name}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {bill.invoiceNumber}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-medium">{formatCurrency(bill.totalAmount)}</div>
                                                <div className="text-sm text-muted-foreground">
                                                    {formatDate(bill.createdAt)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2">
                                            <select
                                                value={bill.status}
                                                onChange={(e) => handleStatusChange(bill._id, e.target.value)}
                                                className="text-sm border rounded px-2 py-1 flex-1"
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="Received">Received</option>
                                            </select>
                                            <Input
                                                value={bill.paymentMode}
                                                onChange={(e) => handlePaymentModeChange(bill._id, e.target.value)}
                                                className="text-sm flex-1"
                                                placeholder="Payment mode"
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePrint(bill)}
                                            >
                                                <Printer className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between mt-6">
                                    <div className="text-sm text-muted-foreground">
                                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredBills.length)} of {filteredBills.length} bills
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <span className="text-sm">
                                            Page {currentPage} of {totalPages}
                                        </span>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </>
    )
}

export default BillHistoryTable