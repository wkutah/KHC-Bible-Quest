'use client';

import { motion } from 'framer-motion';
import { useGameStore } from '../../store/useGameStore';
import { getMaskedWord } from '../../lib/gameUtils';

export function PuzzleBoard() {
    const { currentWord, guessedLetters, currentSegment } = useGameStore();

    if (!currentWord) return <div className="text-white">Loading Word...</div>;

    const wordChars = currentWord.word.split('');
    // We want to handle multiple words/spaces usually, but brief implies single words or short phrases.
    // We'll treat space as a line break or separator if phrases are used. Briefly handling single words first.

    return (
        <div className="flex flex-col items-center gap-2 md:gap-6 my-1 md:my-4">
            {/* Category Header */}
            <div className="bg-[#8B4513] px-3 py-1 md:px-6 md:py-2 rounded-full shadow-lg border-2 border-[#D2691E] flex gap-2 items-center">
                <h2 className="text-xs md:text-xl font-bold text-[#FFD700] tracking-wide uppercase drop-shadow-md font-serif">
                    {currentWord.category}
                </h2>
                <div className="h-4 w-0.5 bg-[#D2691E]/50 mx-1"></div>
                <span className="text-[10px] md:text-sm font-bold text-[#DEB887] uppercase tracking-wider opacity-90">
                    {currentWord.difficulty}
                </span>
            </div>

            {/* Word Grid */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 max-w-4xl px-2">
                {wordChars.map((char, index) => {
                    const isGuessed = guessedLetters.has(char.toUpperCase());
                    const isSpace = char === ' ';

                    if (isSpace) return <div key={index} className="w-8 md:w-16" />; // Spacer

                    return (
                        <motion.div
                            key={`${index}-${char}`}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`
                                w-8 h-10 md:w-16 md:h-20 
                                flex items-center justify-center 
                                text-lg md:text-4xl font-black 
                                rounded md:rounded-lg shadow-sm md:shadow-md transition-colors border-b-2 md:border-b-4
                                ${isGuessed
                                    ? 'bg-[#FDF5E6] text-[#5D4037] border-[#8B4513] shadow-inner'
                                    : 'bg-[#3E2723] border-[#2E1D1A] shadow-inner'}
                            `}
                        >
                            <motion.span
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: isGuessed ? 1 : 0, scale: isGuessed ? 1 : 0.5 }}
                            >
                                {char.toUpperCase()}
                            </motion.span>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
