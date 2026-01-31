import { promises as fs } from 'fs';
import path from 'path';
import { User } from '@/types/user';
import bcrypt from 'bcryptjs';

const usersFilePath = path.join(process.cwd(), 'src/data/users.json');

export async function getUsers(): Promise<User[]> {
    try {
        const data = await fs.readFile(usersFilePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

export async function saveUsers(users: User[]) {
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 4), 'utf8');
}

export async function findUserByUsername(username: string): Promise<User | undefined> {
    const users = await getUsers();
    return users.find(u => u.username.toLowerCase() === username.toLowerCase());
}

export async function createUser(username: string, password: string): Promise<User> {
    const users = await getUsers();
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser: User = {
        id: crypto.randomUUID(),
        username,
        passwordHash,
        stats: {
            score: 0,
            wordsSolved: 0,
            hintsUsed: 0,
            highScore: 0
        },
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    await saveUsers(users);

    return newUser;
}

export async function validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
}
