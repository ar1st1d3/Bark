#!/usr/bin/env python3
"""
Test script to send simulated Antigravity & Hermes events to Bark socket.
"""

import sys
import os
import json
import socket
import time
import uuid

def get_socket_path():
    runtime_dir = os.environ.get("XDG_RUNTIME_DIR")
    if runtime_dir:
        return os.path.join(runtime_dir, "bark.sock")
    home = os.environ.get("HOME", "")
    if home:
        return os.path.join(home, ".local/share/bark/bark.sock")
    return "/tmp/bark.sock"

def send(payload, wait_response=False):
    sock_path = get_socket_path()
    if not os.path.exists(sock_path):
        print(f"Socket {sock_path} introuvable ! Bark est-il lancé ?")
        return None

    with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as client:
        client.settimeout(60.0 if wait_response else 3.0)
        client.connect(sock_path)
        client.sendall(json.dumps(payload).encode("utf-8") + b"\n")
        print(f"-> Événement envoyé : {payload['type']}")

        if wait_response:
            print("... En attente de décision utilisateur dans Bark UI ...")
            data = b""
            while b"\n" not in data:
                chunk = client.recv(1024)
                if not chunk:
                    break
                data += chunk
            if data:
                res = json.loads(data.decode("utf-8").strip())
                print(f"<- Réponse reçue de Bark : {res}")
                return res
    return None

def main():
    agent = sys.argv[1] if len(sys.argv) > 1 else "antigravity"
    print(f"=== Simulation d'événements pour {agent} ===")

    sid = f"session-{uuid.uuid4().hex[:6]}"
    send({
        "type": "agent_connect",
        "agent": agent,
        "session_id": sid,
        "prompt": "Optimiser le moteur de recherche et mettre à jour le design notch"
    })
    time.sleep(1)

    send({
        "type": "diff_update",
        "agent": agent,
        "session_id": sid,
        "file_path": "src/window/positioner.rs",
        "additions": 34,
        "deletions": 8,
        "diff": "@@ -1,5 +1,12 @@\n-const PILL_WIDTH = 340;\n+const PILL_WIDTH = 84;\n+// Ancrage au sommet d'écran\n"
    })
    time.sleep(1)

    send({
        "type": "pre_tool_use",
        "request_id": f"req-{uuid.uuid4().hex[:8]}",
        "agent": agent,
        "session_id": sid,
        "tool": "run_command",
        "args": {"command": "cargo build --release"},
        "description": "L'agent demande à lancer le build de production.",
        "requires_approval": True
    }, wait_response=True)

if __name__ == "__main__":
    main()
