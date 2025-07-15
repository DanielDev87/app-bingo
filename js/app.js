document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const callNumberBtn = document.getElementById('callNumber');
    const newGameBtn = document.getElementById('newGame');
    const lastNumberDisplay = document.getElementById('lastNumber');
    const winnerSection = document.getElementById('winnerSection');
    const winnerNameInput = document.getElementById('winnerName');
    const prizeInput = document.getElementById('prize');
    const declareWinnerBtn = document.getElementById('declareWinner');
    const gameHistoryTable = document.getElementById('gameHistory').querySelector('tbody');
    const letterButtons = document.querySelectorAll('.letter-btn');
    const numbersGrid = document.querySelector('.numbers-grid');
    const calledNumbersLists = {
        'B': document.getElementById('calledB'),
        'I': document.getElementById('calledI'),
        'N': document.getElementById('calledN'),
        'G': document.getElementById('calledG'),
        'O': document.getElementById('calledO')
    };

    // Variables del juego
    let currentGame = bingoStorage.getCurrentGame();
    let calledNumbers = currentGame ? currentGame.calledNumbers : [];
    let currentLetter = null;
    const numberRanges = {
        'B': { min: 1, max: 15 },
        'I': { min: 16, max: 30 },
        'N': { min: 31, max: 45 },
        'G': { min: 46, max: 60 },
        'O': { min: 61, max: 75 }
    };

    // Inicializar el juego
    function initializeGame() {
        // Limpiar selección de letra
        currentLetter = null;
        letterButtons.forEach(btn => btn.classList.remove('active'));
        
        // Limpiar números llamados
        updateCalledNumbersDisplay();
        updateLastNumberDisplay();
        
        // Generar botones de números para la letra seleccionada
        generateNumberButtons();
    }

    // Generar botones de números para la letra seleccionada
    function generateNumberButtons() {
        numbersGrid.innerHTML = '';
        
        if (!currentLetter) return;
        
        const range = numberRanges[currentLetter];
        for (let i = range.min; i <= range.max; i++) {
            const btn = document.createElement('button');
            btn.className = 'number-btn';
            btn.textContent = i;
            btn.dataset.number = i;
            btn.dataset.letter = currentLetter;
            
            if (calledNumbers.some(n => n.letter === currentLetter && n.number === i)) {
                btn.classList.add('called');
            }
            
            btn.addEventListener('click', function() {
                callNumber(this.dataset.letter, parseInt(this.dataset.number));
            });
            
            numbersGrid.appendChild(btn);
        }
    }

    // Llamar un número
    function callNumber(letter, number) {
        // Verificar si el número ya fue llamado
        if (calledNumbers.some(n => n.letter === letter && n.number === number)) {
            return;
        }
        
        // Agregar el número a la lista de llamados
        const calledNumber = { letter, number };
        calledNumbers.push(calledNumber);
        
        // Actualizar la interfaz
        updateCalledNumbersDisplay();
        updateLastNumberDisplay();
        generateNumberButtons();
        saveGameState();
        
        // Verificar si se completó el bingo (todos los números llamados)
        if (calledNumbers.length === 75) {
            winnerSection.style.display = 'block';
        }
    }

    // Actualizar el display de números llamados
    function updateCalledNumbersDisplay() {
        // Limpiar todas las listas
        Object.values(calledNumbersLists).forEach(list => list.innerHTML = '');
        
        // Agrupar números por letra
        const numbersByLetter = {
            'B': [],
            'I': [],
            'N': [],
            'G': [],
            'O': []
        };
        
        calledNumbers.forEach(num => {
            numbersByLetter[num.letter].push(num.number);
        });
        
        // Mostrar números en sus respectivas listas
        for (const letter in numbersByLetter) {
            numbersByLetter[letter].sort((a, b) => a - b).forEach(num => {
                const item = document.createElement('span');
                item.className = 'called-number-item';
                item.textContent = num;
                calledNumbersLists[letter].appendChild(item);
            });
        }
    }

    // Actualizar el display del último número
    function updateLastNumberDisplay() {
        if (calledNumbers.length > 0) {
            const last = calledNumbers[calledNumbers.length - 1];
            lastNumberDisplay.textContent = `Último número: ${last.letter}-${last.number}`;
        } else {
            lastNumberDisplay.textContent = 'Último número: -';
        }
    }

    // Guardar el estado del juego
    function saveGameState() {
        if (!currentGame) return;
        
        currentGame.calledNumbers = calledNumbers;
        bingoStorage.saveCurrentGame(currentGame);
    }

    // Declarar un ganador
    function declareWinner() {
        const winnerName = winnerNameInput.value.trim();
        const prize = prizeInput.value.trim();
        
        if (!winnerName) {
            alert('Por favor ingresa el nombre del ganador');
            return;
        }
        
        currentGame.winner = winnerName;
        currentGame.prize = prize;
        currentGame.endTime = new Date().toISOString();
        currentGame.completed = true;
        
        // Guardar en el historial
        bingoStorage.saveGame(currentGame);
        bingoStorage.clearCurrentGame();
        
        // Actualizar la tabla de historial
        updateHistoryTable();
        
        // Reiniciar la interfaz
        winnerSection.style.display = 'none';
        winnerNameInput.value = '';
        prizeInput.value = '';
        calledNumbers = [];
        initializeGame();
        
        // Iniciar un nuevo juego automáticamente
        currentGame = bingoStorage.startNewGame();
    }

    // Actualizar la tabla de historial
    function updateHistoryTable() {
        const games = bingoStorage.getGamesHistory();
        gameHistoryTable.innerHTML = '';
        
        games.reverse().forEach(game => {
            const row = document.createElement('tr');
            
            const dateCell = document.createElement('td');
            dateCell.textContent = new Date(game.startTime).toLocaleString();
            
            const winnerCell = document.createElement('td');
            winnerCell.textContent = game.winner || '-';
            
            const prizeCell = document.createElement('td');
            prizeCell.textContent = game.prize || '-';
            
            const numbersCell = document.createElement('td');
            numbersCell.textContent = game.calledNumbers.length;
            
            row.appendChild(dateCell);
            row.appendChild(winnerCell);
            row.appendChild(prizeCell);
            row.appendChild(numbersCell);
            
            gameHistoryTable.appendChild(row);
        });
    }

    // Iniciar un nuevo juego
    function startNewGame() {
        if (calledNumbers.length > 0 && 
            !confirm('¿Estás seguro de que quieres iniciar un nuevo juego? Se perderá el progreso actual.')) {
            return;
        }
        
        calledNumbers = [];
        currentGame = bingoStorage.startNewGame();
        initializeGame();
        winnerSection.style.display = 'none';
    }

    // Event listeners
    letterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            currentLetter = this.dataset.letter;
            letterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            generateNumberButtons();
        });
    });
    
    newGameBtn.addEventListener('click', startNewGame);
    declareWinnerBtn.addEventListener('click', declareWinner);

    // Inicialización
    if (!currentGame) {
        currentGame = bingoStorage.startNewGame();
    } else if (currentGame.completed) {
        // Si hay un juego completado pero no guardado (no debería pasar)
        bingoStorage.saveGame(currentGame);
        currentGame = bingoStorage.startNewGame();
    } else {
        // Restaurar el juego existente
        calledNumbers = currentGame.calledNumbers || [];
    }
    
    initializeGame();
    updateHistoryTable();
    
    // Mostrar sección de ganador si todos los números fueron llamados
    if (calledNumbers.length === 75) {
        winnerSection.style.display = 'block';
    }
});