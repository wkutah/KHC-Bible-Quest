'use client';

import { useEffect, useState } from 'react';
import { Word } from '@/types/game';
import { WordEditor } from './WordEditor';
import { CsvUploader } from './CsvUploader';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

export function Dashboard() {
    const [words, setWords] = useState<Word[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentWord, setCurrentWord] = useState<Word | null>(null);

    const fetchWords = async () => {
        const res = await fetch('/api/words');
        if (res.ok) {
            const data = await res.json();
            setWords(data);
        }
    };

    useEffect(() => {
        fetchWords();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this word?')) return;

        await fetch(`/api/words?id=${id}`, { method: 'DELETE' });
        fetchWords();
    };

    const handleEdit = (word: Word) => {
        setCurrentWord(word);
        setIsEditing(true);
    };

    const handleCreate = () => {
        setCurrentWord(null);
        setIsEditing(true);
    };

    const handleSave = () => {
        setIsEditing(false);
        fetchWords();
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <div className="flex flex-col">
                        <h1 className="text-3xl font-bold text-gray-900">Word Management</h1>
                        <p className="text-sm text-gray-500">Connected to Cloud Database</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleCreate}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
                        >
                            <Plus size={20} /> Add Word
                        </button>
                    </div>
                </header>

                {isEditing ? (
                    <div className="bg-white p-6 rounded-xl shadow-lg animate-fade-in relative">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={24} />
                        </button>
                        <h2 className="text-xl font-bold mb-4">{currentWord ? 'Edit Word' : 'Create New Word'}</h2>
                        <WordEditor initialData={currentWord} onSave={handleSave} />
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-100 border-b border-gray-200">
                                    <tr>
                                        <th className="p-4 font-semibold text-gray-600">Word</th>
                                        <th className="p-4 font-semibold text-gray-600">Category</th>
                                        <th className="p-4 font-semibold text-gray-600">Difficulty</th>
                                        <th className="p-4 font-semibold text-gray-600">Verse</th>
                                        <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {words.map((word) => (
                                        <tr key={word.id} className="hover:bg-blue-50 transition">
                                            <td className="p-4 font-medium text-gray-800">{word.word}</td>
                                            <td className="p-4 text-gray-600">
                                                <span className="bg-gray-100 px-2 py-1 rounded text-sm text-gray-600">{word.category}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                            ${word.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                                                        word.difficulty === 'Intermediate' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-red-100 text-red-700'}
                                        `}>
                                                    {word.difficulty}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-500 italic text-sm">{word.verse}</td>
                                            <td className="p-4 text-right space-x-2">
                                                <button
                                                    onClick={() => handleEdit(word)}
                                                    className="text-blue-500 hover:text-blue-700 p-2 hover:bg-blue-100 rounded-full transition"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(word.id)}
                                                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-100 rounded-full transition"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {words.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="p-8 text-center text-gray-400">No words found. Add one to get started!</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <CsvUploader onUploadComplete={fetchWords} />
                    </div>
                )}
            </div>
        </div>
    );
}
