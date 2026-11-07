from pathlib import Path

from src.watch.main import watch
from src.train.main import train
from src.play.main import play
from src.list_files import list_gameplays, list_models


INTRO = """
-------------------------------------------------                                                                                         
                                             
    ▄▄▄▄▄▄▄▄▄    ▄▄▄▄▄▄▄    ▄▄▄▄▄▄▄ ▄▄▄   ▄▄▄
    ▀▀▀███▀▀▀    ███▀▀███▄ ███▀▀▀▀▀ ████▄████
       ███       ███▄▄███▀ ███▄▄     ▀█████▀ 
       ███ ▀▀▀▀▀ ███▀▀██▄  ███      ▄███████▄
       ███       ███  ▀███ ▀███████ ███▀ ▀███
                                             
-------------------------------------------------
"""

MENU = """>>> MENU
    [1] [WATCH] You play while bot watches
    [2] [TRAIN] Train model based on your gameplay
    [3] [PLAY]  Bot play based on training
    [q] [EXIT]  Get out of the program"""

print(INTRO)

while True:
    choice = 0
    print(MENU)

    try:
        choice = int(input(">>> [1-3]: "))
    except:
        print(">>> INVALID INPUT, BYE!")
        break
    
    print()
    
    if choice == 1:
        watch()
    elif choice == 2:
        gameplays = list_gameplays()
        
        if len(gameplays) == 0:
            print(">>> No gameplay found!")
            print(">>> Record your gameplay first")
            if input("\n>>> PRESS ENTER TO CONTINUE (q to quit) ") in ["q", "Q"]:
                print(">>> EXIT SIGNAL DETECTED, BYE!")
                exit(0)
            continue
        
        print(">>> Choose a gameplay to train model")
        
        for i in range(len(gameplays)):
            print(f"    [{i+1}]", gameplays[i])
        gameplay = 0
        try:
            gameplay = int(input(f">>> [1-{len(gameplays)}]: "))
        except:
            print(">>> INVALID INPUT, BYE!")
            break
        print("\n>>> Choose model type:")
        print("    [1] Decision tree")
        print("    [2] Random forest")
        model_type_input = input(">>> [1-2] (default 1): ").strip()
        model_type = "random_forest" if model_type_input == "2" else "decision_tree"

        train(Path(gameplays[gameplay-1]).stem, model_type=model_type)
    elif choice == 3:
        models = list_models()
        
        if len(models) == 0:
            print(">>> No models found!")
            print(">>> Train a model first")
            if input("\n\n>>> PRESS ENTER TO CONTINUE (q to quit) ") != "":
                    print(">>> EXIT SIGNAL DETECTED, BYE!")
                    exit(0)
            continue
        
        print(">>> Choose a model to autoplay")
        for i in range(len(models)):
            print(f"    [{i+1}]", models[i])
        model = 0
        try:
            model = int(input(f">>> [1-{len(models)}]: "))
        except:
            print(">>> INVALID INPUT, BYE!")
            break
        play(Path(models[model-1]).stem)
    else:
        print(">>> INVALID INPUT, BYE!")
        break
    
    if input("\n>>> PRESS ENTER TO CONTINUE (q to quit) ") in ["q", "Q"]:
        print(">>> EXIT SIGNAL DETECTED, BYE!\n")
        exit(0)