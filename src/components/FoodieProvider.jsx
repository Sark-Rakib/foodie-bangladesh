"use client";

import { createContext, useContext } from "react";
import { useFoodieProgress } from "@/hooks/useFoodieProgress";

const FoodieContext = createContext(null);

export function FoodieProvider({ children }) {
  const value = useFoodieProgress();
  return <FoodieContext.Provider value={value}>{children}</FoodieContext.Provider>;
}

export function useFoodie() {
  const ctx = useContext(FoodieContext);
  if (!ctx) {
    throw new Error("useFoodie must be used inside <FoodieProvider>");
  }
  return ctx;
}
