export interface ServerStatus {
  taskStatus: string;
  serverIp: string;
}

export interface ApiError {
  message: string;
  status: number;
}

export interface Player {
  id: string;
  name: string;
}

export interface PlayersInfo {
  online: number;
  max: number;
  list: Player[];
}

interface modInfo {
  version: string;
  name: string;
}

export interface ServerInfo {
  online: boolean;
  players: PlayersInfo;
  mods: modInfo[];
}
