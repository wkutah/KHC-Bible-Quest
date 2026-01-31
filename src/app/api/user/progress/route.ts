import { NextResponse } from 'next/server';
import { getUsers, saveUsers } from '@/lib/auth';
import { PlayerStats } from '@/types/game';

export async function POST(request: Request) {
    try {
        const { username, stats } = await request.json();

        if (!username || !stats) {
            return NextResponse.json({ error: 'Missing data' }, { status: 400 });
        }

        const users = await getUsers();
        const userIndex = users.findIndex(u => u.username === username);

        if (userIndex === -1) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Merge stats (keep highest score)
        const currentStats = users[userIndex].stats;
        const newStats = stats as PlayerStats;

        users[userIndex].stats = {
            score: newStats.score,
            wordsSolved: newStats.wordsSolved,
            hintsUsed: newStats.hintsUsed,
            highScore: Math.max(currentStats.highScore, newStats.score)
        };

        await saveUsers(users);

        return NextResponse.json({ success: true, stats: users[userIndex].stats });

    } catch (error) {
        console.error('Progress update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
