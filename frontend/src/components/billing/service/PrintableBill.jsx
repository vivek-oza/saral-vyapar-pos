import { useAuth } from '../../../contexts/AuthContext'
import { useEffect } from 'react'

const PrintableBill = ({ bill, onClose }) => {
    const { user } = useAuth()

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

    const handlePrint = () => {
        // Hide the modal controls and print the current page
        const printButton = document.querySelector('.print-controls')
        if (printButton) {
            printButton.style.display = 'none'
        }

        // Trigger print
        window.print()

        // Show the controls back after print dialog
        setTimeout(() => {
            if (printButton) {
                printButton.style.display = 'flex'
            }
        }, 100)
    }

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.keyCode === 27) {
                onClose()
            }
        }
        document.addEventListener('keydown', handleEsc)
        return () => {
            document.removeEventListener('keydown', handleEsc)
        }
    }, [onClose])

    return (
        <>
            {/* Print Styles */}
            <style>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    
                    .printable-bill-modal,
                    .printable-bill-modal * {
                        visibility: visible;
                    }
                    
                    .printable-bill-modal {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        height: 100% !important;
                        background: white !important;
                        z-index: 9999 !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        border-radius: 0 !important;
                        box-shadow: none !important;
                        max-width: none !important;
                        max-height: none !important;
                        overflow: visible !important;
                    }
                    
                    .print-controls {
                        display: none !important;
                    }
                    
                    .printable-content {
                        padding: 20px !important;
                        font-size: 12px !important;
                        line-height: 1.4 !important;
                        color: #000 !important;
                    }
                    
                    .print-header {
                        text-align: center;
                        margin-bottom: 20px;
                        border-bottom: 2px solid #000;
                        padding-bottom: 15px;
                    }
                    
                    .print-header h1 {
                        font-size: 18px !important;
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    
                    .print-header p {
                        font-size: 11px !important;
                        margin: 2px 0;
                    }
                    
                    .print-invoice-details {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 20px;
                    }
                    
                    .print-bill-to,
                    .print-invoice-info {
                        width: 48%;
                    }
                    
                    .print-invoice-info {
                        text-align: right;
                    }
                    
                    .print-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 15px;
                    }
                    
                    .print-table th,
                    .print-table td {
                        border: 1px solid #000 !important;
                        padding: 6px 8px;
                        font-size: 11px !important;
                    }
                    
                    .print-table th {
                        background-color: #f0f0f0 !important;
                        font-weight: bold;
                        text-align: left;
                    }
                    
                    .print-total {
                        text-align: right;
                        margin-bottom: 15px;
                    }
                    
                    .print-total-row {
                        display: inline-block;
                        border-top: 2px solid #000;
                        padding-top: 8px;
                        min-width: 200px;
                    }
                    
                    .print-footer {
                        text-align: center;
                        border-top: 1px solid #ccc;
                        padding-top: 10px;
                        font-size: 10px !important;
                        color: #666;
                    }
                    
                    @page {
                        size: A4;
                        margin: 0.5in;
                    }
                }
            `}</style>

            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="printable-bill-modal bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                    {/* Print Controls - Hidden in print */}
                    <div className="print-controls flex justify-between items-center p-4 border-b bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                        <h2 className="text-lg font-semibold text-green-800">Invoice Preview</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={handlePrint}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
                            >
                                Print Invoice
                            </button>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>

                    {/* Printable Content */}
                    <div className="printable-content p-8">
                        {/* Business Header */}
                        <div className="print-header text-center mb-8 border-b-2 border-gray-800 pb-6">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{user?.shop?.name || 'Business Name'}</h1>
                            {user?.shop?.address && (
                                <p className="text-gray-600 mb-1">{user?.shop?.address}</p>
                            )}
                            {user?.shop?.phone && (
                                <p className="text-gray-600 mb-1">Phone: {user?.shop?.phone}</p>
                            )}
                            {user?.shop?.gst_number && (
                                <p className="text-gray-600">GST: {user?.shop?.gst_number}</p>
                            )}
                        </div>

                        {/* Invoice Details */}
                        <div className="print-invoice-details grid grid-cols-2 gap-8 mb-8">
                            <div className="print-bill-to">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Bill To:</h3>
                                <p className="font-semibold text-gray-900 text-lg">{bill.customer.name}</p>
                                <p className="text-gray-600">Phone: {bill.customer.phone}</p>
                                {bill.customer.address && (
                                    <p className="text-gray-600">{bill.customer.address}</p>
                                )}
                            </div>
                            <div className="print-invoice-info text-right">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Invoice Details:</h3>
                                <p className="text-gray-700 mb-1">
                                    <span className="font-semibold">Invoice #:</span> {bill.invoiceNumber}
                                </p>
                                <p className="text-gray-700 mb-1">
                                    <span className="font-semibold">Date:</span> {formatDate(bill.createdAt)}
                                </p>
                                <p className="text-gray-700">
                                    <span className="font-semibold">Status:</span>
                                    <span className={`ml-2 px-2 py-1 rounded text-sm ${bill.status === 'Received'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-orange-100 text-orange-800'
                                        }`}>
                                        {bill.status}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Service Items Table */}
                        <div className="mb-8">
                            <table className="print-table w-full border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Date</th>
                                        <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Service Description</th>
                                        <th className="border border-gray-300 px-4 py-3 text-right font-semibold">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bill.serviceItems.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="border border-gray-300 px-4 py-3 text-gray-700">
                                                {formatDate(item.date)}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-3 text-gray-700">
                                                {item.description}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-900">
                                                {formatCurrency(item.amount)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Total */}
                        <div className="print-total text-right mb-8">
                            <div className="print-total-row inline-block border-t-2 border-gray-800 pt-4 min-w-[250px]">
                                <div className="flex justify-between items-center">
                                    <span className="text-xl font-bold text-gray-800">Total Amount:</span>
                                    <span className="text-2xl font-bold text-green-600">
                                        {formatCurrency(bill.totalAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        {bill.paymentMode && bill.paymentMode !== 'Pending' && (
                            <div className="mb-8">
                                <p className="text-gray-700">
                                    <span className="font-semibold">Payment Mode:</span>
                                    <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded">
                                        {bill.paymentMode}
                                    </span>
                                </p>
                            </div>
                        )}

                        {/* Legal Compliance Note */}
                        <div className="print-footer text-center border-t border-gray-300 pt-6">
                            <p className="font-semibold text-gray-800 mb-2">Thank you for your business!</p>
                            <p className="text-sm text-gray-600 mb-1">
                                This is a computer-generated invoice and does not require signature.
                            </p>
                            <p className="text-sm text-gray-600">
                                Please retain this copy for your records.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default PrintableBill