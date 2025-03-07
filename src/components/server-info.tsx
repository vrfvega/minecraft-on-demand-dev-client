"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Check, Copy, RefreshCcw } from "lucide-react";
import { useMcServerStatus } from "@/hooks/useMinecraftServer";
import { Skeleton } from "./ui/skeleton";

export default function ServerInfo() {
  const [copied, setCopied] = useState(false);
  const {
    data: serverResponse,
    refetch,
    isLoading,
    error,
  } = useMcServerStatus();

  const serverInfo = serverResponse?.data;
  const handleCopy = async () => {
    if (serverInfo?.host) {
      await navigator.clipboard.writeText(serverInfo.host);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Status</h2>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Skeleton className="h-6 w-20 rounded-full" />
          ) : (
            <h2
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-lg font-medium ${
                serverInfo?.online
                  ? "bg-green-500/20 text-green-500 dark:bg-green-500/10"
                  : "bg-red-500/20 text-red-500 dark:bg-red-500/10"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  serverInfo?.online ? "bg-green-500" : "bg-red-500"
                }`}
              />
              {serverInfo?.online ? "Online" : "Offline"}
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={isLoading}
            className="h-8 w-8"
          >
            <RefreshCcw
              className={`w-8 h-8 ${isLoading ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">IP Address</h2>
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Skeleton className="h-6 w-28" />
          ) : (
            <h2 className="inline-flex px-3 py-1 text-lg font-medium">
              {serverInfo?.host || "Not available"}
            </h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-8 w-8"
            disabled={isLoading || !serverInfo?.host}
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
        <div className="mt-2 text-lg text-red-500">Error: {error.message}</div>
      )}
    </div>
  );
}
