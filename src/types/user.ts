import { PlayerStats } from './game';

export interface User {
    id: string;
    username: string;
    passwordHash: string;
    stats: PlayerStats;
    createdAt: string;
}
