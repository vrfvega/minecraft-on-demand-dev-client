import { useQuery } from '@tanstack/react-query';

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
      "https://ag3x118ir8.execute-api.us-east-1.amazonaws.com/alpha/status",
      {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return {
        error: `Failed to fetch server status: ${response.status}`,
        retryAfter: 5
      };
    }

    const data: ServerStatus = await response.json();
    const retryAfter = response.headers.get("Retry-After");

    return {
      data,
      retryAfter: retryAfter ? parseInt(retryAfter, 10) : 5
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      retryAfter: 5
    };
  }
};

export const useCheckServerStatus = () => {
  return useQuery<StatusResponse>({
    queryKey: ['serverStatus'],
    queryFn: checkServerStatus,
    refetchInterval: (query) => {
      // Use the retryAfter value from the response, or default to 5 seconds
      const data = query.state.data as StatusResponse | undefined;
      return (data?.retryAfter ?? 5) * 1000;
    },
    retry: (failureCount, error) => {
      // Only retry if we have a retryAfter value and haven't failed too many times
      return (error as StatusResponse)?.retryAfter !== undefined && failureCount < 3;
    },
  });
};;
