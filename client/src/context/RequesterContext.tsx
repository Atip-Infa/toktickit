import React, { createContext, useContext, useState, useEffect } from "react";
import { DevelopmentRequester, fetchActiveRequesters } from "../api.js";

const STORAGE_KEY = "toktickit_dev_requester_id";

interface RequesterContextType {
  selectedRequester: DevelopmentRequester | null;
  selectRequester: (requester: DevelopmentRequester) => void;
  clearRequester: () => void;
  isLoading: boolean;
}

const RequesterContext = createContext<RequesterContextType>({
  selectedRequester: null,
  selectRequester: () => {},
  clearRequester: () => {},
  isLoading: true,
});

export const RequesterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedRequester, setSelectedRequester] = useState<DevelopmentRequester | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function restoreSession() {
      const savedId = localStorage.getItem(STORAGE_KEY);
      if (savedId) {
        try {
          const requesters = await fetchActiveRequesters();
          const found = requesters.find((r) => r.id === Number(savedId));
          if (found) {
            setSelectedRequester(found);
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        } catch {
          // If network error during restore, keep null to prompt selector
        }
      }
      setIsLoading(false);
    }
    restoreSession();
  }, []);

  const selectRequester = (requester: DevelopmentRequester) => {
    setSelectedRequester(requester);
    localStorage.setItem(STORAGE_KEY, String(requester.id));
  };

  const clearRequester = () => {
    setSelectedRequester(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <RequesterContext.Provider
      value={{ selectedRequester, selectRequester, clearRequester, isLoading }}
    >
      {children}
    </RequesterContext.Provider>
  );
};

export const useRequester = () => useContext(RequesterContext);
