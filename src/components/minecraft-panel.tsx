"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { Loader2, Server, Power } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ApiError, ServerStatus } from "@/types/types"

export default function MinecraftPanel() {
  const { toast } = useToast()
  const [pollInterval, setPollInterval] = useState(5000)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  const {
    data: serverStatus,
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
      const retryAfter = response.headers.get("Retry-After")
      if (retryAfter) {
        setPollInterval(Number.parseInt(retryAfter) * 1000)
      }
      setLastUpdate(new Date())
      return response.json()
    },
    refetchInterval: pollInterval,
  })

  // Debug logging for polling
  useEffect(() => {
    console.log("Current poll interval:", pollInterval)
    console.log("Last update:", lastUpdate.toISOString())
    console.log("Current status:", serverStatus)
  }, [pollInterval, lastUpdate, serverStatus])

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
    onSuccess: () => {
      refetchStatus()
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

  const isRunning = serverStatus?.taskStatus === "RUNNING"
  const isStarting = serverStatus?.taskStatus === "STARTING"

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
                  {isLoadingStatus ? "Checking..." : serverStatus?.taskStatus || "UNKNOWN"}
                </span>
              </div>
              {serverStatus?.serverIp && (
                <div className="space-y-1.5">
                  <span className="text-sm font-medium text-muted-foreground">Server IP</span>
                  <div className="p-2 bg-muted rounded-md font-mono text-sm break-all">{serverStatus.serverIp}</div>
                </div>
              )}
              <div className="mt-2 text-xs text-muted-foreground">Last updated: {lastUpdate.toLocaleTimeString()}</div>
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
              Failed to fetch server status. Please refresh the page.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}