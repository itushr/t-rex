import json
import websocket


def connect(tab):
    return websocket.create_connection(
        tab["webSocketDebuggerUrl"],
        suppress_origin=True
    )

def disconnect(connection):
    if connection and connection.connected:
        connection.close()
    
def command(connection, command_id, method, params=None):
    connection.send(json.dumps({
        "id": command_id,
        "method": method,
        "params": params or {}
    }))
    
def listen(connection, eventhander):
    while True:
        try:
            message = json.loads(connection.recv())
            eventhander(message)

        except websocket.WebSocketConnectionClosedException:
            print("DINO >> error: connection closed unexpectedly")
            break
        except KeyboardInterrupt:
            break
        

class CDP:
    def __init__(self, connection):
        self.connection = connection
        self.command_id = 0

    def evaluate(self, expression):
        self.command_id += 1
        command_id = self.command_id

        self.connection.send(json.dumps({
            "id": command_id,
            "method": "Runtime.evaluate",
            "params": {
                "expression": expression,
                "returnByValue": True,
            },
        }))

        while True:
            message = json.loads(self.connection.recv())

            if message.get("id") != command_id:
                continue

            if "error" in message:
                raise RuntimeError(str(message["error"]))

            result = message.get("result", {})

            if result.get("exceptionDetails"):
                raise RuntimeError(
                    str(result["exceptionDetails"])
                )

            remote = result.get("result", {})

            if "value" in remote:
                return remote["value"]

            if remote.get("subtype") == "error":
                raise RuntimeError(
                    remote.get("description", "JavaScript error")
                )

            return None