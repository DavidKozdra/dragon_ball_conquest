import { canvasWidth, canvasHeight, startGame, setGameState, gameState, getGameState } from './game.js';
import { characters } from './characters.js';

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

var Inputs = [];
var panels = [];

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
  buttonNext.mousePressed(() => {
    currentMenu = (currentMenu + 1) % menus.length;
  });

  buttonPrevious = createButton('<');
  buttonPrevious.class('game-button');
  buttonPrevious.size(50, 50);
  buttonPrevious.mousePressed(() => {
    currentMenu = (currentMenu - 1 + menus.length) % menus.length;
  });

  buttonPlay = createButton('Select');
  buttonPlay.class('game-button');
  buttonPlay.size(100, 50);
  buttonPlay.mousePressed(() => {
    menus[currentMenu].onselect();
  });

  buttonSelect = createButton('Re-Start Game');
  buttonSelect.class('game-button');
  buttonSelect.size(100, 50);
  buttonSelect.mousePressed(() => {
    if (selectedCharacters[0].length > 0 && selectedCharacters[1].length > 0) {
      startGame();
    }
  });

  unpauseButton = createButton('unPause');
  unpauseButton.class('game-button');
  unpauseButton.size(100, 50);
  unpauseButton.mousePressed(() => {
    setGameState('playing');
  });

  buttonAddPlayer1 = createButton('+ Add Player 1');
  buttonAddPlayer1.class('game-button');
  buttonAddPlayer1.size(100, 50);
  buttonAddPlayer1.mousePressed(() => displayCharacterSelectionPanel(0, -1));

  buttonAddPlayer2 = createButton('+ Add Player 2');
  buttonAddPlayer2.class('game-button');
  buttonAddPlayer2.size(100, 50);
  buttonAddPlayer2.mousePressed(() => displayCharacterSelectionPanel(1, -1));

  buttonBack = createButton('Back');
  buttonBack.class('game-button');
  buttonBack.size(100, 50);
  buttonBack.mousePressed(() => {
    setGameState('main_menu');
  });

  startGameButton = createButton('Start Game');
  startGameButton.class('game-button');
  startGameButton.size(100, 50);
  startGameButton.mousePressed(() => {
    if (selectedCharacters[0].length > 0 && selectedCharacters[1].length > 0) {
      startGame();
    }
  });

  backToMainButton = createButton('Back to Main Menu');
  backToMainButton.class('game-button');
  backToMainButton.size(100, 50);
  backToMainButton.mousePressed(() => {
    setGameState('main_menu');
  });

  toggleButton = createButton('Human');
  toggleButton.class('game-button');
  toggleButton.size(70, 50);

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

  toggleButton2.mousePressed(() => {
    if (selectedCharacters[1].length === 0) {
      alert("empty team can not toggle controllable till there are chars selected")
      return;
    }
    selectedCharacters[1].forEach(char => {
      char.isControllable = !char.isControllable;
    });
    toggleButton2.html(selectedCharacters[1][0].isControllable ? 'Human' : 'AI');
  });

  Inputs.push({ object: buttonNext, valid_game_state: 'main_menu', name: 'Next' });
  Inputs.push({ object: buttonPrevious, valid_game_state: 'main_menu', name: 'Previous' });
  Inputs.push({ object: buttonPlay, valid_game_state: 'main_menu', name: 'Play' });
  Inputs.push({ object: startGameButton, valid_game_state: 'char_select', name: 'Start_Game' });

  Inputs.push({ object: buttonAddPlayer1, valid_game_state: 'char_select', name: '+ Add Player 1' });
  Inputs.push({ object: buttonAddPlayer2, valid_game_state: 'char_select', name: '+ Add Player 2' });
  Inputs.push({ object: buttonBack, valid_game_state: 'char_select', name: 'Back' });
  Inputs.push({ object: buttonSelect, valid_game_state: 'paused', name: 'Back to Main Menu' });
  Inputs.push({ object: unpauseButton, valid_game_state: 'paused', name: 'unPause' });
  Inputs.push({ object: backToMainButton, valid_game_state: 'paused', name: 'Back to Main Menu' });

  Inputs.push({ object: toggleButton, valid_game_state: 'char_select', name: 'Toggle Player 1' });
  Inputs.push({ object: toggleButton2, valid_game_state: 'char_select', name: 'Toggle Player 2' });



  // Position buttons initially
  positionButtons();

  // Initialize player divs
  initializePlayerDivs();
}

function positionButtons() {
  const canvas = document.getElementById('game-canvas');
  const rect = canvas.getBoundingClientRect();

  // Example adjustment: Ensuring buttons are positioned within the canvas bounds
  const canvasLeft = rect.left + window.scrollX;
  const canvasTop = rect.top + window.scrollY;

  buttonNext.position(canvasLeft + rect.width - 60, canvasTop + rect.height / 2 - 25);
  buttonPrevious.position(canvasLeft + 10, canvasTop + rect.height / 2 - 25);
  buttonSelect.position(canvasLeft + rect.width / 2 - 50, canvasTop + rect.height - 190);
  buttonPlay.position(canvasLeft + rect.width / 2 - 50, canvasTop + rect.height - 220);
  buttonAddPlayer1.position(canvasLeft + rect.width / 4 - 50, canvasTop + rect.height - 200);
  buttonAddPlayer2.position(canvasLeft + (rect.width / 4) * 3 - 50, canvasTop + rect.height - 200);
  buttonBack.position(canvasLeft + rect.width / 2.7, canvasTop + rect.height - 60);
  unpauseButton.position(canvasLeft + rect.width / 2 - 50, canvasTop + rect.height - 100);
  startGameButton.position(canvasLeft + rect.width / 2 - 50, canvasTop + rect.height - 150);
  backToMainButton.position(canvasLeft + rect.width / 2 - 50, canvasTop + rect.height - 100);

  toggleButton.position(canvasLeft + rect.width / 4 - 50, canvasTop + rect.height / 4);
  toggleButton2.position(canvasLeft + (rect.width / 4) * 3 - 50, canvasTop + rect.height / 4);
}

function initializePlayerDivs() {
  const canvas = document.getElementById('game-canvas');
  const rect = canvas.getBoundingClientRect();

  // Create player 1 div
  player1Div = createDiv();
  player1Div.position(rect.left + window.scrollX + rect.width / 4 - 50, rect.top + window.scrollY + rect.height / 4 + 50);
  player1Div.addClass("teamGrid")
  player1Div.hide();

  // Create player 2 div
  player2Div = createDiv();
  player2Div.position(rect.left + window.scrollX + (rect.width / 4) * 3 - 50, rect.top + window.scrollY + rect.height / 4 + 50);
  player2Div.addClass("teamGrid")
  player2Div.hide();
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
  rect(canvasWidth / 2 - 50, canvasHeight / 2 + 60, 100, 100);

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

  player1Div.show();
  player2Div.show();
  updatePlayerDivs();
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
      Inputs.push({ object: charButton, valid_game_state: 'char_select', name: char.name });
    });
  }

  if (selectedCharacters[1]) {
    selectedCharacters[1].forEach((char, index) => {
      const charButton = createButton(char.name);
      charButton.class('char-button');
      charButton.mousePressed(() => displayCharacterSelectionPanel(1, index));
      charButton.style('margin', '5px 0');
      player2Div.child(charButton);
      Inputs.push({ object: charButton, valid_game_state: 'char_select', name: char.name });
    });
  }
}

function displayCharacterSelectionPanel(playerIndex, charIndex) {
  const canvas = document.getElementById('game-canvas');
  const rect = canvas.getBoundingClientRect();

  const panel = createDiv();
  panel.position(0, rect.height * 1.5);
  panel.style('width', '100%');
  panel.style('height', '200px');
  panel.style('overflow-x', 'scroll');
  panel.style('display', 'flex');
  panel.style('justify-content', 'space-around');
  panel.style('background-color', 'rgba(0, 0, 0, 0.5)');

  panel.addClass('charSelectDiv');

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
  });

  if (charIndex !== -1) {
    const removeButton = createButton('Remove Character');
    removeButton.class('game-button');
    removeButton.size(150, 50);
    removeButton.mousePressed(() => {
      selectedCharacters[playerIndex].splice(charIndex, 1);
      panel.remove();
      updatePlayerDivs(); // Update the player divs to reflect changes
    });
    panel.child(removeButton);
  }
}

function findInputByName(name) {
  return Inputs.find(input => input.name === name)?.object;
}

function UpdateUI() {
  for (let i = 0; i < Inputs.length; i++) {
    if (gameState === Inputs[i].valid_game_state) {
      Inputs[i].object.show();
    } else {
      Inputs[i].object.hide();
    }
  }

  if (gameState === 'char_select') {
    player1Div.show();
    player2Div.show();
  } else {
    player1Div.hide();
    player2Div.hide();
  }

  UpdatePanels();
}

function UpdatePanels() {
  for (let i = 0; i < panels.length; i++) {
    if (gameState === panels[i].valid_game_state) {
      panels[i].object.removeClass('hidden');
    } else {
      panels[i].object.addClass('hidden');
    }
  }

  let char_select_control_UI = document.getElementsByClassName('charSelectDiv');

  for (var i = 0; i < char_select_control_UI.length; i++) {
    if (gameState === 'char_select') {
      char_select_control_UI[i].style.display = 'flex';
    } else {
      char_select_control_UI[i].style.display = 'none';
    }
  }
}

function onWindowResize() {
  positionButtons();
}

export { currentMenu, menus, displayCharacterSelectionPanel, RenderCharacterSelector, RenderMainMenu, positionButtons, UpdateUI, UpdatePanels, selectedCharacters, onWindowResize, findInputByName, initializeButtons };
