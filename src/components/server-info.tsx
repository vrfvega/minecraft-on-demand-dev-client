'use client'
import { useState } from 'react'
import { Button } from "./ui/button"
import { Check, Copy, RefreshCcw } from "lucide-react"
import { useCheckServerStatus } from '@/hooks/useServer'

export default function ServerInfo() {
  const [copied, setCopied] = useState(false)
  const { data: response, isLoading, refetch } = useCheckServerStatus()

  const status = response?.data
  const error = response?.error
  const isRunning = status?.taskStatus === 'Running'
  const isStarting = status?.taskStatus === 'Pending'

  const handleCopy = async () => {
    if (status?.serverIp) {
      await navigator.clipboard.writeText(status.serverIp)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-card/50 border shadow-inner">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium">Status</span>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${isRunning
                ? "bg-green-500/20 text-green-500 dark:bg-green-500/10"
                : isStarting
                  ? "bg-yellow-500/20 text-yellow-500 dark:bg-yellow-500/10"
                  : "bg-muted text-muted-foreground"
                }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${isRunning
                  ? "bg-green-500"
                  : isStarting
                    ? "bg-yellow-500"
                    : "bg-gray-500"
                  }`}
              />
              {status?.taskStatus || ""}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => refetch()}
              disabled={isLoading}
              className="h-8 w-8"
            >
              <RefreshCcw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">IP Address</span>
          <div className="flex items-center gap-2">
            <span className="inline-flex px-3 py-1 text-xs font-medium">
              {status?.serverIp || 'Not available'}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-8 w-8"
              disabled={!status?.serverIp}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        {error && (
          <div className="mt-2 text-xs text-red-500">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  )
}
