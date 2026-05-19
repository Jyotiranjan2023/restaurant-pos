import { useNavigate } from 'react-router-dom'
import { useSubscription } from '../hooks/useSubscription'

export default function SubscriptionBanner() {
  const { subscription, loading } = useSubscription()
  const navigate = useNavigate()

  if (loading || !subscription) return null

  const { status, trialEndsAt, gracePeriodEndsAt } = subscription

  if (status !== 'TRIAL' && status !== 'GRACE_PERIOD') return null

  // Returns a friendly string: "5 days left", "12 hours left", "Less than 1 hour left", or "Expired"
  const formatTimeLeft = (endDateStr) => {
    if (!endDateStr) return 'Expired'
    const endDate = new Date(endDateStr)
    const now = new Date()
    const diffMs = endDate - now

    if (diffMs <= 0) return 'Expired'

    const oneHour = 1000 * 60 * 60
    const oneDay = oneHour * 24

    if (diffMs >= oneDay) {
      const days = Math.ceil(diffMs / oneDay)
      return `${days} ${days === 1 ? 'day' : 'days'} left`
    }
    if (diffMs >= oneHour) {
      const hours = Math.ceil(diffMs / oneHour)
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} left`
    }
    return 'Less than 1 hour left'
  }

  if (status === 'TRIAL') {
    const timeLeft = formatTimeLeft(trialEndsAt)
    const expired = timeLeft === 'Expired'
    return (
      <div className="bg-orange-100 border-b border-orange-300 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎁</span>
          <span className="text-orange-900 font-medium">
            {expired
              ? 'Your free trial has ended.'
              : `Free trial — ${timeLeft}.`}
          </span>
        </div>
        <button
         onClick={() => navigate('/upgrade')}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-1.5 rounded-md text-sm font-medium"
        >
          Upgrade Now
        </button>
      </div>
    )
  }

  if (status === 'GRACE_PERIOD') {
    const timeLeft = formatTimeLeft(gracePeriodEndsAt)
    const expired = timeLeft === 'Expired'
    return (
      <div className="bg-red-100 border-b border-red-300 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚠️</span>
          <span className="text-red-900 font-medium">
            {expired
              ? 'Payment failed. Your account will be suspended shortly.'
              : `Payment failed. Resolve in ${timeLeft.replace(' left', '')} or your account will be suspended.`}
          </span>
        </div>
        <button
          onClick={() => navigate('/upgrade')}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-md text-sm font-medium"
        >
          Pay Now
        </button>
      </div>
    )
  }

  return null
}