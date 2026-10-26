const instance = Runner.getInstance()
const obstacle = Runner.getInstance().horizon.obstacles[0];

instance.currentSpeed

obstacle.typeConfig.type       // cactusSmall | cactusLarge | pterodactyl | collectable
obstacle.size                  // number of obstacle unit in the group
obstacle.xPos                  // xPos measured from left
obstacle.yPos                  // yPos measured from top