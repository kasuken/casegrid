import type { GameFeedback } from '../../stores/gameStore'

interface FeedbackBannerProps {
  readonly feedback: GameFeedback | null
  readonly onDismiss?: () => void
}

export function FeedbackBanner({ feedback, onDismiss }: FeedbackBannerProps) {
  if (!feedback) return null

  const isError = feedback.type === 'error'
  const isSuccess = feedback.type === 'success'

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live="polite"
      className={`feedback-banner feedback-banner--${feedback.type}`}
      data-testid="feedback-banner"
    >
      <span className="feedback-banner__icon" aria-hidden="true">
        {isError ? '⚠️' : isSuccess ? '✓' : 'ℹ️'}
      </span>
      <span className="feedback-banner__text">{feedback.message}</span>
      {onDismiss && (
        <button
          type="button"
          className="feedback-banner__close"
          onClick={onDismiss}
          aria-label="Dismiss feedback"
        >
          ×
        </button>
      )}
    </div>
  )
}
