import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import ServerStartForm from "./server-start-form";

export function MiddleColumn() {
  return (
    <div className="grid grid-rows-2 gap-4 h-full">
      <Card className="bg-[#111] rounded-xl overflow-hidden border-[#222]">
        <CardContent className="p-4">
          <ServerStartForm />
        </CardContent>
      </Card>
    </div>
  );
}
