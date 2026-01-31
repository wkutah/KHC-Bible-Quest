'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Word, Difficulty, Category } from '@/types/game';

interface CsvRow {
    Word: string;
    Difficulty: string;
    Category: string;
    Verse: string;
    Explanation: string;
    [key: string]: string; // For dynamic Hint columns like "Hint 1", "Hint 2"
}

export function CsvUploader({ onUploadComplete }: { onUploadComplete: () => void }) {
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setMessage(null);

        Papa.parse(file, {
            header: false, // Switch to manual parsing to handle messy headers
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const rows = results.data as string[][];
                    const formattedWords: Partial<Word>[] = [];

                    // 1. Attempt to find the Header Row
                    let headerIndex = -1;
                    let colMap: Record<string, number> = {};

                    // Scan first 10 rows for headers
                    for (let i = 0; i < Math.min(rows.length, 10); i++) {
                        const rowStr = rows[i].map(c => c.toLowerCase().trim());
                        if (rowStr.includes('category') || rowStr.includes('difficulty')) {
                            headerIndex = i;
                            rows[i].forEach((cell, idx) => {
                                const cleanKey = cell.toLowerCase().replace(/[^a-z0-9]/g, '');
                                if (cleanKey) colMap[cleanKey] = idx;
                            });
                            break;
                        }
                    }

                    // 2. Define Indices (Use Map or Fallback to Standard)
                    // Standard: 0=Word, 1=Difficulty, 2=Category, 3=Verse, 4=Explanation, 5+=Hints
                    const getCol = (row: string[], key: string, fallbackIdx: number) => {
                        // Specific check for 'word' since user's header might correspond to 'difficulty' col if shifted
                        if (headerIndex !== -1 && colMap[key] !== undefined) return row[colMap[key]];
                        return row[fallbackIdx];
                    };

                    for (let i = 0; i < rows.length; i++) {
                        if (i === headerIndex) continue; // Skip explicit header row

                        const row = rows[i];
                        if (row.length < 2) continue; // Skip empty/garbage rows

                        // Heuristic: Check if this row IS a header row (in case we didn't find it or it's duplicated)
                        const rowStr = row.join(' ').toLowerCase();
                        if (rowStr.includes('difficulty') && rowStr.includes('category')) continue;

                        const wordText = getCol(row, 'word', 0)?.trim();
                        // If "Word" content looks like a header (e.g. "Difficulty"), skip
                        if (!wordText || wordText.toLowerCase() === 'difficulty') continue;

                        const hints: string[] = [];
                        // Collect hints (from col 5 onwards, or mapped)
                        if (headerIndex !== -1) {
                            // Mapped hints
                            Object.keys(colMap).forEach(key => {
                                if (key.startsWith('hint')) {
                                    const val = row[colMap[key]];
                                    if (val?.trim()) hints.push(val.trim());
                                }
                            });
                        } else {
                            // Standard Hints (Index 5+)
                            for (let j = 5; j < row.length; j++) {
                                if (row[j]?.trim()) hints.push(row[j].trim());
                            }
                        }

                        formattedWords.push({
                            word: wordText,
                            difficulty: (getCol(row, 'difficulty', 1) as Difficulty) || 'Beginner',
                            category: (getCol(row, 'category', 2) as Category) || 'Core Christian Words',
                            verse: getCol(row, 'verse', 3) || '',
                            explanation: getCol(row, 'explanation', 4) || '',
                            hints: hints.length > 0 ? hints : ['']
                        });
                    }

                    if (formattedWords.length === 0) {
                        throw new Error("No valid words found. Ensure the CSV has columns: Word, Difficulty, Category, Verse, Explanation, Hints.");
                    }

                    // Send to Batch API
                    const res = await fetch('/api/words/batch', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(formattedWords)
                    });

                    const data = await res.json();

                    if (!res.ok) throw new Error(data.error || 'Upload failed');

                    setMessage({ type: 'success', text: `${data.message} (Processed ${formattedWords.length} rows)` });
                    onUploadComplete();
                } catch (err: any) {
                    setMessage({ type: 'error', text: err.message });
                } finally {
                    setUploading(false);
                }
            },
            error: (err) => {
                setMessage({ type: 'error', text: 'Failed to parse CSV file' });
                setUploading(false);
            }
        });
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Upload size={20} className="text-blue-600" />
                Bulk Upload Words
            </h3>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition relative">
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />

                {uploading ? (
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
                        <p className="text-gray-600">Processing file...</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-gray-500">
                        <FileText size={48} className="mb-2 text-gray-300" />
                        <p className="font-medium text-gray-700">Click or Drag CSV file here</p>
                        <p className="text-xs mt-2 text-gray-400">
                            Required Columns: Word, Category, Difficulty, Verse, Explanation, Hint 1, Hint 2...
                        </p>
                    </div>
                )}
            </div>

            {message && (
                <div className={`mt-4 p-3 rounded-lg flex items-center gap-2 text-sm font-medium
                    ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                `}>
                    {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                </div>
            )}
        </div>
    );
}
