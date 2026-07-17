import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

// GET predictions for current user
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

        const { data: predictions, error } = await supabase
            .from('predictions')
            .select('*')
            .eq('user_id', decoded.id);

        if (error) throw error;

        return NextResponse.json({ success: true, data: predictions });
    } catch (error) {
        console.error('Get predictions error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch predictions' }, { status: 500 });
    }
}

// POST - submit a prediction
export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

        // Check prediction lock (20 July 2026 at 12:30 AM IST)
        const lockTime = new Date('2026-07-20T00:30:00+05:30');
        if (new Date() >= lockTime) {
            return NextResponse.json({ success: false, error: '🔒 Predictions are now closed.' }, { status: 400 });
        }

        const body = await request.json();
        const { match_id, winner, score_home, score_away, first_team_to_score, first_goal_scorer,
            man_of_match, total_goals, match_ends_in, both_teams_score, yellow_cards,
            red_card, possession, corners, last_goal_scorer } = body;

        // Check if match exists and predictions are not locked
        const { data: match } = await supabase
            .from('matches')
            .select('id, predictions_locked, status')
            .eq('id', match_id)
            .single();

        if (!match) return NextResponse.json({ success: false, error: 'Match not found' }, { status: 404 });
        if (match.predictions_locked || (match.status && match.status !== 'upcoming')) {
            return NextResponse.json({ success: false, error: '🔒 Predictions are now closed.' }, { status: 400 });
        }

        // Check if user already submitted
        const { data: existing } = await supabase
            .from('predictions')
            .select('id')
            .eq('user_id', decoded.id)
            .eq('match_id', match_id)
            .single();

        if (existing) {
            return NextResponse.json({ success: false, error: 'You have already submitted a prediction for this match.' }, { status: 400 });
        }

        // Validate all fields
        if (!winner || score_home === undefined || score_away === undefined || !first_team_to_score ||
            !first_goal_scorer || !man_of_match || !total_goals || !match_ends_in ||
            !both_teams_score || yellow_cards === undefined || !red_card || !possession ||
            corners === undefined || !last_goal_scorer) {
            return NextResponse.json({ success: false, error: 'All prediction fields are required' }, { status: 400 });
        }

        const { data: prediction, error } = await supabase
            .from('predictions')
            .insert({
                user_id: decoded.id,
                match_id,
                winner,
                score_home,
                score_away,
                first_team_to_score,
                first_goal_scorer,
                man_of_match,
                total_goals: String(total_goals),
                match_ends_in,
                both_teams_score,
                yellow_cards,
                red_card,
                possession,
                corners,
                last_goal_scorer,
            })
            .select()
            .single();

        if (error) {
            console.error('Insert prediction error:', error);
            return NextResponse.json({ success: false, error: 'Failed to submit prediction' }, { status: 500 });
        }

        // Create/update leaderboard entry
        await supabase
            .from('leaderboard')
            .upsert({
                user_id: decoded.id,
                match_id,
                points: 0,
                rank: 0,
                correct_predictions: 0,
                badges: [],
            }, { onConflict: 'user_id,match_id' });

        return NextResponse.json({
            success: true,
            data: prediction,
            message: 'Prediction submitted successfully!',
        });
    } catch (error) {
        console.error('Submit prediction error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
