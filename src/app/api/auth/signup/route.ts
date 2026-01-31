import { NextResponse } from 'next/server';
import { findUserByUsername, createUser } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        const existingUser = await findUserByUsername(username);
        if (existingUser) {
            return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
        }

        const newUser = await createUser(username, password);

        // Return user without sensitive data
        const { passwordHash, ...safeUser } = newUser;

        return NextResponse.json({
            message: 'Account created successfully',
            user: safeUser
        }, { status: 201 });

    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
