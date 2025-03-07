"use client";

import { Plus, X, AlertCircle } from "lucide-react";
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
import { useServerStartStore } from "@/lib/store/server-config-store";
import { VersionSelect } from "./ui/minecraft-version-select";

export default function ServerStartForm() {
  // Use the store
  const {
    serverType,
    version,
    datapacks,
    modpack,
    newDatapack,
    newDatapackError,
    modpackError,
    setServerType,
    setVersion,
    setModpack,
    setNewDatapack,
    addDatapack,
    removeDatapack,
  } = useServerStartStore();

  function handleDatapackKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addDatapack();
    }
  }

  return (
    <div className="space-y-10">
      {/* Row 1: Server Type and Version */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="serverType" className="text-lg">
            Server Type
          </Label>
          <Select
            value={serverType}
            onValueChange={(value: "VANILLA" | "FABRIC") =>
              setServerType(value)
            }
          >
            <SelectTrigger className="h-[60px]">
              <SelectValue placeholder="Select server type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VANILLA">Vanilla</SelectItem>
              <SelectItem value="FABRIC">Fabric</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="version" className="text-lg">
            Version
          </Label>
          <VersionSelect
            value={version}
            onChange={setVersion}
            className="h-[60px]"
          />
        </div>
      </div>

      {/* Row 2: Datapacks and Modpack (if FABRIC) */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-lg">Datapacks</Label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                value={newDatapack}
                onChange={(e) => setNewDatapack(e.target.value)}
                onKeyDown={handleDatapackKeyDown}
                placeholder="Enter datapack URL (optional)"
                type="url"
                className={`${modpackError ? "border-red-500" : ""} h-[60px]`}
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
              onClick={addDatapack}
              disabled={!newDatapack || !!newDatapackError}
              className="h-[60px] w-[60px]"
            >
              <Plus className="h-8 w-8" />
            </Button>
          </div>
        </div>

        {serverType === "FABRIC" ? (
          <div className="space-y-2">
            <Label className="text-lg">Modpack</Label>
            <div className="flex-1">
              <Input
                value={modpack}
                onChange={(e) => setModpack(e.target.value)}
                placeholder="Enter modpack URL (optional)"
                type="url"
                className={`${modpackError ? "border-red-500" : ""} h-[60px]`}
              />
              {modpackError && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {modpackError}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Empty div for grid alignment when not FABRIC */}
          </div>
        )}
      </div>

      {/* Datapacks List */}
      {datapacks.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Added Datapacks:</p>
          <div className="grid grid-cols-2 gap-2">
            {datapacks.map((datapack, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-xs bg-muted p-2 rounded"
              >
                <span className="flex-1 truncate">{datapack}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDatapack(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
