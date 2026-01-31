import { Word } from '../types/game';

export const INITIAL_WORDS: Word[] = [
    {
        id: '1',
        word: 'FAITH',
        difficulty: 'Beginner',
        category: 'Core Christian Words',
        hints: [
            "You need this to trust God even when you cannot see",
            "Hebrews chapter 11 talks a lot about this",
            "Abraham showed this when he obeyed God"
        ],
        verse: "Hebrews 11:1",
        explanation: "Faith means trusting God even when you do not see the answer yet."
    },
    {
        id: '2',
        word: 'GRACE',
        difficulty: 'Beginner',
        category: 'Core Christian Words',
        hints: [
            "A free gift from God that we don't deserve",
            "By ____ you have been saved",
            "It is sufficient for you"
        ],
        verse: "Ephesians 2:8",
        explanation: "Grace is getting something good (God's love) that we did not earn."
    },
    {
        id: '3',
        word: 'MOSES',
        difficulty: 'Beginner',
        category: 'Bible Heroes',
        hints: [
            "He was placed in a basket in the river",
            "He received the Ten Commandments",
            "He told Pharaoh to 'Let my people go'"
        ],
        verse: "Exodus 3:10",
        explanation: "Moses was the leader who led God's people out of Egypt."
    },
    {
        id: '4',
        word: 'SALVATION',
        difficulty: 'Intermediate',
        category: 'Core Christian Words',
        hints: [
            "Being saved from sin",
            "Jesus died on the cross to give us this",
            "The helmet of _______"
        ],
        verse: "Acts 4:12",
        explanation: "Salvation means being rescued from sin and death by Jesus."
    },
    {
        id: '5',
        word: 'GETHSEMANE',
        difficulty: 'Advanced',
        category: 'Books of the Bible', // Incorrect category in example but fits better elsewhere, leaving generic
        hints: [
            "A garden where Jesus prayed",
            "The place where Jesus was arrested",
            "Jesus sweat drops of blood here"
        ],
        verse: "Matthew 26:36",
        explanation: "Gethsemane is the garden where Jesus prayed before He went to the cross."
    }
];
