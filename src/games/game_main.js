// game_main.js
class Game {
    constructor() {
        this.players = new Map(); // userId -> player state
        this.tickInterval = 5000; // 5 seconds per tick
        this.startLoop();
    }

    startLoop() {
        this.loop = setInterval(() => this.tick(), this.tickInterval);
    }

    tick() {
        // Update all players' states
        for (const [id, player] of this.players) {
            // Example: regenerate health
            player.hp = Math.min(player.maxHp, player.hp + 1);
        }
        // Maybe push updates to channels
    }

    addPlayer(userId) {
        if (!this.players.has(userId)) {
            this.players.set(userId, { hp: 10, maxHp: 10, inventory: [] });
        }
    }

    handleCommand(userId, command, args) {
        this.addPlayer(userId);
        const player = this.players.get(userId);

        switch (command) {
            case 'heal':
                player.hp = Math.min(player.maxHp, player.hp + 5);
                return `You healed! HP is now ${player.hp}`;
            case 'status':
                return `HP: ${player.hp}/${player.maxHp}`;
        }
    }
}

module.exports = new Game();