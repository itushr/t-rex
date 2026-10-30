from pathlib import Path

from src.watch.main import watch
from src.train.main import train
from src.play.main import play

from src.fs import list_gameplays, list_models


INTRO = """-------------------------------------------------

▐▓▓▓▓▓▌      ▐▓▓▓▓▌▐▓▓▓▓▌▐▓▌ ▐▓▌
  ▐▓▌        ▐▓▌▐▓▌▐▓▌    ▐▓▐▓▌ 
  ▐▓▌  ▐▓▓▓▓▌▐▓▓▓▓▌▐▓▓▓▌   ▐▓▌  
  ▐▓▌        ▐▓▐▓▌ ▐▓▌    ▐▓▐▓▌ 
  ▐▓▌        ▐▓▌▐▓▌▐▓▓▓▓▌▐▓▌ ▐▓▌
  
-------------------------------------------------
"""

MENU = """>>> MENU
    [1] [WATCH] You play while bot watches
    [2] [TRAIN] Train model based on your gameplay
    [3] [PLAY]  Bot play based on training
    [q] [EXIT]  Get out of the program
"""

print(INTRO)

while True:
    choice = 0
    print(MENU)

    try:
        choice = int(input(">>> [1-3]: "))
    except:
        print(">>> INVALID INPUT, BYE!")
        break
    
    if choice == 1:
        watch()
    elif choice == 2:
        gameplays = list_gameplays()
        
        if len(gameplays) == 0:
            print(">>> No gameplay found!")
            print(">>> Record your gameplay first")
            if input("\n\n>>> PRESS ENTER TO CONTINUE (q to quit) ") != "":
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
        train(Path(gameplays[gameplay-1]).stem)
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
            print(f"    [{i}]", models[i])
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
    
    if input("\n\n>>> PRESS ENTER TO CONTINUE (q to quit) ") != "":
        print(">>> EXIT SIGNAL DETECTED, BYE!")
        exit(0)