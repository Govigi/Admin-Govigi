"use client";
import React, { createContext, useContext, useState, useCallback } from "react";

const SidePanelContext = createContext(null);

export function SidePanelProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(null);

  const openSidePanel = useCallback((payload) => {
    setData(payload ?? null);
    setIsOpen(true);
  }, []);

  const closeSidePanel = useCallback(() => {
    setIsOpen(false);
    // keep data for a moment if needed; clear immediately
    setData(null);
  }, []);

  return (
    <SidePanelContext.Provider value={{ isOpen, data, openSidePanel, closeSidePanel }}>
      {children}
    </SidePanelContext.Provider>
  );
}

export function useSidePanel() {
  const ctx = useContext(SidePanelContext);
  if (!ctx) throw new Error("useSidePanel must be used within a SidePanelProvider");
  return ctx;
}

export default SidePanelContext;
