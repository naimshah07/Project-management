import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import cors from 'cors'
import { clerkMiddleware } from '@clerk/express'
import { serve } from 'inngest/express'
import { inngest, functions } from './inngest/index.js'
import clerkWebhook from './routes/clerkWebhook.js'
import workspaceRouter from './routes/workspaceRoutes.js'
import { protect } from './middlewares/authMiddleware.js'
import projectRouter from './routes/projectRoutes.js'
import { taskRouter } from './routes/taskRoutes.js'
import commentRouter from './routes/commentRoutes.js'
const app = express()

app.use(cors());
app.use(clerkMiddleware());

app.use('/api/inngest', serve({ client: inngest, functions }))
app.use('/api/clerk/webhook', clerkWebhook)
app.use(express.json());

//Routes
app.use('/api/workspaces', protect, workspaceRouter)
app.use('/api/projects', protect, projectRouter)
app.use('/api/tasks', protect, taskRouter)
app.use('/api/comments', protect, commentRouter)

app.get('/', (req, res) => res.send("Server is live"));

const PORT = process.env.port || 5000;

app.listen(PORT, () => console.log(`server is running on http://localhost:${PORT}`)
)