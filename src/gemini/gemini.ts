import { Hono } from "hono";
import { GoogleGenAI } from "@google/genai";
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
                    Create a ${num}-question multiple-choice quiz on the topic of **${context}**.

                    Requirements:
                    - Difficulty level: ${difficulty}.
                    - Each question must have 1 correct answer and 3 incorrect but plausible distractors.
                    - Vary the subtopics: (search on internet today top news).
                    - Avoid repetition in the questions.
                    - Phrase each question clearly and concisely.
                    - Give each question a point value from 1 to 10.
                    - Make sure the correct answer randomize it's position in the options.
                    - Language must same as the topic.


                    Output format use JSON as follows:
                    {
                        "questions": [
                            {
                                "question": "What is the capital of France?",
                                "options": [
                                    {"id": "A", "value": "Berlin"},
                                    {"id": "B", "value": "Madrid"},
                                    {"id": "C", "value": "Paris"},
                                    {"id": "D", "value": "Rome"}
                                ],
                                "pointValue": 5,
                                "answer": "C"
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

    return c.json({ message: 'MCQs generated successfully', questions: jsonResponse.questions });
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
                    Create a ${num}-question open-ended quiz on the topic of **${context}**.

                    Requirements:
                    - Difficulty level: ${difficulty}.
                    - Vary the subtopics: (search on internet today top news).
                    - Avoid repetition in the questions.
                    - Phrase each question clearly and concisely.
                    - Language must same as the topic.

                    Output format use JSON as follows:
                    {
                        "results": [
                            {
                                "question": "What is the capital of France?",
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

    return c.json({ message: 'Open ended questions generated successfully', results: jsonResponse.results });
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
        apiKey: 'AIzaSyDX1uWD3tvf1isDRHcQu1_p6U_7IgiIri4', // Replace with your Google GenAI API key
    });
    
    const body = await c.req.json();
    const { context } = body;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {
                text: `
                    You're is expert in software engineering. 
                    Explain with deep comprehension about topic: ${context}.

                    Requirements:
                    - Phrase each question clearly and concisely.
                    - Language must same as the topic.
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