import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';
import { Match, GoalEvent, CardEvent } from '@/types';

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

        console.log(`Syncing match ${match_id} with FotMob ID ${fotmob_match_id}...`);

        // Fetch from FotMob API
        const response = await fetch(`https://www.fotmob.com/api/data/matchDetails?matchId=${fotmob_match_id}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            }
        });

        if (!response.ok) {
            return NextResponse.json({ success: false, error: `FotMob API returned status ${response.status}` }, { status: 502 });
        }

        const data = await response.json();

        // 1. Extract basic status
        const isStarted = data.header?.status?.started || false;
        const isFinished = data.header?.status?.finished || false;
        const matchMinute = data.header?.status?.liveTime?.minute || 0;

        let matchStatus: 'upcoming' | 'live' | 'halftime' | 'extra_time' | 'penalties' | 'finished' = 'upcoming';
        if (isFinished) {
            matchStatus = 'finished';
        } else if (isStarted) {
            const liveTimeStr = data.header?.status?.liveTime?.longKey || '';
            if (liveTimeStr.toLowerCase().includes('half')) {
                matchStatus = 'halftime';
            } else if (liveTimeStr.toLowerCase().includes('extra')) {
                matchStatus = 'extra_time';
            } else if (liveTimeStr.toLowerCase().includes('penalties')) {
                matchStatus = 'penalties';
            } else {
                matchStatus = 'live';
            }
        }

        // 2. Map teams dynamically based on team names (in FotMob, Spain might be home and Argentina away)
        const rawHomeTeam = data.header?.teams?.[0];
        const rawAwayTeam = data.header?.teams?.[1];
        const team0Name = (rawHomeTeam?.name || '').toLowerCase();
        const team1Name = (rawAwayTeam?.name || '').toLowerCase();

        let fotmobArgentinaIndex = 0;
        let fotmobSpainIndex = 1;

        if (team0Name.includes('argentina')) {
            fotmobArgentinaIndex = 0;
            fotmobSpainIndex = 1;
        } else if (team0Name.includes('spain') || team0Name.includes('españa') || team0Name.includes('espana')) {
            fotmobSpainIndex = 0;
            fotmobArgentinaIndex = 1;
        } else if (team1Name.includes('argentina')) {
            fotmobArgentinaIndex = 1;
            fotmobSpainIndex = 0;
        } else if (team1Name.includes('spain') || team1Name.includes('españa') || team1Name.includes('espana')) {
            fotmobSpainIndex = 1;
            fotmobArgentinaIndex = 0;
        }

        const scoreHome = data.header?.teams?.[fotmobArgentinaIndex]?.score ?? 0;
        const scoreAway = data.header?.teams?.[fotmobSpainIndex]?.score ?? 0;

        // Determine winner
        let winner: 'Argentina' | 'Spain' | null = null;
        if (isFinished) {
            if (scoreHome > scoreAway) winner = 'Argentina';
            else if (scoreAway > scoreHome) winner = 'Spain';
        }

        // Determine final result (90 Minutes, Extra Time, Penalties)
        let finalResult = '';
        if (isFinished) {
            const liveTimeLong = data.header?.status?.liveTime?.longKey || '';
            if (liveTimeLong.toLowerCase().includes('penal')) {
                finalResult = 'Penalties';
            } else if (data.header?.status?.liveTime?.extratime || liveTimeLong.toLowerCase().includes('extra')) {
                finalResult = 'Extra Time';
            } else {
                finalResult = '90 Minutes';
            }
        }

        // 3. ExtractStats (Possession, Corners, Shots)
        let possessionHome = 50;
        let possessionAway = 50;
        let cornersHome = 0;
        let cornersAway = 0;
        let shotsHome = 0;
        let shotsAway = 0;

        // Try extracting from content.stats
        const statsPeriods = data.content?.stats?.periods?.All?.stats || [];
        for (const statsGroup of statsPeriods) {
            const statsItems = statsGroup.stats || [];
            for (const stat of statsItems) {
                const title = (stat.title || '').toLowerCase();
                const values = stat.stats || []; // [homeVal, awayVal]

                // Map the stat values according to team indexes
                const homeVal = values[fotmobArgentinaIndex];
                const awayVal = values[fotmobSpainIndex];

                if (title.includes('possession')) {
                    possessionHome = parseInt(homeVal) || 50;
                    possessionAway = parseInt(awayVal) || 50;
                } else if (title.includes('corner')) {
                    cornersHome = parseInt(homeVal) || 0;
                    cornersAway = parseInt(awayVal) || 0;
                } else if (title.includes('shot')) {
                    shotsHome = parseInt(homeVal) || 0;
                    shotsAway = parseInt(awayVal) || 0;
                }
            }
        }

        // 4. Extract Events (Goals and Cards)
        const goalEvents: GoalEvent[] = [];
        const cardEvents: CardEvent[] = [];

        const argentinaId = data.header?.teams?.[fotmobArgentinaIndex]?.id;
        const spainId = data.header?.teams?.[fotmobSpainIndex]?.id;

        // Match events are typically in: content.matchFacts.events.events
        const eventsArray = data.content?.matchFacts?.events?.events || [];
        for (const event of eventsArray) {
            const type = (event.type || '').toLowerCase();
            const minute = event.time || 0;

            const eventTeamId = event.teamId;
            let isArgentina = false;
            if (eventTeamId) {
                isArgentina = (eventTeamId === argentinaId);
            } else {
                isArgentina = (fotmobArgentinaIndex === 0) ? event.isHome : !event.isHome;
            }

            const teamName = isArgentina ? 'Argentina' : 'Spain';
            const playerName = event.playerName || event.player?.name || 'Unknown';

            if (type.includes('goal')) {
                let goalType: 'goal' | 'penalty' | 'own_goal' = 'goal';
                if (event.isOwnGoal) goalType = 'own_goal';
                else if (event.isPenalty) goalType = 'penalty';

                goalEvents.push({
                    player: playerName,
                    minute,
                    team: teamName,
                    type: goalType
                });
            } else if (type.includes('card')) {
                const cardType = event.card === 'Red' || type.includes('red') ? 'red' : 'yellow';
                cardEvents.push({
                    player: playerName,
                    minute,
                    team: teamName,
                    type: cardType
                });
            }
        }

        // Determine First Goal Scorer and Last Goal Scorer
        let firstGoalScorer = '';
        let lastGoalScorer = '';
        if (goalEvents.length > 0) {
            // Sort by minute ascending
            const sortedGoals = [...goalEvents].sort((a, b) => a.minute - b.minute);
            // Ignore own goals for scorers if wanted, but standard rule: first person listed
            const scorerGoals = sortedGoals.filter(e => e.type !== 'own_goal');
            if (scorerGoals.length > 0) {
                firstGoalScorer = scorerGoals[0].player;
                lastGoalScorer = scorerGoals[scorerGoals.length - 1].player;
            }
        }

        // Determine Man of the Match (highest rated player in FotMob stats)
        let manOfTheMatch = '';
        let highestRating = 0;

        // Loop through ratings if available
        const lineup = data.content?.lineup?.lineup || [];
        for (const side of lineup) {
            const players = side.players || [];
            for (const tier of players) {
                for (const p of tier) {
                    const rating = parseFloat(p.stats?.find((s: any) => s.title === 'FotMob Rating')?.value) || 0;
                    if (rating > highestRating) {
                        highestRating = rating;
                        manOfTheMatch = p.name?.fullName || p.name || '';
                    }
                }
            }
            const bench = side.bench || [];
            for (const p of bench) {
                const rating = parseFloat(p.stats?.find((s: any) => s.title === 'FotMob Rating')?.value) || 0;
                if (rating > highestRating) {
                    highestRating = rating;
                    manOfTheMatch = p.name?.fullName || p.name || '';
                }
            }
        }

        const updateData: Partial<Match> = {
            status: matchStatus,
            score_home: scoreHome,
            score_away: scoreAway,
            match_minute: matchMinute,
            possession_home: possessionHome,
            possession_away: possessionAway,
            corners_home: cornersHome,
            corners_away: cornersAway,
            shots_home: shotsHome,
            shots_away: shotsAway,
            goal_events: goalEvents as any,
            cards: cardEvents as any,
        };

        if (winner) updateData.winner = winner;
        if (finalResult) updateData.final_result = finalResult;
        if (manOfTheMatch) updateData.man_of_match = manOfTheMatch;

        // Auto-lock predictions once started
        if (isStarted) {
            updateData.predictions_locked = true;
        }

        // Update database
        const { data: updatedMatch, error: dbError } = await supabase
            .from('matches')
            .update(updateData)
            .eq('id', match_id)
            .select()
            .single();

        if (dbError) {
            return NextResponse.json({ success: false, error: 'Database update failed: ' + dbError.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            data: updatedMatch,
            message: 'Match synced successfully from FotMob!'
        });

    } catch (error: any) {
        console.error('FotMob Sync error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
