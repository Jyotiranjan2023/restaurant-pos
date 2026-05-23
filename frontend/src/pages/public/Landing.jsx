import { Link } from 'react-router-dom'
import { useState } from 'react'
import PublicNavbar from '../../components/public/PublicNavbar'
import PublicFooter from '../../components/public/PublicFooter'

export default function Landing() {
  return (
    <div className="min-h-screen bg-cream-50 font-sans">
      <PublicNavbar />

      {/* ============ 1. HERO ============ */}
      <section className="relative pt-20 sm:pt-24 min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&auto=format&fit=crop&q=80"
            alt="Indian restaurant"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-spice-900/85 via-spice-800/70 to-brand-700/60"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-cream-50 text-sm font-medium mb-6 border border-white/20">
                <span className="w-2 h-2 rounded-full bg-leaf-500 animate-pulse"></span>
                Built in India · For Indian restaurants
              </span>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-6">
                Run your restaurant.{' '}
                <span className="text-brand-300 italic">Not paperwork.</span>
              </h1>

              <p className="text-lg sm:text-xl text-cream-100 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
                Take orders, manage menu, accept payments and grow your business —
                from a single dashboard built for Indian restaurants.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white font-semibold rounded-xl shadow-warm-lg transition-all hover:scale-105">
                  Start Free 7-Day Trial <span>→</span>
                </Link>
                <Link to="/features" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white font-semibold rounded-xl border border-white/30 transition-all">
                  See Features
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-6 justify-center lg:justify-start text-sm text-cream-100">
                <div className="flex items-center gap-2"><span className="text-leaf-500 text-lg">✓</span>No credit card required</div>
                <div className="flex items-center gap-2"><span className="text-leaf-500 text-lg">✓</span>Set up in 5 minutes</div>
                <div className="flex items-center gap-2"><span className="text-leaf-500 text-lg">✓</span>Cancel anytime</div>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="relative">
                <div className="absolute -inset-4 bg-brand-500/30 rounded-3xl blur-3xl"></div>
                <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-white/50">
                  <div className="bg-gradient-to-r from-brand-500 to-brand-600 px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-300"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                      <span className="text-white text-xs ml-2 opacity-80">Quickfire Kitchen</span>
                    </div>
                    <span className="text-white text-xs">Today's Dashboard</span>
                  </div>
                  <div className="p-6 bg-cream-50">
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-xs text-spice-500">Orders</p>
                        <p className="text-2xl font-bold text-spice-800">47</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-xs text-spice-500">Revenue</p>
                        <p className="text-2xl font-bold text-brand-600">₹18.2k</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <p className="text-xs text-spice-500">Tables</p>
                        <p className="text-2xl font-bold text-leaf-600">12/16</p>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3 mb-3 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-spice-700">Recent Orders</span>
                        <span className="text-xs text-leaf-500">● Live</span>
                      </div>
                      <div className="space-y-2">
                        {[
                          { table: 'Table 5', items: 'Paneer Tikka, Naan', amount: '₹420' },
                          { table: 'Table 12', items: 'Biryani, Raita', amount: '₹380' },
                          { table: 'Takeaway', items: 'Dosa, Filter Coffee', amount: '₹220' },
                        ].map((o, i) => (
                          <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-cream-200 last:border-0">
                            <div>
                              <p className="font-medium text-spice-800">{o.table}</p>
                              <p className="text-spice-500 text-[10px]">{o.items}</p>
                            </div>
                            <p className="font-bold text-spice-800">{o.amount}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-brand-500 text-white text-xs font-semibold py-2 rounded-lg">+ New Order</button>
                      <button className="flex-1 bg-spice-100 text-spice-700 text-xs font-semibold py-2 rounded-lg">View All</button>
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-leaf-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg rotate-3">⚡ Real-time</div>
                <div className="absolute -bottom-4 -left-4 bg-white text-spice-800 px-4 py-2 rounded-full text-sm font-semibold shadow-lg -rotate-3">🔥 Fast setup</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 2. TRUST STRIP ============ */}
      <section className="py-10 sm:py-12 bg-cream-100 border-y border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-spice-500 text-sm uppercase tracking-widest mb-6 font-medium">
            Why Indian restaurant owners choose us
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              { num: '5 min', label: 'Average setup time' },
              { num: '₹999', label: 'Starts at /month' },
              { num: '24/7', label: 'Live support' },
              { num: '100%', label: 'Made in India' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="font-serif text-3xl sm:text-4xl font-bold text-brand-600 mb-1">{stat.num}</p>
                <p className="text-spice-600 text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 3. FEATURES ============ */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-4">
              Everything you need
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-spice-800 mb-4">
              Built to run your <span className="text-brand-600 italic">whole restaurant</span>
            </h2>
            <p className="text-spice-600 text-lg max-w-2xl mx-auto">
              No more juggling 5 different tools. One dashboard, every operation.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { icon: '🛒', title: 'Take Orders Fast', desc: 'Touch-friendly POS for waiters. Add items, split bills, apply discounts in seconds.' },
              { icon: '🍽️', title: 'Menu & Inventory', desc: 'Add unlimited categories, items with photos, prices and GST. Track inventory in real-time.' },
              { icon: '🪑', title: 'Table Management', desc: 'See which tables are occupied, free, or billed. Move orders between tables with one tap.' },
              { icon: '👨‍🍳', title: 'Kitchen Display', desc: 'Orders go straight to kitchen screen. No paper tickets, no missed items.' },
              { icon: '💳', title: 'Built-in Payments', desc: 'Accept UPI, cards, cash. Generate GST-compliant bills automatically.' },
              { icon: '📊', title: 'Reports That Matter', desc: 'Daily sales, best-selling items, staff performance. Know your business at a glance.' },
            ].map((f, i) => (
              <div key={i} className="group bg-cream-50 hover:bg-white hover:shadow-warm-lg border border-cream-200 rounded-2xl p-6 sm:p-8 transition-all hover:-translate-y-1">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-3xl mb-5 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="font-serif text-xl font-bold text-spice-800 mb-2">{f.title}</h3>
                <p className="text-spice-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 4. HOW IT WORKS ============ */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-cream-100 to-cream-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-300/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-leaf-500/10 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-spice-800 mb-4">
              Live in <span className="text-brand-600">three steps</span>
            </h2>
            <p className="text-spice-600 text-lg max-w-2xl mx-auto">
              No long onboarding, no setup fees, no engineer required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
            {[
              { num: '01', title: 'Sign up', desc: 'Create your restaurant account in 2 minutes. Free 7-day trial, no card required.' },
              { num: '02', title: 'Set up menu', desc: 'Add your categories and dishes. Or import from a CSV. Take photos with your phone.' },
              { num: '03', title: 'Start selling', desc: 'Open the POS, take your first order, print or share the bill. That\'s it.' },
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-warm border border-cream-200 h-full">
                  <div className="text-7xl font-serif font-bold text-brand-200 mb-4 leading-none">
                    {step.num}
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-spice-800 mb-3">{step.title}</h3>
                  <p className="text-spice-600 leading-relaxed">{step.desc}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 lg:-right-8 transform -translate-y-1/2 text-3xl text-brand-400 z-10">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 5. PRICING TEASER ============ */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-leaf-500/10 text-leaf-600 text-sm font-medium mb-4">
              Simple pricing
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-spice-800 mb-4">
              Plans that <span className="text-brand-600 italic">grow with you</span>
            </h2>
            <p className="text-spice-600 text-lg max-w-2xl mx-auto">
              Start small, upgrade anytime. All plans include a free trial.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {[
              { name: 'Basic', price: '999', tagline: 'Small cafes & chai shops', features: ['5 staff users', '50 menu items', '500 orders/month', 'Tables & POS', 'Bills & reports'], highlight: false },
              { name: 'Pro', price: '2,499', tagline: 'Growing restaurants', features: ['15 staff users', '200 menu items', '3,000 orders/month', 'Inventory & recipes', 'Kitchen display', 'Coupons & feedback'], highlight: true },
              { name: 'Enterprise', price: '4,999', tagline: 'Chains & multi-location', features: ['Unlimited staff', 'Unlimited menu', 'Unlimited orders', 'API access', 'Priority support', 'All features'], highlight: false },
            ].map((plan, i) => (
              <div key={i} className={`relative rounded-2xl p-6 sm:p-8 ${plan.highlight ? 'bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-warm-lg scale-105 border-2 border-brand-400' : 'bg-cream-50 border border-cream-200'}`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-leaf-500 text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                    MOST POPULAR
                  </div>
                )}
                <h3 className={`font-serif text-2xl font-bold mb-1 ${plan.highlight ? 'text-white' : 'text-spice-800'}`}>{plan.name}</h3>
                <p className={`text-sm mb-5 ${plan.highlight ? 'text-cream-100' : 'text-spice-500'}`}>{plan.tagline}</p>
                <div className="mb-6">
                  <span className={`text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-spice-800'}`}>₹{plan.price}</span>
                  <span className={`${plan.highlight ? 'text-cream-100' : 'text-spice-500'} ml-1`}>/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f, j) => (
                    <li key={j} className={`flex items-start gap-2 text-sm ${plan.highlight ? 'text-cream-100' : 'text-spice-700'}`}>
                      <span className={`${plan.highlight ? 'text-cream-50' : 'text-leaf-500'} mt-0.5`}>✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/pricing" className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors ${plan.highlight ? 'bg-white text-brand-600 hover:bg-cream-100' : 'bg-spice-800 text-white hover:bg-spice-700'}`}>
                  Choose {plan.name}
                </Link>
              </div>
            ))}
          </div>

          <p className="text-center text-spice-500 text-sm mt-8">
            All prices in INR. GST extra. No hidden fees. <Link to="/pricing" className="text-brand-600 hover:underline font-medium">See full comparison →</Link>
          </p>
        </div>
      </section>

      {/* ============ 6. TESTIMONIALS ============ */}
      <section className="py-16 sm:py-24 bg-spice-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-9xl font-serif text-brand-400">"</div>
          <div className="absolute bottom-10 right-10 text-9xl font-serif text-brand-400 rotate-180">"</div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Loved by restaurant owners
            </h2>
            <p className="text-cream-200 text-lg">Real feedback from people running real kitchens.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { quote: "Setup took literally 10 minutes. My waiters picked it up the same day. Bills are GST-ready, no more manual entry.", name: 'Ramesh Kumar', role: 'Owner, Spice Garden, Bhubaneswar', avatar: 'RK' },
              { quote: "The kitchen display feature alone is worth the price. No more shouting orders across the kitchen.", name: 'Priya Mohanty', role: 'Manager, Coastal Curry, Cuttack', avatar: 'PM' },
              { quote: "Started on the Basic plan when I had one outlet. Now I have three, all on Enterprise. Scales with the business.", name: 'Anil Sharma', role: 'Founder, Tandoor Junction', avatar: 'AS' },
            ].map((t, i) => (
              <div key={i} className="bg-spice-700/50 backdrop-blur-sm border border-spice-600 rounded-2xl p-6 sm:p-8">
                <div className="flex gap-1 mb-4 text-brand-400 text-lg">★★★★★</div>
                <p className="text-cream-100 leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-cream-300 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ 7. FAQ TEASER ============ */}
      <FaqTeaser />

      {/* ============ 8. FINAL CTA ============ */}
      <section className="py-16 sm:py-24 bg-cta-warm relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-spice-900 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-5 leading-tight">
            Ready to make your restaurant <br className="hidden sm:block" />
            <span className="italic">run itself?</span>
          </h2>
          <p className="text-cream-100 text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
            Start your free 7-day trial. No credit card. Cancel anytime.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-brand-600 hover:bg-cream-100 font-bold rounded-xl shadow-2xl transition-all hover:scale-105">
              Start Free Trial <span>→</span>
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

// ============ FAQ Teaser sub-component ============
function FaqTeaser() {
  const [open, setOpen] = useState(0)
  const faqs = [
    { q: 'Is there really a free trial?', a: 'Yes. 7 days, no credit card needed. After the trial, pick a plan or your account is paused — your data is preserved.' },
    { q: 'Can I cancel anytime?', a: 'Yes. Cancel from your dashboard, no questions asked. You keep access until the end of your billing cycle.' },
    { q: 'Do I need to install anything?', a: 'No. Quickfire Kitchen runs in any modern browser. Works on tablets, phones, laptops and desktops.' },
    { q: 'Is GST handled automatically?', a: 'Yes. Set your GST rate per menu item. Bills are GST-compliant and you can export GST reports for filing.' },
    { q: 'What if I have multiple outlets?', a: 'The Enterprise plan supports multiple branches under one account, with role-based access for managers.' },
  ]

  return (
    <section className="py-16 sm:py-24 bg-cream-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-4">
            Got questions?
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-spice-800 mb-4">
            Frequently asked
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white border border-cream-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setOpen(open === i ? -1 : i)}
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-cream-50 transition-colors"
              >
                <span className="font-semibold text-spice-800">{faq.q}</span>
                <span className={`text-2xl text-brand-500 transform transition-transform ${open === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-spice-600 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link to="/faqs" className="text-brand-600 hover:underline font-medium">
            See all FAQs →
          </Link>
        </div>
      </div>
    </section>
  )
}