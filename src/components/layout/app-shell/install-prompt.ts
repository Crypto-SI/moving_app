"use client";

import { useCallback, useEffect, useState } from "react";

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let promptListeners: Array<() => void> = [];
let browserListenersRegistered = false;

function registerBrowserListeners() {
  if (browserListenersRegistered || typeof window === "undefined") return;

  browserListenersRegistered = true;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    promptListeners.forEach((fn) => fn());
    promptListeners = [];
  });

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }
}

export function useDeferredPrompt() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(() => deferredPrompt);

  useEffect(() => {
    registerBrowserListeners();

    if (deferredPrompt) return;

    const listener = () => setPrompt(deferredPrompt);
    promptListeners.push(listener);
    return () => {
      promptListeners = promptListeners.filter((fn) => fn !== listener);
    };
  }, []);

  const consume = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    deferredPrompt = null;
    setPrompt(null);
  }, []);

  return { prompt, consume };
}
