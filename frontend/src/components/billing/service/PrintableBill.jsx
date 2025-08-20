import { useAuth } from '../../../contexts/AuthContext'
import { useEffect, useState, useRef } from 'react'

const PrintableBill = ({ bill, onClose }) => {
    const { user } = useAuth()
    const [template, setTemplate] = useState('default') // 'default' | 'compact' | 'gst'

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

    // Thumbnails will use the same live bill/user data to keep previews consistent.

    const handlePrint = () => {
        // Hide the modal controls and print the current page
        const controls = document.querySelector('.print-controls')
        if (controls) controls.style.display = 'none'

        // Set a meaningful print title for exported PDF/print job
        const prevTitle = document.title
        const shopId = (user?.shop?.username || user?.shop?.name || 'invoice').toString().replace(/\s+/g, '')
        const invoiceNo = bill?.invoiceNumber || 'invoice'
        document.title = `${shopId}_${invoiceNo}`

        // Trigger print
        window.print()

        // Restore controls after print dialog
        setTimeout(() => {
            if (controls) controls.style.display = 'flex'
            document.title = prevTitle
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
            {/* Print Styles (template-aware) */}
            <style>{`
                /* Screen preview improvements */
                @media screen {
                    #print-root { display: flex; justify-content: center; padding: 24px; }
                    .a4 { width: 794px; /* ~A4 @96dpi */ background: #fff; }
                    .receipt { width: 72mm; background: #fff; }
                    .printable-content { margin: 0 auto; }
                    /* Thumbnails: single A4-ratio container. Inner content is dynamically scaled to fit */
                    .thumb { border: 1px dashed #d1d5db; background: #fff; border-radius: 8px; padding: 8px; overflow: hidden; }
                    .thumb-a4 { width: 200px; height: 284px; /* A4 aspect ratio (1:1.414) */ position: relative; }
                    .thumb-inner { transform-origin: top left; position: absolute; left: 8px; top: 8px; }

                    /* Slight zoom-out for modal content to improve UX */
                    .print-overlay-root .print-controls, .print-overlay-root #print-root { transform: scale(0.88); transform-origin: top center; }
                    .print-overlay-root #print-root { margin-top: 8px; }
                }

                @media print {
                    /* Ensure only this overlay prints */
                    body > *:not(.print-overlay-root) { display: none !important; }
                    /* Hide everything except our print root to avoid duplicates */
                    html, body { padding: 0 !important; margin: 0 !important; height: auto !important; }
                    body * { visibility: hidden !important; }
                    #print-root, #print-root * { visibility: visible !important; }
                    #print-root { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; margin: 0 !important; padding: 0 !important; display: block !important; overflow: visible !important; }
                    .print-controls { display: none !important; }
                    .printable-bill-modal { box-shadow: none !important; background: #fff !important; }

                    /* Common print typography */
                    .printable-content { padding: 20px !important; color: #000 !important; }
                    .print-table { width: 100%; border-collapse: collapse; }
                    .print-table th, .print-table td { border: 1px solid #000 !important; }

                    /* Page sizes by template */
                    ${template === 'default' ? `@page { size: A4; margin: 0.5in; }` : ''}
                    ${template === 'gst' ? `@page { size: A4; margin: 0.6in; }` : ''}
                    ${template === 'compact' ? `@page { size: 80mm auto; margin: 5mm; }` : ''}
                }
            `}</style>

            <div className="print-overlay-root fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="printable-bill-modal bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                    {/* Print Controls - Hidden in print */}
                    <div className="print-controls w-full p-4 border-b bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                        <div className="flex flex-col gap-3">
                            <div className="flex justify-between items-center">
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
                            {/* Template selector */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'default', name: 'Default', desc: 'A4, detailed' },
                                    { id: 'compact', name: 'Compact Slip', desc: '80mm receipt' },
                                    { id: 'gst', name: 'GST Invoice', desc: 'A4, GST fields' },
                                ].map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTemplate(t.id)}
                                        className={`text-left border rounded-lg p-3 hover:border-green-500 transition relative ${template === t.id ? 'border-green-600 ring-2 ring-green-200' : 'border-gray-200'}`}
                                        title={t.desc}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold">{t.name}</span>
                                            {template === t.id && <span className="text-green-700 text-xs font-medium">Selected</span>}
                                        </div>
                                        {/* dynamic-fit thumbnail using same data */}
                                        <ThumbnailPreview type={t.id} bill={bill} user={user} />
                                        <div className="mt-2 text-xs text-gray-500">{t.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Printable Content Root */}
                    <div id="print-root">
                        {template === 'default' && (
                            <DefaultTemplate bill={bill} user={user} formatDate={formatDate} formatCurrency={formatCurrency} />
                        )}
                        {template === 'compact' && (
                            <CompactTemplate bill={bill} user={user} formatDate={formatDate} formatCurrency={formatCurrency} />
                        )}
                        {template === 'gst' && (
                            <GSTTemplate bill={bill} user={user} formatDate={formatDate} formatCurrency={formatCurrency} />
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

// Dynamically scale template to fully fit inside an A4 thumbnail box
function ThumbnailPreview({ type, bill, user }) {
    const outerRef = useRef(null)
    const innerRef = useRef(null)
    const [scale, setScale] = useState(0.25)
    const [ready, setReady] = useState(false)

    useEffect(() => {
        const measure = () => {
            if (!outerRef.current || !innerRef.current) return
            const padding = 16 // .thumb has 8px padding on each side
            const availW = outerRef.current.clientWidth - padding
            const availH = outerRef.current.clientHeight - padding
            const prev = innerRef.current.style.transform
            innerRef.current.style.transform = 'scale(1)'
            const w = innerRef.current.scrollWidth
            const h = innerRef.current.scrollHeight
            const s = Math.min(availW / w, availH / h)
            innerRef.current.style.transform = prev
            if (isFinite(s) && s > 0) {
                setScale(s)
                setReady(true)
            }
        }
        // Measure after paint
        const id = requestAnimationFrame(measure)
        window.addEventListener('resize', measure)
        return () => {
            cancelAnimationFrame(id)
            window.removeEventListener('resize', measure)
        }
    }, [type, bill, user])

    return (
        <div className="thumb thumb-a4" ref={outerRef}>
            <div className="thumb-inner" ref={innerRef} style={{ transform: `scale(${scale})`, opacity: ready ? 1 : 0 }}>
                {type === 'default' && (
                    <DefaultTemplate bill={bill} user={user} formatDate={(d)=>new Date(d).toLocaleDateString('en-GB')} formatCurrency={(a)=> new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',minimumFractionDigits:0,maximumFractionDigits:2}).format(a||0)} />
                )}
                {type === 'compact' && (
                    <CompactTemplate bill={bill} user={user} formatDate={(d)=>new Date(d).toLocaleDateString('en-GB')} formatCurrency={(a)=> new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',minimumFractionDigits:0,maximumFractionDigits:2}).format(a||0)} />
                )}
                {type === 'gst' && (
                    <GSTTemplate bill={bill} user={user} formatDate={(d)=>new Date(d).toLocaleDateString('en-GB')} formatCurrency={(a)=> new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',minimumFractionDigits:0,maximumFractionDigits:2}).format(a||0)} />
                )}
            </div>
        </div>
    )
}

export default PrintableBill

// ---------------- Templates ----------------
const DefaultTemplate = ({ bill, user, formatDate, formatCurrency }) => (
    <div className="a4 printable-content">
        <div className="text-center mb-8 border-b-2 border-gray-800 pb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{user?.shop?.name || 'Business Name'}</h1>
            {user?.shop?.address && (<p className="text-gray-600 mb-1">{user?.shop?.address}</p>)}
            {user?.shop?.phone && (<p className="text-gray-600 mb-1">Phone: {user?.shop?.phone}</p>)}
            {user?.shop?.gst_number && (<p className="text-gray-600">GST: {user?.shop?.gst_number}</p>)}
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Bill To:</h3>
                <p className="font-semibold text-gray-900 text-lg">{bill.customer.name}</p>
                <p className="text-gray-600">Phone: {bill.customer.phone}</p>
                {bill.customer.address && (<p className="text-gray-600">{bill.customer.address}</p>)}
            </div>
            <div className="text-right">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Invoice Details:</h3>
                <p className="text-gray-700 mb-1"><span className="font-semibold">Invoice #:</span> {bill.invoiceNumber}</p>
                <p className="text-gray-700 mb-1"><span className="font-semibold">Date:</span> {formatDate(bill.createdAt)}</p>
                <p className="text-gray-700"><span className="font-semibold">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded text-sm ${bill.status === 'Received' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>{bill.status}</span>
                </p>
            </div>
        </div>

        <div className="mb-8">
            <table className="print-table w-full border border-gray-300">
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
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">{formatDate(item.date)}</td>
                            <td className="border border-gray-300 px-4 py-3 text-gray-700">{item.description}</td>
                            <td className="border border-gray-300 px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(item.amount)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>

        <div className="text-right mb-8">
            <div className="inline-block pt-2 min-w-[250px]">
                <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-800">Total Amount:</span>
                    <span className="text-2xl font-bold text-green-600">{formatCurrency(bill.totalAmount)}</span>
                </div>
            </div>
        </div>

        {bill.paymentMode && bill.paymentMode !== 'Pending' && (
            <div className="mb-8">
                <p className="text-gray-700"><span className="font-semibold">Payment Mode:</span>
                    <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded">{bill.paymentMode}</span>
                </p>
            </div>
        )}

        <div className="text-center border-t border-gray-300 pt-6">
            <p className="font-semibold text-gray-800 mb-2">Thank you for your business!</p>
            <p className="text-sm text-gray-600 mb-1">This is a computer-generated invoice and does not require signature.</p>
            <p className="text-sm text-gray-600 mb-1">Please retain this copy for your records.</p>
            <p className="text-sm text-gray-700 font-medium">This is a legitimate bill. Kindly ensure timely payment as per agreed terms.</p>
        </div>
    </div>
)

const CompactTemplate = ({ bill, user, formatDate, formatCurrency }) => (
    <div className="receipt printable-content text-[11px] leading-tight">
        <div className="text-center mb-2">
            <div className="text-base font-bold">{user?.shop?.name || 'Business Name'}</div>
            {user?.shop?.phone && (<div className="text-xs">Ph: {user?.shop?.phone}</div>)}
        </div>
        <div className="mb-2 text-xs">
            <div className="flex justify-between"><span>Invoice:</span><span>{bill.invoiceNumber}</span></div>
            <div className="flex justify-between"><span>Date:</span><span>{formatDate(bill.createdAt)}</span></div>
            <div className="flex justify-between"><span>Customer:</span><span>{bill.customer.name}</span></div>
        </div>
        <table className="w-full text-xs">
            <thead>
                <tr>
                    <th className="border-y py-1 text-left">Item</th>
                    <th className="border-y py-1 text-right">Amt</th>
                </tr>
            </thead>
            <tbody>
                {bill.serviceItems.map((item, idx) => (
                    <tr key={idx}>
                        <td className="py-1 pr-2">{item.description}</td>
                        <td className="py-1 text-right">{formatCurrency(item.amount)}</td>
                    </tr>
                ))}
            </tbody>
        </table>
        <div className="mt-2 border-t pt-1 flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrency(bill.totalAmount)}</span>
        </div>
        {bill.paymentMode && bill.paymentMode !== 'Pending' && (
            <div className="mt-1 text-xs">Mode: {bill.paymentMode}</div>
        )}
        <div className="mt-2 text-center text-[10px]">Thank you! Visit again.</div>
        <div className="mt-1 text-center text-[10px] font-medium">This is a legitimate bill. Please pay on time.</div>
    </div>
)

const GSTTemplate = ({ bill, user, formatDate, formatCurrency }) => (
    <div className="a4 printable-content">
        <div className="mb-4">
            <div className="text-2xl font-bold">TAX INVOICE</div>
        </div>
        <div className="flex justify-between mb-4">
            <div>
                <div className="text-xl font-bold">{user?.shop?.name || 'Business Name'}</div>
                {user?.shop?.address && (<div className="text-sm">{user?.shop?.address}</div>)}
                {user?.shop?.gst_number && (<div className="text-sm">GSTIN: {user?.shop?.gst_number}</div>)}
            </div>
            <div className="text-right text-sm">
                <div><span className="font-semibold">Invoice #:</span> {bill.invoiceNumber}</div>
                <div><span className="font-semibold">Date:</span> {formatDate(bill.createdAt)}</div>
            </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div>
                <div className="font-semibold mb-1">Bill To</div>
                <div className="font-medium">{bill.customer.name}</div>
                {bill.customer.address && (<div>{bill.customer.address}</div>)}
                {bill.customer.phone && (<div>Ph: {bill.customer.phone}</div>)}
            </div>
            <div>
                <div className="font-semibold mb-1">Place of Supply</div>
                <div>{user?.shop?.state || '-'}</div>
            </div>
        </div>
        <table className="print-table w-full border border-gray-300 text-sm">
            <thead>
                <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-2 py-2 text-left">Description</th>
                    <th className="border border-gray-300 px-2 py-2 text-right">Amount</th>
                    <th className="border border-gray-300 px-2 py-2 text-right">Taxable</th>
                    <th className="border border-gray-300 px-2 py-2 text-right">GST%</th>
                    <th className="border border-gray-300 px-2 py-2 text-right">GST Amt</th>
                </tr>
            </thead>
            <tbody>
                {bill.serviceItems.map((item, idx) => {
                    const rate = item.gstRate ?? 18
                    const taxable = Number(item.amount) / (1 + rate / 100)
                    const gstAmt = Number(item.amount) - taxable
                    return (
                        <tr key={idx}>
                            <td className="border border-gray-300 px-2 py-2">{item.description}</td>
                            <td className="border border-gray-300 px-2 py-2 text-right">{formatCurrency(item.amount)}</td>
                            <td className="border border-gray-300 px-2 py-2 text-right">{formatCurrency(taxable)}</td>
                            <td className="border border-gray-300 px-2 py-2 text-right">{rate}%</td>
                            <td className="border border-gray-300 px-2 py-2 text-right">{formatCurrency(gstAmt)}</td>
                        </tr>
                    )
                })}
            </tbody>
        </table>
        <div className="mt-4 flex justify-end">
            <div className="min-w-[260px]">
                <div className="flex justify-between py-1 text-sm"><span className="font-semibold">Total Amount</span><span className="font-bold">{formatCurrency(bill.totalAmount)}</span></div>
                <div className="flex justify-between py-1 text-sm"><span>Round Off</span><span>0.00</span></div>
                <div className="flex justify-between py-1 text-base font-semibold border-t mt-1 pt-2"><span>Grand Total</span><span>{formatCurrency(bill.totalAmount)}</span></div>
            </div>
        </div>
        <div className="mt-6 text-xs text-gray-600">
            Declaration: We declare that this invoice shows the actual price of the goods/services described and that all particulars are true and correct.
        </div>
        <div className="mt-2 text-xs text-gray-800 font-medium text-center">This is a legitimate bill. Kindly ensure timely payment as per agreed terms.</div>
    </div>
)