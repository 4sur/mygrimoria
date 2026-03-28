import * as Sentry from '@sentry/react';

export type EventName =
  | 'session_started'
  | 'page_viewed'
  | 'reading_created'
  | 'reading_saved'
  | 'user_registered'
  | 'user_login'
  | 'chat_started'
  | 'error_occurred';

export type EventProperties = Record<string, string | number | boolean | undefined>;

const sessionId = crypto.randomUUID();
let userId: string | undefined;

export function setUserId(id: string) {
  userId = id;
  Sentry.setUser({ id });
}

export function trackEvent(name: EventName, properties?: EventProperties) {
  if (import.meta.env.DEV) {
    console.log(`[Analytics] ${name}`, properties);
  }

  Sentry.addBreadcrumb({
    category: 'analytics',
    message: name,
    data: properties,
    level: 'info',
  });

  if (properties) {
    Sentry.setContext('event_properties', properties);
  }
}

export function trackPageView(page: string) {
  trackEvent('page_viewed', { page, session_id: sessionId });
}

export function trackReadingCreated(oracleType: string, hexagram?: string, cards?: string[]) {
  trackEvent('reading_created', {
    oracle_type: oracleType,
    hexagram,
    cards: cards?.join(','),
    session_id: sessionId,
    user_id: userId,
  });
}

export function trackReadingSaved(oracleType: string) {
  trackEvent('reading_saved', {
    oracle_type: oracleType,
    session_id: sessionId,
    user_id: userId,
  });
}

export function trackError(error: Error, context?: string) {
  Sentry.captureException(error, {
    extra: { context, session_id: sessionId, user_id: userId },
  });
  trackEvent('error_occurred', { error: error.message, context, user_id: userId });
}

export function trackUserAction(action: string, properties?: EventProperties) {
  trackEvent(action as EventName, { ...properties, session_id: sessionId, user_id: userId });
}
