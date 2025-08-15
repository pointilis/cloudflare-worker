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
    console.log(c.env)
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
                    You're an expert in this topic: ${context}. 
                    Generate 20 multiple-choice questions (MCQs) with 4 options each and their point values.
                    Max one sentence each questions.
                    Provide the correct answer for each question.
                    Response must use same language as the topic.
                    Give points to each questions based on the level of difficulty, the points range is 1 - 10 and store points to key 'pointValue'.
                    Make sure the correct answer randomize its position in the options.
                    Format the response use JSON as follows:
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
    const { context } = body;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            {
                text: `
                    You're an expert in this context: ${context}. 
                    Generate ONLY 5 essay questions on this topic with one sentence max for each question.
                    Response must use same language as the topic.
                    Format the response use JSON as follows:
                    {
                        "essays": [
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

    return c.json({ message: 'Essay generated successfully', essay: jsonResponse.essays });
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
                    You're is judging essays. 
                    Analyzing this question and answer then provide a score from 1 to 10.
                    Result format same as json below but add score key.
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

    return c.json({ message: 'Essay scoring successfully', results: jsonResponse });
});

// Endpoint to generate Todos
app.post('/todos-generator', async (c) => {
    console.log(c.env)
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
                    You're an expert in this topic: ${context}. 
                    Generate top 15 important todo items.
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

export default app;