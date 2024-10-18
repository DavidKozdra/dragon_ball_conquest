import { canvasWidth, canvasHeight, startGame, setGameState, gameState, getGameState } from './game.js';
import { characters } from './characters.js';

console.log(characters, "GPT IS FUCKING WRONG")

let selectedCharacters = [[], []]; // Keeps track of selected characters for player1 and player2
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

let buttonNext, buttonPrevious, buttonSelect, buttonAddPlayer1, buttonAddPlayer2, buttonPlay, buttonBack, unpauseButton, startGameButton, backToMainButton;
let toggleButton, toggleButton2;
let player1Div, player2Div;

// Initialize UI elements array to keep track of current UI components
let uiElements = [];

// Function to get bounds of an element
function getBounds(element) {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
    width: rect.width,
    height: rect.height
  };
}

// Function to map the bounds of one HTML element to another
function mapBounds(sourceElement, targetElement) {
  const sourceBounds = getBounds(sourceElement);
  const targetBounds = getBounds(targetElement);

  // Calculate position difference
  const offsetX = sourceBounds.left - targetBounds.left;
  const offsetY = sourceBounds.top - targetBounds.top;

  // Apply position and size adjustments to target element
  targetElement.style.left = offsetX + 'px';
  targetElement.style.top = offsetY + 'px';
  targetElement.style.width = sourceBounds.width + 'px';
  targetElement.style.height = sourceBounds.height + 'px';
}

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

  buttonSelect = createButton('Re-Start Game');
  buttonSelect.class('game-button');
  buttonSelect.size(100, 50);
  buttonSelect.hide();
  buttonSelect.mousePressed(() => {
    if (selectedCharacters[0].length > 0 && selectedCharacters[1].length > 0) {
      startGame();
    }else {
      alert("can't start without chars")
    }
  });

  unpauseButton = createButton('unPause');
  unpauseButton.class('game-button');
  unpauseButton.size(100, 50);
  unpauseButton.hide();
  unpauseButton.mousePressed(() => {
    setGameState('playing');
  });

  buttonAddPlayer1 = createButton('+ Add Player 1');
  buttonAddPlayer1.class('game-button');
  buttonAddPlayer1.size(100, 50);
  buttonAddPlayer1.hide();
  buttonAddPlayer1.mousePressed(() => displayCharacterSelectionPanel(0, -1));

  buttonAddPlayer2 = createButton('+ Add Player 2');
  buttonAddPlayer2.class('game-button');
  buttonAddPlayer2.size(100, 50);
  buttonAddPlayer2.hide();
  buttonAddPlayer2.mousePressed(() => displayCharacterSelectionPanel(1, -1));

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
    }
  });

  backToMainButton = createButton('Back to Main Menu');
  backToMainButton.class('game-button');
  backToMainButton.size(100, 50);
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
      alert("Empty team cannot toggle controllable until there are chars selected");
      return;
    }
    selectedCharacters[1].forEach(char => {
      char.isControllable = !char.isControllable;
    });
    toggleButton2.html(selectedCharacters[1][0].isControllable ? 'Human' : 'AI');
  });

  // Initialize player divs
  initializePlayerDivs();
}

function initializePlayerDivs() {
  const canvas = document.getElementById('game-canvas');
  const rect = canvas.getBoundingClientRect();

  // Create player 1 div
  player1Div = createDiv();
  player1Div.position(rect.left + window.scrollX + rect.width / 4 - 50, rect.top + window.scrollY + rect.height / 4 + 50);
  player1Div.addClass("teamGrid");
  player1Div.hide();

  // Create player 2 div
  player2Div = createDiv();
  player2Div.position(rect.left + window.scrollX + (rect.width / 4) * 3 - 50, rect.top + window.scrollY + rect.height / 4 + 50);
  player2Div.addClass("teamGrid");
  player2Div.hide();
}

function hideAllUIElements() {
  buttonNext.hide();
  buttonPrevious.hide();
  buttonPlay.hide();
  buttonSelect.hide();
  buttonAddPlayer1.hide();
  buttonAddPlayer2.hide();
  buttonBack.hide();
  unpauseButton.hide();
  startGameButton.hide();
  backToMainButton.hide();
  toggleButton.hide();
  toggleButton2.hide();
  // Hide player divs
  player1Div.hide();
  player2Div.hide();
  // Remove character selection panels if any
  let charSelectDivs = document.getElementsByClassName('charSelectDiv');
  while (charSelectDivs.length > 0) {
    charSelectDivs[0].remove();
  }
  // Clear any dynamically added UI elements
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
    // Add other cases if necessary
    default:
      alert("state error");
      break;
  }
}

function RenderMainMenu() {
  background(200, 200, 220);
  fill(0);
  stroke(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text('Dragon Ball Conquest', canvasWidth / 2, canvasHeight / 2 - 50);
  textSize(16);
  let menu = menus[currentMenu];
  fill(0);
  textSize(16);
  textAlign(CENTER, CENTER);
  text(menu.name, canvasWidth / 2, canvasHeight / 2 + 50);
  //rect(canvasWidth / 2 - 50, canvasHeight / 2 + 60, 100, 100);

  // Show and position buttons
  buttonNext.show();
  buttonPrevious.show();
  buttonPlay.show();

  positionButtons();
}

function RenderSettings() {
  background(200, 200, 220);
  fill(0);
  stroke(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text('Settings', canvasWidth / 2, canvasHeight / 2 - 50);

  // Show and position buttons
  buttonBack.show();

  positionButtons();
}

function RenderCharacterSelector() {
  background(200, 200, 220);
  fill(0);
  stroke(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text('Select Your Characters', canvasWidth / 2, canvasHeight / 2 - 150);
  textSize(16);

  // Show buttons
  buttonAddPlayer1.show();
  buttonAddPlayer2.show();
  buttonBack.show();
  startGameButton.show();
  toggleButton.show();
  toggleButton2.show();

  // Show player divs
  player1Div.show();
  player2Div.show();
  updatePlayerDivs();

  positionButtons();
}

function RenderPausedUI() {
  // Show pause menu buttons
  unpauseButton.show();
  backToMainButton.show();

  positionButtons();
}

function updatePlayerDivs() {
  player1Div.html('');
  player2Div.html('');

  if (selectedCharacters[0]) {
    selectedCharacters[0].forEach((char, index) => {
      const charButton = createButton(char.name);
      charButton.class('char-button');
      charButton.mousePressed(() => displayCharacterSelectionPanel(0, index));
      charButton.style('margin', '5px 0');
      player1Div.child(charButton);
      uiElements.push(charButton);
    });
  }

  if (selectedCharacters[1]) {
    selectedCharacters[1].forEach((char, index) => {
      const charButton = createButton(char.name);
      charButton.class('char-button');
      charButton.mousePressed(() => displayCharacterSelectionPanel(1, index));
      charButton.style('margin', '5px 0');
      player2Div.child(charButton);
      uiElements.push(charButton);
    });
  }
}


function displayCharacterSelectionPanel(playerIndex, charIndex) {
  const canvas = document.getElementById('game-canvas');
  const rect = canvas.getBoundingClientRect();
  console.log("DISPLAY")
  // Create the panel as a p5.js element
  const panel = createDiv();
  panel.addClass('charSelectDiv');

  // Position the panel at the bottom of the viewport
  panel.position(0, window.innerHeight - 200);

  // Set the panel's dimensions
  panel.style('width', '100%');
  panel.style('height', '200px');

  // Add character buttons to the panel
  characters.forEach(char => {
    const charButton = createButton(char.name);
    charButton.class('char-button');
    charButton.mousePressed(() => {
      if (charIndex === -1) {
        selectedCharacters[playerIndex].push({ ...char });
      } else {
        selectedCharacters[playerIndex][charIndex] = { ...char };
      }
      panel.remove();
      updatePlayerDivs(); // Update the player divs to reflect changes
    });
    panel.child(charButton);
    uiElements.push(charButton);
  });

  // Add 'Remove Character' button if editing an existing character
  if (charIndex !== -1) {
    const removeButton = createButton('Remove Character');
    removeButton.class('game-button');
    removeButton.mousePressed(() => {
      selectedCharacters[playerIndex].splice(charIndex, 1);
      panel.remove();
      updatePlayerDivs();
    });
    panel.child(removeButton);
    uiElements.push(removeButton);
  }
  panel.parent(document.body);

  uiElements.push(panel);
}

function findInputByName(name) {
  // Since Inputs array is no longer used, this function returns undefined
  return undefined;
}

function UpdatePanels() {
  // Since panels are managed within render functions, this function can be left empty
}

function onWindowResize() {
  UpdateUI();
}

function positionButtons() {
  const canvas = document.getElementById('game-canvas');
  const rect = canvas.getBoundingClientRect();

  const canvasLeft = rect.left + window.scrollX;
  const canvasTop = rect.top + window.scrollY;

  buttonNext.position(canvasLeft + rect.width - 60, canvasTop + rect.height / 2 - 25);
  buttonPrevious.position(canvasLeft + 10, canvasTop + rect.height / 2 - 25);
  buttonPlay.position(canvasLeft + rect.width / 2 - 50, canvasTop + rect.height - 220);
  buttonAddPlayer1.position(canvasLeft + rect.width / 4 - 50, canvasTop + rect.height - 200);
  buttonAddPlayer2.position(canvasLeft + (rect.width / 4) * 3 - 50, canvasTop + rect.height - 200);
  buttonBack.position(canvasLeft + rect.width / 2.7, canvasTop + rect.height - 60);
  unpauseButton.position(canvasLeft + rect.width / 2 - 50, canvasTop + rect.height - 150);
  startGameButton.position(canvasLeft + rect.width / 2 - 50, canvasTop + rect.height - 150);
  backToMainButton.position(canvasLeft + rect.width / 2 - 50, canvasTop + rect.height - 100);

  toggleButton.position(canvasLeft + rect.width / 4 - 50, canvasTop + rect.height / 4);
  toggleButton2.position(canvasLeft + (rect.width / 4) * 3 - 50, canvasTop + rect.height / 4);

  // Position player divs
  player1Div.position(canvasLeft + rect.width / 4 - 50, canvasTop + rect.height / 4 + 50);
  player2Div.position(canvasLeft + (rect.width / 4) * 3 - 50, canvasTop + rect.height / 4 + 50);
}

export { currentMenu, menus, displayCharacterSelectionPanel, RenderCharacterSelector, RenderMainMenu, positionButtons, UpdateUI, UpdatePanels, selectedCharacters, onWindowResize, findInputByName, initializeButtons };
