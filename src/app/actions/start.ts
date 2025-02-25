'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'

// Define the task input schema
const taskInputSchema = z.object({
  type: z.enum(["VANILLA", "FABRIC"]),
  version: z.string(),
  datapacks: z.string().optional(),
  mods: z.string().optional(),
})

type TaskInput = z.infer<typeof taskInputSchema>

export type StartServerResponse = {
  success?: boolean
  error?: {
    type: 'VALIDATION' | 'CONFLICT' | 'SERVER'
    message: string
  }
  retryAfter?: number
}

export async function startServer(
  serverType: "VANILLA" | "FABRIC",
  datapacks: string[],
  mods: string[]
): Promise<StartServerResponse> {
  try {
    const taskInput: TaskInput = {
      type: serverType,
      version: "1.20.1",
      datapacks: datapacks.length > 0 ? datapacks.join(",") : "",
      mods: mods.length > 0 ? mods.join(",") : "",
    }

    // Validate input
    try {
      taskInputSchema.parse(taskInput)
    } catch (err) {
      if (err instanceof z.ZodError) {
        return {
          error: {
            type: 'VALIDATION',
            message: err.errors[0].message
          }
        }
      }
    }

    // Start server request
    const response = await fetch(
      "https://ab5pvvj6bg.execute-api.us-east-1.amazonaws.com/alpha/start",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskInput }),
      }
    )

    if (!response.ok) {
      if (response.status === 409) {
        return {
          error: {
            type: 'CONFLICT',
            message: "Server is already running"
          }
        }
      }
      throw new Error("Failed to start server")
    }

    // Get retry timing from status endpoint
    const statusResponse = await fetch(
      "https://ab5pvvj6bg.execute-api.us-east-1.amazonaws.com/alpha/status"
    )

    const retryAfter = statusResponse.ok
      ? statusResponse.headers.get("Retry-After")
      : null

    revalidatePath('/server') // Adjust this path as needed

    return {
      success: true,
      retryAfter: retryAfter ? parseInt(retryAfter, 10) : undefined
    }

  } catch (error) {
    return {
      error: {
        type: 'SERVER',
        message: error instanceof Error
          ? error.message
          : "Failed to start server"
      }
    }
  }
}
