//game_main.js

const db = require('../db');

class Game {
    constructor() {
        this.players = new Map();
        this.tickInterval = 5000;
        this.startLoop();
    }

    startLoop() {
        this.loop = setInterval(() => this.tick(), this.tickInterval);
    }

    async tick() {
        for (const [id, player] of this.players) {
            player.hp = Math.min(player.maxHp, player.hp + 1);

            // Sync NeoCreds to DB every tick
            try {
                await db.query(
                    `INSERT INTO players(userId, neocreds) VALUES(?, ?) 
                     ON DUPLICATE KEY UPDATE neocreds = ?, lastUpdated = NOW()`,
                    [id, player.neocreds || 0, player.neocreds || 0]
                );
            } catch (err) {
                console.error('[Game] DB update failed:', err);
            }
        }
    }

    async addPlayer(userId) {
        if (!this.players.has(userId)) {
            // Check DB first
            let res = await db.query('SELECT * FROM players WHERE userId = ?', [userId]);
            const dbPlayer = res[0];

            const player = dbPlayer
                ? { ...dbPlayer, inventory: JSON.parse(dbPlayer.inventory || '[]'), hp: 10, maxHp: 10 }
                : { hp: 10, maxHp: 10, neocreds: 0, inventory: [] };

            this.players.set(userId, player);

            // Ensure DB entry exists
            if (!dbPlayer) {
                await db.query('INSERT INTO players(userId, neocreds, inventory) VALUES(?, ?, ?)', [
                    userId,
                    player.neocreds,
                    JSON.stringify(player.inventory)
                ]);
            }
        }
    }

    async handleCommand(userId, command, args) {
        await this.addPlayer(userId);
        const player = this.players.get(userId);

        switch (command) {
            case 'heal':
                player.hp = Math.min(player.maxHp, player.hp + 5);
                return `You healed! HP is now ${player.hp}`;
            case 'status':
                return `HP: ${player.hp}/${player.maxHp}, NeoCreds: ${player.neocreds}`;
            case 'work':
                const earned = Math.floor(Math.random() * 10) + 5;
                player.neocreds += earned;
                return `You worked and earned ${earned} NeoCreds! Total: ${player.neocreds}`;
        }
    }
}

module.exports = new Game();