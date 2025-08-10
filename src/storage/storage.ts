import { Hono } from 'hono'
import { Storage } from '@google-cloud/storage'

const app = new Hono()
const storage = new Storage()

app.get('/gcs-upload', (c) => {
    return c.text('Hello World!')
})

export default app