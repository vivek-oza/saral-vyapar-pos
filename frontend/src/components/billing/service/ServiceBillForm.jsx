import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"
import { Input } from "../../ui/input"
import { Textarea } from "../../ui/textarea"
import { Plus, Trash2 } from "lucide-react"
import { useAuth } from '../../../contexts/AuthContext'
import { serviceBillsAPI } from '../../../api/serviceBills'

const ServiceBillForm = ({ onBillCreated }) => {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        customer: {
            name: '',
            phone: '',
            address: ''
        },
        serviceItems: [{
            date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
            description: '',
            amount: ''
        }],
        paymentMode: 'Pending'
    })
    const [errors, setErrors] = useState({})

    const formatDateForDisplay = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-GB') // dd/mm/yyyy format
    }

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

            const response = await serviceBillsAPI.createServiceBill(billData)
            onBillCreated(response.bill)

            // Reset form
            setFormData({
                customer: { name: '', phone: '', address: '' },
                serviceItems: [{
                    date: new Date().toISOString().split('T')[0],
                    description: '',
                    amount: ''
                }],
                paymentMode: 'Pending'
            })

        } catch (error) {
            console.error('Error creating bill:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        setFormData({
            customer: { name: '', phone: '', address: '' },
            serviceItems: [{
                date: new Date().toISOString().split('T')[0],
                description: '',
                amount: ''
            }],
            paymentMode: 'Pending'
        })
        setErrors({})
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create Service Bill</CardTitle>
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
                            Total: ₹{calculateTotal().toFixed(2)}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Generating...' : 'Generate Bill'}
                            </Button>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}

export default ServiceBillForm