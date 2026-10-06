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
        "prompt": "Mettre à jour le taux de TVA et recalculer la facture"
    })
    time.sleep(0.8)

    # 1. Step: Read
    send({
        "type": "pre_tool_use",
        "agent": agent,
        "session_id": sid,
        "tool": "read_file",
        "args": {"path": "src/invoice.ts"},
        "description": "Lecture du fichier src/invoice.ts",
        "requires_approval": False
    })
    time.sleep(0.8)

    # 2. Step: Edit with invoice diff (matches screenshot)
    send({
        "type": "diff_update",
        "agent": agent,
        "session_id": sid,
        "file_path": "src/invoice.ts",
        "additions": 1,
        "deletions": 1,
        "diff": "10   import { Item } from './types'\n11\n12 - const TVA = 0.196\n12 + const TVA = 0.20\n13\n14   export function total(items: Item[]) {\n15     const sum = items.reduce((s, i) => s + i.price, 0)\n16     return sum * (1 + TVA)\n17   }"
    })
    time.sleep(0.8)

    # 3. Step: Bash (run command with authorization prompt)
    send({
        "type": "pre_tool_use",
        "request_id": f"req-{uuid.uuid4().hex[:8]}",
        "agent": agent,
        "session_id": sid,
        "tool": "run_command",
        "args": {"command": "npm test -- --filter invoice"},
        "description": "Exécution de la suite de tests de facturation",
        "requires_approval": True
    }, wait_response=True)

if __name__ == "__main__":
    main()
