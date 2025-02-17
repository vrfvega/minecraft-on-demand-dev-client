"use client"

import { useState, useEffect, useRef } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Loader2, Server, Power, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ApiError, ServerStatus } from "@/types/types"

export default function MinecraftPanel() {
  const { toast } = useToast()
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const pollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const initialServerStatus = () => {
    const storedStatus = localStorage.getItem('serverStatus')
    return storedStatus ? JSON.parse(storedStatus) : undefined
  }

  const {
    data: serverStatus = initialServerStatus(),
    isLoading: isLoadingStatus,
    error: statusError,
    refetch: refetchStatus,
  } = useQuery<ServerStatus, ApiError>({
    queryKey: ["serverStatus"],
    queryFn: async () => {
      const response = await fetch("https://ag3x118ir8.execute-api.us-east-1.amazonaws.com/alpha/status")
      if (!response.ok) {
        throw { status: response.status, message: "Failed to fetch server status" }
      }

      const data = await response.json()
      localStorage.setItem('serverStatus', JSON.stringify(data))
      setLastUpdate(new Date())

      // Clear any existing timeout
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current)
      }

      // Schedule next poll based on Retry-After if server is not in final state
      const retryAfter = response.headers.get("Retry-After")
      if (data.taskStatus !== "RUNNING" && data.taskStatus !== "STOPPED") {
        const retryMs = retryAfter ? Number.parseInt(retryAfter) * 1000 : 5000; // Default to 5 seconds if no Retry-After
        if (pollTimeoutRef.current) {
          clearTimeout(pollTimeoutRef.current)
        }
        pollTimeoutRef.current = setTimeout(() => {
          refetchStatus()
        }, retryMs)
      }

      return data
    },
    refetchInterval: false, // Disable tanstack's internal polling
    retry: 1,
  })

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current)
      }
    }
  }, [])

  const isLoading = isLoadingStatus && !serverStatus
  const isRunning = serverStatus?.taskStatus === "RUNNING"
  const isStarting = serverStatus?.taskStatus === "STARTING"

  const startMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("https://ag3x118ir8.execute-api.us-east-1.amazonaws.com/alpha/start", {
        method: "POST",
      })
      if (!response.ok) {
        throw { status: response.status, message: "Failed to start server" }
      }
      return response.json()
    },
    onSuccess: async () => {
      await refetchStatus()
      // Trigger an immediate status check after starting
      const response = await fetch("https://ag3x118ir8.execute-api.us-east-1.amazonaws.com/alpha/status")
      if (response.ok) {
        const retryAfter = response.headers.get("Retry-After")
        if (retryAfter) {
          const retryMs = Number.parseInt(retryAfter) * 1000
          if (pollTimeoutRef.current) {
            clearTimeout(pollTimeoutRef.current)
          }
          pollTimeoutRef.current = setTimeout(() => {
            refetchStatus()
          }, retryMs)
        }
      }
      toast({
        title: "Server starting",
        description: "The server is now starting up...",
      })
    },
    onError: (error: ApiError) => {
      if (error.status === 409) {
        toast({
          title: "Server is already running",
          description: "Please wait for the server to stop before starting it again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to start the server. Please try again.",
          variant: "destructive",
        })
      }
    },
  })

  return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md border-t-4 border-primary shadow-2xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              <CardTitle>Minecraft Server Admin</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">Manage your Minecraft server instance</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-card/50 border shadow-inner">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium">Status</span>
                  <div className="flex items-center gap-2">
                  <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          isRunning
                              ? "bg-green-500/20 text-green-500 dark:bg-green-500/10"
                              : isStarting
                                  ? "bg-yellow-500/20 text-yellow-500 dark:bg-yellow-500/10"
                                  : "bg-muted text-muted-foreground"
                      }`}
                  >
                    <span
                        className={`w-2 h-2 rounded-full ${
                            isRunning ? "bg-green-500" : isStarting ? "bg-yellow-500" : "bg-gray-500"
                        }`}
                    />
                    {isLoading ? "Loading..." : serverStatus?.taskStatus || "UNKNOWN"}
                  </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => refetchStatus()}
                        disabled={isLoadingStatus}
                        className="h-8 w-8"
                    >
                      <RefreshCcw className={`w-4 h-4 ${isLoadingStatus ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
                <div className="pb-4 flex items-center justify-between">
                  <span className="text-sm font-medium">IP Address</span>
                  <span className="inline-flex px-3 py-1 text-xs font-medium">
                    {serverStatus?.serverIp}
                  </span>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </div>
              </div>
            </div>

            <Button
                size="lg"
                className="w-full gap-2 text-base"
                variant={isRunning ? "secondary" : "default"}
                onClick={() => startMutation.mutate()}
                disabled={isRunning || isStarting || startMutation.isPending}
            >
              {startMutation.isPending || isStarting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Starting Server...
                  </>
              ) : (
                  <>
                    <Power className="w-4 h-4" />
                    Start Server
                  </>
              )}
            </Button>

            {statusError && (
                <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm text-center">
                  Failed to fetch server status. Please try again.
                </div>
            )}
          </CardContent>
        </Card>
      </div>
  )
}