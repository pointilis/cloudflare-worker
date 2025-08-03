import { Hono } from 'hono';
import { OpenAI } from 'openai';

const app = new Hono();

app.post('/mcq-generator', async (c) => {
    const body = await c.req.json();
    const { context } = body;

    const openai = new OpenAI({
        apiKey: 'YOUR_OPENAI_API_KEY', // Replace with your OpenAI API key
    });

    const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
            {
                role: 'user',
                content: context,
            },
        ],
    });

    return c.json({ message: 'MCQs generated successfully' });
});

export default app;