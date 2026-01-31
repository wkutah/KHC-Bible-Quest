import { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import { motion } from 'framer-motion';

export function PlayerSetup() {
    const { setPlayers, setDifficulty, difficulty, setCategory, categoryFilter, createRoom, joinRoom } = useGameStore();
    const [mode, setMode] = useState<'LOCAL' | 'ONLINE'>('LOCAL');

    // Local State
    const [numPlayers, setNumPlayers] = useState(2);
    const [names, setNames] = useState<string[]>(['Player 1', 'Player 2']);

    // Online State
    const [onlineName, setOnlineName] = useState('Player 1');
    const [roomInput, setRoomInput] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [createdRoomId, setCreatedRoomId] = useState<string | null>(null);

    const handleCountChange = (count: number) => {
        setNumPlayers(count);
        const newNames = Array(count).fill('').map((_, i) => names[i] || `Player ${i + 1}`);
        setNames(newNames);
    };

    const handleNameChange = (index: number, value: string) => {
        const newNames = [...names];
        newNames[index] = value;
        setNames(newNames);
    };

    const handleLocalSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPlayers(names.map(n => n.trim() || `Player`));
    };

    const handleCreateRoom = async () => {
        setIsJoining(true);
        const roomId = await createRoom(onlineName);
        if (roomId) {
            setCreatedRoomId(roomId);
        } else {
            alert("Failed to create room");
        }
        setIsJoining(false);
    };

    const handleJoinRoom = async () => {
        if (!roomInput) return;
        setIsJoining(true);
        const success = await joinRoom(roomInput, onlineName);
        if (!success) {
            alert("Failed to join room. Check ID.");
        }
        setIsJoining(false);
    };

    if (createdRoomId) {
        return (
            <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-sky-50">
                <div className="texture-parchment p-8 rounded-2xl shadow-2xl max-w-md w-full border-4 border-[#8B4513] text-center">
                    <h2 className="text-2xl font-black text-[#8B4513] mb-4">Room Created!</h2>
                    <p className="mb-2 text-[#5D4037]">Share this ID with friends:</p>
                    <div className="bg-[#FFF8DC] p-3 rounded font-mono text-xl font-bold select-all mb-4 border border-[#DEB887]">
                        {createdRoomId}
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#8B4513] border-t-transparent"></div>
                        <span className="text-sm italic text-[#8B4513]">Waiting for players to join...</span>
                    </div>
                    <p className="text-xs text-[#8B4513]/60">The game will sync automatically when you start.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-sky-50">
            <div className="absolute inset-0 bg-[url('/bg-sky.jpg')] bg-cover opacity-20"></div>

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="texture-parchment p-6 md:p-8 rounded-2xl shadow-2xl max-w-md w-full border-4 border-[#8B4513] relative z-10 max-h-[90vh] overflow-y-auto scrollbar-hide"
            >
                <div className="text-center mb-4">
                    <h2 className="text-2xl md:text-3xl font-black text-[#5D4037] uppercase mb-1">Setup Quest</h2>

                    {/* Mode Toggle */}
                    <div className="flex justify-center gap-2 mt-4 mb-2 bg-[#8B4513]/10 p-1 rounded-lg inline-flex">
                        <button
                            onClick={() => setMode('LOCAL')}
                            className={`px-4 py-1.5 rounded-md font-bold text-sm transition ${mode === 'LOCAL' ? 'bg-[#8B4513] text-[#FFD700] shadow' : 'text-[#8B4513] hover:bg-[#8B4513]/10'}`}
                        >
                            Local Party
                        </button>
                        <button
                            onClick={() => setMode('ONLINE')}
                            className={`px-4 py-1.5 rounded-md font-bold text-sm transition ${mode === 'ONLINE' ? 'bg-[#8B4513] text-[#FFD700] shadow' : 'text-[#8B4513] hover:bg-[#8B4513]/10'}`}
                        >
                            Online
                        </button>
                    </div>
                </div>

                {mode === 'LOCAL' ? (
                    <form onSubmit={handleLocalSubmit} className="space-y-4">
                        {/* Number of Players Selector */}
                        <div>
                            <label className="block text-[#5D4037] font-bold mb-2 text-sm">Number of Players</label>
                            <div className="flex gap-2 justify-center">
                                {[1, 2, 3, 4, 5].map(num => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => handleCountChange(num)}
                                        className={`w-8 h-8 md:w-10 md:h-10 rounded-full font-bold border-2 transition ${numPlayers === num
                                            ? 'bg-[#8B4513] text-[#FFD700] border-[#FFD700] scale-110'
                                            : 'bg-[#FDF5E6] text-[#8B4513] border-[#8B4513] hover:bg-[#DEB887]'
                                            }`}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Difficulty Selector */}
                        <div>
                            <label className="block text-[#5D4037] font-bold mb-2 text-sm">Difficulty</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Random', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
                                    <button
                                        key={diff}
                                        type="button"
                                        onClick={() => setDifficulty(diff as any)}
                                        className={`py-1.5 px-2 rounded-lg font-bold border-2 text-[10px] md:text-sm transition uppercase ${(difficulty === diff)
                                            ? 'bg-[#8B4513] text-[#FFD700] border-[#FFD700] shadow-md'
                                            : 'bg-[#FDF5E6] text-[#8B4513] border-[#8B4513] hover:bg-[#DEB887]'
                                            }`}
                                    >
                                        {diff}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Category Selector */}
                        <div>
                            <label className="block text-[#5D4037] font-bold mb-2 text-sm">Category</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['All', 'Core Christian Words', 'Bible Heroes', 'Books of the Bible', 'Fruits of the Spirit', 'Miracles of Jesus', 'Bible Reading', 'Book Reading'].map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setCategory(cat as any)}
                                        className={`py-1.5 px-2 rounded-lg font-bold border-2 text-[10px] md:text-sm transition uppercase ${(categoryFilter === cat)
                                                ? 'bg-[#8B4513] text-[#FFD700] border-[#FFD700] shadow-md'
                                                : 'bg-[#FDF5E6] text-[#8B4513] border-[#8B4513] hover:bg-[#DEB887]'
                                            }`}
                                    >
                                        {cat === 'All' ? 'All categories' : cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Name Inputs */}
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-hide">
                            {names.map((name, idx) => (
                                <div key={idx} className="flex flex-col">
                                    <label className="text-[10px] font-bold text-[#8B4513] uppercase mb-0.5 ml-2">Player {idx + 1}</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => handleNameChange(idx, e.target.value)}
                                        className="bg-[#FFF8DC] border-2 border-[#8B4513] rounded-lg px-3 py-1.5 font-bold text-[#5D4037] placeholder-[#CD853F] focus:outline-none focus:border-[#D2691E] shadow-inner text-sm"
                                        placeholder={`Player ${idx + 1}`}
                                    />
                                </div>
                            ))}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#2E8B57] hover:bg-[#228B22] text-white font-bold py-3 px-6 rounded-xl shadow-lg border-b-4 border-[#006400] active:translate-y-0.5 active:border-b-0 transition uppercase text-lg mt-2"
                        >
                            Start Quest
                        </button>
                    </form>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div>
                            <label className="block text-[#5D4037] font-bold mb-2 text-sm">Your Name</label>
                            <input
                                type="text"
                                value={onlineName}
                                onChange={(e) => setOnlineName(e.target.value)}
                                className="w-full bg-[#FFF8DC] border-2 border-[#8B4513] rounded-lg px-4 py-2 font-bold text-[#5D4037] placeholder-[#CD853F] focus:outline-none focus:border-[#D2691E] shadow-inner"
                                placeholder="Enter your name"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {/* Create Room */}
                            <button
                                onClick={handleCreateRoom}
                                disabled={isJoining || !onlineName.trim()}
                                className="w-full bg-[#8B4513] text-[#FFD700] hover:bg-[#5D4037] font-bold py-3 px-4 rounded-xl shadow-lg border-2 border-[#D2691E] transition disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isJoining ? 'Creating...' : 'Create New Room'}
                            </button>

                            <div className="flex items-center gap-2">
                                <div className="h-px bg-[#8B4513]/30 flex-1"></div>
                                <span className="text-[#8B4513] font-bold text-xs uppercase">OR JOIN</span>
                                <div className="h-px bg-[#8B4513]/30 flex-1"></div>
                            </div>

                            {/* Join Room */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={roomInput}
                                    onChange={(e) => setRoomInput(e.target.value)}
                                    className="flex-1 bg-[#FFF8DC] border-2 border-[#8B4513] rounded-lg px-3 py-2 font-bold text-[#5D4037] uppercase placeholder-[#CD853F]"
                                    placeholder="ROOM ID"
                                />
                                <button
                                    onClick={handleJoinRoom}
                                    disabled={isJoining || !roomInput.trim() || !onlineName.trim()}
                                    className="bg-[#2E8B57] hover:bg-[#228B22] text-white font-bold px-4 rounded-lg shadow-md border-b-4 border-[#006400] active:border-b-0 active:translate-y-0.5 transition"
                                >
                                    Join
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
