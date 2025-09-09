import { Hono } from 'hono'
import gemini from './gemini/gemini'
import { cors } from 'hono/cors';
import openai from './openai/openai';

const app = new Hono()
app.use(cors({
  origin: '*', // Allow all origins
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific methods
  allowHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
}));

app.get('/', (c) => {
  return c.text('Hello Hono!')
});

app.route('/api/gemini', gemini);
app.route('/api/openai', openai);

export default app;
