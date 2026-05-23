import { Link } from 'react-router-dom'
import PublicNavbar from '../../components/public/PublicNavbar'
import PublicFooter from '../../components/public/PublicFooter'

export default function Features() {
  const features = [
    { icon: '🛒', title: 'Point of Sale', desc: 'Touch-friendly POS designed for tablets and laptops. Add items with one tap, split bills between guests, apply discounts, and accept any payment method.' },
    { icon: '🍽️', title: 'Menu Management', desc: 'Unlimited categories and items (on Pro and above). Add photos, descriptions, GST rates and availability. Make changes instantly across all devices.' },
    { icon: '🪑', title: 'Table Management', desc: 'Visual table layout. See which are occupied, free, billed or reserved. Move orders between tables. Track table turnover times.' },
    { icon: '📦', title: 'Inventory Tracking', desc: 'Track ingredient stock in real-time. Set low-stock alerts. Link recipes to menu items for automatic deduction on each order.' },
    { icon: '👨‍🍳', title: 'Kitchen Display System', desc: 'Orders flow straight to kitchen screens. Color-coded by station. Mark items ready, hold orders, see prep times. No more paper tickets.' },
    { icon: '💳', title: 'Payments & Bills', desc: 'Accept UPI, cards, cash. Generate GST-compliant bills automatically. Print or share by WhatsApp. Razorpay integration for online payments.' },
    { icon: '🎟️', title: 'Coupons & Discounts', desc: 'Create flat or percentage discount codes. Set usage limits, expiry, minimum order value. Track which campaigns work.' },
    { icon: '📊', title: 'Reports & Analytics', desc: 'Daily sales, best-selling items, peak hours, staff performance, payment method breakdown, GST summaries. Export to CSV anytime.' },
    { icon: '👥', title: 'Staff Management', desc: 'Add waiters, chefs, admin users. Role-based access control. Track who took which order. Reset passwords from admin panel.' },
    { icon: '💬', title: 'Customer Feedback', desc: 'Collect ratings and reviews after each order. See what customers love (or don\'t). Respond directly from the dashboard.' },
    { icon: '🔔', title: 'WhatsApp Notifications', desc: 'Auto-send bills to customer WhatsApp. Notify staff of new orders. Customer engagement on the channel they actually use.' },
    { icon: '🌐', title: 'Multi-Location Support', desc: 'Run multiple branches under one account (Enterprise). Compare branch performance. Manage menu and staff centrally.' },
  ]

  return (
    <div className="min-h-screen bg-cream-50 font-sans">
      <PublicNavbar />

      {/* Hero */}
      <section className="pt-32 pb-12 sm:pt-40 sm:pb-16 bg-gradient-to-br from-spice-800 via-spice-700 to-brand-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-cream-50 text-sm font-medium mb-4 border border-white/20">
            Every feature you need, none you don't
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            One platform.{' '}
            <span className="text-brand-300 italic">Entire restaurant.</span>
          </h1>
          <p className="text-cream-100 text-lg sm:text-xl max-w-2xl mx-auto">
            From taking the first order to filing GST returns — Quickfire Kitchen handles it all.
          </p>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((f, i) => (
              <div key={i} className="group bg-cream-50 hover:bg-white hover:shadow-warm border border-cream-200 rounded-2xl p-6 sm:p-8 transition-all">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-3xl mb-5 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="font-serif text-xl font-bold text-spice-800 mb-2">{f.title}</h3>
                <p className="text-spice-600 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-cta-warm text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
            See it for yourself
          </h2>
          <p className="text-cream-100 text-lg mb-8">
            Try every feature free for 7 days. No card needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand-600 font-bold rounded-xl shadow-2xl hover:scale-105 transition-transform">
              Start Free Trial →
            </Link>
            <Link to="/pricing" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-semibold rounded-xl border-2 border-white/30 transition-all">
              See Pricing
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}