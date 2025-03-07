import { PlayerList } from "@/components/left-column";
import { MiddleColumn } from "@/components/middle-column";
import { ServerHeader } from "@/components/server-header";
import ServerInfo from "@/components/server-info";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import React from "react";

export default function Page() {
  return (
    <div className="min-h-screen bg-black text-white p-12 space-y-4">
      <ServerHeader />
      <div className="max-w-full grid grid-cols-1 md:grid-rows-2 gap-4 h-full ">
        <div className="grid grid-cols-2 min-h-full space-x-4">
          <div className="grid grid-rows-4 space-y-4">
            <Card className="bg-[#111] flex rounded-xl items-center overflow-hidden border-[#222]">
              <CardContent className="p-4  w-full">
                <ServerInfo />
              </CardContent>
            </Card>
            <div className="row-span-3">
              <PlayerList />
            </div>
          </div>
          <Card className="bg-[#111] rounded-xl overflow-hidden border-[#222] h-full">
            <CardHeader>
              <h2 className="text-xl font-bold">Console</h2>
            </CardHeader>
          </Card>
        </div>
        <div className="md:col-span-1 min-h-full">
          <MiddleColumn />
        </div>
      </div>
    </div>
  );
}
