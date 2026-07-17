import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';

// GET admin stats
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;
        if (!token) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        }

        // Total users
        const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact', head: true });

        // Total predictions
        const { count: totalPredictions } = await supabase.from('predictions').select('*', { count: 'exact', head: true });

        // Predictions by winner
        const { data: predictions } = await supabase.from('predictions').select('winner, score_home, score_away, first_goal_scorer, man_of_match, total_goals, match_ends_in, submitted_at');

        const argentinaPredictions = predictions?.filter(p => p.winner === 'Argentina').length || 0;
        const spainPredictions = predictions?.filter(p => p.winner === 'Spain').length || 0;

        // Most common score
        const scoreCounts: Record<string, number> = {};
        predictions?.forEach(p => {
            const key = `${p.score_home}-${p.score_away}`;
            scoreCounts[key] = (scoreCounts[key] || 0) + 1;
        });
        const mostCommonScore = Object.entries(scoreCounts).sort((a, b) => b[1] - a[1])[0];

        // Most selected first goal scorer
        const fgsCounts: Record<string, number> = {};
        predictions?.forEach(p => {
            fgsCounts[p.first_goal_scorer] = (fgsCounts[p.first_goal_scorer] || 0) + 1;
        });
        const mostSelectedFGS = Object.entries(fgsCounts).sort((a, b) => b[1] - a[1])[0];

        // Most selected man of the match
        const momCounts: Record<string, number> = {};
        predictions?.forEach(p => {
            momCounts[p.man_of_match] = (momCounts[p.man_of_match] || 0) + 1;
        });
        const mostSelectedMOM = Object.entries(momCounts).sort((a, b) => b[1] - a[1])[0];

        // Average predicted goals
        const avgGoals = predictions?.reduce((sum, p) => {
            const total = p.total_goals === '7+' ? 7 : parseInt(p.total_goals);
            return sum + total;
        }, 0);

        // Submission timeline (by hour)
        const timeline: Record<string, number> = {};
        predictions?.forEach(p => {
            const date = new Date(p.submitted_at).toISOString().split('T')[0];
            timeline[date] = (timeline[date] || 0) + 1;
        });

        // Match ends in distribution
        const endDistribution: Record<string, number> = { '90 Minutes': 0, 'Extra Time': 0, 'Penalties': 0 };
        predictions?.forEach(p => {
            if (p.match_ends_in in endDistribution) endDistribution[p.match_ends_in]++;
        });

        return NextResponse.json({
            success: true,
            data: {
                totalUsers: totalUsers || 0,
                totalPredictions: totalPredictions || 0,
                argentinaPredictions,
                spainPredictions,
                mostCommonScore: mostCommonScore ? { score: mostCommonScore[0], count: mostCommonScore[1] } : null,
                mostSelectedFGS: mostSelectedFGS ? { player: mostSelectedFGS[0], count: mostSelectedFGS[1] } : null,
                mostSelectedMOM: mostSelectedMOM ? { player: mostSelectedMOM[0], count: mostSelectedMOM[1] } : null,
                avgPredictedGoals: predictions?.length ? (avgGoals! / predictions.length).toFixed(1) : '0',
                submissionTimeline: timeline,
                matchEndsInDistribution: endDistribution,
            },
        });
    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 });
    }
}
