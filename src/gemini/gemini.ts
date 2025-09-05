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
    const { context, difficulty, lesson, num, user, topic } = body;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {
                text: `
                    Generate ${num}-question with the type is **multiple-choice** based on the topic of **${context}**.
                    Results should not be taken out of context: ${topic}.

                    Requirements:
                    - Difficulty level: ${difficulty}.
                    - Each question must have 1 correct answer and 3 incorrect but plausible distractors.
                    - Options ID must char (a, b, c, d, etc.).
                    - Correct answer must be one of the options provided with ID.
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
                        correctAnswer: { type: Type.STRING },
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
    const { context, difficulty, lesson, num, user, topic  } = body;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {
                text: `
                    Generate ${num}-question with the type is **open-ended** based on the topic of **${context}**.
                    Results should not be taken out of context: ${topic}.
                    
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
    const question = context.question;
    const answer = context.answer;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {
                text: `
                    You're is judging on open ended question. Analyzing this question and answer.

                    Question: ${question}
                    Answer: ${answer}

                    Requirements:
                    - Phrase each question clearly and concisely.
                    - The language of the response must be the same as language of the topic.
                    - Give a score from 1 to 10 based on the quality of the answer.
                    - Don't forget to provide feedback on how to improve the answer.
                    - Use markdown syntax for the feedback content.
                `,
            },
        ],
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    score: { type: Type.NUMBER },
                    feedback: { type: Type.STRING },
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

    return c.json({ message: 'Open ended questions scoring successfully', result: jsonResponse });
});

// Task resource allocation endpoint
app.post('/task-resources', async (c) => {
    const ai = new GoogleGenAI({
        apiKey: c.env.GOOGLE_GENAI_API_KEY, // Replace with your Google GenAI API key
    });
    
    const body = await c.req.json();
    const { context, topic } = body;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {
                text: `
                    You're is expert in study of topic: ${context}.
                    Results should not be taken out of context: ${topic}.
                    Explain with deep comprehension about that.

                    Requirements:
                    - Phrase each question clearly and concisely.
                    - The language must be the same as the topic.
                    - Use markdown syntax for the response content.
                    - Eliminate jargon like "as a software engineer" at the beginning or similar phrases.
                    - Don't forget give reading time estimation in minutes.
                `,
            },
        ],
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    content: { type: Type.STRING },
                    reading_time: { type: Type.NUMBER },
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

    return c.json({ message: 'Resources allocated successfully', result: jsonResponse });
});

export default app;