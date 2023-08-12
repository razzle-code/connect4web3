let web3;

// Check for Ethereum browser extension (e.g., MetaMask)
if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
        // Request account access if needed
        await window.ethereum.enable();
    } catch (error) {
        console.error("User denied account access");
    }
} else if (window.web3) {
    // For legacy dapp browsers
    web3 = new Web3(window.web3.currentProvider);
} else {
    console.error("Ethereum browser not detected. You should consider trying MetaMask!");
}

const contractAddress = "0x37726917e0e8D60c4262eFbd79220F52203FcD39";
const connect4Contract = new web3.eth.Contract([{"inputs":[],"name":"createGame","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"games","outputs":[{"internalType":"address","name":"player1","type":"address"},{"internalType":"address","name":"player2","type":"address"},{"internalType":"uint256","name":"betAmount","type":"uint256"},{"internalType":"bool","name":"isActive","type":"bool"},{"internalType":"enum Connect4.Player","name":"currentPlayer","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"gamesCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"gameId","type":"uint256"}],"name":"joinGame","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"gameId","type":"uint256"},{"internalType":"uint8","name":"column","type":"uint8"}],"name":"makeMove","outputs":[],"stateMutability":"nonpayable","type":"function"}], contractAddress);

let accounts = [];
let currentGameId = null;

async function init() {
    accounts = await web3.eth.getAccounts();
    document.getElementById("hostGame").addEventListener("click", hostGame);
    document.getElementById("backToLobby").addEventListener("click", backToLobby);
    loadLobby();
}

async function loadLobby() {
    // Fetch list of games from the contract
    const gamesCount = await connect4Contract.methods.gamesCount().call();
    const gamesListElement = document.getElementById("gamesList");
    gamesListElement.innerHTML = ''; // Clear the list

    for (let i = 1; i <= gamesCount; i++) {
        const game = await connect4Contract.methods.games(i).call();
        
        // Only show games that are still active and waiting for a second player
        if (game.isActive && game.player2 === '0x0000000000000000000000000000000000000000') {
            const listItem = document.createElement("li");
            listItem.innerHTML = `Game #${i} hosted by ${game.player1} with bet of ${web3.utils.fromWei(game.betAmount, 'ether')} ETH. <button onclick="joinGame(${i})">Join</button>`;
            gamesListElement.appendChild(listItem);
        }
    }
}

async function hostGame() {
    const betAmount = prompt("Enter the amount of ETH you want to bet:", "0.1");
    if (betAmount && parseFloat(betAmount) > 0) {
        await connect4Contract.methods.createGame().send({
            from: accounts[0],
            value: web3.utils.toWei(betAmount, 'ether')
        });
        alert("Game hosted successfully!");
        loadLobby();
    } else {
        alert("Invalid bet amount!");
    }
}

async function joinGame(gameId) {
    const game = await connect4Contract.methods.games(gameId).call();
    if (game.player2 === '0x0000000000000000000000000000000000000000') {
        await connect4Contract.methods.joinGame(gameId).send({
            from: accounts[0],
            value: game.betAmount
        });
        alert("Joined the game successfully!");
        // Here you can also navigate to the game board to start playing
    } else {
        alert("This game is already full!");
    }
}

function backToLobby() {
    document.getElementById("gameArea").hidden = true;
    document.getElementById("lobby").hidden = false;
    loadLobby();
}

init();
