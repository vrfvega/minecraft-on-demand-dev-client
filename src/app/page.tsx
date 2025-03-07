import { LeftColumn } from "@/components/left-column";
import { MiddleColumn } from "@/components/middle-column";
import { RightColumn } from "@/components/right-column";
import { PlayersInfo } from "@/types/types";
import React from "react";

const mockPlayersInfo: PlayersInfo = {
  online: 3,
  max: 20,
  list: [
    // { id: "a", name: "Player 1" },
    // { id: "b", name: "Player 2" },
    // { id: "c", name: "Player 3" },
  ],
};
export default function Page() {
  return (
    <div className="min-h-screen bg-black text-white p-12">
      <div className="max-w-full mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        <div className="md:col-span-1 min-h-full">
          <LeftColumn Players={mockPlayersInfo} />
        </div>
        <div className="md:col-span-1 min-h-full">
          <MiddleColumn />
        </div>
        <div className="md:col-span-1 min-h-full">
          <RightColumn />
        </div>
      </div>
    </div>
  );
}
