import React from "react";
import { getAuthStatus } from "../lib/auth";

export function useAuthSession() {
  const [state, setState] = React.useState(() => getAuthStatus());

  React.useEffect(() => {
    const update = () => setState(getAuthStatus());
    update();

    window.addEventListener("storage", update);
    window.addEventListener("salus-auth-changed", update as EventListener);

    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("salus-auth-changed", update as EventListener);
    };
  }, []);

  return state;
}
