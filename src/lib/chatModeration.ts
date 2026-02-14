// Chat moderation — blocks emails, phone numbers, and obfuscated contact info

export interface ModerationResult {
  blocked: boolean;
  reason?: string;
  sanitised: string;
}

const EMAIL_REGEX =
  /[a-zA-Z0-9._%+-]+\s*[@＠]\s*[a-zA-Z0-9.-]+\s*\.\s*[a-zA-Z]{2,}/i;

const PHONE_REGEX =
  /(?:\+?\d{1,3}[\s\-.]?)?\(?\d{2,4}\)?[\s\-.]?\d{3,4}[\s\-.]?\d{3,4}/;

const OBFUSCATED_AT = /\b(at|dot|d0t|gmail|yahoo|hotmail|outlook)\b/gi;

/**
 * Detects whether a message contains contact information.
 */
export function containsContactInfo(text: string): {
  hasEmail: boolean;
  hasPhone: boolean;
} {
  return {
    hasEmail: EMAIL_REGEX.test(text),
    hasPhone: PHONE_REGEX.test(text),
  };
}

/**
 * Moderates a chat message. Returns a blocked result if contact info is found.
 */
export function moderateMessage(message: string): ModerationResult {
  const trimmed = message.trim();
  if (!trimmed) {
    return { blocked: false, sanitised: trimmed };
  }

  const { hasEmail, hasPhone } = containsContactInfo(trimmed);

  if (hasEmail) {
    return {
      blocked: true,
      reason: 'Message contains an email address. Sharing contact information is not allowed.',
      sanitised: trimmed.replace(EMAIL_REGEX, '[blocked]'),
    };
  }

  if (hasPhone) {
    return {
      blocked: true,
      reason: 'Message contains a phone number. Sharing contact information is not allowed.',
      sanitised: trimmed.replace(PHONE_REGEX, '[blocked]'),
    };
  }

  // Check for obfuscated contact patterns (e.g. "myname at gmail dot com")
  const obfuscatedMatches = trimmed.match(OBFUSCATED_AT);
  if (obfuscatedMatches && obfuscatedMatches.length >= 2) {
    return {
      blocked: true,
      reason: 'Message appears to contain obfuscated contact information.',
      sanitised: trimmed,
    };
  }

  return { blocked: false, sanitised: trimmed };
}
