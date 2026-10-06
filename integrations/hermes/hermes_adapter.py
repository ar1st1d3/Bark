#!/usr/bin/env python3
"""
Hermes Agent (Nous Research) Adapter for Bark
Intercepts Hermes execution events, tool calls, and diffs, relaying them to Bark over Unix domain socket.
"""

import sys
import os
import json
import socket
import uuid

def get_socket_path():
    runtime_dir = os.environ.get("XDG_RUNTIME_DIR")
    if runtime_dir:
        return os.path.join(runtime_dir, "bark.sock")
    home = os.environ.get("HOME", "")
    if home:
        return os.path.join(home, ".local/share/bark/bark.sock")
    return "/tmp/bark.sock"

class BarkHermesClient:
    def __init__(self, session_id=None):
        self.sock_path = get_socket_path()
        self.session_id = session_id or f"hermes-{uuid.uuid4().hex[:8]}"

    def send_event(self, event_type, **kwargs):
        if not os.path.exists(self.sock_path):
            return None

        req_id = str(uuid.uuid4())
        payload = {
            "type": event_type,
            "request_id": req_id,
            "agent": "hermes",
            "session_id": self.session_id,
            **kwargs
        }

        try:
            with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as client:
                client.settimeout(120.0 if kwargs.get("requires_approval") else 2.0)
                client.connect(self.sock_path)
                client.sendall(json.dumps(payload).encode("utf-8") + b"\n")

                if kwargs.get("requires_approval"):
                    response_data = b""
                    while b"\n" not in response_data:
                        chunk = client.recv(1024)
                        if not chunk:
                            break
                        response_data += chunk
                    if response_data:
                        return json.loads(response_data.decode("utf-8").strip())
        except Exception as e:
            print(f"[Bark Hermes Error] {e}", file=sys.stderr)
        return None

    def connect(self, prompt=None):
        self.send_event("agent_connect", prompt=prompt)

    def tool_call(self, tool, args, description=None, requires_approval=True):
        res = self.send_event(
            "pre_tool_use",
            tool=tool,
            args=args,
            description=description,
            requires_approval=requires_approval
        )
        if res and res.get("status") in ("approved", "always"):
            return True
        return False

    def emit_diff(self, file_path, additions, deletions, diff=None):
        self.send_event(
            "diff_update",
            file_path=file_path,
            additions=additions,
            deletions=deletions,
            diff=diff
        )

    def status(self, status, message=None):
        self.send_event("agent_status", status=status, message=message)

def main():
    client = BarkHermesClient()
    prompt = " ".join(sys.argv[1:]) if len(sys.argv) > 1 else "Hermes Agent session"
    client.connect(prompt=prompt)
    print(f"[Bark Hermes Adapter] Session {client.session_id} active.")

if __name__ == "__main__":
    main()
