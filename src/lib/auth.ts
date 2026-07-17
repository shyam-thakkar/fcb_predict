import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function generateToken(payload: { id: string; username: string; role: string }): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { id: string; username: string; role: string } | null {
    try {
        return jwt.verify(token, JWT_SECRET) as { id: string; username: string; role: string };
    } catch {
        return null;
    }
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (password.length < 8) errors.push('Password must be at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('Must include one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('Must include one lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('Must include one number');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('Must include one special character');
    return { valid: errors.length === 0, errors };
}

export function validateMobile(mobile: string): boolean {
    return /^\d{10,15}$/.test(mobile.replace(/[\s\-\+]/g, ''));
}
