import { useState, useEffect } from 'react'
import {
  fetchSettings,
  updateProfile,
  updateTax,
  updateBill,
  updateOrder,
  uploadLogo,
  removeLogo,
} from '../services/settingsService'

const TABS = ['Profile', 'Tax', 'Bill', 'Order', 'Logo']

const TIMEZONES = ['Asia/Kolkata', 'Asia/Dubai', 'Asia/Singapore', 'UTC']
const PRINT_TEMPLATES = ['THERMAL_58', 'THERMAL_80', 'A4']
const ORDER_TYPES = ['DINE_IN', 'TAKEAWAY', 'DELIVERY']

export default function Settings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('Profile')
  const [feedback, setFeedback] = useState({ type: '', message: '' })
  const [saving, setSaving] = useState(false)

  // Form states
  const [profile, setProfile] = useState({})
  const [tax, setTax] = useState({})
  const [bill, setBill] = useState({})
  const [order, setOrder] = useState({})

  // Logo
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [logoLoading, setLogoLoading] = useState(false)

  const showFeedback = (type, message) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback({ type: '', message: '' }), 4000)
  }

  const loadSettings = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchSettings()
      if (res.success) {
        const s = res.data
        setSettings(s)
        setProfile({
          restaurantName: s.restaurantName || '',
          displayName: s.displayName || '',
          address: s.address || '',
          city: s.city || '',
          state: s.state || '',
          pincode: s.pincode || '',
          phone: s.phone || '',
          email: s.email || '',
          website: s.website || '',
          gstNumber: s.gstNumber || '',
          fssaiNumber: s.fssaiNumber || '',
          currencySymbol: s.currencySymbol || '₹',
          timezone: s.timezone || 'Asia/Kolkata',
        })
        setTax({
          defaultGstPercent: s.defaultGstPercent ?? 5,
          cgstSplitPercent: s.cgstSplitPercent ?? 50,
          serviceChargePercent: s.serviceChargePercent ?? 0,
          serviceChargeAppliesDineIn: s.serviceChargeAppliesDineIn ?? false,
          serviceChargeAppliesTakeaway: s.serviceChargeAppliesTakeaway ?? false,
          serviceChargeAppliesDelivery: s.serviceChargeAppliesDelivery ?? false,
        })
        setBill({
          printTemplate: s.printTemplate || 'THERMAL_80',
          billHeader: s.billHeader || '',
          billFooter: s.billFooter || '',
          showGstBreakdown: s.showGstBreakdown ?? true,
          showTableOnBill: s.showTableOnBill ?? true,
          billNumberPrefix: s.billNumberPrefix || 'BILL',
        })
        setOrder({
          autoConfirmOrders: s.autoConfirmOrders ?? false,
          allowCustomItems: s.allowCustomItems ?? false,
          defaultOrderType: s.defaultOrderType || 'DINE_IN',
        })
      } else {
        setError(res.message || 'Failed to load settings')
      }
    } catch {
      setError('Server error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadSettings() }, [])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const res = await updateProfile(profile)
      if (res.success) {
        showFeedback('success', 'Profile settings saved')
        setSettings(res.data)
      } else {
        showFeedback('error', res.message || 'Save failed')
      }
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Server error')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveTax = async () => {
    setSaving(true)
    try {
      const res = await updateTax({
        defaultGstPercent: Number(tax.defaultGstPercent),
        cgstSplitPercent: Number(tax.cgstSplitPercent),
        serviceChargePercent: Number(tax.serviceChargePercent),
        serviceChargeAppliesDineIn: tax.serviceChargeAppliesDineIn,
        serviceChargeAppliesTakeaway: tax.serviceChargeAppliesTakeaway,
        serviceChargeAppliesDelivery: tax.serviceChargeAppliesDelivery,
      })
      if (res.success) {
        showFeedback('success', 'Tax settings saved')
      } else {
        showFeedback('error', res.message || 'Save failed')
      }
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Server error')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveBill = async () => {
    setSaving(true)
    try {
      const res = await updateBill(bill)
      if (res.success) {
        showFeedback('success', 'Bill settings saved')
      } else {
        showFeedback('error', res.message || 'Save failed')
      }
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Server error')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveOrder = async () => {
    setSaving(true)
    try {
      const res = await updateOrder(order)
      if (res.success) {
        showFeedback('success', 'Order settings saved')
      } else {
        showFeedback('error', res.message || 'Save failed')
      }
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Server error')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async () => {
    if (!logoFile) return
    setLogoLoading(true)
    try {
      const res = await uploadLogo(logoFile)
      if (res.success) {
        showFeedback('success', 'Logo uploaded')
        setSettings(res.data)
        setLogoFile(null)
        setLogoPreview(null)
      } else {
        showFeedback('error', res.message || 'Upload failed')
      }
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Upload failed')
    } finally {
      setLogoLoading(false)
    }
  }

  const handleRemoveLogo = async () => {
    setLogoLoading(true)
    try {
      const res = await removeLogo()
      if (res.success) {
        showFeedback('success', 'Logo removed')
        setSettings(res.data)
      } else {
        showFeedback('error', res.message || 'Remove failed')
      }
    } catch (err) {
      showFeedback('error', err.response?.data?.message || 'Server error')
    } finally {
      setLogoLoading(false)
    }
  }

  const handleLogoFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setLogoFile(file)
    setLogoPreview(URL.createObjectURL(file))
  }

  // Reusable components
  const Input = ({ label, value, onChange, type = 'text', placeholder = '' }) => (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={saving}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-gray-50"
      />
    </div>
  )

  const Toggle = ({ label, value, onChange, description }) => (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {description && <p className="text-xs text-gray-400">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        disabled={saving}
        className={`relative w-11 h-6 rounded-full transition-all ${
          value ? 'bg-orange-500' : 'bg-gray-300'
        }`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
          value ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </button>
    </div>
  )

  const SaveButton = ({ onClick }) => (
    <div className="pt-4 border-t border-gray-200">
      <button
        type="button"
        onClick={onClick}
        disabled={saving}
        className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-6 py-2 rounded-lg disabled:opacity-60"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  )

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500">Loading settings...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-700">{error}</p>
        <button onClick={loadSettings} className="mt-3 bg-red-600 text-white text-sm px-4 py-2 rounded-lg">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage your restaurant configuration
        </p>
      </div>

      {/* Feedback */}
      {feedback.message && (
        <div className={`mb-4 px-4 py-2 rounded-lg text-sm border ${
          feedback.type === 'success'
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {feedback.message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap mb-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all
              ${activeTab === tab
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
          >
            {tab === 'Profile' && '🏪 '}
            {tab === 'Tax' && '💰 '}
            {tab === 'Bill' && '🧾 '}
            {tab === 'Order' && '📋 '}
            {tab === 'Logo' && '🖼️ '}
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">

        {/* PROFILE TAB */}
        {activeTab === 'Profile' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">
              Restaurant Profile
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Restaurant Name *"
                value={profile.restaurantName}
                onChange={(v) => setProfile(p => ({ ...p, restaurantName: v }))}
                placeholder="Spice Garden"
              />
              <Input
                label="Display Name"
                value={profile.displayName}
                onChange={(v) => setProfile(p => ({ ...p, displayName: v }))}
                placeholder="Spice Garden Restaurant"
              />
              <Input
                label="Phone"
                value={profile.phone}
                onChange={(v) => setProfile(p => ({ ...p, phone: v }))}
                placeholder="9876543210"
              />
              <Input
                label="Email"
                type="email"
                value={profile.email}
                onChange={(v) => setProfile(p => ({ ...p, email: v }))}
                placeholder="info@restaurant.com"
              />
              <Input
                label="Website"
                value={profile.website}
                onChange={(v) => setProfile(p => ({ ...p, website: v }))}
                placeholder="https://restaurant.com"
              />
              <Input
                label="GST Number"
                value={profile.gstNumber}
                onChange={(v) => setProfile(p => ({ ...p, gstNumber: v }))}
                placeholder="21ABCDE1234F1Z5"
              />
              <Input
                label="FSSAI Number"
                value={profile.fssaiNumber}
                onChange={(v) => setProfile(p => ({ ...p, fssaiNumber: v }))}
                placeholder="12345678901234"
              />
              <Input
                label="Currency Symbol"
                value={profile.currencySymbol}
                onChange={(v) => setProfile(p => ({ ...p, currencySymbol: v }))}
                placeholder="₹"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfile(p => ({ ...p, address: e.target.value }))}
                placeholder="Plot 42, Patia"
                disabled={saving}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="City"
                value={profile.city}
                onChange={(v) => setProfile(p => ({ ...p, city: v }))}
                placeholder="Bhubaneswar"
              />
              <Input
                label="State"
                value={profile.state}
                onChange={(v) => setProfile(p => ({ ...p, state: v }))}
                placeholder="Odisha"
              />
              <Input
                label="Pincode"
                value={profile.pincode}
                onChange={(v) => setProfile(p => ({ ...p, pincode: v }))}
                placeholder="751024"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Timezone</label>
              <select
                value={profile.timezone}
                onChange={(e) => setProfile(p => ({ ...p, timezone: e.target.value }))}
                disabled={saving}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                {TIMEZONES.map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>

            <SaveButton onClick={handleSaveProfile} />
          </div>
        )}

        {/* TAX TAB */}
        {activeTab === 'Tax' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Tax & Charges</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Default GST %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0" max="100" step="0.01"
                    value={tax.defaultGstPercent}
                    onChange={(e) => setTax(t => ({ ...t, defaultGstPercent: e.target.value }))}
                    disabled={saving}
                    className="w-full border border-gray-300 rounded-lg pl-3 pr-7 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  CGST Split %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0" max="100" step="0.01"
                    value={tax.cgstSplitPercent}
                    onChange={(e) => setTax(t => ({ ...t, cgstSplitPercent: e.target.value }))}
                    disabled={saving}
                    className="w-full border border-gray-300 rounded-lg pl-3 pr-7 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Service Charge %
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0" max="100" step="0.01"
                    value={tax.serviceChargePercent}
                    onChange={(e) => setTax(t => ({ ...t, serviceChargePercent: e.target.value }))}
                    disabled={saving}
                    className="w-full border border-gray-300 rounded-lg pl-3 pr-7 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
                </div>
              </div>
            </div>

            <div className="border border-gray-100 rounded-lg p-3 space-y-1">
              <p className="text-xs font-semibold text-gray-600 mb-2">
                Service Charge Applies To:
              </p>
              <Toggle
                label="Dine In"
                value={tax.serviceChargeAppliesDineIn}
                onChange={(v) => setTax(t => ({ ...t, serviceChargeAppliesDineIn: v }))}
              />
              <Toggle
                label="Takeaway"
                value={tax.serviceChargeAppliesTakeaway}
                onChange={(v) => setTax(t => ({ ...t, serviceChargeAppliesTakeaway: v }))}
              />
              <Toggle
                label="Delivery"
                value={tax.serviceChargeAppliesDelivery}
                onChange={(v) => setTax(t => ({ ...t, serviceChargeAppliesDelivery: v }))}
              />
            </div>

            <SaveButton onClick={handleSaveTax} />
          </div>
        )}

        {/* BILL TAB */}
        {activeTab === 'Bill' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Bill Settings</h2>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Print Template
              </label>
              <div className="flex gap-2 flex-wrap">
                {PRINT_TEMPLATES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setBill(b => ({ ...b, printTemplate: t }))}
                    disabled={saving}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all
                      ${bill.printTemplate === t
                        ? 'bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-400'
                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Bill Number Prefix"
              value={bill.billNumberPrefix}
              onChange={(v) => setBill(b => ({ ...b, billNumberPrefix: v }))}
              placeholder="BILL"
            />

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Bill Header
              </label>
              <input
                type="text"
                value={bill.billHeader}
                onChange={(e) => setBill(b => ({ ...b, billHeader: e.target.value }))}
                placeholder="*** WELCOME ***"
                disabled={saving}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Bill Footer
              </label>
              <input
                type="text"
                value={bill.billFooter}
                onChange={(e) => setBill(b => ({ ...b, billFooter: e.target.value }))}
                placeholder="Thank you! Visit again."
                disabled={saving}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <div className="border border-gray-100 rounded-lg p-3 space-y-1">
              <Toggle
                label="Show GST Breakdown"
                description="Show CGST/SGST split on bill"
                value={bill.showGstBreakdown}
                onChange={(v) => setBill(b => ({ ...b, showGstBreakdown: v }))}
              />
              <Toggle
                label="Show Table on Bill"
                description="Print table number on bill"
                value={bill.showTableOnBill}
                onChange={(v) => setBill(b => ({ ...b, showTableOnBill: v }))}
              />
            </div>

            <SaveButton onClick={handleSaveBill} />
          </div>
        )}

        {/* ORDER TAB */}
        {activeTab === 'Order' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Order Settings</h2>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Default Order Type
              </label>
              <div className="flex gap-2 flex-wrap">
                {ORDER_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setOrder(o => ({ ...o, defaultOrderType: t }))}
                    disabled={saving}
                    className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-all
                      ${order.defaultOrderType === t
                        ? 'bg-orange-50 border-orange-500 text-orange-700 ring-1 ring-orange-400'
                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {t === 'DINE_IN' ? '🪑 Dine In' :
                     t === 'TAKEAWAY' ? '🥡 Takeaway' : '🚴 Delivery'}
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-gray-100 rounded-lg p-3 space-y-1">
              <Toggle
                label="Auto Confirm Orders"
                description="Orders go straight to RUNNING without confirmation"
                value={order.autoConfirmOrders ?? false}
                onChange={(v) => setOrder(o => ({ ...o, autoConfirmOrders: v }))}
              />
              <Toggle
                label="Allow Custom Items"
                description="Staff can add custom items not in menu"
                value={order.allowCustomItems ?? false}
                onChange={(v) => setOrder(o => ({ ...o, allowCustomItems: v }))}
              />
            </div>

            <SaveButton onClick={handleSaveOrder} />
          </div>
        )}

        {/* LOGO TAB */}
        {activeTab === 'Logo' && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Restaurant Logo</h2>

            {/* Current logo */}
            {settings?.logoUrl && !logoPreview && (
              <div className="flex items-center gap-4">
                <img
                  src={`http://localhost:8080${settings.logoUrl}`}
                  alt="Logo"
                  className="w-24 h-24 object-contain border border-gray-200 rounded-lg bg-gray-50 p-2"
                />
                <div>
                  <p className="text-sm text-gray-600 mb-2">Current logo</p>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    disabled={logoLoading}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-300 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-60"
                  >
                    {logoLoading ? 'Removing...' : 'Remove Logo'}
                  </button>
                </div>
              </div>
            )}

            {/* Preview new logo */}
            {logoPreview && (
              <div className="flex items-center gap-4">
                <img
                  src={logoPreview}
                  alt="Preview"
                  className="w-24 h-24 object-contain border border-orange-200 rounded-lg bg-gray-50 p-2"
                />
                <div>
                  <p className="text-xs text-orange-600 font-medium mb-2">New logo preview</p>
                  <button
                    type="button"
                    onClick={() => { setLogoFile(null); setLogoPreview(null) }}
                    className="text-xs text-gray-500 underline"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Upload */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                Upload New Logo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoFileChange}
                className="block w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"
              />
              <p className="text-xs text-gray-400 mt-1">
                Recommended: square image, PNG or JPG, max 2MB
              </p>
            </div>

            {logoFile && (
              <button
                type="button"
                onClick={handleLogoUpload}
                disabled={logoLoading}
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-6 py-2 rounded-lg disabled:opacity-60"
              >
                {logoLoading ? 'Uploading...' : 'Upload Logo'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}