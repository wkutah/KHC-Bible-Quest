import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Word } from '@/types/game';

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('words')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map DB types to our Word interface if necessary (UUID vs string ID is fine)
        return NextResponse.json(data);
    } catch (error) {
        console.error('Fetch words error:', error);
        return NextResponse.json({ error: 'Failed to fetch words' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Basic validation
        if (!body.word || !body.hints || !body.category) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('words')
            .insert({
                word: body.word.toUpperCase().trim(),
                difficulty: body.difficulty || 'Intermediate',
                category: body.category,
                hints: Array.isArray(body.hints) ? body.hints : [body.hints],
                verse: body.verse || '',
                explanation: body.explanation || ''
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error('Save word error:', error);
        return NextResponse.json({ error: 'Failed to save word' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        const body = await request.json();
        if (!body.id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('words')
            .update({
                word: body.word?.toUpperCase().trim(),
                difficulty: body.difficulty,
                category: body.category,
                hints: body.hints,
                verse: body.verse,
                explanation: body.explanation
            })
            .eq('id', body.id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error('Update word error:', error);
        return NextResponse.json({ error: 'Failed to update word' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
        }

        const { error } = await supabase
            .from('words')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete word error:', error);
        return NextResponse.json({ error: 'Failed to delete word' }, { status: 500 });
    }
}
