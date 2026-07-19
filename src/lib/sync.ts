import { supabase } from './supabase';
import { Match, GoalEvent, CardEvent, Prediction } from '@/types';
import { calculatePoints, tieBreak, assignBadges } from './scoring';

export async function syncMatchStats(matchId: string, fotmobMatchId: string): Promise<{ success: boolean; error?: string; message?: string; data?: any }> {
    try {
        console.log(`[Background Sync] Syncing match ${matchId} with FotMob ID ${fotmobMatchId}...`);

        // Fetch from FotMob API
        const response = await fetch(`https://www.fotmob.com/api/data/matchDetails?matchId=${fotmobMatchId}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'application/json, text/plain, */*'
            }
        });

        if (!response.ok) {
            return { success: false, error: `FotMob API returned status ${response.status}` };
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

        // 2. Map teams dynamically based on team names
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

        // Determine final result
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

        // 3. Extract Stats
        let possessionHome = 50;
        let possessionAway = 50;
        let cornersHome = 0;
        let cornersAway = 0;
        let shotsHome = 0;
        let shotsAway = 0;

        const statsPeriods = data.content?.stats?.periods?.All?.stats || [];
        for (const statsGroup of statsPeriods) {
            const statsItems = statsGroup.stats || [];
            for (const stat of statsItems) {
                const title = (stat.title || '').toLowerCase();
                const values = stat.stats || [];

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

        // 4. Extract Events
        const goalEvents: GoalEvent[] = [];
        const cardEvents: CardEvent[] = [];

        const argentinaId = data.header?.teams?.[fotmobArgentinaIndex]?.id;

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

        // Determine First and Last Goal Scorer
        if (goalEvents.length > 0) {
            // first/last goal scorer calculation is done if needed, but matched in updatedMatch.
            // Under existing code, first_goal_scorer and last_goal_scorer were part of the match database record?
            // Actually let's look at route.ts check:
            // "if (winner) updateData.winner = winner;"
            // Wait, does route.ts update first_goal_scorer or last_goal_scorer in updateData?
            // Ah! Let's check:
            // Wait, in route.ts, it calculates firstGoalScorer and lastGoalScorer, but does it set them on updateData?
            // Let's look at lines 202-230:
            // "const updateData: Partial<Match> = { status: matchStatus, score_home: scoreHome, ... }"
            // Oh, wait! It calculates them but doesn't add them. Wait, let's see. Does the database table matches have first_goal_scorer and last_goal_scorer columns? No, they are not in the matches table in schema!
            // Wait, the match winner and MOTM are in the matches table, but first/last goal scorers are individual user prediction metrics and the match results has goal_events JSONB which has the entire array of goals! Inside `calculatePoints`, it parses `goal_events` to check first/last goal scorer.
            // Under `scoring.ts` calculatePoints:
            // ```typescript
            // const firstGoal = match.goal_events?.filter(e => e.type !== 'own_goal').sort((a,b) => a.minute - b.minute)[0];
            // const isFGS = prediction.first_goal_scorer === firstGoal?.player;
            // ```
            // Yes! So we don't save first_goal_scorer directly to the match row (only goal_events is stored). This is perfect!
        }

        // Determine Man of the Match
        let manOfTheMatch = '';
        let highestRating = 0;

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

        if (isStarted) {
            updateData.predictions_locked = true;
        }

        // Update database
        const { data: updatedMatch, error: dbError } = await supabase
            .from('matches')
            .update(updateData)
            .eq('id', matchId)
            .select()
            .single();

        if (dbError) {
            return { success: false, error: 'Database update failed: ' + dbError.message };
        }

        // Auto-recalculate leaderboard on successful sync
        try {
            const { data: predictions } = await supabase
                .from('predictions')
                .select('*')
                .eq('match_id', matchId);

            if (predictions && predictions.length > 0) {
                const scored = predictions.map((prediction: Prediction) => {
                    const breakdown = calculatePoints(prediction, updatedMatch as Match);
                    return { prediction, breakdown };
                });

                scored.sort((a, b) => {
                    if (b.breakdown.total !== a.breakdown.total) return b.breakdown.total - a.breakdown.total;
                    return tieBreak(a, b);
                });

                for (let i = 0; i < scored.length; i++) {
                    const { prediction, breakdown } = scored[i];
                    const rank = i + 1;
                    const badges = assignBadges(rank, breakdown);

                    await supabase
                        .from('leaderboard')
                        .upsert({
                            user_id: prediction.user_id,
                            match_id: matchId,
                            points: breakdown.total,
                            rank,
                            correct_predictions: breakdown.correctPredictions,
                            badges,
                        }, { onConflict: 'user_id,match_id' });
                }
                console.log(`[Sync Worker] Leaderboard recalculated for ${scored.length} users.`);
            }
        } catch (recalcError: any) {
            console.error('[Sync Worker] Failed to recalculate leaderboard during sync:', recalcError);
        }

        return {
            success: true,
            data: updatedMatch,
            message: 'Match synced and leaderboard recalculated successfully!'
        };
    } catch (error: any) {
        console.error('[Sync Worker] FotMob Sync error:', error);
        return { success: false, error: error.message };
    }
}

// Background sync controller
export function startLiveBackgroundSync() {
    if (typeof window !== 'undefined') return; // Server-side only

    const globalRef = global as any;
    if (globalRef.backgroundSyncInterval) {
        return; // Already running
    }

    console.log('[Background Sync] Initializing server-side match sync worker...');

    // Run active sync loops in the background every 15 seconds
    globalRef.backgroundSyncInterval = setInterval(async () => {
        try {
            // Find any matches marked for auto sync
            const { data: activeMatches, error } = await supabase
                .from('matches')
                .select('id, auto_sync, fotmob_match_id')
                .eq('auto_sync', true);

            if (error) {
                console.error('[Background Worker] Error checking active matches:', error);
                return;
            }

            if (!activeMatches || activeMatches.length === 0) {
                return; // Nothing to sync
            }

            for (const match of activeMatches) {
                if (match.fotmob_match_id) {
                    await syncMatchStats(match.id, match.fotmob_match_id);
                }
            }
        } catch (err) {
            console.error('[Background Worker] Error in background sync loop:', err);
        }
    }, 15000);

    // Gracefully handle server shutdown
    if (process) {
        process.on('SIGTERM', () => {
            clearInterval(globalRef.backgroundSyncInterval);
            globalRef.backgroundSyncInterval = null;
        });
        process.on('SIGINT', () => {
            clearInterval(globalRef.backgroundSyncInterval);
            globalRef.backgroundSyncInterval = null;
        });
    }
}
