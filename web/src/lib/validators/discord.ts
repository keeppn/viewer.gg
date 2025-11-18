/**
 * Discord ID Validators
 *
 * Discord uses Snowflake IDs which are 64-bit integers
 * represented as strings of 17-19 digits
 */

/**
 * Validates Discord User ID format
 * Discord IDs are 64-bit integers (17-19 digits as strings)
 */
export function isValidDiscordUserId(id: unknown): id is string {
  if (typeof id !== 'string') return false;
  return /^\d{17,19}$/.test(id);
}

/**
 * Validates Discord Guild ID format
 */
export function isValidDiscordGuildId(id: unknown): id is string {
  if (typeof id !== 'string') return false;
  return /^\d{17,19}$/.test(id);
}

/**
 * Validates Discord Role ID format
 */
export function isValidDiscordRoleId(id: unknown): id is string {
  if (typeof id !== 'string') return false;
  return /^\d{17,19}$/.test(id);
}
