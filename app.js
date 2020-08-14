let clickCount = 0;
let moveCount = 0;
let table = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8];
let compareImg = [];
let compareId = [];
let correctImages = [];
let playerNick = null;
const memos = {
  1: "bird_green",
  2: "bird_yellow",
  3: "cat",
  4: "cow",
  5: "dog",
  6: "fish_purple",
  7: "fish_yellow",
  8: "owl",
};

window.onload = populateBoard;

const addStats = document.querySelector(".stats");

addStats.addEventListener("click", addScore);

const showStatsOnly = document.querySelector(".show-stats");

showStatsOnly.addEventListener('click', getScores)

const board = document.querySelector(".game__board");
board.addEventListener("click", rotate);

function rotate(e) {
  if (clickCount < 2) {
    let img, id = null;
    if (e.target.classList.contains("tile__front")) {
        img = e.target.nextElementSibling.firstElementChild.src;
        id = e.target.parentElement.parentElement.id;
    
    }
    else if (e.target.classList.contains("tile__inner")) {
        img =e.target.firstElementChild.nextElementSibling.firstElementChild.src;
        id = e.target.parentElement.id;
      
    }
    if (img && id != null) {
      const tile = document.getElementById(id);
      tile.firstElementChild.classList.add("rotate");
      clickCount++;
      compareImg.push(img);
      compareId.push(id);
    }
    
    if (clickCount == 2) {
      checkTiles(compareId, compareImg);
    }
  }
}

function shuffleBoard(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function saveMatchedImages(ids) {
  correctImages.push(parseInt(ids[0]), parseInt(ids[1]));
  document.querySelectorAll(".tile").forEach((tile) => {
    correctImages.forEach((element) => {
      if (element == parseInt(tile.id)) {
        tile.classList.add("matched");
      }
    });
  });
}

function coverAllTiles() {
  document.querySelectorAll(".tile").forEach((tile) => {
    tile.firstElementChild.className = "tile__inner";
  });
}

function coverMismatchedTiles() {
  document.querySelectorAll(".tile").forEach((tile) => {
    if (correctImages.find((e) => e == tile.id)) {
      document.getElementById(tile.id).firstElementChild.className =
        "tile__inner rotate";
    } else {
      document.getElementById(tile.id).firstElementChild.className =
        "tile__inner";
    }
  });
}

function checkTiles(ids, imgs) {
  moveCount++;
  setTimeout(() => {
    if (imgs[0] == imgs[1]) {
      saveMatchedImages(ids);
    } else {
      if (correctImages.length == 0) {
        coverAllTiles();
      } else {
        coverMismatchedTiles();
      }
    }
    clickCount = 0;
    compareImg = [];
    compareId = [];
    if (correctImages.length == 16) {
      showModal();
    }
  }, 1300);
}

function populateBoard() {
  shuffleBoard(table);
  document.querySelectorAll(".tile__back").forEach((tile, index) => {
    const img = document.createElement("img");
    const link = memos[table[index]];
    img.setAttribute("src", `memos/${link}.png`);
    img.setAttribute("alt", `image`);
    tile.appendChild(img);
  });
}

function clearBoard() {
  document.querySelectorAll(".tile__back").forEach(tile => {
    tile.innerHTML = '';
  })
}

function getLocalStorage() {
  return localStorage.getItem("name");
}
function addToLocalStorage(input) {
  localStorage.setItem("name", input);
}

async function postScore(name) {
  try {
    const req = await fetch(
      `https://memory-game-c467d.firebaseio.com/players.json`,
      {
        method: "Post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nick: name, score: moveCount }),
      }
    )
      .then((response) => response.json())
      .then((data) => data);
    return await getScores();
  } catch (err) {
    console.log(err);
  }
}

async function getScores() {
  try {
    showStatsOnly.disabled = true;
    const req = await fetch(
      `https://memory-game-c467d.firebaseio.com/players.json`
    )
      .then((response) => response.json())
      .then((data) => data);
    const res = await req;
    showStats(res);
    addStats.disabled = true;
    addStats.style.display = "none";
    showStatsOnly.style.display = "none";
  } catch (err) {
    console.log(err);
  }
}

function addScore() {
  if (playerNick != null) {
    addStats.disabled = true;
    postScore(playerNick);
  } else {
    const input = document.querySelector(".name");
    if (input.value != "") {
      addStats.disabled = true;
      addToLocalStorage(input.value.toUpperCase());
      postScore(input.value.toUpperCase());
    } else {
      input.classList.add("input-warning");
      input.placeholder = "Type your name...";
      setTimeout(() => {
        input.classList.remove("input-warning");
        input.placeholder = "Your name";
      }, 1500);
    }
  }
}

function showModal() {
  document.querySelector(".move-count").innerText = `moves: ${moveCount}`;
  document.querySelector(".modal-container").classList.add("show");
  const modal = document.querySelector(".modal");
  if (getLocalStorage() == null) {
    if (!document.querySelector('.name')) {
      const input = document.createElement("input");
      input.className = "name";
      input.type = "text";
      input.placeholder = "Your name";
      modal.insertBefore(input, addStats);
    }
  } else if (getLocalStorage() != null) {
    playerNick = getLocalStorage();
  }
  document.querySelector(".replay").addEventListener("click", playAgain);
}

function showStats(stats) {
  document.querySelector(".message").style.display = "none";
  document.querySelector(".stats").style.display = "none";
  document.querySelector(".move-count").style.display = "none";
  if (document.querySelector(".name")) {
    document.querySelector(".name").style.display = "none";
  }
  const tableWrapper = document.createElement("div");
  tableWrapper.className = "table-wrapper";
  const tableScroll = document.createElement("div");
  tableScroll.className = "table-scroll";
  const btn = document.querySelector(".replay");
  const table = document.createElement("table");
  const header = table.createTHead();
  const heading = `<thead><tr><th><span class='text'>Name</span></th><th><span class='text'>Score</span></th></tr></thead>`;
  header.innerHTML = heading;
  const body = table.createTBody();
  let data = "";
  let sortable = [];
  for (let key in stats) {
    sortable.push([stats[key].nick, stats[key].score]);
    sortable.sort((a, b) => a[1] - b[1]);
  }
  sortable.forEach((element) => {
    data += `<tr><td>${element[0]}</td><td>${element[1]}</td></tr>`;
  });
  body.innerHTML = data;
  table.appendChild(body);
  tableScroll.appendChild(table);
  tableWrapper.appendChild(tableScroll);
  document.querySelector(".modal").insertBefore(tableWrapper, btn);
}

function playAgain() {
  coverAllTiles();
  document.querySelector(".modal-container").classList.remove("show");
  moveCount = 0;
  correctImages = [];
  playerNick = null;
  document.querySelectorAll(".tile").forEach((tile) => { 
        tile.classList.remove("matched");   
  });
  clearBoard();
  setTimeout(() => {
    populateBoard();
  },500)
  
}