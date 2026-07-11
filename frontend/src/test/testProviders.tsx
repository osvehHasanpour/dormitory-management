import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";

import { AuthContext, type AuthContextValue } from "../context/authContext";

export function TestProviders({
  auth,
  initialEntries = ["/"],
  children,
}: {
  auth: AuthContextValue;
  initialEntries?: string[];
  children: ReactNode;
}) {
  return (
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </AuthContext.Provider>
  );
}
