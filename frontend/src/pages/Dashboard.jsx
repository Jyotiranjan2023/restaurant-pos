// src/pages/Dashboard.jsx
import React from 'react';
import { fillDateGaps } from '../utils/dateRange'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useDashboard } from '../hooks/useDashboard';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444'];
const RevenueBreakdownCard = ({ title, chartData, formatCurrency }) => {
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // Empty state — no data
  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
        <h2 className="text-sm md:text-base font-semibold text-gray-700 mb-3">{title}</h2>
        <div className="flex items-center justify-center h-[200px] text-gray-400 text-sm italic">
          No data yet
        </div>
      </div>
    );
  }

  // Single category — pie would look like a circle, show as stat card instead
  if (chartData.length === 1) {
    const only = chartData[0];
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
        <h2 className="text-sm md:text-base font-semibold text-gray-700 mb-3">{title}</h2>
        <div className="flex flex-col items-center justify-center h-[200px] gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: COLORS[0] }}
          />
          <p className="text-xs text-gray-500 uppercase tracking-wide">{only.name}</p>
          <p className="text-xl md:text-2xl font-bold text-gray-800">
            {formatCurrency(only.value)}
          </p>
          <p className="text-xs text-gray-400 italic">
            100% of revenue from this category
          </p>
        </div>
      </div>
    );
  }

  // Multiple categories — show pie chart (unchanged from before)
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
      <h2 className="text-sm md:text-base font-semibold text-gray-700 mb-3">{title}</h2>
      <ResponsiveContainer width="100%" height={200} minWidth={0}>
        <PieChart>
          <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="45%" outerRadius={65}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(val) => formatCurrency(val)} />
          <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

const StatCard = ({ label, value, sub, color = 'orange' }) => {
  const colorMap = {
    orange: 'bg-orange-50 border-orange-200 text-orange-600',
    blue:   'bg-blue-50 border-blue-200 text-blue-600',
    green:  'bg-green-50 border-green-200 text-green-600',
    red:    'bg-red-50 border-red-200 text-red-600',
    purple: 'bg-purple-50 border-purple-200 text-purple-600',
  };
  return (
    <div className={`rounded-xl border p-3 md:p-4 ${colorMap[color]}`}>
      <p className="text-xs md:text-sm font-medium opacity-70">{label}</p>

<p className="text-base md:text-xl lg:text-2xl font-bold mt-1 break-all">{value}</p>

      {sub && <p className="text-xs mt-1 opacity-60">{sub}</p>}
    </div>
  );
};

const formatCurrency = (val) =>
  `₹${Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

export default function Dashboard() {
  const { data, loading, error, refresh } = useDashboard();

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      Loading dashboard...
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-red-500">
      <p>{error}</p>
      <button onClick={refresh} className="px-4 py-2 bg-red-100 rounded-lg text-sm font-medium">
        Retry
      </button>
    </div>
  );
// Fill in any missing days with ₹0 entries
const today = new Date()
const sevenDaysAgo = new Date()
sevenDaysAgo.setDate(today.getDate() - 6)

const filledRevenue = fillDateGaps(
  data.last7DaysRevenue || [],
  sevenDaysAgo,
  today,
  'date',
  { revenue: 0, orderCount: 0 }
)
// Tiny visible bar for empty days — calculate based on max revenue
const maxRevenue = Math.max(...filledRevenue.map(d => d.revenue), 0)
const emptyDayValue = maxRevenue > 0 ? maxRevenue * 0.008 : 1  // ~0.8% of max, very small
const revenueChart = filledRevenue.map(d => ({
  date: d.date.slice(5),
  revenue: d.revenue,
  orders: d.orderCount,
  isEmpty: d._isEmpty || d.revenue === 0,
}))

  const orderTypeChart = Object.entries(data.revenueByOrderType || {}).map(([name, value]) => ({
    name, value,
  }));

  const paymentChart = Object.entries(data.revenueByPaymentMethod || {}).map(([name, value]) => ({
    name, value,
  }));

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">Today's overview</p>
        </div>
        <button
          onClick={refresh}
          className="px-3 md:px-4 py-2 text-xs md:text-sm bg-white border border-gray-200 rounded-lg hover:bg-gray-50 font-medium text-gray-600"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        <StatCard label="Today's Revenue" value={formatCurrency(data.todayRevenue)} color="orange" />
        <StatCard label="Today's Orders"  value={data.todayOrderCount}              color="blue"   />
        <StatCard label="Running Orders"  value={data.runningOrderCount}            color="green"  />
        <StatCard label="Low Stock Items" value={data.lowStockCount} sub="needs attention" color="red" />
        {/* 5th card spans 2 cols on mobile so it doesn't sit alone */}
        <div className="col-span-2 md:col-span-1">
          <StatCard label="Active Staff" value={data.activeStaffCount} color="purple" />
        </div>
      </div>

      {/* Revenue Bar Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
        <h2 className="text-sm md:text-base font-semibold text-gray-700 mb-4">Last 7 Days Revenue</h2>
        <ResponsiveContainer width="100%" height={200} minWidth={0}>
          <BarChart data={revenueChart} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} width={40} />
       <Tooltip
  formatter={(val, name, props) => {
    if (name === 'revenue') return formatCurrency(props.payload.revenue)
    return val
  }}
/>
            <Bar dataKey="revenue" radius={[4, 4, 0, 0]} name="revenue" minPointSize={4}>
  {revenueChart.map((entry, i) => (
    <Cell
      key={i}
      fill={entry.isEmpty ? '#e5e7eb' : '#f97316'}
    />
  ))}
</Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

      <RevenueBreakdownCard
  title="Revenue by Order Type"
  chartData={orderTypeChart}
  formatCurrency={formatCurrency}
/>

       <RevenueBreakdownCard
  title="Revenue by Payment"
  chartData={paymentChart}
  formatCurrency={formatCurrency}
/>

        {/* Top Selling Products — spans 2 cols on tablet, 1 on desktop */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 md:col-span-2 lg:col-span-1">
          <h2 className="text-sm md:text-base font-semibold text-gray-700 mb-3">Top Selling Products</h2>
          <div className="space-y-3">
            {(data.topSellingProducts || []).map((item, i) => (
              <div key={item.productId} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.productName}</p>
                  <p className="text-xs text-gray-400">{item.quantitySold} sold</p>
                </div>
                <span className="text-sm font-semibold text-gray-700 flex-shrink-0">
                  {formatCurrency(item.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}