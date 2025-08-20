import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Badge } from "../../ui/badge"
import PrintableBill from "./PrintableBill"
import BillEditModal from "./BillEditModal"
import { serviceBillsAPI } from '../../../api/serviceBills'
import { Search, Printer, ChevronLeft, ChevronRight, BadgeIndianRupee, Edit, Save, X, FileEdit } from "lucide-react"

const BillHistoryTable = ({ bills, loading, onBillUpdated, onRefresh }) => {
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [printBill, setPrintBill] = useState(null)
    const [editingBill, setEditingBill] = useState(null)
    const [editFormData, setEditFormData] = useState({})
    const [saving, setSaving] = useState(false)
    const [fullEditBill, setFullEditBill] = useState(null)
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

    const startEditing = (bill) => {
        setEditingBill(bill._id)
        setEditFormData({
            status: bill.status,
            paymentMode: bill.paymentMode,
            customer: { ...bill.customer },
            serviceItems: [...bill.serviceItems],
            totalAmount: bill.totalAmount
        })
    }

    const cancelEditing = () => {
        setEditingBill(null)
        setEditFormData({})
    }

    const handleEditChange = (field, value) => {
        setEditFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleCustomerEditChange = (field, value) => {
        setEditFormData(prev => ({
            ...prev,
            customer: {
                ...prev.customer,
                [field]: value
            }
        }))
    }

    const handleServiceItemEditChange = (index, field, value) => {
        setEditFormData(prev => ({
            ...prev,
            serviceItems: prev.serviceItems.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }))
    }

    const addServiceRow = () => {
        setEditFormData(prev => ({
            ...prev,
            serviceItems: [
                ...prev.serviceItems,
                {
                    date: new Date().toISOString().split('T')[0],
                    description: '',
                    amount: 0
                }
            ]
        }))
    }

    const removeServiceRow = (index) => {
        if (editFormData.serviceItems.length > 1) {
            setEditFormData(prev => ({
                ...prev,
                serviceItems: prev.serviceItems.filter((_, i) => i !== index)
            }))
        }
    }

    const calculateEditTotal = () => {
        return editFormData.serviceItems?.reduce((total, item) => {
            return total + (parseFloat(item.amount) || 0)
        }, 0) || 0
    }

    const saveChanges = async () => {
        setSaving(true)
        try {
            const updatedData = {
                ...editFormData,
                totalAmount: calculateEditTotal()
            }
            const response = await serviceBillsAPI.updateBill(editingBill, updatedData)
            onBillUpdated(response.bill)
            setEditingBill(null)
            setEditFormData({})
        } catch (error) {
            console.error('Error updating bill:', error)
        } finally {
            setSaving(false)
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
            {fullEditBill && (
                <BillEditModal
                    bill={fullEditBill}
                    onClose={() => setFullEditBill(null)}
                    onBillUpdated={onBillUpdated}
                />
            )}
            <Card className="bg-white shadow-md border-green-100">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <CardTitle className="text-green-800 flex items-center gap-2">
                            <BadgeIndianRupee className="h-5 w-5" />
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
                                                        {editingBill === bill._id ? (
                                                            <select
                                                                value={editFormData.status}
                                                                onChange={(e) => handleEditChange('status', e.target.value)}
                                                                className="text-sm border rounded px-2 py-1"
                                                            >
                                                                <option value="Pending">Pending</option>
                                                                <option value="Received">Received</option>
                                                            </select>
                                                        ) : (
                                                            <Badge variant={bill.status === 'Received' ? 'default' : 'destructive'}>
                                                                {bill.status}
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        {editingBill === bill._id ? (
                                                            <Input
                                                                value={editFormData.paymentMode}
                                                                onChange={(e) => handleEditChange('paymentMode', e.target.value)}
                                                                className="text-sm w-24"
                                                                placeholder="Payment mode"
                                                            />
                                                        ) : (
                                                            <span className="text-sm">{bill.paymentMode}</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <div className="flex gap-1">
                                                            {editingBill === bill._id ? (
                                                                <>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={saveChanges}
                                                                        disabled={saving}
                                                                        title="Save quick changes"
                                                                    >
                                                                        <Save className="h-4 w-4" />&nbsp;Save
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={cancelEditing}
                                                                        disabled={saving}
                                                                    >
                                                                        <X className="h-4 w-4" />&nbsp;Cancel
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => startEditing(bill)}
                                                                        title="Quick edit status & payment"
                                                                    >
                                                                        <Edit className="h-4 w-4" />{" "}&nbsp;Status
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => setFullEditBill(bill)}
                                                                        title="Full bill edit"
                                                                    >
                                                                        <FileEdit className="h-4 w-4" />&nbsp;Bill
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => handlePrint(bill)}
                                                                    >
                                                                        <Printer className="h-4 w-4" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
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
                                            {editingBill === bill._id ? (
                                                <>
                                                    <select
                                                        value={editFormData.status}
                                                        onChange={(e) => handleEditChange('status', e.target.value)}
                                                        className="text-sm border rounded px-2 py-1 flex-1"
                                                    >
                                                        <option value="Pending">Pending</option>
                                                        <option value="Received">Received</option>
                                                    </select>
                                                    <Input
                                                        value={editFormData.paymentMode}
                                                        onChange={(e) => handleEditChange('paymentMode', e.target.value)}
                                                        className="text-sm flex-1"
                                                        placeholder="Payment mode"
                                                    />
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={saveChanges}
                                                        disabled={saving}
                                                    >
                                                        <Save className="h-4 w-4" />&nbsp;Save
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={cancelEditing}
                                                        disabled={saving}
                                                    >
                                                        <X className="h-4 w-4" />&nbsp;Cancel
                                                    </Button>
                                                </>
                                            ) : (
                                                <>
                                                    <Badge variant={bill.status === 'Received' ? 'default' : 'destructive'} className="flex-1">
                                                        {bill.status}
                                                    </Badge>
                                                    <span className="text-sm flex-1">{bill.paymentMode}</span>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => startEditing(bill)}
                                                        title="Quick edit"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setFullEditBill(bill)}
                                                        title="Full edit"
                                                    >
                                                        <FileEdit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handlePrint(bill)}
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
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