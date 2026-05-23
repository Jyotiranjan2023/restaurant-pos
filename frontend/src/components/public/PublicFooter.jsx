import { Link } from 'react-router-dom'

export default function PublicFooter() {
  return (
    <footer className="bg-spice-800 text-cream-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">

          {/* Brand column */}
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xl font-bold">
                🔥
              </div>
              <div>
                <p className="font-serif font-bold text-white text-xl">Quickfire Kitchen</p>
                <p className="text-xs text-cream-300 uppercase tracking-wider">Restaurant POS</p>
              </div>
            </div>
            <p className="text-cream-200 text-sm leading-relaxed max-w-md mb-4">
              Modern, affordable point-of-sale software designed for Indian restaurants.
              Manage orders, menu, billing and growth — all from one dashboard.
            </p>
            <div className="flex gap-3">
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full bg-spice-700 hover:bg-brand-600 flex items-center justify-center transition-colors">
                <span className="text-sm">f</span>
              </a>
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full bg-spice-700 hover:bg-brand-600 flex items-center justify-center transition-colors">
                <span className="text-sm">in</span>
              </a>
              <a href="#" aria-label="Twitter" className="w-9 h-9 rounded-full bg-spice-700 hover:bg-brand-600 flex items-center justify-center transition-colors">
                <span className="text-sm">𝕏</span>
              </a>
              <a href="#" aria-label="LinkedIn" className="w-9 h-9 rounded-full bg-spice-700 hover:bg-brand-600 flex items-center justify-center transition-colors">
                <span className="text-sm">Li</span>
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-3">
              <li><Link to="/features" className="text-cream-200 hover:text-brand-400 text-sm transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="text-cream-200 hover:text-brand-400 text-sm transition-colors">Pricing</Link></li>
              <li><Link to="/faqs" className="text-cream-200 hover:text-brand-400 text-sm transition-colors">FAQs</Link></li>
              <li><Link to="/register" className="text-cream-200 hover:text-brand-400 text-sm transition-colors">Start Free Trial</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm uppercase tracking-wider">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-cream-200">
              <li>
                <span className="block text-brand-400 text-xs mb-1">EMAIL</span>
                hello@quickfirekitchen.com
              </li>
              <li>
                <span className="block text-brand-400 text-xs mb-1">PHONE</span>
                +91 98765 43210
              </li>
              <li>
                <span className="block text-brand-400 text-xs mb-1">LOCATION</span>
                Bhubaneswar, Odisha, India
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="border-t border-spice-700 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-cream-300 text-xs">
            © 2026 Quickfire Kitchen. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs text-cream-300">
            <a href="#" className="hover:text-brand-400 transition-colors">Privacy Policy</a>
            <span>·</span>
            <a href="#" className="hover:text-brand-400 transition-colors">Terms of Service</a>
            <span>·</span>
            <a href="#" className="hover:text-brand-400 transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}