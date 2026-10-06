import React, { useEffect } from "react";
import { useAgentStore } from "./store/useAgentStore";
import { ClosedNotch } from "./components/pill/ClosedNotch";
import { CommandPanel } from "./components/panel/CommandPanel";
import { SocketEventPayload } from "./types/socket";
import { pugAudio } from "./components/mascot/PugAudio";

export const App: React.FC = () => {
  const {
    isExpanded,
    setIsExpanded,
    setActiveNav,
    setAttachedFile,
    handleSocketEvent,
    appendOutput,
  } = useAgentStore();

  useEffect(() => {
    // 1. Listen to Tauri socket & PTY events
    if ((window as any).__TAURI_INTERNALS__) {
      let unlistenEvent: (() => void) | undefined;
      let unlistenPty: (() => void) | undefined;
      let unlistenDrag: (() => void) | undefined;

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

      // 2. Listen to Tauri native OS drag & drop
      import("@tauri-apps/api/webview").then(({ getCurrentWebview }) => {
        getCurrentWebview()
          .onDragDropEvent((event) => {
            if (event.payload.type === "drop" && event.payload.paths && event.payload.paths.length > 0) {
              const fullPath = event.payload.paths[0];
              const fileName = fullPath.split("/").pop() || fullPath;
              setAttachedFile({
                name: fileName,
                path: fullPath,
              });
              setIsExpanded(true);
              setActiveNav("chat");
              pugAudio.playBark();
            }
          })
          .then((un) => {
            unlistenDrag = un;
          })
          .catch(console.error);
      });

      return () => {
        unlistenEvent?.();
        unlistenPty?.();
        unlistenDrag?.();
      };
    }
  }, [handleSocketEvent, appendOutput, setAttachedFile, setIsExpanded, setActiveNav]);

  // Global HTML5 Drag & Drop fallback for browser / webview
  useEffect(() => {
    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleWindowDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        const file = files[0];
        setAttachedFile({
          name: file.name,
          size: file.size,
        });
        setIsExpanded(true);
        setActiveNav("chat");
        pugAudio.playBark();
      }
    };

    window.addEventListener("dragover", handleWindowDragOver);
    window.addEventListener("drop", handleWindowDrop);

    return () => {
      window.removeEventListener("dragover", handleWindowDragOver);
      window.removeEventListener("drop", handleWindowDrop);
    };
  }, [setAttachedFile, setIsExpanded, setActiveNav]);

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
