export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type DifficultySetting = Difficulty | 'Random';
export type GameMode = 'LOCAL' | 'ONLINE';

export type Category =
    | 'Core Christian Words'
    | 'Bible Heroes'
    | 'Books of the Bible'
    | 'Fruits of the Spirit'
    | 'Miracles of Jesus'
    | 'Bible Reading'
    | 'Book Reading';

export interface Word {
    id: string;
    word: string;
    difficulty: Difficulty;
    category: Category;
    hints: string[];
    verse: string; // e.g., "Hebrews 11:1"
    explanation: string;
}

export type WheelSegmentType =
    | 'POINTS'
    | 'BANKRUPT'
    | 'LOSE_TURN'
    | 'FREE_HINT'
    | 'SPIN_AGAIN'
    | 'SOLVE';

export interface WheelSegment {
    id: string;
    type: WheelSegmentType;
    value?: number; // For POINTS type
    color: string;
    label: string;
}

export type GameStatus = 'IDLE' | 'PLAYING' | 'RONUD_WON' | 'GAME_WON' | 'GAME_OVER';
export type TurnPhase = 'SPIN' | 'RESULT' | 'GUESS' | 'SOLVE';

export interface PlayerStats {
    score: number;
    highScore: number;
    wordsSolved: number;
    hintsUsed: number;
}
