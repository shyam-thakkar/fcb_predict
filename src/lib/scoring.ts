import { Prediction, Match } from '@/types';

export interface ScoreBreakdown {
    matchWinner: number;
    exactScore: number;
    firstTeamToScore: number;
    firstGoalScorer: number;
    manOfMatch: number;
    totalGoals: number;
    matchEndsIn: number;
    bothTeamsScore: number;
    yellowCards: number;
    redCard: number;
    possession: number;
    corners: number;
    lastGoalScorer: number;
    total: number;
    correctPredictions: number;
}

export function calculatePoints(prediction: Prediction, match: Match): ScoreBreakdown {
    const breakdown: ScoreBreakdown = {
        matchWinner: 0,
        exactScore: 0,
        firstTeamToScore: 0,
        firstGoalScorer: 0,
        manOfMatch: 0,
        totalGoals: 0,
        matchEndsIn: 0,
        bothTeamsScore: 0,
        yellowCards: 0,
        redCard: 0,
        possession: 0,
        corners: 0,
        lastGoalScorer: 0,
        total: 0,
        correctPredictions: 0,
    };

    if (match.status !== 'finished') return breakdown;

    // 1. Match Winner (15 points)
    if (match.winner && prediction.winner === match.winner) {
        breakdown.matchWinner = 15;
        breakdown.correctPredictions++;
    }

    // 2. Exact Score (10 points)
    if (prediction.score_home === match.score_home && prediction.score_away === match.score_away) {
        breakdown.exactScore = 10;
        breakdown.correctPredictions++;
    }

    // 3. First Team To Score (10 points)
    const firstGoal = match.goal_events?.length > 0 ? match.goal_events[0] : null;
    if (firstGoal && prediction.first_team_to_score === firstGoal.team) {
        breakdown.firstTeamToScore = 10;
        breakdown.correctPredictions++;
    }

    // 4. First Goal Scorer (10 points)
    if (firstGoal && prediction.first_goal_scorer === firstGoal.player) {
        breakdown.firstGoalScorer = 10;
        breakdown.correctPredictions++;
    }

    // 5. Man of the Match (10 points)
    if (match.man_of_match && prediction.man_of_match === match.man_of_match) {
        breakdown.manOfMatch = 10;
        breakdown.correctPredictions++;
    }

    // 6. Total Goals (5 points)
    const actualTotalGoals = match.score_home + match.score_away;
    const predictedTotal = prediction.total_goals === '7+' ? 7 : parseInt(prediction.total_goals);
    if (prediction.total_goals === '7+' && actualTotalGoals >= 7) {
        breakdown.totalGoals = 5;
        breakdown.correctPredictions++;
    } else if (predictedTotal === actualTotalGoals) {
        breakdown.totalGoals = 5;
        breakdown.correctPredictions++;
    }

    // 7. Match Ends In (10 points)
    const matchEndedIn = match.final_result || '90 Minutes';
    if (prediction.match_ends_in === matchEndedIn) {
        breakdown.matchEndsIn = 10;
        breakdown.correctPredictions++;
    }

    // 8. Both Teams Score (5 points)
    const bothScored = match.score_home > 0 && match.score_away > 0;
    if ((prediction.both_teams_score === 'Yes') === bothScored) {
        breakdown.bothTeamsScore = 5;
        breakdown.correctPredictions++;
    }

    // 9. Yellow Cards (5 points)
    const actualYellows = match.cards?.filter(c => c.type === 'yellow').length || 0;
    if (prediction.yellow_cards === actualYellows) {
        breakdown.yellowCards = 5;
        breakdown.correctPredictions++;
    }

    // 10. Red Card (5 points)
    const hasRedCard = match.cards?.some(c => c.type === 'red') || false;
    if ((prediction.red_card === 'Yes') === hasRedCard) {
        breakdown.redCard = 5;
        breakdown.correctPredictions++;
    }

    // 11. Team With Most Possession (5 points)
    const possessionWinner = match.possession_home > match.possession_away ? 'Argentina' : 'Spain';
    if (prediction.possession === possessionWinner) {
        breakdown.possession = 5;
        breakdown.correctPredictions++;
    }

    // 12. Total Corners (5 points)
    const actualCorners = (match.corners_home || 0) + (match.corners_away || 0);
    if (prediction.corners === actualCorners) {
        breakdown.corners = 5;
        breakdown.correctPredictions++;
    }

    // 13. Last Goal Scorer (10 points)
    const lastGoal = match.goal_events?.length > 0
        ? match.goal_events[match.goal_events.length - 1]
        : null;
    if (lastGoal && prediction.last_goal_scorer === lastGoal.player) {
        breakdown.lastGoalScorer = 10;
        breakdown.correctPredictions++;
    }

    breakdown.total =
        breakdown.matchWinner + breakdown.exactScore + breakdown.firstTeamToScore +
        breakdown.firstGoalScorer + breakdown.manOfMatch + breakdown.totalGoals +
        breakdown.matchEndsIn + breakdown.bothTeamsScore + breakdown.yellowCards +
        breakdown.redCard + breakdown.possession + breakdown.corners + breakdown.lastGoalScorer;

    return breakdown;
}

// Tie-break comparison: returns negative if a should rank higher, positive if b should
export function tieBreak(
    a: { prediction: Prediction; breakdown: ScoreBreakdown },
    b: { prediction: Prediction; breakdown: ScoreBreakdown }
): number {
    // 1. Exact Score Prediction
    if (a.breakdown.exactScore !== b.breakdown.exactScore) return b.breakdown.exactScore - a.breakdown.exactScore;
    // 2. Match Winner Prediction
    if (a.breakdown.matchWinner !== b.breakdown.matchWinner) return b.breakdown.matchWinner - a.breakdown.matchWinner;
    // 3. First Goal Scorer Prediction
    if (a.breakdown.firstGoalScorer !== b.breakdown.firstGoalScorer) return b.breakdown.firstGoalScorer - a.breakdown.firstGoalScorer;
    // 4. Man of the Match Prediction
    if (a.breakdown.manOfMatch !== b.breakdown.manOfMatch) return b.breakdown.manOfMatch - a.breakdown.manOfMatch;
    // 5. Earlier Submission Time
    return new Date(a.prediction.submitted_at).getTime() - new Date(b.prediction.submitted_at).getTime();
}

export function assignBadges(rank: number, breakdown: ScoreBreakdown): string[] {
    const badges: string[] = [];
    if (rank === 1) badges.push('🥇 Top Predictor');
    if (rank === 2) badges.push('🥈 Runner-Up');
    if (rank === 3) badges.push('🥉 Third Place');
    if (breakdown.total === 105) badges.push('🏆 World Champion Predictor');
    if (breakdown.total >= 90) badges.push('🎯 Perfect Score');
    if (breakdown.firstGoalScorer > 0) badges.push('⚽ Goal Prophet');
    if (breakdown.correctPredictions >= 10) badges.push('🔥 Hot Streak');
    return badges;
}
