import { Link } from 'react-router-dom'
import { useState } from 'react'
import PublicNavbar from '../../components/public/PublicNavbar'
import PublicFooter from '../../components/public/PublicFooter'

export default function FAQs() {
  const [openId, setOpenId] = useState(null)

  const categories = [
    {
      title: 'Getting Started',
      faqs: [
        { q: 'How do I sign up?', a: 'Click "Start Free Trial" on any page, fill in your restaurant details, and your account is created instantly. You can start using the POS within 5 minutes.' },
        { q: 'Do I need any hardware?', a: 'No special hardware required. Quickfire Kitchen works on any tablet, laptop, or phone with a modern browser. Most customers use a tablet for POS and a printer for bills.' },
        { q: 'How long does setup take?', a: 'Most restaurants are live within 30 minutes — including menu setup. Our onboarding wizard guides you step by step.' },
        { q: 'Is training included?', a: 'Yes. Free video tutorials and email support during your trial. Enterprise plan includes one-on-one onboarding.' },
      ],
    },
    {
      title: 'Pricing & Billing',
      faqs: [
        { q: 'Is the free trial really free?', a: 'Yes, 7 days, no credit card needed. You get full Enterprise features during the trial.' },
        { q: 'Can I change plans later?', a: 'Yes, anytime. Upgrade or downgrade from your dashboard. Changes take effect immediately, with pro-rated billing.' },
        { q: 'How do I pay?', a: 'Via Razorpay — UPI, cards, net banking. Indian payment methods only for now. Bills generated automatically each month.' },
        { q: 'What if my payment fails?', a: 'You get a 7-day grace period to update your payment method. Your data and access stay intact during this time.' },
        { q: 'Are there hidden fees?', a: 'No. The price on our pricing page is what you pay. GST is added as per Indian tax law. No setup fees, no surprise charges.' },
      ],
    },
    {
      title: 'Features & Functionality',
      faqs: [
        { q: 'Does it work offline?', a: 'Quickfire Kitchen needs internet to sync data. Offline mode is on our roadmap for 2026.' },
        { q: 'Can I customize my menu?', a: 'Yes. Add categories, items, photos, descriptions, prices, GST rates. Toggle availability per item. Full control.' },
        { q: 'Does it generate GST bills?', a: 'Yes. All bills are GST-compliant with HSN codes, GSTIN, and breakup of CGST/SGST/IGST. Export GST summary reports anytime.' },
        { q: 'Can multiple staff use it at once?', a: 'Yes. Plans include multiple staff users. Each gets their own login and role-based access (Admin, Waiter, Chef).' },
        { q: 'Can I integrate with other tools?', a: 'API access is included with Enterprise plan. Integrations with Zomato, Swiggy, accounting software are on our roadmap.' },
      ],
    },
    {
      title: 'Data & Security',
      faqs: [
        { q: 'Where is my data stored?', a: 'Securely on Indian servers, in compliance with Indian data protection norms. Daily automated backups.' },
        { q: 'What if I cancel — do I lose my data?', a: 'Your data is preserved for 90 days after cancellation. You can export everything to CSV before leaving, and reactivate any time during that window.' },
        { q: 'Is my customer data safe?', a: 'Yes. All data is encrypted in transit (HTTPS) and at rest. We never sell or share customer data with third parties.' },
        { q: 'Can I export my data?', a: 'Yes. Export menu, orders, bills, customers as CSV from your dashboard, anytime.' },
      ],
    },
    {
      title: 'Support',
      faqs: [
        { q: 'How do I contact support?', a: 'Email: hello@quickfirekitchen.com — response within 24 hours on all plans, within 4 hours on Enterprise.' },
        { q: 'Do you offer phone support?', a: 'Yes, phone support is available on Enterprise plan. Pro and Basic plans get email and chat support.' },
        { q: 'What languages do you support?', a: 'English currently. Hindi and Odia interface coming in 2026.' },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-cream-50 font-sans">
      <PublicNavbar />

      {/* Hero */}
      <section className="pt-32 pb-12 sm:pt-40 sm:pb-16 bg-gradient-to-br from-spice-800 via-spice-700 to-brand-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            Frequently Asked <span className="text-brand-300 italic">Questions</span>
          </h1>
          <p className="text-cream-100 text-lg sm:text-xl max-w-2xl mx-auto">
            Quick answers about pricing, features, support and more.
          </p>
        </div>
      </section>

      {/* FAQs by category */}
      <section className="py-16 sm:py-24 bg-cream-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {categories.map((cat, ci) => (
            <div key={ci} className="mb-12 last:mb-0">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-spice-800 mb-6 pb-3 border-b-2 border-brand-200">
                {cat.title}
              </h2>
              <div className="space-y-3">
                {cat.faqs.map((faq, fi) => {
                  const id = `${ci}-${fi}`
                  const isOpen = openId === id
                  return (
                    <div key={id} className="bg-white border border-cream-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setOpenId(isOpen ? null : id)}
                        className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-cream-50 transition-colors"
                      >
                        <span className="font-semibold text-spice-800">{faq.q}</span>
                        <span className={`text-2xl text-brand-500 transform transition-transform flex-shrink-0 ${isOpen ? 'rotate-45' : ''}`}>+</span>
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-5 text-spice-600 leading-relaxed">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

    {/* Still need help? */}
<section className="py-16 bg-white">
  <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
    <h2 className="font-serif text-3xl font-bold text-spice-800 mb-4">
      Still have questions?
    </h2>

    <p className="text-spice-600 text-lg mb-8">
      Drop us an email — we usually reply within a few hours.
    </p>

    <a
      href="mailto:hello@quickfirekitchen.com"
      className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold rounded-xl shadow-warm transition-all hover:scale-105"
    >
      ✉ hello@quickfirekitchen.com
    </a>
  </div>
</section>

<PublicFooter />
</div>
)
}