import { Hono } from 'hono';
import { OpenAI } from 'openai';

type Bindings = {
    OPENAI_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Generate milestones
app.post('/generate-milestones', async (c) => {
    const body = await c.req.json();
    const { expertise_level, topic } = body;

    const client = new OpenAI({ apiKey: c.env.OPENAI_API_KEY });
    const prompt = `Generate learning path with topic "{topic}" in 120 hours for a ${expertise_level} learner.
Each day learning duration is 1 hours.

Rules:
    - Result must fully expanded 120 hours.
    - Make sure ordering of milestones is logical and sequential.
    - Make sure number of milestones is appropriate for the duration and period.
    - Don't insert words like "Day 1" or similar into milestones.
    - The language of the response must be the same as language of the topic.`;

    const response = await client.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: `You are a helpful assistant that helps people find information about ${topic}.`
            },
            {
                role: 'user',
                content: prompt
            }
        ],
        model: "gpt-5-mini",
        store: false,
        response_format: {
            type: 'json_schema',
            "json_schema": {
                "name": "user_schema",
                "schema": {
                    "type": "object",
                    "properties": {
                        "milestones": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "order": {"type": "integer"},
                                    "duration": {"type": "integer"},
                                    "period": {"type": "string"},
                                    "title": {"type": "string"},
                                },
                            },
                            "required": ["order", "duration", "period", "title"]
                        }
                    },
                    "required": ["milestones"]
                },
                "strict": false
            }
        },
    });

    const aiResponse = response.choices[0].message.content;
    return c.json({ 
        message: 'Milestones generated successfully', 
        result: aiResponse ? JSON.parse(aiResponse) : null, 
    });
});

export default app;