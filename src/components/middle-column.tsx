import React from "react";
import { Card } from "@/components/ui/card";
import ServerInfo from "./server-info";

export function MiddleColumn() {
  return (
    <div className="grid grid-rows-2 gap-4 h-full">
      {/* Main Profile Section */}
      <Card className="bg-[#111] rounded-xl overflow-hidden border-[#222]">
        <ServerInfo />
      </Card>

      {/* Satisfied Partners */}
      <Card className="bg-[#111] rounded-xl overflow-hidden border-[#222]"></Card>
    </div>
  );
}
