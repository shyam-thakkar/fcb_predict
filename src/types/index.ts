// ============ User Types ============
export interface User {
    id: string;
    full_name: string;
    username: string;
    mobile: string;
    password_hash: string;
    role: 'user' | 'admin';
    created_at: string;
    last_login: string | null;
    ip_address: string | null;
}

// ============ Prediction Types ============
export interface Prediction {
    id: string;
    user_id: string;
    match_id: string;
    winner: 'Argentina' | 'Spain';
    score_home: number;
    score_away: number;
    first_team_to_score: 'Argentina' | 'Spain';
    first_goal_scorer: string;
    man_of_match: string;
    total_goals: string;
    match_ends_in: '90 Minutes' | 'Extra Time' | 'Penalties';
    both_teams_score: 'Yes' | 'No';
    yellow_cards: number;
    red_card: 'Yes' | 'No';
    possession: 'Argentina' | 'Spain';
    corners: number;
    last_goal_scorer: string;
    submitted_at: string;
}

// ============ Match Types ============
export interface GoalEvent {
    minute: number;
    player: string;
    team: 'Argentina' | 'Spain';
    type: 'goal' | 'own_goal' | 'penalty';
}

export interface CardEvent {
    minute: number;
    player: string;
    team: 'Argentina' | 'Spain';
    type: 'yellow' | 'red';
}

export interface Match {
    id: string;
    team_home: string;
    team_away: string;
    kickoff_time: string;
    status: 'upcoming' | 'live' | 'halftime' | 'extra_time' | 'penalties' | 'finished';
    score_home: number;
    score_away: number;
    goal_events: GoalEvent[];
    cards: CardEvent[];
    possession_home: number;
    possession_away: number;
    corners_home: number;
    corners_away: number;
    man_of_match: string | null;
    winner: 'Argentina' | 'Spain' | null;
    final_result: string | null;
    predictions_locked: boolean;
    match_minute: number;
    shots_home: number;
    shots_away: number;
    auto_sync?: boolean;
    fotmob_match_id?: string;
}

// ============ Leaderboard Types ============
export interface LeaderboardEntry {
    id: string;
    user_id: string;
    match_id: string;
    points: number;
    rank: number;
    correct_predictions: number;
    badges: string[];
    username?: string;
    full_name?: string;
}

// ============ Admin Log Types ============
export interface AdminLog {
    id: string;
    admin_id: string;
    action: string;
    details: string;
    created_at: string;
}

// ============ Auth Types ============
export interface LoginCredentials {
    username: string;
    password: string;
}

export interface RegisterData {
    full_name: string;
    username: string;
    mobile: string;
    password: string;
    confirm_password: string;
}

// ============ API Response Types ============
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
