"use client";

import { create } from "zustand";
import { z } from "zod";

interface ServerStartState {
  // State
  serverType: "VANILLA" | "FABRIC";
  version: string;
  datapacks: string[];
  modpack: string;
  newDatapack: string;

  // Validation errors
  newDatapackError: string | null;
  modpackError: string | null;

  // Actions
  setServerType: (type: "VANILLA" | "FABRIC") => void;
  setVersion: (version: string) => void;
  setModpack: (modpack: string) => void;
  setNewDatapack: (datapack: string) => void;
  validateDatapackUrl: (url: string) => boolean;
  validateModpackUrl: (url: string) => boolean;
  addDatapack: () => void;
  removeDatapack: (index: number) => void;
  reset: () => void;

  // For form submission
  getFormData: () => {
    serverType: "VANILLA" | "FABRIC";
    dataPacks: string[];
    modPack: string;
    version: string;
  };
}

export const useServerStartStore = create<ServerStartState>((set, get) => ({
  // Initial state
  serverType: "FABRIC",
  version: "1.20.1",
  datapacks: [],
  modpack: "",
  newDatapack: "",
  newDatapackError: null,
  modpackError: null,

  // Actions
  setServerType: (serverType) => set({ serverType }),

  setVersion: (version) => set({ version }),

  setModpack: (modpack) => {
    set({ modpack });
    get().validateModpackUrl(modpack);
  },

  setNewDatapack: (newDatapack) => {
    set({ newDatapack });
    if (newDatapack) {
      get().validateDatapackUrl(newDatapack);
    }
  },

  validateDatapackUrl: (url) => {
    try {
      // Skip validation if empty
      if (!url.trim()) {
        set({ newDatapackError: null });
        return true;
      }

      z.string().url().parse(url);
      set({ newDatapackError: null });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        set({ newDatapackError: "Please enter a valid URL" });
      }
      return false;
    }
  },

  validateModpackUrl: (url) => {
    try {
      // Skip validation if empty
      if (!url.trim()) {
        set({ modpackError: null });
        return true;
      }

      z.string().url().parse(url);
      set({ modpackError: null });
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        set({ modpackError: "Please enter a valid URL" });
      }
      return false;
    }
  },

  addDatapack: () => {
    const { newDatapack, datapacks, validateDatapackUrl } = get();
    const isValid = validateDatapackUrl(newDatapack);

    if (isValid && newDatapack.trim() && !datapacks.includes(newDatapack)) {
      set((state) => ({
        datapacks: [...state.datapacks, newDatapack],
        newDatapack: "",
      }));
    }
  },

  removeDatapack: (index) => {
    set((state) => ({
      datapacks: state.datapacks.filter((_, i) => i !== index),
    }));
  },

  reset: () => {
    set({
      serverType: "FABRIC",
      version: "",
      datapacks: [],
      modpack: "",
      newDatapack: "",
      newDatapackError: null,
      modpackError: null,
    });
  },

  getFormData: () => {
    const { serverType, datapacks, modpack, version } = get();
    return {
      serverType,
      dataPacks: datapacks,
      modPack: modpack,
      version,
    };
  },
}));
