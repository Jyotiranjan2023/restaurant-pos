import { useState } from 'react'
import { exportToCsv } from '../utils/csvExport'
import {
  fetchSalesReport,
  fetchProductReport,
  fetchStaffReport,
  fetchGstReport,
  fetchPaymentMethodReport,
} from '../services/reportService'

const TABS = ['Sales', 'Products', 'Staff', 'GST', 'Payments']

const today = () => new Date().toISOString().split('T')[0]
const daysAgo = (n) => {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

const QUICK_RANGES = [
  { label: 'Today', from: today(), to: today() },
  { label: 'Last 7 days', from: daysAgo(6), to: today() },
  { label: 'Last 30 days', from: daysAgo(29), to: today() },
  { label: 'This month', from: new Date().toISOString().slice(0, 7) + '-01', to: today() },
]

export default function Reports() {
  const [activeTab, setActiveTab] = useState('Sales')
  const [from, setFrom] = useState(daysAgo(29))
  const [to, setTo] = useState(today())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  const fetchReport = async (tab = activeTab, fromDate = from, toDate = to) => {
    if (!fromDate || !toDate) { setError('Select both dates'); return }
    if (fromDate > toDate) { setError('From date cannot be after To date'); return }

    setLoading(true)
    setError('')
    setData(null)

    try {
      let res
      if (tab === 'Sales') res = await fetchSalesReport(fromDate, toDate)
      else if (tab === 'Products') res = await fetchProductReport(fromDate, toDate)
      else if (tab === 'Staff') res = await fetchStaffReport(fromDate, toDate)
      else if (tab === 'GST') res = await fetchGstReport(fromDate, toDate)
      else if (tab === 'Payments') res = await fetchPaymentMethodReport(fromDate, toDate)

      if (res.success) {
        setData(res.data)
      } else {
        setError(res.message || 'Failed to fetch report')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error')
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setData(null)
    setError('')
  }
const handleExportCsv = () => {
  if (!data) return
  const dateRange = `${from}_to_${to}`

  if (activeTab === 'Sales') {
    const columns = [
      { key: 'date', label: 'Date' },
      { key: 'orderCount', label: 'Orders' },
      { key: 'revenue', label: 'Revenue (INR)' },
      { key: 'gst', label: 'GST (INR)' },
      { key: 'discount', label: 'Discount (INR)' },
    ]
    const rows = (data.dailySales || [])
      .filter(d => d.orderCount > 0)
      .map(d => ({
        date: d.date,
        orderCount: d.orderCount,
        revenue: Number(d.revenue).toFixed(2),
        gst: Number(d.gst).toFixed(2),
        discount: Number(d.discount).toFixed(2),
      }))
    exportToCsv(`sales_report_${dateRange}`, columns, rows)
  }

  else if (activeTab === 'Products') {
    const columns = [
      { key: 'productName', label: 'Product' },
      { key: 'categoryName', label: 'Category' },
      { key: 'quantitySold', label: 'Quantity Sold' },
      { key: 'revenue', label: 'Revenue (INR)' },
      { key: 'avgPrice', label: 'Avg Price (INR)' },
    ]
    const rows = data.map(p => ({
      productName: p.productName,
      categoryName: p.categoryName,
      quantitySold: p.quantitySold,
      revenue: Number(p.revenue).toFixed(2),
      avgPrice: Number(p.avgPrice).toFixed(2),
    }))
    exportToCsv(`products_report_${dateRange}`, columns, rows)
  }

  else if (activeTab === 'Staff') {
    const columns = [
      { key: 'fullName', label: 'Name' },
      { key: 'username', label: 'Username' },
      { key: 'role', label: 'Role' },
      { key: 'ordersHandled', label: 'Orders Handled' },
      { key: 'totalSales', label: 'Total Sales (INR)' },
    ]
    const rows = data.map(s => ({
      fullName: s.fullName,
      username: s.username,
      role: s.role,
      ordersHandled: s.ordersHandled,
      totalSales: Number(s.totalSales).toFixed(2),
    }))
    exportToCsv(`staff_report_${dateRange}`, columns, rows)
  }

  else if (activeTab === 'GST') {
    const columns = [
      { key: 'gstRate', label: 'GST Rate (%)' },
      { key: 'taxableAmount', label: 'Taxable Amount (INR)' },
      { key: 'cgst', label: 'CGST (INR)' },
      { key: 'sgst', label: 'SGST (INR)' },
      { key: 'total', label: 'Total GST (INR)' },
    ]
    const rows = (data.rateBreakdowns || []).map(r => ({
      gstRate: r.gstRate,
      taxableAmount: Number(r.taxableAmount).toFixed(2),
      cgst: Number(r.cgst).toFixed(2),
      sgst: Number(r.sgst).toFixed(2),
      total: Number(r.total).toFixed(2),
    }))
    exportToCsv(`gst_report_${dateRange}`, columns, rows)
  }

  else if (activeTab === 'Payments') {
    const columns = [
      { key: 'method', label: 'Payment Method' },
      { key: 'transactionCount', label: 'Transactions' },
      { key: 'totalAmount', label: 'Total Amount (INR)' },
      { key: 'percentage', label: 'Percentage (%)' },
    ]
    const rows = data.map(p => ({
      method: p.method,
      transactionCount: p.transactionCount,
      totalAmount: Number(p.totalAmount).toFixed(2),
      percentage: Number(p.percentage).toFixed(1),
    }))
    exportToCsv(`payments_report_${dateRange}`, columns, rows)
  }
}

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          View sales, product, staff, GST and payment reports
        </p>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
        <p className="text-xs font-semibold text-gray-600 mb-2">Date Range</p>

        {/* Quick ranges */}
        <div className="flex gap-2 flex-wrap mb-3">
          {QUICK_RANGES.map((r) => (
            <button
              key={r.label}
              type="button"
              onClick={() => handleQuickRange(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all
                ${from === r.from && to === r.to
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Custom date inputs */}
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <button
            type="button"
            onClick={() => fetchReport()}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-60"
          >
            {loading ? 'Loading...' : 'Generate Report'}
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-600 mt-2">{error}</p>
        )}
      </div>

      {/* Report Type Tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all
              ${activeTab === tab
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
          >
            {tab === 'Sales' && '📊 '}
            {tab === 'Products' && '🍽️ '}
            {tab === 'Staff' && '👤 '}
            {tab === 'GST' && '🧾 '}
            {tab === 'Payments' && '💳 '}
            {tab}
          </button>
        ))}
      </div>

      {/* Export CSV button — only shows when data is loaded */}
{!loading && data && (
  <div className="flex justify-end mb-3">
    <button
      type="button"
      onClick={handleExportCsv}
      className="text-sm bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2"
    >
      ⬇ Export CSV
    </button>
  </div>
)}

      {/* No data yet */}
      {!loading && !data && !error && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-3xl mb-2">📊</p>
          <p className="text-gray-500 text-sm">
            Select a date range and click Generate Report
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-500">Loading report...</p>
        </div>
      )}

      {/* SALES REPORT */}
      {!loading && data && activeTab === 'Sales' && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total Revenue', value: `₹${Number(data.totalRevenue).toFixed(2)}`, color: 'text-green-600' },
              { label: 'Total Orders', value: data.totalOrders, color: 'text-blue-600' },
              { label: 'Total Bills', value: data.totalBills, color: 'text-orange-600' },
              { label: 'Items Sold', value: data.totalItemsSold, color: 'text-purple-600' },
              { label: 'Avg Order Value', value: `₹${Number(data.avgOrderValue).toFixed(2)}`, color: 'text-gray-700' },
              { label: 'Total GST', value: `₹${Number(data.totalGst).toFixed(2)}`, color: 'text-gray-700' },
              { label: 'Total Discount', value: `₹${Number(data.totalDiscount).toFixed(2)}`, color: 'text-red-500' },
              { label: 'Subtotal', value: `₹${Number(data.totalSubtotal).toFixed(2)}`, color: 'text-gray-700' },
            ].map((card) => (
              <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-500">{card.label}</p>
                <p className={`text-lg font-bold mt-1 ${card.color}`}>{card.value}</p>
              </div>
            ))}
          </div>

          {/* Daily sales table */}
          {data.dailySales && data.dailySales.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800">Daily Breakdown</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Date</th>
                      <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">Orders</th>
                      <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">Revenue</th>
                      <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">GST</th>
                      <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">Discount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.dailySales
                      .filter(d => d.orderCount > 0)
                      .map((day) => (
                        <tr key={day.date} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-gray-700">{day.date}</td>
                          <td className="px-4 py-2 text-right text-gray-700">{day.orderCount}</td>
                          <td className="px-4 py-2 text-right font-semibold text-green-600">
                            ₹{Number(day.revenue).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-right text-gray-600">
                            ₹{Number(day.gst).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-right text-red-500">
                            ₹{Number(day.discount).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PRODUCTS REPORT */}
      {!loading && data && activeTab === 'Products' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">
              Product Performance ({data.length} products)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Product</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Category</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">Qty Sold</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">Revenue</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">Avg Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((p) => (
                  <tr key={p.productId} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-800">{p.productName}</td>
                    <td className="px-4 py-2 text-gray-500">{p.categoryName}</td>
                    <td className="px-4 py-2 text-right text-blue-600 font-semibold">{p.quantitySold}</td>
                    <td className="px-4 py-2 text-right text-green-600 font-semibold">
                      ₹{Number(p.revenue).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-600">
                      ₹{Number(p.avgPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STAFF REPORT */}
      {!loading && data && activeTab === 'Staff' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">
              Staff Performance ({data.length} staff)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Name</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">Role</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">Orders</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">Total Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((s) => (
                  <tr key={s.userId} className="hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <p className="font-medium text-gray-800">{s.fullName}</p>
                      <p className="text-xs text-gray-500">@{s.username}</p>
                    </td>
                    <td className="px-4 py-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold
                        ${s.role === 'ADMIN'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : s.role === 'WAITER'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-green-50 text-green-700 border-green-200'
                        }`}>
                        {s.role}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right text-blue-600 font-semibold">
                      {s.ordersHandled}
                    </td>
                    <td className="px-4 py-2 text-right text-green-600 font-semibold">
                      ₹{Number(s.totalSales).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* GST REPORT */}
      {!loading && data && activeTab === 'GST' && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Taxable Amount', value: `₹${Number(data.totalTaxableAmount).toFixed(2)}` },
              { label: 'Total CGST', value: `₹${Number(data.totalCgst).toFixed(2)}` },
              { label: 'Total SGST', value: `₹${Number(data.totalSgst).toFixed(2)}` },
              { label: 'Total GST', value: `₹${Number(data.totalGst).toFixed(2)}`, bold: true },
              { label: 'Grand Total', value: `₹${Number(data.grandTotal).toFixed(2)}`, bold: true },
            ].map((card) => (
              <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-500">{card.label}</p>
                <p className={`text-lg mt-1 ${card.bold ? 'font-bold text-orange-600' : 'font-semibold text-gray-800'}`}>
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          {/* Rate breakdown */}
          {data.rateBreakdowns && data.rateBreakdowns.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-800">GST Rate Breakdown</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">GST Rate</th>
                      <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">Taxable Amount</th>
                      <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">CGST</th>
                      <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">SGST</th>
                      <th className="text-right px-4 py-2 text-xs font-semibold text-gray-600">Total GST</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.rateBreakdowns.map((r) => (
                      <tr key={r.gstRate} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-semibold text-orange-600">{r.gstRate}%</td>
                        <td className="px-4 py-2 text-right text-gray-700">₹{Number(r.taxableAmount).toFixed(2)}</td>
                        <td className="px-4 py-2 text-right text-gray-700">₹{Number(r.cgst).toFixed(2)}</td>
                        <td className="px-4 py-2 text-right text-gray-700">₹{Number(r.sgst).toFixed(2)}</td>
                        <td className="px-4 py-2 text-right font-semibold text-gray-800">₹{Number(r.total).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* PAYMENT METHODS REPORT */}
      {!loading && data && activeTab === 'Payments' && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Payment Method Breakdown</h2>
          </div>
          <div className="space-y-3 p-4">
            {data.map((p) => (
              <div key={p.method}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-gray-700">{p.method}</span>
                  <span className="text-gray-500">
                    {p.transactionCount} txns · ₹{Number(p.totalAmount).toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all"
                    style={{ width: `${Number(p.percentage).toFixed(1)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-0.5 text-right">
                  {Number(p.percentage).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}