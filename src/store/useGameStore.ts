import { create } from 'zustand';
import { Word, Difficulty, DifficultySetting, Category, GameStatus, TurnPhase, WheelSegment, PlayerStats } from '../types/game';
import { User } from '../types/user';
import { supabase } from '../lib/supabase';

interface Player {
    id: string;
    name: string;
    score: number;
}

interface GameState {
    currentWord: Word | null;
    guessedLetters: Set<string>;
    difficulty: DifficultySetting;
    status: GameStatus;
    turnPhase: TurnPhase;
    stats: PlayerStats; // Keep for backward compat / single player persistence
    currentSegment: WheelSegment | null;

    // Multiplayer State
    mode: 'LOCAL' | 'ONLINE';
    roomId: string | null;
    players: Player[];
    currentPlayerIndex: number;
    hostId: string | null; // To check if current user is host
    categoryFilter: Category | 'All';

    // Actions
    setDifficulty: (diff: DifficultySetting) => void;
    setCategory: (cat: Category | 'All') => void;
    setPlayers: (names: string[]) => void;
    nextTurn: () => void;
    startGame: () => Promise<void>;
    spinWheel: () => void;
    setWheelOutcome: (segment: WheelSegment) => void;
    guessLetter: (letter: string) => void;
    revealHint: () => void;
    solveWord: (guess: string) => void;
    resetRound: () => void;

    // Online Actions
    createRoom: (hostName: string) => Promise<string | null>;
    joinRoom: (roomId: string, playerName: string) => Promise<boolean>;
    leaveRoom: () => void;
    _subscribeToRoom: (roomId: string) => void;

    user: User | null;
    login: (user: User) => void;
    logout: () => void;
    syncProgress: () => Promise<void>;
}

// Helper to push state to Supabase
const pushState = async (roomId: string, state: Partial<GameState>) => {
    // Construct the payload to match DB schema
    const payload = {
        players: state.players,
        current_turn_index: state.currentPlayerIndex,
        status: state.status,
        game_state: {
            currentWord: state.currentWord,
            guessedLetters: Array.from(state.guessedLetters || []),
            turnPhase: state.turnPhase,
            currentSegment: state.currentSegment,
            difficulty: state.difficulty,
            categoryFilter: state.categoryFilter
        }
    };

    await supabase.from('rooms').update(payload).eq('id', roomId);
};

export const useGameStore = create<GameState>((set, get) => ({
    currentWord: null,
    guessedLetters: new Set(),
    difficulty: 'Random',
    status: 'IDLE',
    turnPhase: 'SPIN',
    stats: {
        score: 0,
        highScore: 0,
        wordsSolved: 0,
        hintsUsed: 0,
    },
    currentSegment: null,

    mode: 'LOCAL',
    roomId: null,
    players: [],
    currentPlayerIndex: 0,
    hostId: null,
    categoryFilter: 'All',

    setDifficulty: (diff) => {
        set({ difficulty: diff });
        const { mode, roomId } = get();
        if (mode === 'ONLINE' && roomId) {
            pushState(roomId, get());
        }
    },

    setCategory: (cat) => {
        set({ categoryFilter: cat });
        const { mode, roomId } = get();
        if (mode === 'ONLINE' && roomId) {
            pushState(roomId, get());
        }
    },

    setPlayers: (names) => {
        const newPlayers = names.map(name => ({
            id: crypto.randomUUID(),
            name,
            score: 0
        }));
        set({ players: newPlayers, currentPlayerIndex: 0, status: 'IDLE', mode: 'LOCAL' });
        get().startGame();
    },

    createRoom: async (hostName) => {
        const hostId = crypto.randomUUID();
        const initialPlayer = { id: hostId, name: hostName, score: 0 };

        const { data, error } = await supabase.from('rooms').insert({
            host_id: hostId,
            players: [initialPlayer],
            status: 'WAITING'
        }).select().single();

        if (error || !data) {
            console.error("Failed to create room", error);
            return null;
        }

        const roomId = data.id;

        set({
            mode: 'ONLINE',
            roomId,
            hostId,
            players: [initialPlayer],
            status: 'IDLE',
            currentPlayerIndex: 0
        });

        get()._subscribeToRoom(roomId);

        return roomId;
    },

    joinRoom: async (roomId, playerName) => {
        const { data: room, error } = await supabase.from('rooms').select('*').eq('id', roomId).single();
        if (error || !room) return false;

        const myId = crypto.randomUUID();
        const newPlayer = { id: myId, name: playerName, score: 0 };
        const updatedPlayers = [...(room.players as any[]), newPlayer];

        const { error: updateError } = await supabase
            .from('rooms')
            .update({ players: updatedPlayers })
            .eq('id', roomId);

        if (updateError) {
            console.error("Failed to join", updateError);
            return false;
        }

        set({
            mode: 'ONLINE',
            roomId,
            hostId: null,
            players: updatedPlayers,
            status: (room.status === 'WAITING' ? 'IDLE' : room.status) as GameStatus,
        });

        get()._subscribeToRoom(roomId);
        return true;
    },

    leaveRoom: () => {
        const { roomId } = get();
        if (roomId) {
            supabase.channel(`room:${roomId}`).unsubscribe();
        }
        set({ mode: 'LOCAL', roomId: null, players: [], status: 'IDLE' });
    },

    _subscribeToRoom: (roomId: string) => {
        supabase.channel(`room:${roomId}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
                (payload) => {
                    const room = payload.new;
                    const gameState = room.game_state || {};

                    set({
                        players: room.players || [],
                        currentPlayerIndex: room.current_turn_index || 0,
                        status: (room.status === 'WAITING' ? 'IDLE' : room.status) as GameStatus,

                        difficulty: gameState.difficulty || 'Random',
                        turnPhase: gameState.turnPhase || 'SPIN',

                        // Only update transient game state if playing, to avoid overwriting distinct local UI states potentially?
                        // Actually we want full sync for turn based logic
                        currentWord: gameState.currentWord || get().currentWord,
                        guessedLetters: new Set(gameState.guessedLetters || []),
                        currentSegment: gameState.currentSegment || null,
                        categoryFilter: gameState.categoryFilter || 'All'
                    });
                }
            )
            .subscribe();
    },

    nextTurn: () => {
        const { players, currentPlayerIndex, mode, roomId } = get();
        if (players.length === 0) return;

        const nextIndex = (currentPlayerIndex + 1) % players.length;
        set({ currentPlayerIndex: nextIndex, turnPhase: 'SPIN' });

        if (mode === 'ONLINE' && roomId) {
            pushState(roomId, get());
        }
    },

    startGame: async () => {
        const { difficulty, stats, players, mode, roomId } = get();

        // Local Fallback
        if (players.length === 0 && mode === 'LOCAL') {
            const defaultName = get().user?.username || 'Player 1';
            set({
                players: [{ id: 'p1', name: defaultName, score: 0 }],
                currentPlayerIndex: 0
            });
        }

        try {
            const response = await fetch('/api/words');
            const words: Word[] = await response.json();

            if (!words || words.length === 0) {
                console.error("No words found");
                return;
            }

            let pool = words;
            const { categoryFilter } = get();

            // Filter by Category first if not 'All'
            if (categoryFilter !== 'All') {
                pool = pool.filter(w => w.category === categoryFilter);
            }

            if (difficulty !== 'Random') {
                const filtered = pool.filter(w => w.difficulty === difficulty);
                if (filtered.length > 0) {
                    pool = filtered;
                }
            }

            const randomWord = pool[Math.floor(Math.random() * pool.length)];

            const newState = {
                currentWord: randomWord,
                guessedLetters: new Set<string>(),
                status: 'PLAYING' as GameStatus,
                turnPhase: 'SPIN' as TurnPhase,
                currentSegment: null,
                stats: { ...stats, hintsUsed: 0 }
            };

            set(newState);

            if (mode === 'ONLINE' && roomId) {
                pushState(roomId, { ...get(), ...newState });
            }

        } catch (e) {
            console.error("Failed to start game", e);
        }
    },

    spinWheel: () => {
        set({ turnPhase: 'RESULT' });
        // Typically we wait for result to sync, but setting phase effectively locks out others?
        const { mode, roomId } = get();
        if (mode === 'ONLINE' && roomId) {
            pushState(roomId, get());
        }
    },

    setWheelOutcome: (segment) => {
        const { stats, currentWord, players, currentPlayerIndex, mode, roomId } = get();
        if (players.length === 0) return;

        let newPhase: TurnPhase = 'GUESS';
        const currentPlayer = { ...players[currentPlayerIndex] };
        let newHintsUsed = stats.hintsUsed;
        let shouldChangeTurn = false;

        if (segment.type === 'BANKRUPT') {
            currentPlayer.score = 0;
            shouldChangeTurn = true;
        } else if (segment.type === 'LOSE_TURN') {
            shouldChangeTurn = true;
        } else if (segment.type === 'FREE_HINT') {
            if (currentWord && newHintsUsed < currentWord.hints.length) {
                newHintsUsed += 1;
            }
        }

        const updatedPlayers = [...players];
        updatedPlayers[currentPlayerIndex] = currentPlayer;

        const newState = {
            currentSegment: segment,
            turnPhase: shouldChangeTurn ? 'SPIN' : newPhase,
            players: updatedPlayers,
            stats: { ...stats, score: currentPlayer.score, hintsUsed: newHintsUsed }
        } as Partial<GameState>;

        set(newState);

        if (shouldChangeTurn) {
            get().nextTurn();
        } else {
            if (mode === 'ONLINE' && roomId) {
                pushState(roomId, { ...get(), ...newState });
            }
        }
    },

    guessLetter: (letter: string) => {
        const { currentWord, guessedLetters, stats, currentSegment, players, currentPlayerIndex, mode, roomId } = get();
        if (!currentWord || players.length === 0) return;

        const upperChar = letter.toUpperCase();
        if (guessedLetters.has(upperChar)) return;

        const newGuessed = new Set(guessedLetters);
        newGuessed.add(upperChar);

        const isCorrect = currentWord.word.toUpperCase().includes(upperChar);

        const currentPlayer = { ...players[currentPlayerIndex] };
        let shouldChangeTurn = false;

        if (isCorrect) {
            const segmentValue = currentSegment?.value || 50;
            const count = currentWord.word.toUpperCase().split(upperChar).length - 1;
            currentPlayer.score += (segmentValue * count);
        } else {
            shouldChangeTurn = true;
        }

        const updatedPlayers = [...players];
        updatedPlayers[currentPlayerIndex] = currentPlayer;

        const allGuessed = currentWord.word.toUpperCase().split('').every(char => newGuessed.has(char));

        const newState = {
            guessedLetters: newGuessed,
            players: updatedPlayers,
            stats: { ...stats, score: currentPlayer.score },
            turnPhase: (allGuessed ? 'SPIN' : (isCorrect ? 'SPIN' : 'SPIN')) as TurnPhase,
            status: (allGuessed ? 'RONUD_WON' : 'PLAYING') as GameStatus
        };

        set(newState);

        if (shouldChangeTurn && !allGuessed) {
            get().nextTurn();
        } else {
            if (mode === 'ONLINE' && roomId) {
                pushState(roomId, { ...get(), ...newState });
            }
        }
    },

    revealHint: () => {
        const { currentWord, stats, players, currentPlayerIndex, mode, roomId } = get();
        if (!currentWord || players.length === 0) return;

        const currentPlayer = { ...players[currentPlayerIndex] };

        const COST = 50;
        if (currentPlayer.score < COST) return;

        const nextHintIndex = stats.hintsUsed;
        if (nextHintIndex >= currentWord.hints.length) return;

        currentPlayer.score -= COST;
        const updatedPlayers = [...players];
        updatedPlayers[currentPlayerIndex] = currentPlayer;

        const newState = {
            players: updatedPlayers,
            stats: { ...stats, score: currentPlayer.score, hintsUsed: stats.hintsUsed + 1 }
        };

        set(newState);

        if (mode === 'ONLINE' && roomId) {
            pushState(roomId, { ...get(), ...newState });
        }
    },

    solveWord: (guess) => {
        const { currentWord, stats, players, currentPlayerIndex, mode, roomId } = get();
        if (!currentWord || players.length === 0) return;

        const currentPlayer = { ...players[currentPlayerIndex] };

        if (guess.toUpperCase() === currentWord.word.toUpperCase()) {
            currentPlayer.score += 300;
            const updatedPlayers = [...players];
            updatedPlayers[currentPlayerIndex] = currentPlayer;

            const newState = {
                status: 'RONUD_WON' as GameStatus,
                players: updatedPlayers,
                stats: { ...stats, score: currentPlayer.score }
            };
            set(newState);
            if (mode === 'ONLINE' && roomId) pushState(roomId, { ...get(), ...newState });

        } else {
            currentPlayer.score = Math.max(0, currentPlayer.score - 50);
            const updatedPlayers = [...players];
            updatedPlayers[currentPlayerIndex] = currentPlayer;

            set({
                players: updatedPlayers,
                stats: { ...stats, score: currentPlayer.score }
            });
            get().nextTurn();
        }
    },

    resetRound: () => {
        const { user } = get();
        if (user) {
            get().syncProgress();
        }
        get().startGame();
    },

    user: null,

    login: (user) => {
        set({
            user,
            stats: { ...user.stats, score: user.stats.score }
        });
    },

    logout: () => {
        set({
            user: null,
            stats: { score: 0, highScore: 0, wordsSolved: 0, hintsUsed: 0 }
        });
    },

    syncProgress: async () => {
        const { user, stats } = get();
        if (!user) return;
        try {
            await fetch('/api/user/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user.username, stats: stats })
            });
        } catch (e) { console.error("Sync failed", e); }
    }
}));
