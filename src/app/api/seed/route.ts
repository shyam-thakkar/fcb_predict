import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';

export async function GET() {
    try {
        // 1. Verify match
        const { data: matches, error: matchError } = await supabase
            .from('matches')
            .select('id');

        if (matchError) {
            return NextResponse.json({ success: false, error: 'Match select error: ' + matchError.message }, { status: 500 });
        }

        let matchCount = matches?.length || 0;
        let matchId = '';

        if (matchCount === 0) {
            const { data: inserted, error: insertError } = await supabase
                .from('matches')
                .insert({
                    team_home: 'Argentina',
                    team_away: 'Spain',
                    kickoff_time: '2026-07-19T20:00:00Z',
                    status: 'upcoming',
                    predictions_locked: false,
                })
                .select('id')
                .single();

            if (insertError) {
                return NextResponse.json({ success: false, error: 'Match insert error: ' + insertError.message }, { status: 500 });
            }
            matchId = inserted.id;
        } else {
            matchId = matches[0].id;
        }

        // 2. Ensure admin exists
        const adminUsername = 'admin';
        const { data: existingAdmin, error: userError } = await supabase
            .from('users')
            .select('id, role')
            .eq('username', adminUsername)
            .maybeSingle();

        if (userError) {
            return NextResponse.json({ success: false, error: 'User query error: ' + userError.message }, { status: 500 });
        }

        if (!existingAdmin) {
            const hp = await hashPassword('AdminPassword123!');
            const { data: newAdmin, error: createError } = await supabase
                .from('users')
                .insert({
                    full_name: 'System Admin',
                    username: adminUsername,
                    mobile: '9999999999',
                    password_hash: hp,
                    role: 'admin',
                    ip_address: '127.0.0.1',
                })
                .select('id')
                .single();

            if (createError) {
                return NextResponse.json({ success: false, error: 'Admin create error: ' + createError.message }, { status: 500 });
            }

            // Also initialize leaderboard entry for admin
            await supabase
                .from('leaderboard')
                .insert({
                    user_id: newAdmin.id,
                    match_id: matchId,
                    points: 0,
                    rank: 0,
                    correct_predictions: 0,
                    badges: [],
                });
        } else if (existingAdmin.role !== 'admin') {
            await supabase
                .from('users')
                .update({ role: 'admin' })
                .eq('username', adminUsername);
        }

        return NextResponse.json({
            success: true,
            message: 'Seeding completed. Argentina vs Spain match is present and admin user (admin / AdminPassword123!) is registered.',
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
