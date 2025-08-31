import { Hono } from "hono";
import { GoogleGenAI, Type } from "@google/genai";
import { extractJsonFromResponse } from "../helpers";

type Bindings = {
    GOOGLE_GENAI_API_KEY: string;
    GOOGLE_SERVICE_ACCOUNT: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Endpoint to generate MCQs
app.post('/mcq-generator', async (c) => {
    const ai = new GoogleGenAI({
        apiKey: c.env.GOOGLE_GENAI_API_KEY, // Replace with your Google GenAI API key
    });

    const body = await c.req.json();
    const { context, difficulty, lesson, num, user } = body;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {
                text: `
                    Generate ${num}-question with the type is **multiple-choice** based on the topic of **${context}**.

                    Rules:
                    - Difficulty level: ${difficulty}.
                    - Each question must have 1 correct answer and 3 incorrect but plausible distractors.
                    - Vary the subtopics: (search on internet today top news).
                    - Avoid repetition in the questions.
                    - Phrase each question clearly and concisely.
                    - Give each question a point value from 1 to 10.
                    - Make sure the correct answer randomize it's position in the options.
                    - Avoid duplication of questions.
                    - The language of the response must be the same as language of the topic.
                `,
            },
        ],
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                        options: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    id: { type: Type.STRING },
                                    value: { type: Type.STRING },
                                },
                            },
                        },
                        pointValue: { type: Type.NUMBER },
                    }
                }
            }
        }
    });

    const aiResponse = response.text;
    if (!aiResponse) {
        return c.json({ error: 'No response from AI' }, 500);
    }

    const jsonResponse = extractJsonFromResponse(aiResponse);
    if (!jsonResponse) {
        return c.json({ error: 'Invalid JSON response from AI' }, 500);
    }

    return c.json({ message: 'MCQs generated successfully', questions: jsonResponse });
});

// Essay generation endpoint
app.post('/essay-generator', async (c) => {
    const ai = new GoogleGenAI({
        apiKey: c.env.GOOGLE_GENAI_API_KEY, // Replace with your Google GenAI API key
    });
    
    const body = await c.req.json();
    const { context, difficulty, lesson, num, user  } = body;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {
                text: `
                    Generate ${num}-question with the type is **open-ended** based on the topic of **${context}**.

                    Requirements:
                    - Difficulty level: ${difficulty}.
                    - Vary the subtopics: (search on internet today top news).
                    - Avoid repetition in the questions.
                    - Phrase each question clearly and concisely.
                    - Avoid duplication of questions.
                    - The language of the response must be the same as language of the topic.
                `,
            },
        ],
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        question: { type: Type.STRING },
                    }
                }
            }
        }
    });

    const aiResponse = response.text;  
    if (!aiResponse) {
        return c.json({ error: 'No response from AI' }, 500);
    }

    const jsonResponse = extractJsonFromResponse(aiResponse);
    if (!jsonResponse) {
        return c.json({ error: 'Invalid JSON response from AI' }, 500);
    }

    return c.json({ message: 'Open ended questions generated successfully', questions: jsonResponse });
});

// Essay scoring endpoint
app.post('/essay-scoring', async (c) => {
    const ai = new GoogleGenAI({
        apiKey: c.env.GOOGLE_GENAI_API_KEY, // Replace with your Google GenAI API key
    });
    
    const body = await c.req.json();
    const { context } = body;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {
                text: `
                    You're is judging on open ended question. 
                    Analyzing this question and answer then provide a score from 1 to 10.
                    
                    Requirements:
                    - Phrase each question clearly and concisely.
                    - Language must same as the topic.
                    - Result format same as json below but add score key.

                    ${JSON.stringify(context)}
                `,
            },
        ]
    });

    const aiResponse = response.text;  
    if (!aiResponse) {
        return c.json({ error: 'No response from AI' }, 500);
    }

    const jsonResponse = extractJsonFromResponse(aiResponse);
    if (!jsonResponse) {
        return c.json({ error: 'Invalid JSON response from AI' }, 500);
    }

    return c.json({ message: 'Open ended questions scoring successfully', results: jsonResponse });
});

// Endpoint to generate Todos
app.post('/todos-generator', async (c) => {
    const ai = new GoogleGenAI({
        apiKey: c.env.GOOGLE_GENAI_API_KEY, // Replace with your Google GenAI API key
    });

    const body = await c.req.json();
    const { context } = body;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {
                text: `
                    Make 15 todo list for beginner from topic: ${context}. 
                    Response must use same language as the topic.
                    Format the response use JSON as follows:
                    {
                        "todos": [
                            {
                                "task": "What is the capital of France?",
                            },
                        ]
                    }
                `,
            },
        ]
    });

    const aiResponse = response.text;
    if (!aiResponse) {
        return c.json({ error: 'No response from AI' }, 500);
    }

    const jsonResponse = extractJsonFromResponse(aiResponse);
    if (!jsonResponse) {
        return c.json({ error: 'Invalid JSON response from AI' }, 500);
    }

    return c.json({ message: 'Todos generated successfully', todos: jsonResponse.todos });
});

// Task resource allocation endpoint
app.post('/task-resources', async (c) => {
    const ai = new GoogleGenAI({
        apiKey: c.env.GOOGLE_GENAI_API_KEY, // Replace with your Google GenAI API key
    });
    
    const body = await c.req.json();
    const { context } = body;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {
                text: `
                    You're is expert in study of topic: ${context}. 
                    Explain with deep comprehension about that.

                    Requirements:
                    - Phrase each question clearly and concisely.
                    - The language must be the same as the topic.
                    - Use markdown syntax for the response.
                    - Eliminate jargon like "as a software engineer" at the beginning or similar phrases.
                `,
            },
        ]
    });

    const aiResponse = response.text;  
    return c.json({ message: 'Open ended questions scoring successfully', result: aiResponse });
});

export default app;