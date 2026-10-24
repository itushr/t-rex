import json

def parse(event):
    if event.get("method") == "Runtime.bindingCalled":
        params = event["params"]
        if params["name"] == "pythonSend":
            print("BSE >>", json.loads(params["payload"]))
        else:
            print("EVENT >>", event)
    else:
        print("EVENT >>", event)