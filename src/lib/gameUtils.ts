export function getMaskedWord(word: string, guessedLetters: Set<string>): string {
    return word
        .split('')
        .map((char) => (guessedLetters.has(char.toUpperCase()) || !/[A-Z]/.test(char.toUpperCase()) ? char : '_'))
        .join(' ');
}

export function isWordSolved(word: string, guessedLetters: Set<string>): boolean {
    const letters = word.toUpperCase().split('').filter(c => /[A-Z]/.test(c));
    return letters.every(l => guessedLetters.has(l));
}
