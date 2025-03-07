import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Player, PlayersInfo } from "@/types/types";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface LeftColumnProps {
  Players: PlayersInfo;
}

export function LeftColumn({ Players }: LeftColumnProps) {
  const list = Players.list;
  return (
    <div className="flex gap-4 min-h-full">
      <Card className="bg-[#111] rounded-xl overflow-hidden border-[#222] min-h-full w-full flex flex-col">
        <CardHeader>
          <div className="flex flex-row justify-between">
            <h2 className="text-xl font-bold">Players</h2>
            <h2 className="text-xl font-bold">
              {Players.online} / {Players.max}
            </h2>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex">
          {list.length ? (
            <div className="w-full space-y-3">
              {list.map((player: Player) => (
                <div key={player.id} className="flex items-center gap-2">
                  <Avatar>
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{player.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center w-full">
              <h2 className="text-xl font-bold text-gray-500">
                No players online
              </h2>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
