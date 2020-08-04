(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
window.addEventListener("load", populateBoard);

const addStats = document.querySelector(".stats");

addStats.addEventListener("click", addScore);

const showStatsOnly = document.querySelector(".show-stats");

showStatsOnly.addEventListener('click', getScores)

const board = document.querySelector(".game__board");
board.addEventListener("click", rotate);

function rotate(e) {
  if (clickCount < 2) {
    if (e.target.classList.contains("tile__front")) {
      const img = e.target.nextElementSibling.firstElementChild.src;
      const id = e.target.parentElement.parentElement.id;
      const tile = document.getElementById(id);
      tile.firstElementChild.classList.add("rotate");
      clickCount++;
      compareImg.push(img);
      compareId.push(id);
      if (clickCount == 2) {
        checkCount(compareId, compareImg);
      }
    }
    if (e.target.classList.contains("tile__inner")) {
      const img =
        e.target.firstElementChild.nextElementSibling.firstElementChild.src;
      const id = e.target.parentElement.id;
      const tile = document.getElementById(id);
      tile.firstElementChild.classList.add("rotate");
      clickCount++;
      compareImg.push(img);
      compareId.push(id);
      if (clickCount == 2) {
        checkCount(compareId, compareImg);
      }
    }
  }
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function checkCount(ids, imgs) {
  moveCount++;
  setTimeout(() => {
    if (imgs[0] == imgs[1]) {
      correctImages.push(parseInt(ids[0]), parseInt(ids[1]));
      document.querySelectorAll(".tile").forEach((tile) => {
        correctImages.forEach((element) => {
          if (element == parseInt(tile.id)) {
            tile.classList.add("matched");
            // return;
          }
        });
      });
    } else {
      if (correctImages.length <= 0) {
        document.querySelectorAll(".tile").forEach((tile) => {
          tile.firstElementChild.className = "tile__inner";
        });
      } else {
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
  shuffle(table);
  document.querySelectorAll(".tile__back").forEach((tile, index) => {
    const img = document.createElement("img");
    const link = memos[table[index]];
    img.setAttribute("src", `memos/${link}.png`);
    img.setAttribute("alt", `image`);
    tile.appendChild(img);
  });
}

function getLocalStorage() {
  const name = localStorage.getItem("name");
  return name;
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
      .then(response => response.json())
      .then(data => data);
    return await  getScores();
  } catch (err) {
    console.log(err);
  }
}

async function getScores() {
  try {
    const req = await fetch(
      `https://memory-game-c467d.firebaseio.com/players.json`
    )
      .then(response => response.json())
      .then(data => data);
    const res = await req;
    showStats(res)
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
    const input = document.createElement("input");
    input.className = "name";
    input.type = "text";
    input.placeholder = "Your name";
    modal.insertBefore(input, addStats);
  } else if (getLocalStorage() != null) {
    playerNick = getLocalStorage();
  }
  document.querySelector(".replay").addEventListener("click", () => {
    location.reload();
  });
}

function showStats(stats) {
  document.querySelector('.message').style.display = 'none';
  document.querySelector('.stats').style.display = 'none';
  document.querySelector('.move-count').style.display = 'none';
  if (document.querySelector('.name')) {
    document.querySelector('.name').style.display = 'none';
  }
  const tableWrapper = document.createElement('div');
  tableWrapper.className = 'table-wrapper'
  const tableScroll = document.createElement('div');
  tableScroll.className = 'table-scroll'
  const btn = document.querySelector('.replay')
  const table = document.createElement('table');
  const header = table.createTHead()
  const heading = `<thead><tr><th><span class='text'>Name</span></th><th><span class='text'>Score</span></th></tr></thead>`;
  header.innerHTML = heading;
  const body = table.createTBody();
  let data = '';
  for (let key in stats) {
    const nick = stats[key].nick;
    const score = stats[key].score;
    data += `<tr><td>${nick}</td><td>${score}</td></tr>` 
  }
  body.innerHTML = data;
  table.appendChild(body);
  tableScroll.appendChild(table);
  tableWrapper.appendChild(tableScroll)
  document.querySelector('.modal').insertBefore(tableWrapper, btn)
}
},{}]},{},[1]);
