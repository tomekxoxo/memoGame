const clickCount = null;
const board = document.querySelector('.game__board');
board.addEventListener('click', rotate);

function rotate(e) {
  if (e.target.classList.contains('tile__front')) {
    console.log(e.target.parentElement.id);
  }
  else {
    console.log(e.target.id);
  }
  e.preventDefault()
}