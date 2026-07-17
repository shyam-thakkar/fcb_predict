import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword, validatePassword, validateMobile } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { full_name, username, mobile, password, confirm_password } = body;

        // Validate required fields
        if (!full_name || !username || !mobile || !password || !confirm_password) {
            return NextResponse.json({ success: false, error: 'All fields are required' }, { status: 400 });
        }

        // Validate password match
        if (password !== confirm_password) {
            return NextResponse.json({ success: false, error: 'Passwords do not match' }, { status: 400 });
        }

        // Validate password strength
        const passwordCheck = validatePassword(password);
        if (!passwordCheck.valid) {
            return NextResponse.json({ success: false, error: passwordCheck.errors.join('. ') }, { status: 400 });
        }

        // Validate mobile
        if (!validateMobile(mobile)) {
            return NextResponse.json({ success: false, error: 'Invalid mobile number' }, { status: 400 });
        }

        // Check username uniqueness
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('username', username.toLowerCase())
            .single();

        if (existingUser) {
            return NextResponse.json({ success: false, error: 'This username is already taken. Please choose another username.' }, { status: 400 });
        }
        // Check mobile uniqueness
        const { data: existingMobile } = await supabase
            .from('users')
            .select('id')
            .eq('mobile', mobile)
            .single();

        if (existingMobile) {
            return NextResponse.json({ success: false, error: 'This mobile number is already registered.' }, { status: 400 });
        }

        const ip_address = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
        const isLocal = ip_address === '127.0.0.1' || ip_address === '::1' || ip_address === 'unknown';

        if (!isLocal) {
            // Check if any other user registered with this IP address
            const { data: existingIp } = await supabase
                .from('users')
                .select('id')
                .eq('ip_address', ip_address)
                .limit(1);

            if (existingIp && existingIp.length > 0) {
                return NextResponse.json({ success: false, error: 'Only one prediction account registration allowed per IP/household.' }, { status: 400 });
            }
        }

        // Hash password and create user
        const password_hash = await hashPassword(password);

        const { data: newUser, error } = await supabase
            .from('users')
            .insert({
                full_name,
                username: username.toLowerCase(),
                mobile,
                password_hash,
                role: 'user',
                ip_address,
            })
            .select('id, full_name, username, role')
            .single();

        if (error) {
            console.error('Registration error:', error);
            return NextResponse.json({ success: false, error: 'Registration failed. Please try again.' }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: newUser,
            message: 'Registration successful! Please login to continue.',
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
