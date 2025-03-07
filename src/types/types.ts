export interface ServerStatus {
  taskStatus: string;
  serverIp: string;
}

export interface ApiError {
  message: string;
  status: number;
}

interface MinecraftPlayer {
  uuid: string;
  name_clean: string;
}

export interface MinecraftServerStatus {
  online: boolean;
  host: string;
  port: number;
  eula_blocked: boolean;
  retrieved_at: number;
  expires_at: number;
  version: {
    name_raw: string;
    name_clean: string;
    name_html: string;
    protocol: number;
  };
  players: {
    online: number;
    max: number;
    list: MinecraftPlayer[];
  };
  motd: {
    raw: string;
    clean: string;
    html: string;
  };
  icon: string | null;
  mods:
    | {
        name: string;
        version: string;
      }[]
    | null;
}

// Adjust this to match any custom player data you might want to add
export interface Player {
  uuid: string;
  name_clean: string;
}

export interface PlayersInfo {
  online: number;
  max: number;
  list: Player[];
}
