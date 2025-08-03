import { Hono } from "hono";
import { GoogleGenAI } from "@google/genai";
import { extractJsonFromResponse } from "../helpers";

type Bindings = {
    GOOGLE_GENAI_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Endpoint to generate MCQs
app.post('/mcq-generator', async (c) => {
    console.log(c)
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
                    Generate 10 multiple-choice questions (MCQs) with 4 options each and their point values.
                    Provide the correct answer for each question.
                    Format the response use JSON as follows:
                    {
                        "questions": [
                            {
                                "question": "What is the capital of France?",
                                "options": [
                                    {"id": "A", "value": "Berlin", "pointValue": 1},
                                    {"id": "B", "value": "Madrid", "pointValue": 3},
                                    {"id": "C", "value": "Paris", "pointValue": 2},
                                    {"id": "D", "value": "Rome", "pointValue": 5}
                                ],
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

    return c.json({ message: 'MCQs generated successfully', questions: jsonResponse });
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
                    Generate 5 essays questions on this topic.
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

    return c.json({ message: 'Essay generated successfully', essay: jsonResponse });
});

export default app;
