'use client';

import Link from 'next/link';
import { useGameStore } from '@/store/useGameStore';
import { User, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function Header() {
    const { user, stats, logout } = useGameStore();
    const router = useRouter();

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-100">
            <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
                <Link href="/" className="text-xl font-bold text-blue-600 flex items-center gap-2">
                    🎡 Bible Word Quest
                </Link>

                <div className="flex items-center gap-4">
                    {user ? (
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-gray-800">{user.username}</p>
                                <p className="text-xs text-gray-500">Score: {stats.score}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <Link
                                href="/login"
                                className="text-sm font-medium text-gray-600 hover:text-blue-600 transition"
                            >
                                Log In
                            </Link>
                            <Link
                                href="/signup"
                                className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
