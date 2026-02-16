import { createAnthropicClient } from './anthropic';
import { debugManager } from './debug';
import {
    getRandomReadingPassage,
    getRandomRACEPrompt,
    getRandomWritingPrompt,
    type ReadingPassage,
    type RACEPrompt
} from './mock-content';

export interface AIMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: number;
    score?: number;
}

const SYSTEM_PROMPT = `You are a friendly, encouraging, and expert literacy tutor for elementary school students (Grades 3-5). 
Your goal is to help them improve their reading and writing skills.
Always be positive, constructive, and use age-appropriate language.
Keep your responses relatively short and focused.`;

export interface AIResponse {
    score: number;
    feedback: string;
}

export const sendMessageToAI = async (text: string, context: any): Promise<AIResponse> => {
    const client = createAnthropicClient();

    // Fallback to mock if no API key
    if (!client) {
        debugManager.log('warning', 'Client init failed: No API Key found. Using Mock.', { error: 'Missing VITE_ANTHROPIC_API_KEY or LocalStorage key' });
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return {
            score: 8,
            feedback: "I'm in offline mode right now! That's a great start. **Keep writing!**"
        };
    }

    try {
        let systemPrompt = SYSTEM_PROMPT;
        let userMessage = "";
        let contextLog = "";

        // Common instruction for JSON output
        systemPrompt += `\n\nIMPORTANT: You must return your response in strictly valid JSON format with the following structure:
        {
            "score": number, // A score from 0-10 based on quality/accuracy. 0 is poor, 10 is perfect.
            "feedback": "string" // Your helpful feedback in Markdown format. Use bolding and lists where appropriate.
        }`;

        // Parse context if it's a string (backward compatibility)
        const contextData = typeof context === 'string' ? { mode: context } : context;

        if (contextData.mode === 'race') {
            const { prompt, answer } = contextData;
            systemPrompt += `\n\nAnalyze the student's response based on the RACE strategy:
            - Restate: Did they restate the question?
            - Answer: Did they answer the question?
            - Cite: Did they cite evidence from the text?
            - Explain: Did they explain how the evidence supports their answer?
            
            Score criteria:
            - 0-4: Missing multiple components or incorrect.
            - 5-7: Has most components but weak explanation or citation.
            - 8-10: Strong RACE response with clear evidence.`;

            userMessage = `Passage:\n"${prompt.content}"\n\nQuestion:\n"${prompt.prompt}"\n\nStudent Answer:\n"${answer}"\n\nPlease review my RACE response.`;
            contextLog = "RACE Practice";
        }
        else if (contextData.mode === 'reading') {
            const { passage, answers } = contextData;
            // Include question text for context
            const answersText = Object.entries(answers).map(([id, ans]) => {
                const questionText = passage.questions.find((q: any) => q.id.toString() === id)?.text || "Question";
                return `Q: ${questionText}\nA: ${ans}`;
            }).join('\n\n');

            systemPrompt += `\n\nCheck the student's answers for accuracy based on the text.
            Score is based on the accuracy of the answers.`;

            userMessage = `Passage:\n"${passage.content}"\n\nStudent Q&A:\n${answersText}\n\nPlease check my reading comprehension answers.`;
            contextLog = "Reading Comprehension";
        }
        else {
            // Free write or simple chat
            const input = contextData.text || text;
            systemPrompt += `\n\nEvaluate the writing for creativity, grammar, and clarity.`;
            userMessage = `Student Writing:\n"${input}"\n\nPlease provide feedback on my writing.`;
            contextLog = "Free Write";
        }

        const promptInfo = {
            system: systemPrompt,
            context: contextLog,
            message: userMessage
        };
        debugManager.log('info', 'Sending Message to AI', { prompt: JSON.stringify(promptInfo, null, 2) });

        const message = await client.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 1000,
            system: systemPrompt,
            messages: [
                { role: "user", content: userMessage }
            ]
        });

        const content = message.content[0];
        if (content.type === 'text') {
            debugManager.log('success', 'Received AI Response', { response: content.text });
            try {
                // simple cleanup for potential markdown code blocks
                const cleanJson = content.text.replace(/```json\n?|\n?```/g, '');
                const result = JSON.parse(cleanJson);
                return {
                    score: typeof result.score === 'number' ? result.score : 0,
                    feedback: result.feedback || "Great job!"
                };
            } catch (e) {
                console.error("Failed to parse AI JSON", e);
                // Fallback if AI fails to return JSON
                return {
                    score: 7, // Neutral score
                    feedback: content.text
                };
            }
        }
        return { score: 0, feedback: "Something went wrong. Please try again." };
    } catch (error: any) {
        debugManager.log('error', 'AI Message Failed', { error: error.message || error });
        console.error("AI Error:", error);
        return {
            score: 0,
            feedback: "I'm having trouble connecting to my brain right now, but keep writing!"
        };
    }
};

const THEMES = [
    "Space Exploration", "Deep Sea Mysteries", "Ancient Civilizations", "Rainforest Wildlife",
    "Robots and AI", "Superheroes", "Time Travel", "Magical Forests", "Inventors",
    "Sports Legends", "Volcanoes", "Castles and Knights", "Space Stations", "Detectives"
];

const getRandomTheme = () => THEMES[Math.floor(Math.random() * THEMES.length)];

export const generateReadingPassage = async (grade: number, topic?: string): Promise<ReadingPassage> => {
    const client = createAnthropicClient();
    if (!client) {
        debugManager.log('warning', 'Client init failed: No API Key. Using Mock Passage.');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return getRandomReadingPassage(grade);
    }

    const currentTheme = topic || getRandomTheme();
    const uniqueSeed = Date.now().toString().slice(-4);

    try {
        const prompt = `Generate a Grade ${grade} reading passage about "${currentTheme}" (ID: ${uniqueSeed}) with a title, content (approx 150-200 words), and 2 comprehension questions.
        
        Requirements:
        - Use rich, descriptive vocabulary appropriate for Grade ${grade} aiming for high proficiency.
        - Include complex sentence structures to challenge the reader.
        - Ensure the content is engaging and educational.
        - Questions should be detailed and require inferential thinking, not just recall.
        - MAKE IT UNIQUE. Do not repeat previous stories.

        Return strictly valid JSON with this structure:
        {
            "title": "string",
            "content": "string",
            "questions": [
                { "id": 1, "text": "question 1" },
                { "id": 2, "text": "question 2" }
            ]
        }`;

        debugManager.log('info', 'Generating Reading Passage', { prompt });

        const message = await client.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 1000,
            temperature: 0.9,
            messages: [{ role: "user", content: prompt }]
        });

        const content = message.content[0];
        if (content.type === 'text') {
            debugManager.log('success', 'Generated Reading Passage', { response: content.text });
            const json = JSON.parse(content.text.replace(/```json\n?|\n?```/g, ''));
            return {
                id: Date.now().toString(),
                grade,
                ...json
            };
        }
        throw new Error("Invalid response format");
    } catch (error: any) {
        debugManager.log('error', 'Passage Generation Failed', { error: error.message || error });
        console.error("AI Generation Error:", error);
        return getRandomReadingPassage(grade);
    }
};

export const generateRACEPrompt = async (grade: number): Promise<RACEPrompt> => {
    const client = createAnthropicClient();
    if (!client) {
        debugManager.log('warning', 'Client init failed: No API Key. Using Mock RACE Prompt.');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return getRandomRACEPrompt(grade);
    }

    const currentTheme = getRandomTheme();
    const uniqueSeed = Date.now().toString().slice(-4);

    try {
        const prompt = `Generate a Grade ${grade} short text about "${currentTheme}" (ID: ${uniqueSeed}) and a question that requires a constructed response using the RACE strategy.
        
        Requirements:
        - The text should be rich in detail and vocabulary to support deep analysis.
        - The topic should be engaging and complex enough to require explanation.
        - The question should be open-ended and require citing specific evidence from the text to answer fully.
        
        Return strictly valid JSON with this structure:
        {
            "title": "string",
            "content": "string",
            "prompt": "string"
        }`;

        debugManager.log('info', 'Generating RACE Prompt', { prompt });

        const message = await client.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 1000,
            temperature: 0.9,
            messages: [{ role: "user", content: prompt }]
        });

        const content = message.content[0];
        if (content.type === 'text') {
            debugManager.log('success', 'Generated RACE Prompt', { response: content.text });
            const json = JSON.parse(content.text.replace(/```json\n?|\n?```/g, ''));
            return {
                id: Date.now().toString(),
                grade,
                ...json
            };
        }
        throw new Error("Invalid response format");
    } catch (error: any) {
        debugManager.log('error', 'RACE Generation Failed', { error: error.message || error });
        console.error("AI Generation Error:", error);
        return getRandomRACEPrompt(grade);
    }
};

export const generateWritingPrompt = async (grade: number): Promise<string> => {
    const client = createAnthropicClient();
    if (!client) {
        debugManager.log('warning', 'Client init failed: No API Key. Using Mock Prompt.');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return getRandomWritingPrompt();
    }

    const currentTheme = getRandomTheme();
    const uniqueSeed = Date.now().toString().slice(-4);

    try {
        const prompt = `Generate a single creative writing prompt for a Grade ${grade} student based on the theme: "${currentTheme}". 
        The prompt should inspire sophisticated thinking and the use of descriptive language.
        Avoid simple scenarios; suggest intriguing dilemmas, magical realism, or character-driven situations.
        Unique ID: ${uniqueSeed}
        Return ONLY the prompt text, without quotes or introductory phrases.`;

        debugManager.log('info', 'Generating Writing Prompt', { prompt });

        const message = await client.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 100,
            temperature: 0.9,
            messages: [{ role: "user", content: prompt }]
        });

        const content = message.content[0];
        if (content.type === 'text') {
            debugManager.log('success', 'Generated Writing Prompt', { response: content.text });
            return content.text;
        }
        return getRandomWritingPrompt();
    } catch (error: any) {
        debugManager.log('error', 'Prompt Generation Failed', { error: error.message || error });
        console.error("AI Generation Error:", error);
        return getRandomWritingPrompt();
    }
};
