import { canvasWidth, canvasHeight, startGame, setGameState, gameState,getGameState } from './game.js';
import { characters } from './characters.js';

let selectedCharacters = [[], []]; // Keeps track of selected characters for player1 and player2
let currentMenu = 0;
let menus = [
  {
    name: 'Play',
    image: 'char_select.png',
    onselect: () => {
      console.log('Character Selection');
      setGameState('char_select');
    }
  },
  {
    name: 'Settings',
    image: 'char_select.png',
    onselect: () => {
      console.log('settings ');
      setGameState('settings');
    }
  }
];

let buttonNext, buttonPrevious, buttonSelect, buttonAddPlayer1, buttonAddPlayer2, buttonPlay, buttonBack, unpauseButton, startGameButton, backToMainButton, toggleButton,toggleButton2;
let player1Div, player2Div;

var Inputs = [];
var panels = [];

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
    if (selectedCharacters[0] && selectedCharacters[1] && selectedCharacters[0].length > 0 && selectedCharacters[1].length > 0) {
      startGame();
    }
  });

  unpauseButton = createButton('unPause');
  unpauseButton.class('game-button');
  unpauseButton.size(100, 50);
  unpauseButton.mousePressed(() => {
    setGameState('playing');
  });

  buttonAddPlayer1 = createButton('Add Player 1');
  buttonAddPlayer1.class('game-button');
  buttonAddPlayer1.size(100, 50);
  buttonAddPlayer1.mousePressed(() => displayCharacterSelectionPanel(0, -1));

  buttonAddPlayer2 = createButton('Add Player 2');
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
    startGameButton.disabled =  selectedCharacters[0] && selectedCharacters[1] && selectedCharacters[0].length > 0 && selectedCharacters[1].length > 0;
    startGameButton.mousePressed(() => {
        if (selectedCharacters[0] && selectedCharacters[1] && selectedCharacters[0].length > 0 && selectedCharacters[1].length > 0) {
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
        selectedCharacters[0].forEach((char, index) => {
            char.isControllable = !char.isControllable;
        });
    });


    toggleButton2 = createButton('Human');
    toggleButton2.class('game-button');
    toggleButton2.size(70, 50);
    toggleButton2.mousePressed(() => {
        selectedCharacters[1].forEach((char, index) => {

            char.isControllable = !char.isControllable;
        });
    });

  Inputs.push({ object: buttonNext, valid_game_state: 'main_menu', name: 'Next' });
  Inputs.push({ object: buttonPrevious, valid_game_state: 'main_menu', name: 'Previous' });
  Inputs.push({ object: buttonPlay, valid_game_state: 'main_menu', name: 'Play' });
  Inputs.push({ object: startGameButton, valid_game_state: 'char_select', name: 'Start_Game' });

  Inputs.push({ object: buttonAddPlayer1, valid_game_state: 'char_select', name: 'Add Player 1' });
  Inputs.push({ object: buttonAddPlayer2, valid_game_state: 'char_select', name: 'Add Player 2' });
  Inputs.push({ object: buttonBack, valid_game_state: 'char_select', name: 'Back' });
  Inputs.push({ object: buttonSelect, valid_game_state: 'paused', name: 'Back to Main Menu' });
  Inputs.push({ object: unpauseButton, valid_game_state: 'paused', name: 'unPause' });
  Inputs.push({ object: backToMainButton, valid_game_state: 'paused', name: 'Back to Main Menu' });
  
  Inputs.push({ object: toggleButton, valid_game_state: 'char_select', name: 'Toggle Player 1' });
  Inputs.push({ object: toggleButton2, valid_game_state: 'char_select', name: 'Toggle Player 2' });
    
  // Position buttons initially
  positionButtons();
}

function positionButtons() {
  const canvas = document.getElementById('game-canvas');
  const rect = canvas.getBoundingClientRect();

  toggleButton.position(-200, 150);
  toggleButton2.position(100,150);

  buttonNext.position(rect.right - 60, rect.top + rect.height / 2 - 25);
  buttonPrevious.position(rect.left + 10, rect.top + rect.height / 2 - 25);
  buttonSelect.position(rect.left + rect.width / 2 - 50, rect.bottom - 190);
  buttonPlay.position(rect.left + rect.width / 2 - 50, rect.bottom - 220);
  buttonAddPlayer1.position(rect.x, rect.bottom / 2 + 200);
  buttonAddPlayer2.position(rect.x + 300, rect.bottom / 2 + 200);
  buttonBack.position(rect.left + 10, rect.bottom - 60);
  unpauseButton.position(rect.left + rect.width / 2 - 50, rect.bottom - 100);
  startGameButton.position(rect.left + rect.width / 2 - 50, rect.bottom - 150);
  backToMainButton.position(rect.left + rect.width / 2 - 50, rect.bottom - 100);

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
  text('Select Your Characters', canvasWidth / 2, canvasHeight / 2 - 100);
  textSize(16);

  // Create player 1 div
  const player1Div = createDiv();
  player1Div.position(rect.x, rect.y);

  if (selectedCharacters[0]) {
    selectedCharacters[0].forEach((char, index) => {
      const charButton = createButton(char.name);
      charButton.class('char-button');
      charButton.mousePressed(() => displayCharacterSelectionPanel(0, index));
      charButton.position(rect.width / 4, rect.height / 2);
      player1Div.child(charButton);
      Inputs.push({ object: charButton, valid_game_state: 'char_select', name: char.name });
    });
  }

  // Create player 2 div
  const player2Div = createDiv();
  player2Div.position(rect.width / 4 + 100, rect.height / 2); // Adjusted position to avoid overlap

  if (selectedCharacters[1]) {
    selectedCharacters[1].forEach((char, index) => {
      const charButton = createButton(char.name);
      charButton.class('char-button');
      charButton.mousePressed(() => displayCharacterSelectionPanel(1, index));
      player2Div.child(charButton);
      charButton.position(rect.width / 4 - 100, rect.height / 2);
      Inputs.push({ object: charButton, valid_game_state: 'char_select', name: char.name });
    });
  }



  player2Div.child(toggleButton);


  player2Div.child(toggleButton2);
  positionButtons();
}

function displayCharacterSelectionPanel(playerIndex, charIndex) {
  const panel = createDiv();
  panel.position(0, rect.height / 2 + 100);
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
      RenderCharacterSelector(); // Re-render the character selector to update selected character display
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
      RenderCharacterSelector(); // Re-render the character selector to update character list
    });
    panel.child(removeButton);
  }
}



function findInputByName(name) {
  return Inputs.find(input => input.name === name)?.object;
}

function UpdateUI(){
    for (let i = 0; i < Inputs.length; i++) {
      if (gameState === Inputs[i].valid_game_state) {
        Inputs[i].object.show();
      } else {
        Inputs[i].object.hide();
      }
    }
    UpdatePanels()
    
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

  for (var i =0 ; i<char_select_control_UI.length; i++) {
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
