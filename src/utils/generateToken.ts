
export const generateToken = (length: number = 64): string => {
    return require('crypto').randomBytes(length).toString('hex');
}