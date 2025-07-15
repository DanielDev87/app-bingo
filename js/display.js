document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const currentNumberDisplay = document.getElementById('currentNumber');
    const winnerNameDisplay = document.getElementById('winnerName');
    const winnerPrizeDisplay = document.getElementById('winnerPrize');
    const winnerInfoSection = document.getElementById('winnerInfo');
    const calledNumbersContainer = document.getElementById('calledNumbersContainer');
    const winnersHistoryTable = document.getElementById('winnersHistory').querySelector('tbody');
    const bingoGridDisplay = document.getElementById('bingoGridDisplay');

    // Inicializar el tablero de bingo
    function initializeBingoGrid() {
        bingoGridDisplay.innerHTML = '';
        
        // Crear 5 columnas (B-I-N-G-O) x 15 filas
        for (let i = 1; i <= 15; i++) {
            // B (1-15)
            const cellB = createBingoCell('B', i);
            bingoGridDisplay.appendChild(cellB);
            
            // I (16-30)
            const cellI = createBingoCell('I', i + 15);
            bingoGridDisplay.appendChild(cellI);
            
            // N (31-45)
            const cellN = createBingoCell('N', i + 30);
            bingoGridDisplay.appendChild(cellN);
            
            // G (46-60)
            const cellG = createBingoCell('G', i + 45);
            bingoGridDisplay.appendChild(cellG);
            
            // O (61-75)
            const cellO = createBingoCell('O', i + 60);
            bingoGridDisplay.appendChild(cellO);
        }
    }

    function createBingoCell(letter, number) {
        const cell = document.createElement('div');
        cell.className = 'bingo-cell-display';
        cell.textContent = number;
        cell.dataset.letter = letter;
        cell.dataset.number = number;
        return cell;
    }

    // Actualizar la pantalla con los datos del juego
    function updateDisplay() {
        const currentGame = bingoStorage.getCurrentGame();
        const gamesHistory = bingoStorage.getGamesHistory();
        
        // Mostrar el último número llamado
        if (currentGame && currentGame.calledNumbers.length > 0) {
            const lastNumber = currentGame.calledNumbers[currentGame.calledNumbers.length - 1];
            currentNumberDisplay.textContent = `${lastNumber.letter}-${lastNumber.number}`;
            
            // Marcar números llamados en el tablero
            currentGame.calledNumbers.forEach(num => {
                const cell = document.querySelector(`.bingo-cell-display[data-letter="${num.letter}"][data-number="${num.number}"]`);
                if (cell) cell.classList.add('called');
            });
        } else {
            currentNumberDisplay.textContent = '-';
        }
        
        // Mostrar números llamados en la lista
        calledNumbersContainer.innerHTML = '';
        if (currentGame) {
            currentGame.calledNumbers.forEach(num => {
                const numberElement = document.createElement('div');
                numberElement.className = 'called-number';
                numberElement.textContent = `${num.letter}-${num.number}`;
                calledNumbersContainer.appendChild(numberElement);
            });
        }
        
        // Mostrar el último ganador del historial
        if (gamesHistory.length > 0) {
            const lastWinner = gamesHistory[gamesHistory.length - 1];
            if (lastWinner.winner) {
                winnerNameDisplay.textContent = lastWinner.winner;
                winnerPrizeDisplay.textContent = lastWinner.prize || 'Sin premio especificado';
                winnerInfoSection.style.display = 'block';
            } else {
                winnerInfoSection.style.display = 'none';
            }
        } else {
            winnerInfoSection.style.display = 'none';
        }
        
        // Actualizar la tabla de historial de ganadores
        updateWinnersHistory();
    }

    // Actualizar la tabla de historial de ganadores
    function updateWinnersHistory() {
        const gamesHistory = bingoStorage.getGamesHistory();
        winnersHistoryTable.innerHTML = '';
        
        // Filtrar solo juegos con ganadores y ordenar del más reciente al más antiguo
        const winners = gamesHistory
            .filter(game => game.winner)
            .reverse();
        
        winners.forEach(game => {
            const row = document.createElement('tr');
            
            const dateCell = document.createElement('td');
            dateCell.textContent = new Date(game.startTime).toLocaleDateString();
            
            const winnerCell = document.createElement('td');
            winnerCell.textContent = game.winner;
            
            const prizeCell = document.createElement('td');
            prizeCell.textContent = game.prize || '-';
            
            row.appendChild(dateCell);
            row.appendChild(winnerCell);
            row.appendChild(prizeCell);
            
            winnersHistoryTable.appendChild(row);
        });
    }

    // Inicializar y actualizar la pantalla cada segundo
    initializeBingoGrid();
    updateDisplay();
    setInterval(updateDisplay, 1000);
});