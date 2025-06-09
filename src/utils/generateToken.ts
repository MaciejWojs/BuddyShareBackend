/**
 * Generates a random hexadecimal token of the specified length.
 *
 * @param {number} [length=64] - The number of bytes to generate for the token
 * @returns {string} - The generated hexadecimal token string
 *
 * @example
 * // Generate a 64-byte token
 * const token = generateToken();
 * // Generate a 32-byte token
 * const token = generateToken(32);
 */
export const generateToken = (length: number = 64): string => {
    return require('crypto').randomBytes(length).toString('hex');
}