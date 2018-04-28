const towers = document.querySelectorAll('.tower__container');
let tiles = document.querySelectorAll('.tile');
const counterElement = document.querySelector('#counter');
const numOfTilesElement = document.querySelector('#numOfTiles');
const resetBtn = document.querySelector('#reset');
const solveBtn = document.querySelector('#solve');

let tileToMove;
let originalTower;
let counter = 0;
let numOfTiles = 5;

function updateCounter(n = ++counter) {
    counterElement.textContent = `${n}`;
    counter = n;
}

function checkVictory() {
    const towerContainer = towers[2].children;
    if (towerContainer.length !== numOfTiles) return;
    for (let i = 0; i < towerContainer.length - 1; i++) {
        if (
            towerContainer[i].dataset.weight >
            towerContainer[i + 1].dataset.weight
        ) {
            return;
        }
    }
    console.log('yay');
}

function moveTile(e) {
    if (!tileToMove) return;
    const [tileHalfWidth, tileHalfHeight] = [
        tileToMove.offsetWidth / 2,
        tileToMove.offsetHeight / 2
    ];
    tileToMove.style.left = `${e.pageX - tileHalfWidth}px`;
    tileToMove.style.top = `${e.pageY - tileHalfHeight}px`;
}

function clickOnTile(e) {
    const tile = e.target;
    const container = this;
    //  checks if tile was pressed
    if (!tile.classList.contains('tile')) return;
    //  if its the top tile
    if (tile === container.children[0]) {
        originalTower = this;
        document.body.appendChild(tile);
        tile.style.position = 'absolute';
        tileToMove = tile;
        moveTile(e);
    }
}

function towerToPlaceIn(x, y) {
    return Array.from(towers).find((tower) => {
        return (
            tower.offsetParent.offsetLeft < x &&
            x < tower.offsetParent.offsetLeft + tower.clientWidth &&
            tower.offsetParent.offsetTop < y &&
            y < tower.offsetParent.offsetTop + tower.clientHeight
        );
    });
}

function placeTile(e) {
    if (e.target !== tileToMove) return;
    let tower = towerToPlaceIn(e.clientX, e.clientY) || originalTower;
    console.log(tower);
    if (
        tower.children[0] &&
        tower.children[0].dataset.weight < tileToMove.dataset.weight
    ) {
        tower = originalTower;
    }
    if (tower !== originalTower) {
        updateCounter();
    }
    tileToMove.style.position = 'static';
    tower.insertBefore(tileToMove, tower.firstChild);
    tileToMove = null;
    checkVictory();
}

function emptyTowers() {
    towers.forEach((tower) => {
        tower.innerHTML = '';
    });
}

function resetTiles() {
    updateCounter(0);
    emptyTowers();
    let tilesHtml = '';
    const towerContainer = towers[0];
    for (let i = 1; i < numOfTiles + 1; i++) {
        tilesHtml += `<div class="tile" data-weight="${i}"></div>`;
    }
    towerContainer.innerHTML = tilesHtml;
    tiles = document.querySelectorAll('.tile');
    tiles.forEach((tile) => tile.addEventListener('mouseup', placeTile));
}

function updateNumOfTiles(e) {
    numOfTiles = +e.target.value;
    resetTiles();
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function moveTower(tileIndex, source, dest, spare) {
    if (tileIndex === 0) {
        dest.insertBefore(tiles[tileIndex], dest.firstChild);
        updateCounter();
        await wait(500);
    } else {
        await moveTower(tileIndex - 1, source, spare, dest);
        dest.insertBefore(tiles[tileIndex], dest.firstChild);
        updateCounter();
        await wait(500);
        await moveTower(tileIndex - 1, spare, dest, source);
    }
}

async function solve() {
    resetTiles();
    towers.forEach((tower) =>
        tower.removeEventListener('mousedown', clickOnTile)
    );
    await moveTower(numOfTiles - 1, towers[0], towers[2], towers[1]);
}

towers.forEach((tower) => tower.addEventListener('mousedown', clickOnTile));
tiles.forEach((tile) => tile.addEventListener('mouseup', placeTile));
window.addEventListener('mousemove', moveTile);
numOfTilesElement.addEventListener('change', updateNumOfTiles);
resetBtn.addEventListener('click', resetTiles);
solveBtn.addEventListener('click', solve);
