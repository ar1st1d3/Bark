#!/usr/bin/env python3
"""
Bark Relay Hook for Google Antigravity
Transmits lifecycle events to the Bark desktop companion via Unix domain socket (bark.sock).
Handles interactive user approval for tool execution.
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

def send_event(event_type, tool_name=None, tool_args=None, session_id="antigravity-session", description=None, requires_approval=False):
    sock_path = get_socket_path()
    if not os.path.exists(sock_path):
        return True

    req_id = str(uuid.uuid4())
    payload = {
        "type": event_type,
        "request_id": req_id,
        "agent": "antigravity",
        "session_id": session_id,
        "tool": tool_name or "",
        "args": tool_args or {},
        "description": description or f"Exécution de {tool_name}",
        "requires_approval": requires_approval
    }

    try:
        with socket.socket(socket.AF_UNIX, socket.SOCK_STREAM) as client:
            client.settimeout(120.0 if requires_approval else 2.0)
            client.connect(sock_path)
            client.sendall(json.dumps(payload).encode("utf-8") + b"\n")

            if requires_approval:
                response_data = b""
                while b"\n" not in response_data:
                    chunk = client.recv(1024)
                    if not chunk:
                        break
                    response_data += chunk
                
                if response_data:
                    res = json.loads(response_data.decode("utf-8").strip())
                    status = res.get("status")
                    if status in ("approved", "always"):
                        return True
                    else:
                        print(f"[Bark] Action {tool_name} refusée par l'utilisateur.", file=sys.stderr)
                        return False
            return True
    except Exception as e:
        print(f"[Bark Hook Notice] Socket error: {e}", file=sys.stderr)
        return True

def main():
    event = sys.argv[1] if len(sys.argv) > 1 else "PreToolUse"
    tool = sys.argv[2] if len(sys.argv) > 2 else os.environ.get("ANTIGRAVITY_TOOL_NAME", "run_command")
    
    tool_args = {}
    if not sys.stdin.isatty():
        try:
            stdin_data = sys.stdin.read().strip()
            if stdin_data:
                tool_args = json.loads(stdin_data)
        except Exception:
            pass

    if event == "PreToolUse":
        critical_tools = {"run_command", "write_to_file"}
        needs_approval = tool in critical_tools or os.environ.get("BARK_FORCE_APPROVAL") == "1"
        allowed = send_event("pre_tool_use", tool, tool_args, requires_approval=needs_approval)
        if not allowed:
            sys.exit(1)
    elif event == "PostToolUse":
        send_event("post_tool_use", tool, tool_args)
    elif event == "PreInvocation":
        send_event("pre_invocation")
    elif event == "PostInvocation":
        send_event("post_invocation")

    sys.exit(0)

if __name__ == "__main__":
    main()
