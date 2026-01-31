'use client';

import { useState, useEffect } from 'react';
import { Wheel } from './Wheel';
import { PuzzleBoard } from './PuzzleBoard';
import { GameControls } from './GameControls';
import { useGameStore } from '../../store/useGameStore';
import { HelpCircle, Trophy } from 'lucide-react';
import { HowToPlayModal } from './HowToPlayModal';
import { PlayerSetup } from './PlayerSetup';

export function GameLayout() {
    const { status, resetRound, currentWord, players, currentPlayerIndex } = useGameStore();
    const [showHelp, setShowHelp] = useState(false);

    // Initial check to avoid flash, though store defaults might handle it
    const activePlayer = players[currentPlayerIndex];

    if (!players || players.length === 0) {
        return <PlayerSetup />;
    }

    return (
        <div className="min-h-screen h-screen flex flex-col items-center py-1 md:py-4 px-1 font-sans overflow-hidden bg-sky-50">
            {/* Compact Header */}
            <header className="mb-1 md:mb-4 relative z-10 shrink-0 w-full max-w-6xl flex justify-center items-center px-2">
                <div className="bg-[#8B4513] border-2 md:border-4 border-[#5D4037] rounded-lg md:rounded-xl p-0.5 shadow-lg relative flex items-center pr-10 md:pr-16 scale-90 md:scale-100 origin-top">
                    <div className="bg-[#5D4037] rounded md:rounded-lg border md:border-2 border-[#D2691E] px-4 md:px-12 py-0.5 md:py-1">
                        <h1 className="text-base md:text-3xl font-black text-[#FFD700] drop-shadow-md tracking-wide text-stroke text-center font-[family-name:var(--font-outfit)] uppercase whitespace-nowrap">
                            KHC Bible Quest
                        </h1>
                    </div>

                    {/* Help Button */}
                    <button
                        onClick={() => setShowHelp(true)}
                        className="absolute -right-3 -top-2 md:-right-8 md:-top-4 bg-[#FFD700] hover:bg-[#FDB931] text-[#8B4513] px-2 py-0.5 md:px-3 md:py-1 rounded-full border-2 border-[#FFF8DC] shadow-lg transition transform hover:scale-105 active:scale-95 flex items-center gap-1 z-20"
                        title="How to Play"
                    >
                        <HelpCircle size={12} strokeWidth={3} className="w-3 h-3 md:w-4 md:h-4" />
                        <span className="font-bold text-[9px] md:text-xs font-[family-name:var(--font-outfit)] uppercase whitespace-nowrap leading-none">Help</span>
                    </button>
                </div>
            </header>

            <HowToPlayModal isOpen={showHelp} onClose={() => setShowHelp(false)} />

            {/* Turn Indicator & Leaderboard */}
            <div className="w-full max-w-6xl flex justify-between items-start mb-1 px-1 gap-2 relative z-10 scale-90 origin-top">
                {/* Active Player Badge */}
                <div className="bg-[#2E8B57] text-white px-3 py-1 md:px-4 md:py-2 rounded-lg md:rounded-xl border-2 border-[#006400] shadow-md animate-bounce-in">
                    <p className="text-[10px] md:text-xs uppercase font-bold text-[#98FB98]">Current Turn</p>
                    <p className="text-sm md:text-xl font-black text-stroke text-white truncate max-w-[120px] md:max-w-[150px]">{activePlayer?.name}</p>
                </div>

                {/* Mini Leaderboard */}
                <div className="flex gap-1 overflow-x-auto scrollbar-hide py-0.5">
                    {players.map((p, i) => (
                        <div key={p.id} className={`flex flex-col items-center px-2 py-0.5 rounded border-2 min-w-[60px] ${i === currentPlayerIndex ? 'bg-[#FFD700] border-[#B8860B] shadow-lg scale-105' : 'bg-[#FDF5E6] border-[#DEB887] opacity-80'}`}>
                            <span className="text-[9px] uppercase font-bold text-[#8B4513] truncate max-w-[50px]">{p.name}</span>
                            <span className="text-xs font-black text-[#5D4037]">{p.score}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content Area - Flex on Mobile, Grid on Desktop */}
            <div className="w-full max-w-6xl flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-0.5 md:gap-4 items-center lg:items-start min-h-0">

                {/* Left/Top: Wheel (Fits in 5 cols on desktop) */}
                <div className="lg:col-span-5 flex justify-center items-center h-[180px] md:h-full w-full pointer-events-none lg:pointer-events-auto shrink-0 -mt-2 lg:mt-0">
                    {/* Scale wheel down significantly on mobile */}
                    <div className="transform scale-[0.45] sm:scale-75 md:scale-90 lg:scale-100 origin-center pointer-events-auto">
                        <Wheel />
                    </div>
                </div>

                {/* Right/Bottom: Board & Controls (Fits in 7 cols on desktop) */}
                <div className="lg:col-span-7 flex flex-col w-full h-full lg:h-auto gap-1 lg:gap-4 overflow-y-auto lg:overflow-visible px-1 scrollbar-hide justify-start lg:justify-center">

                    {/* Puzzle Board - Compact Container */}
                    <div className="bg-black/40 p-1 md:p-6 rounded-lg md:rounded-3xl border-b-2 md:border-b-4 border-black/20 backdrop-blur-sm shrink-0 mb-1">
                        <PuzzleBoard />
                    </div>

                    {/* Controls - Compact */}
                    <div className="w-full shrink-0 pb-safe">
                        {/* Pass active player prop if needed, but store handles it */}
                        <GameControls />
                    </div>
                </div>

            </div>

            {/* Win Modal Overlay */}
            {status === 'RONUD_WON' && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
                    <div className="bg-[#FDF5E6] border-8 border-[#8B4513] rounded-3xl p-6 md:p-8 max-w-lg w-full text-center shadow-2xl animate-bounce-in relative">
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-[#FFD700] border-4 border-[#B8860B] px-8 py-2 rounded-full shadow-lg min-w-[240px]">
                            <h2 className="text-xl md:text-2xl font-black text-[#5D4037] uppercase whitespace-nowrap">
                                {players.reduce((prev, current) => (prev.score > current.score) ? prev : current).name} Wins!
                            </h2>
                        </div>

                        <div className="mt-6 mb-4">
                            <p className="text-4xl font-black text-[#8B4513] mb-2">{currentWord?.word}</p>
                            <div className="h-1 w-24 bg-[#DEB887] mx-auto rounded-full"></div>
                        </div>

                        <div className="bg-[#DEB887]/20 p-4 md:p-6 rounded-xl mb-6 text-left border-2 border-[#DEB887;] border-dashed">
                            <p className="text-lg text-[#8B4513] font-serif italic mb-2">"{currentWord?.verse}"</p>
                            <p className="text-sm md:text-md text-[#5D4037] font-medium">{currentWord?.explanation}</p>
                        </div>

                        <button
                            onClick={resetRound}
                            className="bg-[#2E8B57] hover:bg-[#228B22] border-b-4 border-[#006400] text-white text-xl font-bold py-3 px-8 rounded-2xl shadow-lg transition active:translate-y-1 active:border-b-0 w-full"
                        >
                            Next Round
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
