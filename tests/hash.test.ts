import { describe, it, expect } from 'vitest';
import { getHash, getPasswordHash } from '../src/utils/hash.ts';

describe('Hashing functions', () => {
    it('should hash a string correctly', () => {
        const input = 'hello';
        const expectedHash = '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'; // Example hash for 'hello'
        const actualHash = getHash(input); // Replace with actual hash function
        expect(actualHash).toBe(expectedHash);
    });

    it('should handle empty strings', () => {
        const input = '';
        const expectedHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'; // Example hash for ''
        const actualHash = getHash(input); // Replace with actual hash function
        expect(actualHash).toBe(expectedHash);
    });

    it('should handle special characters', () => {
        const input = '!@#$%^&*()';
        const expectedHash = '95ce789c5c9d18490972709838ca3a9719094bca3ac16332cfec0652b0236141'; // Example hash for '!@#$%^&*()'
        const actualHash = getHash(input); // Replace with actual hash function
        expect(actualHash).toBe(expectedHash);
    });
});

describe('Password hashing', () => {
    it('should hash a password correctly', () => {
        const salt = 'salt';
        const pepper = 'pepper';
        const pass = 'password';

        const expectedHash = getHash(salt + pass + pepper);
        const actualHash = getPasswordHash(pass, salt, pepper); // Replace with actual hash function
        expect(actualHash).toBe(expectedHash);
    });

});