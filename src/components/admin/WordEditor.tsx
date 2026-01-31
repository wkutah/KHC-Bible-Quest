'use client';

import { useState } from 'react';
import { Word, Difficulty, Category } from '@/types/game';
import { Plus, X, Save } from 'lucide-react';

interface WordEditorProps {
    initialData: Word | null;
    onSave: () => void;
}

export function WordEditor({ initialData, onSave }: WordEditorProps) {
    const [formData, setFormData] = useState<Partial<Word>>({
        word: initialData?.word || '',
        difficulty: initialData?.difficulty || 'Beginner',
        category: initialData?.category || 'Core Christian Words',
        verse: initialData?.verse || '',
        explanation: initialData?.explanation || '',
        hints: initialData?.hints || [''],
    });

    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const method = initialData ? 'PUT' : 'POST';
            const body = initialData ? { ...formData, id: initialData.id } : formData;

            const res = await fetch('/api/words', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                onSave();
            } else {
                alert('Failed to save word');
            }
        } catch (error) {
            console.error(error);
            alert('Error saving word');
        } finally {
            setSaving(false);
        }
    };

    const updateHint = (index: number, value: string) => {
        const newHints = [...(formData.hints || [])];
        newHints[index] = value;
        setFormData({ ...formData, hints: newHints });
    };

    const addHint = () => {
        setFormData({ ...formData, hints: [...(formData.hints || []), ''] });
    };

    const removeHint = (index: number) => {
        const newHints = (formData.hints || []).filter((_, i) => i !== index);
        setFormData({ ...formData, hints: newHints });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Col */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Word</label>
                        <input
                            type="text"
                            required
                            value={formData.word}
                            onChange={e => setFormData({ ...formData, word: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-lg font-bold"
                            placeholder="e.g. FAITH"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                            <select
                                value={formData.difficulty}
                                onChange={e => setFormData({ ...formData, difficulty: e.target.value as Difficulty })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                            >
                                <option value="Beginner">Beginner</option>
                                <option value="Intermediate">Intermediate</option>
                                <option value="Advanced">Advanced</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Category</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                            >
                                <option value="Core Christian Words">Core Christian Words</option>
                                <option value="Bible Heroes">Bible Heroes</option>
                                <option value="Books of the Bible">Books of the Bible</option>
                                <option value="Fruits of the Spirit">Fruits of the Spirit</option>
                                <option value="Miracles of Jesus">Miracles of Jesus</option>
                                <option value="Bible Reading">Bible Reading</option>
                                <option value="Book Reading">Book Reading</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bible Verse Reference</label>
                        <input
                            type="text"
                            required
                            value={formData.verse}
                            onChange={e => setFormData({ ...formData, verse: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                            placeholder="e.g. John 3:16"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Brief Explaination</label>
                        <textarea
                            required
                            value={formData.explanation}
                            onChange={e => setFormData({ ...formData, explanation: e.target.value })}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                            rows={3}
                            placeholder="Simple definition for kids..."
                        />
                    </div>
                </div>

                {/* Right Col: Hints */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <label className="block text-sm font-medium text-gray-700">Hints</label>
                        <button
                            type="button"
                            onClick={addHint}
                            className="text-xs flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                        >
                            <Plus size={14} /> Add Hint
                        </button>
                    </div>
                    <div className="space-y-3">
                        {formData.hints?.map((hint, i) => (
                            <div key={i} className="flex gap-2">
                                <input
                                    type="text"
                                    required
                                    value={hint}
                                    onChange={e => updateHint(i, e.target.value)}
                                    className="flex-1 rounded-md border-gray-300 shadow-sm border p-2 text-sm"
                                    placeholder={`Hint #${i + 1}`}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeHint(i)}
                                    disabled={(formData.hints?.length || 0) <= 1}
                                    className="text-gray-400 hover:text-red-500 disabled:opacity-30"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
                >
                    <Save size={20} />
                    {saving ? 'Saving...' : 'Save Word'}
                </button>
            </div>
        </form>
    );
}
