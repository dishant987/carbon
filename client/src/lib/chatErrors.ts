export function formatChatError(rawError: string): string {
  if (!rawError) return 'An unexpected error occurred. Please try again.';

  const errLower = rawError.toLowerCase();

  if (
    errLower.includes('quota') ||
    errLower.includes('rate limit') ||
    errLower.includes('429') ||
    errLower.includes('too many requests')
  ) {
    const retryMatch =
      rawError.match(/retry(?:ing)? in ([\d\.]+)\s*s/i) ||
      rawError.match(/retryDelay":"(\d+)/i) ||
      rawError.match(/retry in ([\d\.]+)\s*s/i);
    if (retryMatch) {
      const secs = Math.ceil(parseFloat(retryMatch[1]));
      return `EcoBot is currently receiving too many requests. Please try again in about ${secs} seconds.`;
    }
    return 'EcoBot has exceeded its daily usage quota or rate limit. Please try again in a moment.';
  }

  if (
    errLower.includes('prisma') ||
    errLower.includes('database') ||
    errLower.includes('findmany') ||
    errLower.includes('create')
  ) {
    return 'We encountered a database connection issue. Please contact the administrator.';
  }

  if (errLower.includes('api key') || errLower.includes('apikey') || errLower.includes('api_key')) {
    return 'The AI service is currently misconfigured (invalid API key). Please check server configuration.';
  }

  if (errLower.includes('abort') || errLower.includes('cancelled')) {
    return 'The request was cancelled.';
  }

  if (
    errLower.includes('stream interrupted') ||
    errLower.includes('failed to connect') ||
    errLower.includes('fetch')
  ) {
    return 'Connection to the chat server was lost. Please try again.';
  }

  if (
    rawError.length < 120 &&
    !rawError.includes('http') &&
    !rawError.includes('google') &&
    !rawError.includes('fetch')
  ) {
    return rawError;
  }

  return 'Sorry, I encountered an issue generating a response. Please try again.';
}
