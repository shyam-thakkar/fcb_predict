import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { syncMatchStats } from '@/lib/sync';

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { match_id, fotmob_match_id } = body;

        if (!match_id || !fotmob_match_id) {
            return NextResponse.json({ success: false, error: 'Missing match_id or fotmob_match_id' }, { status: 400 });
        }

        const result = await syncMatchStats(match_id, fotmob_match_id);

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }

        return NextResponse.json(result);

    } catch (error: any) {
        console.error('FotMob Sync API error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
