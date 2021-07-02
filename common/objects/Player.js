
class Player {

    constructor(name, width, height) {
        this.name = name;
        this.x = 0;
        this.y = 0;
        this.width = width;
        this.height = height;
        this.hp = 0;
        this.ammo = 0;
    }
}

module.exports = { Player };