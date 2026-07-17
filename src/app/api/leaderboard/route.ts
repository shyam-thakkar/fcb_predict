import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { calculatePoints, tieBreak, assignBadges, ScoreBreakdown } from '@/lib/scoring';
import { Prediction, Match } from '@/types';

// GET leaderboard
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const matchId = searchParams.get('match_id');
        const search = searchParams.get('search');

        let query = supabase
            .from('leaderboard')
            .select(`
        *,
        users (id, full_name, username, role)
      `)
            .order('rank', { ascending: true });

        if (matchId) query = query.eq('match_id', matchId);

        const { data: entries, error } = await query;
        if (error) throw error;

        // Apply filters
        let filtered = (entries || []) as any[];
        filtered = filtered.filter((e) => e.users?.role !== 'admin');

        if (search) {
            const s = search.toLowerCase();
            filtered = filtered.filter((e: any) => {
                return e.users?.username?.toLowerCase().includes(s) ||
                    e.users?.full_name?.toLowerCase().includes(s);
            });
        }

        // Adjust ranks to be contiguous
        filtered = filtered.map((e, idx) => ({
            ...e,
            rank: idx + 1
        }));

        return NextResponse.json({ success: true, data: filtered });
    } catch (error) {
        console.error('Get leaderboard error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch leaderboard' }, { status: 500 });
    }
}

// POST - recalculate leaderboard (admin only)
export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

        const { verifyToken } = await import('@/lib/auth');
        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { match_id } = body;

        // Get match data
        const { data: match } = await supabase
            .from('matches')
            .select('*')
            .eq('id', match_id)
            .single();

        if (!match) return NextResponse.json({ success: false, error: 'Match not found' }, { status: 404 });

        // Get all predictions
        const { data: predictions } = await supabase
            .from('predictions')
            .select('*')
            .eq('match_id', match_id);

        if (!predictions || predictions.length === 0) {
            return NextResponse.json({ success: true, message: 'No predictions to calculate' });
        }

        // Calculate points for each prediction
        const scored = predictions.map((prediction: Prediction) => {
            const breakdown = calculatePoints(prediction, match as Match);
            return { prediction, breakdown };
        });

        // Sort by points (descending), then apply tie-break
        scored.sort((a: { prediction: Prediction; breakdown: ScoreBreakdown }, b: { prediction: Prediction; breakdown: ScoreBreakdown }) => {
            if (b.breakdown.total !== a.breakdown.total) return b.breakdown.total - a.breakdown.total;
            return tieBreak(a, b);
        });

        // Assign ranks and badges, update leaderboard
        for (let i = 0; i < scored.length; i++) {
            const { prediction, breakdown } = scored[i];
            const rank = i + 1;
            const badges = assignBadges(rank, breakdown);

            await supabase
                .from('leaderboard')
                .upsert({
                    user_id: prediction.user_id,
                    match_id,
                    points: breakdown.total,
                    rank,
                    correct_predictions: breakdown.correctPredictions,
                    badges,
                }, { onConflict: 'user_id,match_id' });
        }

        return NextResponse.json({
            success: true,
            message: `Leaderboard recalculated for ${scored.length} users`,
        });
    } catch (error) {
        console.error('Recalculate leaderboard error:', error);
        return NextResponse.json({ success: false, error: 'Failed to recalculate leaderboard' }, { status: 500 });
    }
}
