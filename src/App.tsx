import React, { useEffect } from "react";
import { useAgentStore } from "./store/useAgentStore";
import { ClosedNotch } from "./components/pill/ClosedNotch";
import { CommandPanel } from "./components/panel/CommandPanel";
import { SocketEventPayload } from "./types/socket";

export const App: React.FC = () => {
  const { isExpanded, setIsExpanded, handleSocketEvent, appendOutput } = useAgentStore();

  useEffect(() => {
    // Listen to Tauri events if available
    if ((window as any).__TAURI_INTERNALS__) {
      let unlistenEvent: (() => void) | undefined;
      let unlistenPty: (() => void) | undefined;

      import("@tauri-apps/api/event").then(({ listen }) => {
        listen<SocketEventPayload>("bark://event", (ev) => {
          handleSocketEvent(ev.payload);
        }).then((un) => {
          unlistenEvent = un;
        });

        listen<{ session_id: string; data: string }>("bark://pty-output", (ev) => {
          appendOutput("antigravity", ev.payload.data);
        }).then((un) => {
          unlistenPty = un;
        });
      });

      return () => {
        unlistenEvent?.();
        unlistenPty?.();
      };
    }
  }, [handleSocketEvent, appendOutput]);

  // Global escape key to collapse
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded, setIsExpanded]);

  return (
    <div className="w-full flex flex-col items-center justify-start m-0 p-0 select-none">
      {isExpanded ? <CommandPanel /> : <ClosedNotch />}
    </div>
  );
};

export default App;
