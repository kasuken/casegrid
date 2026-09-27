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
        {isError ? (
          <img src="/assets/ui/badge-clue-conflict.svg" width={28} height={28} alt="" />
        ) : isSuccess ? (
          <img src="/assets/ui/icon-clue-resolved.svg" width={24} height={24} alt="" />
        ) : 'i'}
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
