from src.watch import watch
from src.train import train
from src.play import play


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
        train()
    elif choice == 3:
        play()
    else:
        print(">>> INVALID INPUT, BYE!")
        break
    
    if input(">>> PRESS ENTER TO CONTINUE (q to quit) ") != "":
        print(">>> EXIT SIGNAL DETECTED, BYE!")
        exit(0)