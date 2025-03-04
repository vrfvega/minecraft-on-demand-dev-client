import { useQuery } from "@tanstack/react-query";

export type ServerStatus = {
  taskStatus: string;
  serverIp: string;
};

export type StatusResponse = {
  data?: ServerStatus;
  error?: string;
  retryAfter?: number;
};

const checkServerStatus = async (): Promise<StatusResponse> => {
  try {
    const response = await fetch(
      "https://ab5pvvj6bg.execute-api.us-east-1.amazonaws.com/alpha/status",
    );

    if (!response.ok) {
      return {
        error: `Failed to fetch server status: ${response.status}`,
        retryAfter: 15,
      };
    }

    const data: ServerStatus = await response.json();
    const retryAfter = response.headers.get("Retry-After");
    console.log(retryAfter);

    return {
      data,
      retryAfter: retryAfter ? parseInt(retryAfter, 10) : 15,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
      retryAfter: 15,
    };
  }
};

export const useCheckServerStatus = () => {
  return useQuery<StatusResponse>({
    queryKey: ["serverStatus"],
    queryFn: checkServerStatus,
    refetchIntervalInBackground: false,
    refetchInterval: (query) => {
      const data = query.state.data as StatusResponse | undefined;
      return data?.retryAfter ? data.retryAfter * 1000 : 15 * 1000;
    },
    retry: (failureCount, error) => {
      return (
        (error as StatusResponse)?.retryAfter !== undefined && failureCount < 3
      );
    },
  });
};
