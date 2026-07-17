import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET match data
export async function GET() {
    try {
        const { data: matches, error } = await supabase
            .from('matches')
            .select('*')
            .order('kickoff_time', { ascending: true });

        if (error) throw error;

        // Server-side lock time: 20 July 2026 at 12:30 AM IST (which is 19 July 2026 at 19:00 UTC)
        const lockTime = new Date('2026-07-20T00:30:00+05:30');
        const isTimeLocked = new Date() >= lockTime;

        const processedMatches = matches?.map(match => {
            const isStatusLocked = match.status && match.status !== 'upcoming';
            return {
                ...match,
                predictions_locked: !!(match.predictions_locked || isTimeLocked || isStatusLocked)
            };
        }) || [];

        return NextResponse.json({ success: true, data: processedMatches });
    } catch (error) {
        console.error('Get match error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch match data' }, { status: 500 });
    }
}

// PUT - admin update match
export async function PUT(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

        // Import and verify
        const { verifyToken } = await import('@/lib/auth');
        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) return NextResponse.json({ success: false, error: 'Match ID required' }, { status: 400 });

        const { data: match, error } = await supabase
            .from('matches')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        // Log admin action
        await supabase.from('admin_logs').insert({
            admin_id: decoded.id,
            action: 'update_match',
            details: JSON.stringify({ match_id: id, updates: Object.keys(updateData) }),
        });

        return NextResponse.json({ success: true, data: match, message: 'Match updated successfully' });
    } catch (error) {
        console.error('Update match error:', error);
        return NextResponse.json({ success: false, error: 'Failed to update match' }, { status: 500 });
    }
}
