const yearsList = document.getElementById('years');
const detailsDiv = document.getElementById('details');
const searchInput = document.getElementById('search');
const sortSelect = document.getElementById('sort');

let currentBoard = null;
let currentChess = null;
let currentMoves = [];
let moveIndex = 0;

// Champions with full PGN example
const champions = [
    {
        year: 2023,
        name: "Ding Liren",
        country: "China",
        image: "images/ding.png",
        rating: 2799,
        info: "Ding Liren won the 2023 World Chess Championship.",
        games: [
            { 
                name: "Game 1 vs Nepomniachtchi", 
                pgn: `[Event "World Chess Championship"]
[White "Ding Liren"]
[Black "Ian Nepomniachtchi"]
[Result "1/2-1/2"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O
9. h3 Nb8 10. d4 Nbd7 11. c4 c6 12. Nc3 Qc7 13. Bg5 h6 14. Bh4 Re8 15. Rc1 Bb7
16. a3 Bf8 17. Ba2 g6 18. Qd2 Bg7 19. cxb5 axb5 20. Nxb5 Qb8 21. Nc3 Nh5 22. g3
g5 23. Bxg5 hxg5 24. Nxg5 Re7 25. Qe2 Ndf6 26. dxe5 dxe5 27. Qc4 Qf8 28. Rcd1 Bh6
29. Nf3 Qg7 30. Nh4 Nf4 31. Nf5 Nxh3+ 32. Kg2 Nf4+ 33. Kf1 Qg5 34. gxf4 Qh5
35. Rd3 Bxf4 36. Rh3 Qxh3+ 37. Ke2 Qg4+ 38. Kd3 Ba6 39. Nd5 Bxc4+ 40. Bxc4 Nxd5
41. Bxd5 Rd7 42. Kc4 cxd5+ 43. exd5 Qxf5 44. b4 Rxa3 45. Kc5 Qc2+ 46. Kb6 Rb3
47. Ka5 Rxb4 48. Kxb4 Rb7+ 49. Ka5 Qa2# 0-1`
            }
        ]
    },
    {
        year: 2021,
        name: "Magnus Carlsen",
        country: "Norway",
        image: "images/magnus.png",
        rating: 2847,
        info: "Magnus Carlsen defended his title in 2021.",
        games: [
            {
                name: "Game 1 vs Nepomniachtchi",
                pgn: `[Event "World Chess Championship"]
[White "Magnus Carlsen"]
[Black "Ian Nepomniachtchi"]
[Result "1/2-1/2"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O
9. h3 Nb8 10. d4 Nbd7 11. c4 c6 12. Nc3 Qc7 13. Bg5 h6 14. Bh4 Re8 15. Rc1 Bb7 16. a3 Bf8`
            }
        ]
    }
];

// Load years list
function loadYears(list = champions) {
    yearsList.innerHTML = "";
    list.forEach(champ => {
        const li = document.createElement('li');
        li.textContent = champ.year + " - " + champ.name;
        li.onclick = () => showChampion(champ);
        yearsList.appendChild(li);
    });
}

// Show champion with tabs
function showChampion(champ) {
    detailsDiv.innerHTML = `
        <h3>${champ.name} (${champ.country}) - ${champ.year}</h3>
        <img src="${champ.image}" alt="${champ.name}">
        <div id="tabs">
            <button onclick="showTab('info')">Info</button>
            <button onclick="showTab('board')">Chessboard</button>
            <button onclick="showTab('games')">Games</button>
        </div>
        <div id="tab-info" class="tab-content active">
            <p>${champ.info}</p>
            <p>Rating: ${champ.rating}</p>
        </div>
        <div id="tab-board" class="tab-content">
            <div id="chessboard"></div>
            <p id="move-text"></p>
            <button onclick="prevMove()">◀ Prev Move</button>
            <button onclick="nextMove()">Next Move ▶</button>
        </div>
        <div id="tab-games" class="tab-content">
            <ul>${champ.games.map((g,i) => `<li onclick="loadGame(${i})">${g.name}</li>`).join('')}</ul>
        </div>
    `;

    // Initialize empty board
    currentBoard = Chessboard('chessboard', { position: 'start' });
    currentChess = new Chess();
    currentMoves = [];
    moveIndex = 0;
}

// Tabs
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.add('active');
}

// Load a game PGN
function loadGame(index) {
    const tabBoard = document.getElementById('tab-board');
    const moveText = document.getElementById('move-text');
    const gamePGN = champions.find(c => c.year == parseInt(yearsList.querySelector('li.active')?.textContent))?.games[index]?.pgn;

    if (!gamePGN) return;

    currentChess = new Chess();
    currentChess.load_pgn(gamePGN);
    currentMoves = currentChess.history();
    moveIndex = 0;
    currentChess.reset();
    currentBoard.position(currentChess.fen());
    moveText.textContent = "";
}

// Next / Previous move functions
function nextMove() {
    if (moveIndex >= currentMoves.length) return;
    currentChess.move(currentMoves[moveIndex]);
    currentBoard.position(currentChess.fen());
    moveIndex++;
}

function prevMove() {
    if (moveIndex <= 0) return;
    currentChess.undo();
    moveIndex--;
    currentBoard.position(currentChess.fen());
}

// Search and sort
searchInput.addEventListener('input', () => {
    const term = searchInput.value.toLowerCase();
    const filtered = champions.filter(c => c.name.toLowerCase().includes(term) || c.country.toLowerCase().includes(term));
    loadYears(filtered);
});

sortSelect.addEventListener('change', () => {
    let sorted;
    if (sortSelect.value === "year") {
        sorted = [...champions].sort((a,b)=> b.year - a.year);
    } else {
        sorted = [...champions].sort((a,b)=> Math.floor(a.year/10) - Math.floor(b.year/10));
    }
    loadYears(sorted);
});

// Chart.js rating graph
const ctx = document.getElementById('ratingChart').getContext('2d');
const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: champions.map(c => c.year),
        datasets: [{
            label: 'World Champion Rating',
            data: champions.map(c => c.rating),
            borderColor: '#2e8b57',
            fill: false
        }]
    },
    options: { responsive: true }
});

loadYears();
