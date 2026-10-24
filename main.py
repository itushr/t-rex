from instance import get_debug_tabs, get_dino_tabs
from browser_gateway import connect, disconnect, command, listen
from subscription_script import script
from parse_event import parse

debug_tabs = get_debug_tabs()

if(debug_tabs):
    print("DINO >> debug tabs detected, count: ", len(debug_tabs))
else:
    print("DINO >> error: debugs tabs not detected")
    exit(1)


dino_tabs = get_dino_tabs(debug_tabs)

if(len(dino_tabs) < 1):
    print("DINO >> error: dino tab not detected")
    exit(1)
elif(len(dino_tabs) > 1):
    print("DINO >> error: multiple dino tabs detected")
    exit(1)
else:
    print("DINO >> dino tab detected, count: ", len(dino_tabs))
  

connection = connect(dino_tabs[0])

if(connection):
    print("DINO >> websocket connection successful")
else:
    print("DINO >> error: websocket connection failed")
    exit(1)


command(connection, 1, "Runtime.enable")
command(connection, 2, "Runtime.addBinding", {
    "name": "pythonSend"
})
command(connection, 3, "Runtime.evaluate", {
    "expression": script
})

listen(connection, lambda msg: parse(msg))

disconnect(connection)
print("DINO >> websocket disconnected successfully")