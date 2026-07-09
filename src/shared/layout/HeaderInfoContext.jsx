import { createContext, useContext } from "react";

const HeaderInfoContext = createContext(null);

export function HeaderInfoProvider({ value, children }) {
  return <HeaderInfoContext.Provider value={value}>{children}</HeaderInfoContext.Provider>;
}

export default function useHeaderInfo() {
  const ctx = useContext(HeaderInfoContext);
  if (!ctx) throw new Error("useHeaderInfo must be used within HeaderInfoProvider");
  return ctx;
}
