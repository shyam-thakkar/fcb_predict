import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

// GET all users (admin only)
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        }

        const searchParams = request.nextUrl.searchParams;
        const search = searchParams.get('search');

        let query = supabase
            .from('users')
            .select('id, full_name, username, mobile, role, created_at, last_login, ip_address')
            .order('created_at', { ascending: false });

        if (search) {
            query = query.or(`username.ilike.%${search}%,full_name.ilike.%${search}%,mobile.ilike.%${search}%`);
        }

        const { data: users, error } = await query;
        if (error) throw error;

        return NextResponse.json({ success: true, data: users });
    } catch (error) {
        console.error('Admin users error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
    }
}

// DELETE user (admin only)
export async function DELETE(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { user_id } = body;

        if (!user_id) return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 });

        const { error } = await supabase.from('users').delete().eq('id', user_id);
        if (error) throw error;

        await supabase.from('admin_logs').insert({
            admin_id: decoded.id,
            action: 'delete_user',
            details: JSON.stringify({ deleted_user_id: user_id }),
        });

        return NextResponse.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete user' }, { status: 500 });
    }
}
