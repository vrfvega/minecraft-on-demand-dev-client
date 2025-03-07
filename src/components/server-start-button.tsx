"use client";

import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useStartServer } from "@/hooks/useServerStart";
import { useServerStartStore } from "@/lib/store/server-config-store";
import { Loader2, Power } from "lucide-react";

export function ServerStartButton() {
  const { toast } = useToast();
  const { mutate: startServer, isPending } = useStartServer();

  // Get form data from the store
  const { getFormData } = useServerStartStore();

  function handleStartServer() {
    const formData = getFormData();

    startServer(formData, {
      onSuccess: (result) => {
        if (result.error) {
          switch (result.error.type) {
            case "VALIDATION":
              toast({
                title: "Validation Error",
                description: result.error.message,
                variant: "destructive",
              });
              break;
            case "CONFLICT":
              toast({
                title: "Server is busy",
                description:
                  "A server instance is currently active. Wait for it to stop or stop it manually.",
                variant: "destructive",
              });
              break;
            case "SERVER":
              toast({
                title: "Error",
                description: "Failed to start the server. Please try again.",
                variant: "destructive",
              });
              break;
          }
          return;
        }

        if (result.success) {
          toast({
            title: "Request accepted",
            description:
              "Server startup initiated. This may take a few minutes...",
          });
        }
      },
    });
  }

  return (
    <Button
      onClick={handleStartServer}
      size="lg"
      className="w-full gap-2 text-base"
      disabled={isPending}
    >
      {isPending ? (
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
  );
}
