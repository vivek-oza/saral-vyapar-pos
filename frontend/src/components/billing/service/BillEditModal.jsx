import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Textarea } from "../../ui/textarea"
import { Plus, Trash2, X, Save } from "lucide-react"
import { serviceBillsAPI } from '../../../api/serviceBills'

const BillEditModal = ({ bill, onClose, onBillUpdated }) => {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        customer: {
            name: '',
            phone: '',
            address: ''
        },
        serviceItems: [{
            date: new Date().toISOString().split('T')[0],
            description: '',
            amount: ''
        }],
        paymentMode: 'Pending',
        status: 'Pending'
    })
    const [errors, setErrors] = useState({})

    useEffect(() => {
        if (bill) {
            setFormData({
                customer: { ...bill.customer },
                serviceItems: bill.serviceItems.map(item => ({
                    ...item,
                    date: item.date ? new Date(item.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
                })),
                paymentMode: bill.paymentMode || 'Pending',
                status: bill.status || 'Pending'
            })
        }
    }, [bill])

    const handleCustomerChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            customer: {
                ...prev.customer,
                [field]: value
            }
        }))

        // Clear error when user starts typing
        if (errors[`customer.${field}`]) {
            setErrors(prev => ({
                ...prev,
                [`customer.${field}`]: ''
            }))
        }
    }

    const handleServiceItemChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            serviceItems: prev.serviceItems.map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            )
        }))

        // Clear error when user starts typing
        if (errors[`serviceItems.${index}.${field}`]) {
            setErrors(prev => ({
                ...prev,
                [`serviceItems.${index}.${field}`]: ''
            }))
        }
    }

    const addServiceRow = () => {
        setFormData(prev => ({
            ...prev,
            serviceItems: [
                ...prev.serviceItems,
                {
                    date: new Date().toISOString().split('T')[0],
                    description: '',
                    amount: ''
                }
            ]
        }))
    }

    const removeServiceRow = (index) => {
        if (formData.serviceItems.length > 1) {
            setFormData(prev => ({
                ...prev,
                serviceItems: prev.serviceItems.filter((_, i) => i !== index)
            }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        // Validate customer details
        if (!formData.customer.name.trim()) {
            newErrors['customer.name'] = 'Client name is required'
        }
        if (!formData.customer.phone.trim()) {
            newErrors['customer.phone'] = 'Phone number is required'
        } else if (!/^[6-9]\d{9}$/.test(formData.customer.phone)) {
            newErrors['customer.phone'] = 'Invalid phone number format'
        }

        // Validate service items
        formData.serviceItems.forEach((item, index) => {
            if (!item.description.trim()) {
                newErrors[`serviceItems.${index}.description`] = 'Service description is required'
            }
            if (!item.amount || isNaN(item.amount) || parseFloat(item.amount) <= 0) {
                newErrors[`serviceItems.${index}.amount`] = 'Valid amount is required'
            }
        })

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const calculateTotal = () => {
        return formData.serviceItems.reduce((total, item) => {
            return total + (parseFloat(item.amount) || 0)
        }, 0)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) {
            return
        }

        setLoading(true)
        try {
            const billData = {
                ...formData,
                totalAmount: calculateTotal()
            }

            const response = await serviceBillsAPI.updateBill(bill._id, billData)
            onBillUpdated(response.bill)
            onClose()
        } catch (error) {
            console.error('Error updating bill:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount || 0)
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <Card className="border-0 shadow-none">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-xl">Edit Bill - {bill?.invoiceNumber}</CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            disabled={loading}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Customer Details Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Customer Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Client Name *</label>
                                        <Input
                                            value={formData.customer.name}
                                            onChange={(e) => handleCustomerChange('name', e.target.value)}
                                            placeholder="Enter client name"
                                            className={errors['customer.name'] ? 'border-destructive' : ''}
                                        />
                                        {errors['customer.name'] && (
                                            <p className="text-destructive text-sm">{errors['customer.name']}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Phone Number *</label>
                                        <Input
                                            value={formData.customer.phone}
                                            onChange={(e) => handleCustomerChange('phone', e.target.value)}
                                            placeholder="Enter phone number"
                                            className={errors['customer.phone'] ? 'border-destructive' : ''}
                                        />
                                        {errors['customer.phone'] && (
                                            <p className="text-destructive text-sm">{errors['customer.phone']}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Address (Optional)</label>
                                    <Textarea
                                        value={formData.customer.address}
                                        onChange={(e) => handleCustomerChange('address', e.target.value)}
                                        placeholder="Enter client address"
                                        rows={2}
                                    />
                                </div>
                            </div>

                            {/* Bill Status and Payment Mode */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">Bill Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Received">Received</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Payment Mode</label>
                                        <Input
                                            value={formData.paymentMode}
                                            onChange={(e) => setFormData(prev => ({ ...prev, paymentMode: e.target.value }))}
                                            placeholder="Enter payment mode"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Service Rows Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium">Service Details</h3>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addServiceRow}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Row
                                    </Button>
                                </div>

                                {formData.serviceItems.map((item, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Date</label>
                                            <Input
                                                type="date"
                                                value={item.date}
                                                onChange={(e) => handleServiceItemChange(index, 'date', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-medium">Service Description *</label>
                                            <Input
                                                value={item.description}
                                                onChange={(e) => handleServiceItemChange(index, 'description', e.target.value)}
                                                placeholder="Describe the service provided"
                                                className={errors[`serviceItems.${index}.description`] ? 'border-destructive' : ''}
                                            />
                                            {errors[`serviceItems.${index}.description`] && (
                                                <p className="text-destructive text-sm">{errors[`serviceItems.${index}.description`]}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Amount *</label>
                                            <div className="flex">
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    value={item.amount}
                                                    onChange={(e) => handleServiceItemChange(index, 'amount', e.target.value)}
                                                    placeholder="0.00"
                                                    className={errors[`serviceItems.${index}.amount`] ? 'border-destructive' : ''}
                                                />
                                                {formData.serviceItems.length > 1 && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className="ml-2"
                                                        onClick={() => removeServiceRow(index)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                            {errors[`serviceItems.${index}.amount`] && (
                                                <p className="text-destructive text-sm">{errors[`serviceItems.${index}.amount`]}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Total and Actions */}
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t">
                                <div className="text-lg font-semibold">
                                    Total: {formatCurrency(calculateTotal())}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onClose}
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default BillEditModal
