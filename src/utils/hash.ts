
/**
 * Generates a hash for a password using salt and pepper for added security.
 * 
 * @param {string} password - The password to hash
 * @param {string | null} salt - Salt value to use in the hash. If null, uses the environment variable SALT.
 * @param {string | null} pepper - Pepper value to use in the hash. If null, uses the environment variable PEPPER.
 * @returns {string} The hashed password. Returns an empty string if salt or pepper is not available.
 * @throws {Error} Logs an error if salt or pepper is not found.
 * @example
 * // Using environment variables for salt and pepper
 * const hash = getPasswordHash('myPassword');
 * 
 * // Using custom salt and pepper
 * const hash = getPasswordHash('myPassword', 'customSalt', 'customPepper');
 */
export function getPasswordHash(password: string, salt: string | null = null, pepper: string | null = null): string {
    const actualSalt = salt || process.env.SALT;
    const actualPepper = pepper || process.env.PEPPER;

    if (!actualSalt || !actualPepper) {
        console.error("Salt or Pepper not found");
        return "";
    }

    return getHash(actualSalt + password + actualPepper);
}

/**
 * Computes a SHA-256 hash of a given string.
 *
 * @param {string} input - The string to be hashed.
 * @returns {string} A hexadecimal string representation of the hash.
 * @example
 * getHash("hello");
 * // returns "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
 */
export function getHash(input: string): string {
    return require('crypto').createHash('sha256').update(input, 'utf8').digest('hex');
}
