import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import subscriptionService from '../services/subscriptionService'
import { useSubscription } from '../hooks/useSubscription'

export default function Upgrade() {
  const navigate = useNavigate()
  const { subscription } = useSubscription()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const res = await subscriptionService.getVisiblePlans()
        const list = res.data || []
        // Sort by displayOrder so Basic → Pro → Enterprise
        list.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
        setPlans(list)
      } catch (err) {
        setError('Failed to load plans. Please try again.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadPlans()
  }, [])

  const currentPlanCode = subscription?.planCode
  const currentStatus = subscription?.status
  const isLifetime = currentStatus === 'LIFETIME_FREE'

  // Plan rank for comparing upgrade vs downgrade
  const planRank = { BASIC: 1, PRO: 2, ENTERPRISE: 3 }
const handleChoose = async (planCode) => {
    try {
        const res = await subscriptionService.createCheckout(planCode)
        if (res.success && res.data?.shortUrl) {
            // Redirect customer to Razorpay payment page
            window.location.href = res.data.shortUrl
        } else {
            alert('Failed to start checkout. Please try again.')
        }
    } catch (err) {
        const message = err.response?.data?.message || 'Checkout failed. Please try again.'
        alert(message)
    }
}

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading plans...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-800">
        {error}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/subscription')}
          className="text-sm text-gray-600 hover:text-gray-900 mb-3 flex items-center gap-1"
        >
          ← Back to My Subscription
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Choose Your Plan</h1>
        <p className="text-gray-600 mt-2">
          Pick the plan that fits your restaurant. Upgrade or change anytime.
        </p>
      </div>

      {/* Lifetime notice */}
      {isLifetime && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4 text-blue-900">
          ⭐ You have <strong>Lifetime Free</strong> access. Plans below are for reference only.
        </div>
      )}

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            currentPlanCode={currentPlanCode}
            isLifetime={isLifetime}
            planRank={planRank}
            onChoose={handleChoose}
          />
        ))}
      </div>

      {/* Footer note */}
      <div className="mt-10 text-center text-sm text-gray-500">
        All prices in INR per month. GST may apply. Cancel anytime.
      </div>
    </div>
  )
}

// ============ PlanCard sub-component ============

function PlanCard({ plan, currentPlanCode, isLifetime, planRank, onChoose }) {
  const isCurrent = plan.code === currentPlanCode
  const isPro = plan.code === 'PRO'
  const currentRank = planRank[currentPlanCode] || 0
  const thisRank = planRank[plan.code] || 0
  const isUpgrade = thisRank > currentRank
  const isDowngrade = thisRank < currentRank && currentRank > 0

  // Button logic
  let buttonText = 'Choose Plan'
  let buttonDisabled = false
  let buttonClass = 'bg-blue-600 hover:bg-blue-700 text-white'

  if (isLifetime) {
    buttonText = 'Lifetime Free'
    buttonDisabled = true
    buttonClass = 'bg-gray-200 text-gray-500 cursor-not-allowed'
  } else if (isCurrent) {
    buttonText = 'Current Plan'
    buttonDisabled = true
    buttonClass = 'bg-gray-200 text-gray-600 cursor-not-allowed'
  } else if (isDowngrade) {
    // Hide downgrade — per decision earlier
    buttonText = ''
    buttonDisabled = true
    buttonClass = 'hidden'
  } else if (isUpgrade) {
    buttonText = `Upgrade to ${plan.name}`
  }

  return (
    <div
      className={`rounded-lg border-2 p-6 flex flex-col ${
        isPro ? 'border-blue-500 shadow-lg relative' : 'border-gray-200'
      } bg-white`}
    >
      {isPro && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          MOST POPULAR
        </div>
      )}

      {/* Plan name + price */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
        <p className="text-sm text-gray-500 mt-1 min-h-[40px]">
          {plan.description}
        </p>
      </div>

      <div className="mb-6">
        <span className="text-4xl font-bold text-gray-900">
          ₹{Math.floor(plan.priceInr).toLocaleString('en-IN')}
        </span>
        <span className="text-gray-500 ml-1">/month</span>
      </div>

      {/* Limits */}
      <div className="mb-5 space-y-2 text-sm">
        <LimitRow label="Staff" value={plan.maxStaff} />
        <LimitRow label="Menu items" value={plan.maxMenuItems} />
        <LimitRow label="Tables" value={plan.maxTables} />
        <LimitRow label="Orders/month" value={plan.maxOrdersPerMonth} />
      </div>

      {/* Features */}
      <div className="mb-6 space-y-2 text-sm border-t pt-4">
        <FeatureRow label="Inventory management" enabled={plan.hasInventory} />
        <FeatureRow label="Recipes" enabled={plan.hasRecipes} />
        <FeatureRow label="Discount coupons" enabled={plan.hasCoupons} />
        <FeatureRow label="Kitchen display" enabled={plan.hasKitchenDisplay} />
        <FeatureRow label="Customer feedback" enabled={plan.hasFeedback} />
        <FeatureRow label="CSV exports" enabled={plan.hasCsvExport} />
        <FeatureRow label="Advanced reports" enabled={plan.hasAllReports} />
        <FeatureRow label="WhatsApp notifications" enabled={plan.hasWhatsappNotifications} />
        <FeatureRow label="API access" enabled={plan.hasApiAccess} />
        <FeatureRow label="Priority support" enabled={plan.hasPrioritySupport} />
      </div>

      {/* Action button — pushed to bottom */}
      <div className="mt-auto">
        {buttonText && (
          <button
            onClick={() => !buttonDisabled && onChoose(plan.code)}
            disabled={buttonDisabled}
            className={`w-full py-2.5 rounded-md font-medium ${buttonClass}`}
          >
            {buttonText}
          </button>
        )}
      </div>
    </div>
  )
}

function LimitRow({ label, value }) {
  const display = value === null || value === undefined ? 'Unlimited' : value.toLocaleString('en-IN')
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{display}</span>
    </div>
  )
}

function FeatureRow({ label, enabled }) {
  return (
    <div className="flex items-center gap-2">
      <span className={enabled ? 'text-green-600' : 'text-gray-300'}>
        {enabled ? '✓' : '✗'}
      </span>
      <span className={enabled ? 'text-gray-800' : 'text-gray-400 line-through'}>
        {label}
      </span>
    </div>
  )
}