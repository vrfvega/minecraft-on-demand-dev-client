import { useQuery } from "@tanstack/react-query";

const fetchMcStatus = async (serverAddress: string) => {
  const response = await fetch(
    `https://api.mcstatus.io/v2/status/java/${serverAddress}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch server status: ${response.status}`);
  }
  const data = await response.json();

  return {
    data,
  };
};

export const useMcServerStatus = (
  serverAddress: string = "pz-craft.online",
) => {
  return useQuery({
    queryKey: ["mcStatus", serverAddress],
    queryFn: () => fetchMcStatus(serverAddress),
    refetchInterval: 1000, // Refetch every second

    retry: 3,
  });
};

const fetchMinecraftVersions = async (): Promise<string[]> => {
  const response = await fetch("https://mc-versions-api.net/api/java");

  if (!response.ok) {
    throw new Error("Failed to fetch Minecraft versions");
  }

  const data = await response.json();
  return data.result;
};

export const useMinecraftVersions = () => {
  return useQuery({
    queryKey: ["minecraftVersions"],
    queryFn: fetchMinecraftVersions,
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};
