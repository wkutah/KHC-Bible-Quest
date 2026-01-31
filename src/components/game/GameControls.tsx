'use client';

import { useGameStore } from '../../store/useGameStore';
import { motion } from 'framer-motion';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export function GameControls() {
    const {
        turnPhase,
        guessLetter,
        guessedLetters,
        stats,
        solveWord,
        startGame,
        status,
        revealHint,
        currentWord
    } = useGameStore();

    const isGuessing = turnPhase === 'GUESS';

    if (status === 'IDLE') {
        return (
            <div className="flex flex-col items-center mt-8">
                <button
                    onClick={startGame}
                    className="bg-green-500 hover:bg-green-600 text-white text-2xl font-bold py-4 px-12 rounded-full shadow-xl transition-transform hover:scale-105"
                >
                    START GAME
                </button>
            </div>
        )
    }

    return (
        <div className="w-full max-w-4xl mx-auto mt-0 flex flex-col gap-0.5 md:gap-2">
            {/* Stats Bar Container - Flex Row for Stats + Hints on same line ? No, might be too crowded. Keeping stacked but super tight. */}

            {/* Row 1: Stats & Hints Combined to save vertical space if possible? Or just tight stacking. */}
            <div className="flex gap-1 w-full h-[40px]">
                {/* Stats */}
                <div className="flex-1 flex justify-between items-center texture-wood px-2 py-1 rounded shadow-sm">
                    <div className="flex flex-col">
                        <span className="text-[8px] md:text-xs text-[#DEB887] font-bold uppercase">Score</span>
                        <span className="text-sm md:text-3xl font-black text-[#FFD700] leading-none">{stats.score}</span>
                    </div>
                    <div className="bg-[#5D4037]/50 px-2 rounded border border-[#8B4513]">
                        <span className="text-[10px] md:text-base font-bold text-[#FDF5E6] uppercase">
                            {status === 'PLAYING' ? (turnPhase === 'SPIN' ? 'Spin!' : 'Guess!') : status}
                        </span>
                    </div>
                </div>

                {/* Hint Button (Move hint button to stats row, or keep hint display separate?) 
                   Let's try putting the hint button IN the stats row or next to it?
                   Actually let's keep the Hint Display but make it TINY.
                */}
            </div>

            {/* Hints Display - Ultra Compact */}
            <div className="texture-parchment px-2 py-1 rounded relative flex justify-between items-center min-h-[36px] mx-0">
                <div className="flex-1 pr-1 overflow-hidden">
                    {currentWord && stats.hintsUsed > 0 ? (
                        <p className="text-[#5D4037] font-serif text-[10px] md:text-base leading-tight truncate">
                            <span className="font-bold text-[#8B4513]">{stats.hintsUsed}.</span> {currentWord.hints[stats.hintsUsed - 1]}
                        </p>
                    ) : (
                        <p className="text-[#8B4513]/60 italic font-serif text-[10px] md:text-sm">Hints available...</p>
                    )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    <span className="text-[9px] font-bold text-[#8B4513]">{stats.hintsUsed}/{currentWord?.hints.length || 3}</span>
                    <button
                        onClick={revealHint}
                        disabled={!currentWord || stats.hintsUsed >= currentWord.hints.length || stats.score < 50}
                        className="px-2 py-0.5 bg-[#8B4513] text-[#FFD700] text-[9px] md:text-xs font-bold rounded hover:bg-[#5D4037] transition disabled:opacity-50 border border-[#FFF8DC]/20 leading-none h-6"
                    >
                        Hint (-50)
                    </button>
                </div>
            </div>

            {/* Keyboard */}
            <div className="grid grid-cols-7 gap-0.5 p-0.5 bg-[#8B4513]/20 rounded-lg md:rounded-2xl border-b-2 md:border-b-4 border-[#8B4513]/40">
                {ALPHABET.map((letter) => {
                    const isGuessed = guessedLetters.has(letter);
                    return (
                        <button
                            key={letter}
                            onClick={() => guessLetter(letter)}
                            disabled={!isGuessing || isGuessed}
                            className={`
                                h-8 md:h-12 rounded md:rounded-xl font-black text-xs md:text-xl transition-all relative overflow-hidden
                                ${isGuessed
                                    ? 'bg-[#5D4037] text-[#8B4513] border border-[#3E2723] opacity-40 cursor-not-allowed'
                                    : (isGuessing
                                        ? 'texture-gold hover:brightness-110 active:scale-95'
                                        : 'bg-[#DEB887] text-[#8B4513] border-b-2 border-[#8B4513] cursor-not-allowed opacity-70')
                                }
                            `}
                        >
                            {letter}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
