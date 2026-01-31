import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { Word } from '@/types/game';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!Array.isArray(body)) {
            return NextResponse.json({ error: 'Body must be an array of words' }, { status: 400 });
        }

        const validWords = body
            .filter(item => item.word && item.hints && item.category)
            .map(item => ({
                word: item.word.toUpperCase().trim(),
                difficulty: item.difficulty || 'Intermediate',
                category: item.category,
                verse: item.verse || '',
                explanation: item.explanation || '',
                hints: Array.isArray(item.hints) ? item.hints : [item.hints]
            }));

        if (validWords.length === 0) {
            return NextResponse.json({ message: 'No new valid words to add', count: 0 });
        }

        // Supabase handles batch inserts by passing an array
        // UPSERT is better if we want to avoid duplicates based on "word"
        // But for simplicity in prototype, we'll just insert.
        // If "word" column was UNIQUE, we could use { onConflict: 'word' }
        const { data, error } = await supabase
            .from('words')
            .insert(validWords)
            .select();

        if (error) throw error;

        return NextResponse.json({
            message: `Successfully added ${validWords.length} words to cloud`,
            count: validWords.length
        });

    } catch (error) {
        console.error('Batch upload error:', error);
        return NextResponse.json({ error: 'Failed to process batch upload' }, { status: 500 });
    }
}
