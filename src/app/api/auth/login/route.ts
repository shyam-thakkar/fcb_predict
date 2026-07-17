import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json({ success: false, error: 'Username and password are required' }, { status: 400 });
        }

        // Find user by username
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username.toLowerCase())
            .single();

        if (error || !user) {
            return NextResponse.json({ success: false, error: 'Invalid username or password' }, { status: 401 });
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password_hash);
        if (!isValid) {
            return NextResponse.json({ success: false, error: 'Invalid username or password' }, { status: 401 });
        }

        // Enforce one login per IP (excluding admins and local loopback address)
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
        const isLocal = ip === '127.0.0.1' || ip === '::1' || ip === 'unknown';

        if (!isLocal && user.role !== 'admin') {
            const { data: activeIpUser } = await supabase
                .from('users')
                .select('id, username')
                .eq('ip_address', ip)
                .neq('id', user.id)
                .limit(1);

            if (activeIpUser && activeIpUser.length > 0) {
                return NextResponse.json({
                    success: false,
                    error: 'Only one user account login is permitted per IP address.'
                }, { status: 403 });
            }
        }

        // Update last login and IP address
        await supabase
            .from('users')
            .update({
                last_login: new Date().toISOString(),
                ip_address: ip
            })
            .eq('id', user.id);

        // Generate JWT
        const token = generateToken({ id: user.id, username: user.username, role: user.role });

        const response = NextResponse.json({
            success: true,
            data: {
                id: user.id,
                full_name: user.full_name,
                username: user.username,
                role: user.role,
                token,
            },
            message: 'Login successful!',
        });

        // Set cookie
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
