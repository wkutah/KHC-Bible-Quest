'use client';

import { motion, useAnimation, PanInfo } from 'framer-motion';
import { useState, useRef } from 'react';
import { WHEEL_SEGMENTS } from '../../data/wheel';
import { useGameStore } from '../../store/useGameStore';

export function Wheel() {
    const { spinWheel, setWheelOutcome, turnPhase } = useGameStore();
    const controls = useAnimation();
    const [rotation, setRotation] = useState(0);
    const wheelRef = useRef<HTMLDivElement>(null);

    const handleSpin = async () => {
        if (turnPhase !== 'SPIN') return;

        spinWheel(); // Update global state

        // Random rotation: 5 full spins (1800) + random segment
        const randomOffset = Math.floor(Math.random() * 360);
        const newRotation = rotation + 1800 + randomOffset;

        setRotation(newRotation);

        await controls.start({
            rotate: newRotation,
            transition: { duration: 4, ease: "circOut" }
        });

        // Calculate result based on final angle
        // Normalized angle (0-360)
        const normalizedAngle = newRotation % 360;
        // Because wheel rotates clockwise, the needle (at top, 0deg) effectively points to a segment based on the rotation.
        // Actually, usually needle is at top. If wheel rotates X degrees, the segment at TOP is:
        // 360 - (normalizedAngle) (roughly, depends on start zero).
        // Let's rely on random selection logic in logic layer or just calc simplified here:

        const segmentCount = WHEEL_SEGMENTS.length;
        const segmentSlice = 360 / segmentCount;
        // Assuming segment 0 starts at 0 degrees and goes clockwise?
        // Let's assume needle at top (270deg or 0deg). 
        // Simplification: We pick a random segment result FIRST, then calculate rotation to land there.
        // For now, let's just reverse map angle to index.

        // Correct math: 
        // If 0 deg is at 12 o'clock.
        // Index = floor( ( (360 - (normalizedAngle % 360) ) % 360 ) / segmentSlice )

        const degrees = normalizedAngle % 360;
        const landingAngle = (360 - degrees) % 360;
        // Offset by half segment to center? 
        // Let's keep it simple: matches logic in data/wheel if possible.

        const index = Math.floor(landingAngle / segmentSlice) % segmentCount;
        const segment = WHEEL_SEGMENTS[index];

        setWheelOutcome(segment);
    };

    return (
        <div className="relative flex flex-col items-center justify-center p-4">
            <div className="relative w-80 h-80 md:w-96 md:h-96">

                {/* Pointer (Jewel Style) */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 drop-shadow-lg">
                    <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-[#DC143C]"></div>
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#FFD700] rounded-full border-2 border-[#B8860B] shadow-inner"></div>
                </div>

                {/* Outer Rim (Wood) */}
                <div className="absolute -inset-4 rounded-full bg-[#8B4513] border-4 border-[#5D4037] shadow-xl flex items-center justify-center">
                    {/* Studs */}
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-3 h-3 bg-[#FFD700] rounded-full shadow-sm border border-[#B8860B]"
                            style={{
                                top: '50%',
                                left: '50%',
                                transform: `rotate(${i * 30}deg) translate(0, -195px)` // Adjust based on size
                            }}
                        ></div>
                    ))}
                </div>

                {/* Wheel - Animated Container */}
                <motion.div
                    ref={wheelRef}
                    className="w-full h-full rounded-full border-4 border-white shadow-2xl overflow-hidden relative"
                    animate={controls}
                    initial={{ rotate: 0 }}
                    style={{ rotate: rotation }} // persistent
                >
                    {/* Segments */}
                    {WHEEL_SEGMENTS.map((seg, i) => {
                        const rotate = (360 / WHEEL_SEGMENTS.length) * i;
                        return (
                            <div
                                key={seg.id}
                                className="absolute top-0 left-1/2 w-1/2 h-full origin-left flex items-center justify-center"
                                style={{
                                    transform: `rotate(${rotate}deg)`,
                                    transformOrigin: '0% 50%', // Rotate around center of parent? No.
                                    // CSS Conic gradients are easier for background, but for labels we need absolute positioning.
                                    // Let's use simplified CSS pie slices or just a conic gradient bg and overlays.
                                }}
                            >
                                {/* This slice approach is hard with divs. 
                     Using logical conic gradient for visuals and just placing labels is easier.
                     Let's do text placement relative to center.
                 */}
                            </div>
                        )
                    })}

                    {/* Alternative Visuals: SVG/Conic Gradient */}
                    <div className="w-full h-full rounded-full"
                        style={{
                            background: `conic-gradient(
                    ${WHEEL_SEGMENTS.map((s, i) =>
                                `${s.color} ${(i / WHEEL_SEGMENTS.length) * 100}%, ${s.color} ${((i + 1) / WHEEL_SEGMENTS.length) * 100}%`
                            ).join(', ')}
                  )`
                        }}
                    >
                    </div>

                    {/* Labels Overlay */}
                    {WHEEL_SEGMENTS.map((seg, i) => {
                        const angle = (360 / WHEEL_SEGMENTS.length) * i + (360 / WHEEL_SEGMENTS.length) / 2;
                        return (
                            <div
                                key={seg.id}
                                className="absolute w-full h-full top-0 left-0 flex justify-center pt-4"
                                style={{ transform: `rotate(${angle}deg)` }}
                            >
                                <span className="text-white font-bold text-lg drop-shadow-md" style={{ writingMode: 'vertical-rl' }}>
                                    {seg.label}
                                </span>
                            </div>
                        );
                    })}
                </motion.div>

                {/* Spin Button Center */}
                <button
                    onClick={handleSpin}
                    disabled={turnPhase !== 'SPIN'}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
            w-16 h-16 bg-white rounded-full border-4 border-gray-200 
            flex items-center justify-center shadow-inner z-10
            font-bold text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition"
                >
                    SPIN
                </button>
            </div>
        </div>
    );
}
