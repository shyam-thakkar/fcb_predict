import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const CARD_DESIGNS = ['messi_white', 'messi_barca', 'messi_goat'];

function generateCardNumber(): string {
    const prefix = 'FCB';
    const year = '2026';
    const random = Math.floor(1000 + Math.random() * 9000).toString();
    const suffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${year}-${random}-${suffix}`;
}

// GET - Fetch the current user's card (or check by user_id query for admin)
export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        }

        const url = new URL(request.url);
        const queryUserId = url.searchParams.get('user_id');

        // Admin can fetch any user's card
        if (queryUserId && decoded.role === 'admin') {
            const { data, error } = await supabase
                .from('screening_cards')
                .select('*, users!screening_cards_user_id_fkey(full_name, username)')
                .eq('user_id', queryUserId)
                .single();

            if (error && error.code !== 'PGRST116') {
                return NextResponse.json({ success: false, error: error.message }, { status: 500 });
            }
            return NextResponse.json({ success: true, data: data || null });
        }

        // Fetch all cards (admin only)
        const fetchAll = url.searchParams.get('all');
        if (fetchAll === 'true' && decoded.role === 'admin') {
            const { data, error } = await supabase
                .from('screening_cards')
                .select('*, users!screening_cards_user_id_fkey(full_name, username, mobile)')
                .order('assigned_at', { ascending: false });

            if (error) {
                return NextResponse.json({ success: false, error: error.message }, { status: 500 });
            }
            return NextResponse.json({ success: true, data: data || [] });
        }

        // Regular user - fetch their own card
        const { data, error } = await supabase
            .from('screening_cards')
            .select('*')
            .eq('user_id', decoded.id)
            .single();

        if (error && error.code !== 'PGRST116') {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: data || null });
    } catch (error) {
        console.error('Cards GET error:', error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}

// POST - Claim a card (user picks or gets randomly assigned)
export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }
        const decoded = verifyToken(token);
        if (!decoded) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        }

        // Check if user already has a card
        const { data: existing } = await supabase
            .from('screening_cards')
            .select('*')
            .eq('user_id', decoded.id)
            .single();

        if (existing) {
            return NextResponse.json({ success: false, error: 'You already have a card assigned!' }, { status: 400 });
        }

        // Randomly assign a card design
        const randomDesign = CARD_DESIGNS[Math.floor(Math.random() * CARD_DESIGNS.length)];
        const cardNumber = generateCardNumber();

        const { data, error } = await supabase
            .from('screening_cards')
            .insert({
                user_id: decoded.id,
                card_design: randomDesign,
                card_number: cardNumber,
                is_collected: false,
            })
            .select()
            .single();

        if (error) {
            // Handle unique constraint violation on card_number
            if (error.code === '23505' && error.message.includes('card_number')) {
                // Retry with a new card number
                const retryNumber = generateCardNumber();
                const { data: retryData, error: retryError } = await supabase
                    .from('screening_cards')
                    .insert({
                        user_id: decoded.id,
                        card_design: randomDesign,
                        card_number: retryNumber,
                        is_collected: false,
                    })
                    .select()
                    .single();
                if (retryError) {
                    return NextResponse.json({ success: false, error: retryError.message }, { status: 500 });
                }
                return NextResponse.json({ success: true, data: retryData });
            }
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Cards POST error:', error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}

// PUT - Admin marks a card as collected / uncollected
export async function PUT(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;
        if (!token) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
        }
        const decoded = verifyToken(token);
        if (!decoded || decoded.role !== 'admin') {
            return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { card_id, is_collected } = body;

        if (!card_id) {
            return NextResponse.json({ success: false, error: 'Card ID required' }, { status: 400 });
        }

        const updateData: Record<string, unknown> = {
            is_collected: is_collected,
            collected_marked_by: decoded.id,
        };

        if (is_collected) {
            updateData.collected_at = new Date().toISOString();
        } else {
            updateData.collected_at = null;
        }

        const { data, error } = await supabase
            .from('screening_cards')
            .update(updateData)
            .eq('id', card_id)
            .select('*, users!screening_cards_user_id_fkey(full_name, username, mobile)')
            .single();

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Cards PUT error:', error);
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
}
