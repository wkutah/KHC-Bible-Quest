import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface HowToPlayModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function HowToPlayModal({ isOpen, onClose }: HowToPlayModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#FDF5E6] texture-parchment p-6 md:p-8 rounded-xl shadow-2xl max-w-lg w-full relative border-4 border-[#8B4513] rotate-1"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-3 -right-3 bg-[#8B4513] text-[#FDF5E6] rounded-full p-2 border-2 border-[#FDF5E6] hover:bg-[#5D4037] transition shadow-md"
                >
                    <X size={24} strokeWidth={3} />
                </button>

                {/* Header */}
                <div className="text-center mb-6 border-b-2 border-[#8B4513]/20 pb-4">
                    <h2 className="text-3xl font-black text-[#5D4037] uppercase tracking-wide">How To Play</h2>
                    <p className="text-[#8B4513] font-serif italic mt-1">Quest for Bible Wisdom!</p>
                </div>

                {/* Instructions List */}
                <div className="space-y-4 text-[#4E342E]">

                    <div className="flex gap-4 items-start">
                        <div className="bg-[#8B4513] text-[#FFD700] w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shrink-0 border border-[#FDF5E6] shadow-sm">1</div>
                        <div>
                            <h3 className="font-bold text-lg uppercase text-[#5D4037]">Spin The Wheel</h3>
                            <p className="font-serif leading-snug">Spin to earn points! Watch out for <span className="text-red-700 font-bold">Bankrupt</span> or <span className="text-orange-700 font-bold">Lose Turn</span>.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start">
                        <div className="bg-[#8B4513] text-[#FFD700] w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shrink-0 border border-[#FDF5E6] shadow-sm">2</div>
                        <div>
                            <h3 className="font-bold text-lg uppercase text-[#5D4037]">Guess Letters</h3>
                            <p className="font-serif leading-snug">Buy vowels or guess consonants to reveal the hidden Bible word.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start">
                        <div className="bg-[#8B4513] text-[#FFD700] w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shrink-0 border border-[#FDF5E6] shadow-sm">3</div>
                        <div>
                            <h3 className="font-bold text-lg uppercase text-[#5D4037]">Use Hints</h3>
                            <p className="font-serif leading-snug">Stuck? Spend <span className="font-bold text-[#8B4513]">50 points</span> to reveal a clue about the word.</p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start">
                        <div className="bg-[#8B4513] text-[#FFD700] w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shrink-0 border border-[#FDF5E6] shadow-sm">4</div>
                        <div>
                            <h3 className="font-bold text-lg uppercase text-[#5D4037]">Win The Round</h3>
                            <p className="font-serif leading-snug">Solve the word to learn its verse and meaning!</p>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <button
                        onClick={onClose}
                        className="bg-[#2E8B57] hover:bg-[#228B22] text-white font-bold py-2 px-8 rounded-full shadow-lg border-b-4 border-[#006400] active:translate-y-0.5 active:border-b-0 transition"
                    >
                        Let's Play!
                    </button>
                </div>

            </motion.div>
        </div>
    );
}
