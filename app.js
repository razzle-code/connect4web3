// Assuming MetaMask is installed
const web3 = new Web3(window.ethereum);
let accounts = [];
let contract;

async function init() {
    // Request account access if needed (for MetaMask)
    await window.ethereum.enable();

    accounts = await web3.eth.getAccounts();
    contract = new web3.eth.Contract([{"anonymous":false,"inputs":[],"name":"GameDraw","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"player1","type":"address"},{"indexed":false,"internalType":"address","name":"player2","type":"address"},{"indexed":false,"internalType":"uint256","name":"betAmount","type":"uint256"}],"name":"GameStarted","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"winner","type":"address"}],"name":"GameWon","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"player","type":"address"},{"indexed":false,"internalType":"uint8","name":"column","type":"uint8"}],"name":"MoveMade","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"winner","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}],"name":"PrizeClaimed","type":"event"},{"inputs":[],"name":"betAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"},{"internalType":"uint256","name":"","type":"uint256"}],"name":"board","outputs":[{"internalType":"enum ConnectFour.Player","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"currentPlayer","outputs":[{"internalType":"enum ConnectFour.Player","name":"","type":"uint8"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"gameEnded","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint8","name":"column","type":"uint8"}],"name":"makeMove","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"player1","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"player2","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_player1","type":"address"},{"internalType":"address","name":"_player2","type":"address"},{"internalType":"uint256","name":"_betAmount","type":"uint256"}],"name":"startGame","outputs":[],"stateMutability":"payable","type":"function"}]
, 0xf718e3Ec4c25598E3946cb0F634d7aA017f38BeB);

    // Now, you can safely access contract events
    contract.events.MoveMade({}, (error, event) => {
        if (error) {
            console.error(error);
            return;
        }
        const { player, column } = event.returnValues;
        updateBoard(player, column);
    });

    document.getElementById('createGame').addEventListener('click', createGame);
}

const rows = 6;
const columns = 7;
let board = [];

function initBoard() {
    board = Array(rows).fill().map(() => Array(columns).fill(Player.NONE));
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';
    for (let i = 0; i < rows; i++) {
        const rowElement = document.createElement('tr');
        for (let j = 0; j < columns; j++) {
            const cellElement = document.createElement('td');
            cellElement.dataset.row = i;
            cellElement.dataset.column = j;
            rowElement.appendChild(cellElement);
        }
        boardElement.appendChild(rowElement);
    }
}

async function makeMove(column) {
    // Call the smart contract's makeMove function
    await contract.methods.makeMove(column).send({ from: accounts[0] });
}

// Initialize the board when the page loads
initBoard();

// Call the init function when the page loads
window.onload = init;
