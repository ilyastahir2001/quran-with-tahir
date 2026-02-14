// Server-side chat moderation for Edge Functions

const EMAIL_REGEX =
  /[a-zA-Z0-9._%+-]+\s*[@＠]\s*[a-zA-Z0-9.-]+\s*\.\s*[a-zA-Z]{2,}/i;

const PHONE_REGEX =
  /(?:\+?\d{1,3}[\s\-.]?)?\(?\d{2,4}\)?[\s\-.]?\d{3,4}[\s\-.]?\d{3,4}/;

export interface ModerationResult {
  blocked: boolean;
  reason?: string;
  sanitized: string;
}

export function moderateMessage(message: string): ModerationResult {
  const trimmed = message.trim();
  if (!trimmed) return { blocked: false, sanitized: trimmed };

  if (EMAIL_REGEX.test(trimmed)) {
    return {
      blocked: true,
      reason: 'email_detected',
      sanitized: trimmed.replace(EMAIL_REGEX, '[blocked]'),
    };
  }

  if (PHONE_REGEX.test(trimmed)) {
    return {
      blocked: true,
      reason: 'phone_detected',
      sanitized: trimmed.replace(PHONE_REGEX, '[blocked]'),
    };
  }

  return { blocked: false, sanitized: trimmed };
}
