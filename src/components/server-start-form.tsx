"use client";

import { useState, useTransition } from "react";
import { Loader2, Power, Plus, X } from "lucide-react";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { startServer } from "@/app/actions/start";
import { useToast } from "@/hooks/use-toast";

export default function ServerStartForm() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [serverType, setServerType] = useState<"VANILLA" | "FABRIC">("FABRIC");
  const [datapacks, setDatapacks] = useState<string[]>([]);
  const [mods, setMods] = useState<string[]>([]);
  const [newDatapack, setNewDatapack] = useState("");
  const [newMod, setNewMod] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      const result = await startServer(serverType, datapacks, mods);

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
    });
  }

  function handleAddDatapack() {
    if (newDatapack && !datapacks.includes(newDatapack)) {
      setDatapacks([...datapacks, newDatapack]);
      setNewDatapack("");
    }
  }

  function handleAddMod() {
    if (newMod && !mods.includes(newMod)) {
      setMods([...mods, newMod]);
      setNewMod("");
    }
  }

  function handleDatapackKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddDatapack();
    }
  }

  function handleModKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddMod();
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
                <Label htmlFor="serverType">Type</Label>
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
                      onChange={(e) => setNewDatapack(e.target.value)}
                      onKeyDown={handleDatapackKeyDown}
                      placeholder="Enter datapack URL"
                      type="url"
                    />
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    onClick={handleAddDatapack}
                    disabled={!newDatapack}
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
                        value={newMod}
                        onChange={(e) => setNewMod(e.target.value)}
                        onKeyDown={handleModKeyDown}
                        placeholder="Enter mod URL"
                        type="url"
                      />
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      onClick={handleAddMod}
                      disabled={!newMod}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {mods.map((mod, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm bg-muted p-2 rounded"
                      >
                        <span className="flex-1 truncate">{mod}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            setMods(mods.filter((_, i) => i !== index))
                          }
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
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
