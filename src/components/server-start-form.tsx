"use client";

import { useState } from "react";
import { Loader2, Power, Plus, X, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useToast } from "@/hooks/use-toast";
import { useStartServer } from "@/hooks/useServerStart";
import { z } from "zod";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

// Zod schemas for validation
const urlSchema = z.string().url().optional().or(z.literal(""));

export default function ServerStartForm() {
  const { toast } = useToast();
  const { mutate: startServer, isPending } = useStartServer();

  const [serverType, setServerType] = useState<"VANILLA" | "FABRIC">("FABRIC");
  const [datapacks, setDatapacks] = useState<string[]>([]);
  const [modpack, setModPack] = useState<string>("");
  const [newDatapack, setNewDatapack] = useState("");

  // Validation error states
  const [newDatapackError, setNewDatapackError] = useState<string | null>(null);
  const [modpackError, setModpackError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startServer(
      {
        serverType,
        dataPacks: datapacks,
        modPack: modpack,
      },
      {
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
      },
    );
  }

  function validateDatapackUrl(url: string): boolean {
    try {
      // Skip validation if empty
      if (!url.trim()) {
        setNewDatapackError(null);
        return true;
      }

      urlSchema.parse(url);
      setNewDatapackError(null);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setNewDatapackError("Please enter a valid URL");
      }
      return false;
    }
  }

  function validateModpackUrl(url: string): boolean {
    try {
      // Skip validation if empty
      if (!url.trim()) {
        setModpackError(null);
        return true;
      }

      urlSchema.parse(url);
      setModpackError(null);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setModpackError("Please enter a valid URL");
      }
      return false;
    }
  }

  function handleAddDatapack() {
    const isValid = validateDatapackUrl(newDatapack);

    if (isValid && newDatapack.trim() && !datapacks.includes(newDatapack)) {
      setDatapacks([...datapacks, newDatapack]);
      setNewDatapack("");
      setNewDatapackError(null);
    }
  }

  function handleDatapackKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddDatapack();
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="server-settings" className="border-b-0 pb-0">
          <AccordionTrigger>Settings</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="serverType">Server Type</Label>
                <Select
                  value={serverType}
                  onValueChange={(value: "VANILLA" | "FABRIC") =>
                    setServerType(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select server type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VANILLA">Vanilla</SelectItem>
                    <SelectItem value="FABRIC">Fabric</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Datapacks</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      value={newDatapack}
                      onChange={(e) => {
                        setNewDatapack(e.target.value);
                        if (e.target.value) validateDatapackUrl(e.target.value);
                      }}
                      onBlur={() => validateDatapackUrl(newDatapack)}
                      onKeyDown={handleDatapackKeyDown}
                      placeholder="Enter datapack(s) URL (optional)"
                      type="url"
                      className={newDatapackError ? "border-red-500" : ""}
                    />
                    {newDatapackError && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {newDatapackError}
                      </p>
                    )}
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    onClick={handleAddDatapack}
                    disabled={!newDatapack || !!newDatapackError}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {datapacks.map((datapack, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm bg-muted p-2 rounded"
                    >
                      <span className="flex-1 truncate">{datapack}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setDatapacks(datapacks.filter((_, i) => i !== index))
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {serverType === "FABRIC" && (
                <div className="space-y-2">
                  <Label>Modpack</Label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Input
                        value={modpack}
                        onChange={(e) => {
                          setModPack(e.target.value);
                          if (e.target.value)
                            validateModpackUrl(e.target.value);
                        }}
                        onBlur={() => validateModpackUrl(modpack)}
                        placeholder="Enter modpack URL (optional)"
                        type="url"
                        className={modpackError ? "border-red-500" : ""}
                      />
                      {modpackError && (
                        <p className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          {modpackError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Button
        type="submit"
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
    </form>
  );
}
