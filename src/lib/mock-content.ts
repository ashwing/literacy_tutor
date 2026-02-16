export interface ReadingPassage {
    id: string;
    grade: number;
    title: string;
    content: string;
    questions: { id: number; text: string }[];
}

export interface RACEPrompt {
    id: string;
    grade: number;
    title: string;
    content: string;
    prompt: string;
}

export const READING_Passages: ReadingPassage[] = [
    {
        id: 'r1',
        grade: 3,
        title: "The Mysterious Garden",
        content: "Lucy found a small, rusty key under the old doormat. She had never seen it before. It didn't look like the key to the front door, which was big and shiny. This key was old, with a shape like a tiny flower on top. She remembered the locked wooden gate at the back of the garden that nobody ever opened. Her heart started to beat faster. Could this key open the secret garden?",
        questions: [
            { id: 1, text: "What did Lucy find under the doormat?" },
            { id: 2, text: "Why did Lucy's heart beat faster?" }
        ]
    },
    {
        id: 'r2',
        grade: 3,
        title: "The Lost Puppy",
        content: "Max heard a soft whimper coming from the bushes. He peeked inside and saw a tiny, trembling puppy with muddy paws. It looked scared. Max slowly reached out his hand so the puppy could sniff it. The puppy licked his fingers. Max knew he had to help it find its home.",
        questions: [
            { id: 1, text: "What did Max hear?" },
            { id: 2, text: "How did Max show he was friendly?" }
        ]
    },
    {
        id: 'r3',
        grade: 4,
        title: "Space Explorers",
        content: "Commander Alex looked out the viewport. The stars were like diamond dust scattered on black velvet. 'Prepare for landing,' he told his crew. The red planet loomed ahead, mysterious and waiting. They were the first humans to travel this far from Earth. The mission was dangerous, but Alex was ready.",
        questions: [
            { id: 1, text: "What did the stars look like to Alex?" },
            { id: 2, text: "Why was this mission special?" }
        ]
    },
    {
        id: 'r4',
        grade: 4,
        title: "The Deep Blue Sea",
        content: "The submarine descended deeper into the dark ocean. Strange glowing fish swam past the window. Dr. Smith adjusted the lights. suddenly, a giant tentacle draped over the front of the ship. 'It's the giant squid!' she whispered. This was the discovery of a lifetime.",
        questions: [
            { id: 1, text: "What did Dr. Smith see outside?" },
            { id: 2, text: "Why did she whisper?" }
        ]
    }
];

export const RACE_PROMPTS: RACEPrompt[] = [
    {
        id: 'race1',
        grade: 3,
        title: "The Golden Touch",
        content: "King Midas loved gold more than anything. One day, a magical stranger granted him a wish: everything he touched would turn to gold. At first, Midas was delighted. But when he tried to eat, his food turned to gold. When he tried to drink, the water turned to gold. He realized his wish was actually a curse.",
        prompt: "Why did King Midas change his mind about gold being the best thing in the world? Use the RACE strategy to answer."
    },
    {
        id: 'race2',
        grade: 3,
        title: "The Ant and the Grasshopper",
        content: "All summer long, the Ant worked hard storing food for winter. The Grasshopper just played his fiddle and laughed at the Ant. 'Why work so hard?' he asked. When winter came, the Ant was warm and full, but the Grasshopper was cold and hungry.",
        prompt: "Was the Ant right to work all summer? Explain why or why not using evidence from the story."
    },
    {
        id: 'race3',
        grade: 4,
        title: "Rosa Parks",
        content: "Rosa Parks was tired after a long day of work. She sat down on the bus. When the driver told her to move to the back so a man could sit, she said 'No.' Her brave choice helped start a movement for fairness and equality.",
        prompt: "How did Rosa Parks show bravery? detailed your answer using the RACE strategy."
    }
];

export const WRITING_PROMPTS = [
    "Write about a time you were surprisingly brave.",
    "If you could have any superpower, what would it be and why?",
    "Describe your perfect day from morning to night.",
    "Imagine you found a door in a tree. Where does it lead?",
    "Write a letter to your future self 10 years from now."
];

export const getRandomReadingPassage = (grade: number) => {
    const suitable = READING_Passages.filter(p => Math.abs(p.grade - grade) <= 1);
    const pool = suitable.length > 0 ? suitable : READING_Passages;
    return pool[Math.floor(Math.random() * pool.length)];
};

export const getRandomRACEPrompt = (grade: number) => {
    const suitable = RACE_PROMPTS.filter(p => Math.abs(p.grade - grade) <= 1);
    const pool = suitable.length > 0 ? suitable : RACE_PROMPTS;
    return pool[Math.floor(Math.random() * pool.length)];
};

export const getRandomWritingPrompt = () => {
    return WRITING_PROMPTS[Math.floor(Math.random() * WRITING_PROMPTS.length)];
};
