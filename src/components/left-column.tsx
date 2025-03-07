"use client";

import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useMcServerStatus } from "@/hooks/useMinecraftServer";
import { Player } from "@/types/types";
import { Skeleton } from "./ui/skeleton";

export function PlayerList() {
  const { data: playersInfo, isLoading } = useMcServerStatus();
  console.log(playersInfo);

  const players = playersInfo?.data.players;
  return (
    <div className="flex gap-4 min-h-full">
      <Card className="bg-[#111] rounded-xl overflow-hidden border-[#222] min-h-full w-full flex flex-col">
        <CardHeader>
          <div className="flex flex-row justify-between">
            <h2 className="text-xl font-bold">Players</h2>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <h2 className="text-xl font-bold">
                {players ? `${players.online} / ${players.max}` : "0 / 0"}
              </h2>
            )}
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex">
          {isLoading ? (
            <div className="w-full space-y-3">
              {[...Array(3)].map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="flex items-center gap-2"
                >
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>
          ) : players?.list?.length ? (
            <div className="w-full space-y-3">
              {players.list.map((player: Player) => (
                <div key={player.uuid} className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage
                      src={`https://api.mineatar.io/face/${player.uuid}`}
                    />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{player.name_clean}</span>
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
