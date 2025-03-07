"use client";

import { ServerStartButton } from "./server-start-button";

export function ServerHeader() {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-3xl font-bold">Minecraft Server</h2>
      <div className="flex items-center space-x-4">
        <ServerStartButton />
      </div>
    </div>
  );
}
