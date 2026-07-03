import { createContext, useContext, useState, type ReactNode } from "react";

export type AgentStatus = "idle" | "running" | "done";
export type StatusMap = Record<string, AgentStatus>;

interface AgentStatusCtx {
  statuses: StatusMap;
  setStatuses: (s: StatusMap | ((prev: StatusMap) => StatusMap)) => void;
}

const AgentStatusContext = createContext<AgentStatusCtx>({
  statuses: {},
  setStatuses: () => {},
});

export function AgentStatusProvider({ children }: { children: ReactNode }) {
  const [statuses, setStatuses] = useState<StatusMap>({});
  return (
    <AgentStatusContext.Provider value={{ statuses, setStatuses }}>
      {children}
    </AgentStatusContext.Provider>
  );
}

export const useAgentStatuses = () => useContext(AgentStatusContext);
