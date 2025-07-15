class BingoStorage {
    constructor() {
        this.gamesKey = 'bingoGames';
        this.currentGameKey = 'currentBingoGame';
    }

    // Guardar un nuevo juego en el historial
    saveGame(game) {
        const games = this.getGamesHistory();
        games.push(game);
        localStorage.setItem(this.gamesKey, JSON.stringify(games));
    }

    // Obtener todo el historial de juegos
    getGamesHistory() {
        const games = localStorage.getItem(this.gamesKey);
        return games ? JSON.parse(games) : [];
    }

    // Guardar el juego actual
    saveCurrentGame(game) {
        localStorage.setItem(this.currentGameKey, JSON.stringify(game));
    }

    // Obtener el juego actual
    getCurrentGame() {
        const game = localStorage.getItem(this.currentGameKey);
        return game ? JSON.parse(game) : null;
    }

    // Eliminar el juego actual
    clearCurrentGame() {
        localStorage.removeItem(this.currentGameKey);
    }

    // Iniciar un nuevo juego
    startNewGame() {
        const newGame = {
            id: Date.now(),
            startTime: new Date().toISOString(),
            calledNumbers: [],
            winner: null,
            prize: null,
            completed: false
        };
        this.saveCurrentGame(newGame);
        return newGame;
    }
}

const bingoStorage = new BingoStorage();