import { Hono } from 'hono'
import gemini from './gemini/gemini'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/gemini', gemini);

export default app
