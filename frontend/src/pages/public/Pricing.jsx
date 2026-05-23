import { Link } from 'react-router-dom'
import { useState } from 'react'
import PublicNavbar from '../../components/public/PublicNavbar'
import PublicFooter from '../../components/public/PublicFooter'

export default function Pricing() {
  const [billing, setBilling] = useState('monthly')

  const plans = [
    {
      name: 'Basic',
      price: 999,
      tagline: 'For small cafes and chai shops',
      features: [
        '5 staff users',
        '50 menu items',
        '3 tables',
        '500 orders/month',
        'POS & billing',
        'Basic reports',
        'Email support',
      ],
      cta: 'Start with Basic',
      highlight: false,
    },
    {
      name: 'Pro',
      price: 2499,
      tagline: 'For growing restaurants',
      features: [
        '15 staff users',
        '200 menu items',
        '30 tables',
        '3,000 orders/month',
        'Inventory & recipes',
        'Discount coupons',
        'Kitchen display',
        'Customer feedback',
        'CSV exports',
        'Advanced reports',
      ],
      cta: 'Start with Pro',
      highlight: true,
    },
    {
      name: 'Enterprise',
      price: 4999,
      tagline: 'For chains and multi-location',
      features: [
        'Unlimited staff',
        'Unlimited menu items',
        'Unlimited tables',
        'Unlimited orders',
        'Everything in Pro',
        'WhatsApp notifications',
        'API access',
        'Priority support',
        'Custom onboarding',
      ],
      cta: 'Start with Enterprise',
      highlight: false,
    },
  ]

  const compareRows = [
    { label: 'Staff users', basic: '5', pro: '15', enterprise: 'Unlimited' },
    { label: 'Menu items', basic: '50', pro: '200', enterprise: 'Unlimited' },
    { label: 'Tables', basic: '3', pro: '30', enterprise: 'Unlimited' },
    { label: 'Orders per month', basic: '500', pro: '3,000', enterprise: 'Unlimited' },
    { label: 'POS & Billing', basic: true, pro: true, enterprise: true },
    { label: 'GST-compliant bills', basic: true, pro: true, enterprise: true },
    { label: 'Inventory management', basic: false, pro: true, enterprise: true },
    { label: 'Recipes', basic: false, pro: true, enterprise: true },
    { label: 'Discount coupons', basic: false, pro: true, enterprise: true },
    { label: 'Kitchen display', basic: false, pro: true, enterprise: true },
    { label: 'Customer feedback', basic: false, pro: true, enterprise: true },
    { label: 'CSV exports', basic: false, pro: true, enterprise: true },
    { label: 'Advanced reports', basic: false, pro: true, enterprise: true },
    { label: 'WhatsApp notifications', basic: false, pro: false, enterprise: true },
    { label: 'API access', basic: false, pro: false, enterprise: true },
    { label: 'Priority support', basic: false, pro: false, enterprise: true },
  ]

  return (
    <div className="min-h-screen bg-cream-50 font-sans">
      <PublicNavbar />

      {/* Hero */}
      <section className="pt-32 pb-12 sm:pt-40 sm:pb-16 bg-gradient-to-br from-spice-800 via-spice-700 to-brand-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-cream-50 text-sm font-medium mb-4 border border-white/20">
            Simple, transparent pricing
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            Plans that <span className="text-brand-300 italic">grow with you</span>
          </h1>
          <p className="text-cream-100 text-lg sm:text-xl max-w-2xl mx-auto">
            Start with a 7-day free trial on any plan. No credit card required.
            Upgrade, downgrade or cancel anytime.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="py-16 sm:py-24 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {plans.map((plan, i) => (
              <div key={i} className={`relative rounded-2xl p-6 sm:p-8 ${plan.highlight ? 'bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-warm-lg lg:scale-105 border-2 border-brand-400' : 'bg-white border border-cream-200'}`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-leaf-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                    MOST POPULAR
                  </div>
                )}

                <h3 className={`font-serif text-2xl font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-spice-800'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${plan.highlight ? 'text-cream-100' : 'text-spice-500'}`}>
                  {plan.tagline}
                </p>

                <div className="mb-6">
                  <span className={`text-5xl font-bold ${plan.highlight ? 'text-white' : 'text-spice-800'}`}>
                    ₹{plan.price.toLocaleString('en-IN')}
                  </span>
                  <span className={`${plan.highlight ? 'text-cream-100' : 'text-spice-500'} ml-1`}>
                    /month
                  </span>
                </div>

                <Link
                  to="/register"
                  className={`block w-full text-center py-3 rounded-lg font-semibold mb-6 transition-colors ${plan.highlight ? 'bg-white text-brand-600 hover:bg-cream-100' : 'bg-spice-800 text-white hover:bg-spice-700'}`}
                >
                  {plan.cta}
                </Link>

                <div className={`text-xs uppercase tracking-wider mb-4 font-semibold ${plan.highlight ? 'text-cream-100' : 'text-spice-500'}`}>
                  What's included
                </div>
                <ul className="space-y-3">
                  {plan.features.map((f, j) => (
                    <li key={j} className={`flex items-start gap-2 text-sm ${plan.highlight ? 'text-cream-100' : 'text-spice-700'}`}>
                      <span className={`${plan.highlight ? 'text-cream-50' : 'text-leaf-500'} mt-0.5 font-bold`}>✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <p className="text-center text-spice-500 text-sm mt-8">
            All prices in INR per month. GST extra. No setup fees, no hidden charges.
          </p>
        </div>
      </section>

      {/* Detailed comparison */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-spice-800 mb-3">
              Compare all features
            </h2>
            <p className="text-spice-600">
              See exactly what's in each plan, side by side.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-4 text-spice-600 font-medium border-b-2 border-cream-200">
                    Feature
                  </th>
                  <th className="p-4 text-center border-b-2 border-cream-200">
                    <div className="font-serif font-bold text-spice-800">Basic</div>
                    <div className="text-xs text-spice-500">₹999/mo</div>
                  </th>
                  <th className="p-4 text-center border-b-2 border-brand-500 bg-brand-50">
                    <div className="font-serif font-bold text-brand-700">Pro</div>
                    <div className="text-xs text-brand-600">₹2,499/mo</div>
                  </th>
                  <th className="p-4 text-center border-b-2 border-cream-200">
                    <div className="font-serif font-bold text-spice-800">Enterprise</div>
                    <div className="text-xs text-spice-500">₹4,999/mo</div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {compareRows.map((row, i) => (
                  <tr key={i} className="border-b border-cream-200">
                    <td className="p-4 text-spice-700 font-medium">{row.label}</td>
                    <td className="p-4 text-center text-spice-700">
                      {typeof row.basic === 'boolean' ? (row.basic ? <span className="text-leaf-500 text-lg">✓</span> : <span className="text-cream-300">—</span>) : row.basic}
                    </td>
                    <td className="p-4 text-center bg-brand-50/50 text-spice-700 font-medium">
                      {typeof row.pro === 'boolean' ? (row.pro ? <span className="text-leaf-500 text-lg">✓</span> : <span className="text-cream-300">—</span>) : row.pro}
                    </td>
                    <td className="p-4 text-center text-spice-700">
                      {typeof row.enterprise === 'boolean' ? (row.enterprise ? <span className="text-leaf-500 text-lg">✓</span> : <span className="text-cream-300">—</span>) : row.enterprise}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQs about pricing */}
      <section className="py-16 sm:py-24 bg-cream-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-spice-800 mb-10 text-center">
            Common pricing questions
          </h2>

          <div className="space-y-6">
            {[
              { q: 'Is the 7-day trial really free?', a: 'Yes. No credit card needed to start. Full access to Enterprise features during trial.' },
              { q: 'Can I change plans later?', a: 'Yes. Upgrade or downgrade any time from your dashboard. Pro-rated billing applies.' },
              { q: 'What happens if I cancel?', a: 'You retain access until the end of your current billing cycle. Your data is preserved for 90 days in case you come back.' },
              { q: 'Are there any setup or hidden fees?', a: 'No. The price you see is what you pay. GST is added per Indian tax laws.' },
              { q: 'Do you offer annual discounts?', a: 'Annual billing with a discount is coming soon. For now, all plans are monthly.' },
            ].map((faq, i) => (
              <div key={i}>
                <h3 className="font-semibold text-spice-800 mb-2 text-lg">{faq.q}</h3>
                <p className="text-spice-600 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-cta-warm text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl sm:text-4xl font-bold mb-4">
            Start your free trial today
          </h2>
          <p className="text-cream-100 text-lg mb-8">
            7 days. No credit card. Cancel anytime.
          </p>
          <Link to="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-600 font-bold rounded-xl shadow-2xl hover:scale-105 transition-transform">
            Start Free Trial →
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}