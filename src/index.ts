import { Hono } from 'hono'
import gemini from './gemini/gemini'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
});

app.get('/api', (c) => {
  return c.text('Welcome!')
});

app.route('/api/gemini', gemini);

export default app
