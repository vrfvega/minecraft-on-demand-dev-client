'use server'

export type ServerStatus = {
  taskStatus: string,
  serverIp: string
}

export type StatusResponse = {
  data?: ServerStatus
  error?: string
  retryAfter?: number
}

export async function checkServerStatus(): Promise<StatusResponse> {
  try {
    const response = await fetch(
      "https://ab5pvvj6bg.execute-api.us-east-1.amazonaws.com/alpha/status",
      {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      return {
        error: `Failed to fetch server status: ${response.status}`,
        retryAfter: 5
      }
    }

    const data: ServerStatus = await response.json()
    const retryAfter = response.headers.get("Retry-After")

    return {
      data,
      retryAfter: retryAfter ? parseInt(retryAfter, 10) : 5
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      retryAfter: 5
    }
  }
}
