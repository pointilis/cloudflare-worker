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
    const prompt = `Generate learning path with topic "${topic}" within 30 - 60 milestones for a ${expertise_level} learner.

Rules:
    - Result must fully expanded 30 - 60 milestones.
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
            "type": 'json_schema',
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


// Generate tasks
app.post('/generate-tasks', async (c) => {
    const body = await c.req.json();
    const { milestone, topic } = body;

    const client = new OpenAI({ apiKey: c.env.OPENAI_API_KEY });
    const prompt = `Generate 10 - 50 tasks for milestone: ${milestone}.
Results should not be taken out the main topic: ${topic}.

Rules:
    - Result must fully expanded 10 - 50 tasks.
    - Each task is actionable and has a clear objective.
    - Give estimates in hours for the duration of each task.
    - The tasks are relevant to the milestone.
    - Make sure ordering of tasks is logical and sequential.
    - The language of the response must be the same as language of the topic.`;

    const response = await client.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: `You are a helpful assistant that helps people find information about ${milestone} and ${topic}.`
            },
            {
                role: 'user',
                content: prompt
            }
        ],
        model: "gpt-5-mini",
        store: false,
        response_format: {
            "type": 'json_schema',
            "json_schema": {
                "name": "user_schema",
                "schema": {
                    "type": "object",
                    "properties": {
                        "tasks": {
                            "type": "array",
                            "items": {
                                "type": "object",
                                "properties": {
                                    "order": {"type": "integer"},
                                    "duration": {"type": "integer"},
                                    "title": {"type": "string"},
                                },
                            },
                            "required": ["order", "duration", "title"]
                        }
                    },
                    "required": ["tasks"]
                },
                "strict": false
            }
        },
    });

    const aiResponse = response.choices[0].message.content;
    return c.json({ 
        message: 'Tasks generated successfully', 
        result: aiResponse ? JSON.parse(aiResponse) : null, 
    });
});

export default app;