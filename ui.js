import { canvasWidth, canvasHeight, startGame, setGameState, gameState } from './game.js';
import { characters } from './characters.js';

let selectedCharacters = [[], []]; // Selected characters for player1 and player2
let currentMenu = 0;
let menus = [
  {
    name: 'Play',
    image: 'char_select.png',
    onselect: () => {
      setGameState('char_select');
    }
  },
  {
    name: 'Settings',
    image: 'char_select.png',
    onselect: () => {
      setGameState('settings');
    }
  }
];

let buttonNext, buttonPrevious, buttonPlay, buttonBack, unpauseButton, startGameButton, backToMainButton;
let toggleButton, toggleButton2;
let player1Div, player2Div, availableCharsDiv;

let uiElements = [];

// Initialize UI elements
function initializeButtons() {
  buttonNext = createButton('>');
  buttonNext.class('game-button');
  buttonNext.size(50, 50);
  buttonNext.hide();
  buttonNext.mousePressed(() => {
    currentMenu = (currentMenu + 1) % menus.length;
  });

  buttonPrevious = createButton('<');
  buttonPrevious.class('game-button');
  buttonPrevious.size(50, 50);
  buttonPrevious.hide();
  buttonPrevious.mousePressed(() => {
    currentMenu = (currentMenu - 1 + menus.length) % menus.length;
  });

  buttonPlay = createButton('Select');
  buttonPlay.class('game-button');
  buttonPlay.size(100, 50);
  buttonPlay.hide();
  buttonPlay.mousePressed(() => {
    menus[currentMenu].onselect();
  });

  buttonBack = createButton('Back');
  buttonBack.class('game-button');
  buttonBack.size(100, 50);
  buttonBack.hide();
  buttonBack.mousePressed(() => {
    setGameState('main_menu');
  });

  startGameButton = createButton('Start Game');
  startGameButton.class('game-button');
  startGameButton.size(100, 50);
  startGameButton.hide();
  startGameButton.mousePressed(() => {
    if (selectedCharacters[0].length > 0 && selectedCharacters[1].length > 0) {
      startGame();
    } else {
      alert("Can't start without characters");
    }
  });

  unpauseButton = createButton('Unpause');
  unpauseButton.class('game-button');
  unpauseButton.size(100, 50);
  unpauseButton.hide();
  unpauseButton.mousePressed(() => {
    setGameState('playing');
  });

  backToMainButton = createButton('Back to Main Menu');
  backToMainButton.class('game-button');
  backToMainButton.size(150, 50);
  backToMainButton.hide();
  backToMainButton.mousePressed(() => {
    setGameState('main_menu');
  });

  toggleButton = createButton('Human');
  toggleButton.class('game-button');
  toggleButton.size(70, 50);
  toggleButton.hide();
  toggleButton.mousePressed(() => {
    if (selectedCharacters[0].length === 0) {
      return;
    }
    selectedCharacters[0].forEach(char => {
      char.isControllable = !char.isControllable;
    });
    toggleButton.html(selectedCharacters[0][0].isControllable ? 'Human' : 'AI');
  });

  toggleButton2 = createButton('Human');
  toggleButton2.class('game-button');
  toggleButton2.size(70, 50);
  toggleButton2.hide();
  toggleButton2.mousePressed(() => {
    if (selectedCharacters[1].length === 0) {
      alert("Empty team cannot toggle controllable until there are characters selected");
      return;
    }
    selectedCharacters[1].forEach(char => {
      char.isControllable = !char.isControllable;
    });
    toggleButton2.html(selectedCharacters[1][0].isControllable ? 'Human' : 'AI');
  });

  initializePlayerDivs();
}

// Initialize player and available characters divs
function initializePlayerDivs() {
  const canvas = document.getElementById('game-canvas');
  const rect = canvas.getBoundingClientRect();

  // Player 1 Div
  player1Div = createDiv();
  player1Div.position(rect.left + window.scrollX + 50, rect.top + window.scrollY + 100);
  player1Div.addClass('teamGrid');
  player1Div.hide();

  // Player 2 Div
  player2Div = createDiv();
  player2Div.position(rect.left + window.scrollX + rect.width , rect.top + window.scrollY + 100);
  player2Div.addClass('teamGrid');
  player2Div.hide();

  // Available Characters Div
  availableCharsDiv = createDiv();
  availableCharsDiv.position(rect.left + window.scrollX + rect.width / 2 - 200, rect.top + window.scrollY + 100);
  availableCharsDiv.addClass('availableCharsGrid');
  availableCharsDiv.hide();
}

function hideAllUIElements() {
  buttonNext.hide();
  buttonPrevious.hide();
  buttonPlay.hide();
  buttonBack.hide();
  startGameButton.hide();
  unpauseButton.hide();
  backToMainButton.hide();
  toggleButton.hide();
  toggleButton2.hide();

  player1Div.hide();
  player2Div.hide();
  availableCharsDiv.hide();

  uiElements.forEach(el => el.remove());
  uiElements = [];
}

function UpdateUI() {
  hideAllUIElements();
  switch (gameState) {
    case 'main_menu':
      RenderMainMenu();
      break;
    case 'char_select':
      RenderCharacterSelector();
      break;
    case 'settings':
      RenderSettings();
      break;
    case 'paused':
      RenderPausedUI();
      break;
      case 'playing':
        break;
    default:
      console.error('Unknown game state:', gameState);
      break;
  }
}

function RenderMainMenu() {
  background(200, 200, 220);
  fill(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text('Dragon Ball Conquest', canvasWidth / 2, canvasHeight / 2 - 50);

  let menu = menus[currentMenu];
  fill(0);
  textSize(24);
  text(menu.name, canvasWidth / 2, canvasHeight / 2 + 50);

  buttonNext.show();
  buttonPrevious.show();
  buttonPlay.show();

  positionButtons();
}

function RenderSettings() {
  background(200, 200, 220);
  fill(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text('Settings', canvasWidth / 2, canvasHeight / 2 - 50);

  buttonBack.show();

  positionButtons();
}

function RenderCharacterSelector() {
  background(200, 200, 220);
  fill(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text('Character Selection', canvasWidth / 2, 50);

  // Show player divs, available characters, and toggle buttons
  player1Div.show();
  player2Div.show();
  availableCharsDiv.show();
  startGameButton.show();
  buttonBack.show();
  toggleButton.show();
  toggleButton2.show();

  // Assign random characters if not already assigned
  if (selectedCharacters[0].length === 0 && selectedCharacters[1].length === 0) {
    assignRandomCharacters();
  }

  updatePlayerDivs();
  updateAvailableCharsDiv();

  positionButtons();
}

function RenderPausedUI() {

  textSize(32);
  textAlign(CENTER, CENTER);
  unpauseButton.show();
  backToMainButton.show();

  positionButtons();
}

function assignRandomCharacters() {
  // Clone the characters array to avoid modifying the original
  let availableChars = [...characters];

  // Randomly select characters for player 1
  for (let i = 0; i < 3; i++) {
    let randomIndex = floor(random(availableChars.length));
    selectedCharacters[0].push({ ...availableChars[randomIndex], isControllable: true });
  }

  // Randomly select characters for player 2
  for (let i = 0; i < 3; i++) {
    let randomIndex = floor(random(availableChars.length));
    selectedCharacters[1].push({ ...availableChars[randomIndex], isControllable: true });
  }
}

function updatePlayerDivs() {
  player1Div.html('<h3>Player 1 Team</h3>');
  player2Div.html('<h3>Player 2 Team</h3>');

  selectedCharacters[0].forEach((char, index) => {
    const charDiv = createDiv(char.name + ' (' + (char.isControllable ? 'Human' : 'AI') + ')');
    charDiv.class('char-display');
    charDiv.mousePressed(() => displayCharacterSelectionPanel(0, index));
    player1Div.child(charDiv);
    uiElements.push(charDiv);
  });

  selectedCharacters[1].forEach((char, index) => {
    console.log(char.name)
    const charDiv = createDiv(char.name + ' (' + (char.isControllable ? 'Human' : 'AI') + ')');
    charDiv.class('char-display');
    charDiv.mousePressed(() => displayCharacterSelectionPanel(1, index));
    player2Div.child(charDiv);
    uiElements.push(charDiv);
  });
}

function updateAvailableCharsDiv() {
  return
  availableCharsDiv.html('<h3>Available Characters</h3>');

  // Get the list of selected characters
  const selectedCharsNames = [
    ...selectedCharacters[0].map(c => c.name),
    ...selectedCharacters[1].map(c => c.name)
  ];

  const availableChars = characters.filter(c => !selectedCharsNames.includes(c.name));

  availableChars.forEach(char => {
    const charDiv = createDiv(char.name);
    charDiv.class('char-display');
    charDiv.mousePressed(() => selectCharacter(char));
    availableCharsDiv.child(charDiv);
    uiElements.push(charDiv);
  });
}

function displayCharacterSelectionPanel(playerIndex, charIndex) {
  // Open character selection panel to swap or remove character
  const char = selectedCharacters[playerIndex][charIndex];
  const isAI = char.isControllable ? 'Human' : 'AI';

  const optionsPanel = createDiv();
  optionsPanel.addClass('optionsPanel');
  optionsPanel.position(windowWidth / 2 - 100, windowHeight / 2 - 50);
  optionsPanel.style('width', '200px');
  optionsPanel.style('height', '100px');
  optionsPanel.style('background-color', '#fff');
  optionsPanel.style('border', '1px solid #000');
  optionsPanel.style('padding', '10px');
  optionsPanel.style('text-align', 'center');

  const toggleButton = createButton('Toggle AI/Human');
  toggleButton.mousePressed(() => {
    char.isControllable = !char.isControllable;
    updatePlayerDivs();
    optionsPanel.remove();
  });
  optionsPanel.child(toggleButton);

  const removeButton = createButton('Remove Character');
  removeButton.mousePressed(() => {
    const removedChar = selectedCharacters[playerIndex].splice(charIndex, 1)[0];
    characters.push(removedChar);
    updatePlayerDivs();
    updateAvailableCharsDiv();
    optionsPanel.remove();
  });
  optionsPanel.child(removeButton);

  const closeButton = createButton('Close');
  closeButton.mousePressed(() => {
    optionsPanel.remove();
  });
  optionsPanel.child(closeButton);

  uiElements.push(optionsPanel);
}

function selectCharacter(char) {
  // Add character to the team with fewer characters
  if (selectedCharacters[0].length < 3) {
    selectedCharacters[0].push({ ...char, isControllable: true });
  } else if (selectedCharacters[1].length < 3) {
    selectedCharacters[1].push({ ...char, isControllable: true });
  } else {
    alert('Both teams are full. Remove a character to add a new one.');
    return;
  }

  // Remove character from available characters
  const charIndex = characters.findIndex(c => c.name === char.name);
  if (charIndex !== -1) {
    characters.splice(charIndex, 1);
  }

  updatePlayerDivs();
  updateAvailableCharsDiv();
}

function positionButtons() {
  const canvas = document.getElementById('game-canvas');
  const rect = canvas.getBoundingClientRect();
  const canvasLeft = rect.left + window.scrollX;
  const canvasTop = rect.top + window.scrollY;

  buttonNext.position(canvasLeft + rect.width - 60, canvasTop + rect.height / 2 - 25);
  buttonPrevious.position(canvasLeft + 10, canvasTop + rect.height / 2 - 25);
  buttonPlay.position(canvasLeft + rect.width / 2 - 50, canvasTop + rect.height - 100);
  buttonBack.position(canvasLeft + 20, canvasTop + 400);
  startGameButton.position(canvasLeft + rect.width - 150, canvasTop + 400);
  unpauseButton.position(canvasLeft + rect.width / 2 - 50, canvasTop + rect.height / 1.5);
  backToMainButton.position(canvasLeft + rect.width / 2 - 75, canvasTop + rect.height / 2 + 150);

  toggleButton.position(canvasLeft + 50, canvasTop + rect.height - 100);
  toggleButton2.position(canvasLeft + rect.width - 120, canvasTop + rect.height - 100);

  // Position player divs
  player1Div.position(canvasLeft + 50, canvasTop + 120);
  player2Div.position(canvasLeft + rect.width - 150, canvasTop + 120);
  availableCharsDiv.position(canvasLeft + rect.width / 2 - 200, canvasTop + 100);
}

function onWindowResize() {
  UpdateUI();
}

export {
  currentMenu,
  menus,
  RenderCharacterSelector,
  RenderMainMenu,
  positionButtons,
  UpdateUI,
  selectedCharacters,
  onWindowResize,
  initializeButtons
};
