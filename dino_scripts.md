### Runner.getInstance().

1. activated: not started-> false, running-> true, paused-> true, crashed -> true
2. crashed
3. paused: not started->false, running->false, paused->true, crashed->true
4. currentSpeed
5. horizon.obstacles: obstacle[]
    .size: number of cactus in the cactus group
    .xPos
    .typeConfig.type: 'cactusSmall', 'cactusLarge'
6. startGame
7. playIntro
8. restartGame
9. play
10. stop
11. gameOver
12. tRex
    .startJump(runner.currentSpeed)
    .endJump()
    .setDuck(true)
    .setDuck(false)
13. 


### functions Override

const runner = Runner.getInstance();

const originalStartGame = runner.startGame;

runner.startGame = function (...args) {
    const result = originalStartGame.apply(this, args);

    extraFun();

    return result;
};