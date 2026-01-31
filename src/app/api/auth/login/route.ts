import { NextResponse } from 'next/server';
import { findUserByUsername, validatePassword } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }

        const user = await findUserByUsername(username);
        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isValid = await validatePassword(user, password);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // In a real app, we'd set a session/cookie here.
        // For this simple version, we'll return the user object to store in Client state.
        const { passwordHash, ...safeUser } = user;

        return NextResponse.json({
            message: 'Login successful',
            user: safeUser
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
