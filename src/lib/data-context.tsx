"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface MockDataContextValue {
  useMockData: boolean;
  setUseMockData: (value: boolean) => void;
}

const MockDataContext = createContext<MockDataContextValue | null>(null);

export function MockDataProvider({ children }: { children: ReactNode }) {
  const [useMockData, setUseMockData] = useState(false);

  return (
    <MockDataContext.Provider value={{ useMockData, setUseMockData }}>
      {children}
    </MockDataContext.Provider>
  );
}

export function useMockDataToggle() {
  const context = useContext(MockDataContext);
  if (!context) {
    throw new Error("useMockDataToggle must be used within a MockDataProvider");
  }
  return context;
}
