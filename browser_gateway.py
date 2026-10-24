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