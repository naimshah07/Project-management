import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL must be set')
}

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: connectionString,
    },
  },
})
