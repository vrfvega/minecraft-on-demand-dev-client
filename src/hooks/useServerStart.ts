import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const taskInputSchema = z.object({
  type: z.enum(["VANILLA", "FABRIC"]),
  version: z.string(),
  datapacks: z.string().optional(),
  modpack: z.string().url().optional(),
});

type TaskInput = z.infer<typeof taskInputSchema>;

export type StartServerResponse = {
  success?: boolean;
  error?: {
    type: "VALIDATION" | "CONFLICT" | "SERVER";
    message: string;
  };
};

type StartServerParams = {
  serverType: "VANILLA" | "FABRIC";
  dataPacks: string[];
  modPack: string;
};

const startServer = async ({
  serverType,
  dataPacks,
  modPack,
}: StartServerParams): Promise<StartServerResponse> => {
  const taskInput: TaskInput = {
    type: serverType,
    version: "1.20.1",
    datapacks: dataPacks.length > 0 ? dataPacks.join(",") : "",
    modpack: modPack,
  };

  // Start server request
  const response = await fetch(
    "https://ab5pvvj6bg.execute-api.us-east-1.amazonaws.com/alpha/start",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ taskInput }),
    },
  );

  if (!response.ok) {
    if (response.status === 409) {
      return {
        error: {
          type: "CONFLICT",
          message: "Server is already running",
        },
      };
    }
    throw new Error("Failed to start server");
  }

  return { success: true };
};

export const useStartServer = () => {
  return useMutation({
    mutationFn: startServer,
    onError: (error) => {
      return {
        error: {
          type: "SERVER",
          message:
            error instanceof Error ? error.message : "Failed to start server",
        },
      };
    },
  });
};
