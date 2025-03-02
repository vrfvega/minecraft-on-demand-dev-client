"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Check, Copy, RefreshCcw } from "lucide-react";
import { checkServerStatus, type ServerStatus } from "@/app/actions/status";

export default function ServerInfo() {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const isRunning = status?.taskStatus === "Running";
  const isStarting = status?.taskStatus === "Pending";

  const checkStatus = async () => {
    setIsLoading(true);
    try {
      const result = await checkServerStatus();

      if (result.error) {
        setError(result.error);
        setStatus(null);
      } else if (result.data) {
        setStatus(result.data);
        setError(null);

        setTimeout(checkStatus, (result.retryAfter || 30) * 1000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to check status");
      setStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (status?.serverIp) {
      await navigator.clipboard.writeText(status.serverIp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  return (
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
                isRunning
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
            onClick={checkStatus}
            disabled={isLoading}
            className="h-8 w-8"
          >
            <RefreshCcw
              className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">IP Address</span>
        <div className="flex items-center gap-2">
          <span className="inline-flex px-3 py-1 text-xs font-medium">
            {status?.serverIp || "Not available"}
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
      {error && <div className="mt-2 text-xs text-red-500">Error: {error}</div>}
    </div>
  );
}
