let players = [];
let secretWord = "";
let hint = "";
let impostorIndex = 0;
let currentIndex = 0;
let revealed = false;
let finalHold = false;
let holdTimer = null;

/* --- Persistencia --- */
names.value = localStorage.getItem("players") || "";
word.value = localStorage.getItem("word") || "";
Pista.value = localStorage.getItem("hint") || "";

names.addEventListener("input", () => {
  localStorage.setItem("players", names.value);
});
word.addEventListener("input", () => {
  localStorage.setItem("word", word.value);
});
Pista.addEventListener("input", () => {
  localStorage.setItem("hint", Pista.value);
});

/* --- Juego --- */
function startGame() {
  players = names.value.split(",").map(n => n.trim()).filter(Boolean);
  secretWord = word.value;
  hint = Pista.value;

  if (players.length < 3 || !secretWord) {
    alert("Ingresa al menos 3 jugadores y una palabra");
    return;
  }

  impostorIndex = Math.floor(Math.random() * players.length);
  currentIndex = 0;

  setup.style.display = "none";
  game.style.display = "block";
  updatePlayer();
}

async function startGameRandom() {

  const namesInput = names.value.trim();

  if (!namesInput) {
    alert("Debes ingresar los nombres primero.");
    return;
  }

  const parsedPlayers = namesInput
    .split(",")
    .map(name => name.trim())
    .filter(Boolean);

  if (parsedPlayers.length < 3) {
    alert("Necesitas al menos 3 jugadores.");
    return;
  }

  // Cargar palabras del CSV
  const wordsList = await loadCSV();

  async function loadCSV() {
  const response = await fetch("script/words.csv");
  const text = await response.text();
  return parseCSV(text);
}

function parseCSV(csv) {
  const lines = csv.trim().split("\n").slice(1);

  return lines.map(line => {
    const [secretWord, hint] = line.split(",");
    return { secretWord, hint };
  });
}

  if (!wordsList.length) {
    alert("No se pudieron cargar las palabras.");
    return;
  }

  // Elegir palabra random
  const randomIndex = Math.floor(Math.random() * wordsList.length);
  const randomWord = wordsList[randomIndex];

  // Insertar en inputs existentes
  word.value = randomWord.secretWord;
  Pista.value = randomWord.hint;

  // Iniciar juego normal
  startGame();
}

function updatePlayer() {
  revealed = false;
  finalHold = false;

  card.classList.remove("revealed", "holding");
  card.querySelector(".card-content").textContent = "Toca para revelar tu rol";

  playerTitle.textContent = `Turno de: ${players[currentIndex]}`;
  nextBtn.disabled = true;

  card.onclick = revealRole;
}

function revealRole() {
  if (revealed) return;

  revealed = true;
  card.classList.add("revealed");

  const content = card.querySelector(".card-content");

  if (currentIndex === impostorIndex) {
    content.innerHTML = `😈<br>Eres el impostor${hint ? `<div class="hint">🧩 ${hint}</div>` : ""}`;
  } else {
    content.innerHTML = `🔑 ${secretWord}`;
  }

  nextBtn.disabled = false;
}

function nextPlayer() {
  currentIndex++;

  if (currentIndex < players.length) {
    updatePlayer();
  } else {
    prepareFinalHold();
  }
}

/* --- FINAL CON TENSIÓN --- */
function prepareFinalHold() {
  finalHold = true;
  nextBtn.style.display = "none";

  playerTitle.textContent = "🤫 Momento final";

  const content = card.querySelector(".card-content");
  content.innerHTML = `
    Mantén presionado <br>
    para revelar al impostor
    <div class="hint">(no sueltes)</div>
  `;

  card.onmousedown = startHold;
  card.ontouchstart = startHold;
  card.onmouseup = cancelHold;
  card.onmouseleave = cancelHold;
  card.ontouchend = cancelHold;
}

function startHold() {
  if (!finalHold) return;

  card.classList.add("holding");
  holdTimer = setTimeout(revealFinal, 3000);
}

function cancelHold() {
  if (!finalHold) return;

  clearTimeout(holdTimer);
  card.classList.remove("holding");
}

function revealFinal() {
  game.style.display = "none";
  end.style.display = "block";

  result.innerHTML = `
    😈 El impostor fue: <strong>${players[impostorIndex]}</strong><br>
    🔑 La palabra era: <strong>${secretWord}</strong>
  `;

  confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 }
});
}

/* --- Restart --- */
function restart() {
  nextBtn.style.display = "block";
  currentIndex = 0;
  setup.style.display = "block";
  end.style.display = "none";
}

