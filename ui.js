import { characters } from './characters.js';

let selectedCharacters = [[], []]; // Selected characters for player1 and player2

import {startGame} from "./game.js"

function initUI(uiManager,gameStateManager, GameStates){


// ==================== MAIN MENU ====================
uiManager.registerScreen("mainMenu", {
  validStates: [GameStates.MAIN_MENU],

  create: () => {
    const parent = createDiv().id("mainMenu").class("screen");

    createImg("./assets/images/logo.png", "Game Logo")
      .style("width", "150px")
      .style("margin-bottom", "20px")
      .parent(parent);

    createElement("h1", "Excalibur QUEST").parent(parent).addClass("main-title");

    createButton("Start Game")
      .parent(parent)
      .addClass("menu-btn")
      .mousePressed(() => {
        gameStateManager.setState(GameStates.CHAR_SELECT);
      });

    createButton("Settings")
      .parent(parent)
      .addClass("menu-btn")
      .mousePressed(() => {
        gameStateManager.setState(GameStates.SETTINGS);
      });

    createButton("Quit Game")
      .parent(parent)
      .addClass("menu-btn")
      .mousePressed(() => {
        window.close(); // Or a custom quit handler
      });

    return parent;
  },

  show: () => {
    const m = select("#mainMenu");
    if (m) m.show().style("opacity", "1");

    console.log("main menu ?!?!")
  },

  hide: () => {
    const m = select("#mainMenu");
    if (m) {
      m.style("opacity", "0");
      setTimeout(() => m.hide(), 200);
    }
  }
});


// ==================== PAUSE MENU ====================
uiManager.registerScreen("pauseMenu", {
  validStates: [GameStates.PAUSED],

  create: () => {
    const wrapper = createDiv().id("pauseMenu").class("screen");

    createElement("h2", "Game Paused").parent(wrapper);

    createButton("Resume")
      .parent(wrapper)
      .addClass("pause-btn")
      .mousePressed(() => {
        gameStateManager.setState(GameStates.PLAYING);
      });

    createButton("Settings")
      .parent(wrapper)
      .addClass("pause-btn")
      .mousePressed(() => {
        gameStateManager.setState(GameStates.SETTINGS);
      });

    createButton("Quit to Main Menu")
      .parent(wrapper)
      .addClass("pause-btn")
      .mousePressed(() => {
        gameStateManager.setState(GameStates.MAIN_MENU);
      });

    return wrapper;
  },

  show: () => {
    const p = select("#pauseMenu");
    if (p) p.show().style("opacity", "1");
  },

  hide: () => {
    const p = select("#pauseMenu");
    if (p) {
      p.style("opacity", "0");
      setTimeout(() => p.hide(), 200);
    }
  }
});


// ==================== SETTINGS MENU ====================
uiManager.registerScreen("settingsMenu", {
  validStates: [GameStates.SETTINGS],

  create: () => {
    const wrapper = createDiv().id("settingsMenu").class("screen");

    createElement("h2", "Settings").parent(wrapper);

    createP("Music Volume").parent(wrapper);
    const musicSlider = createSlider(0, 1, 0.5, 0.01).id("musicSlider").parent(wrapper);

    createP("Game Volume").parent(wrapper);
    const gameSlider = createSlider(0, 1, 0.5, 0.01).id("gameSlider").parent(wrapper);

    createButton("Clear All Saved Data")
      .parent(wrapper)
      .addClass("danger-btn")
      .mousePressed(() => {
        if (confirm("Are you sure? This will delete all saved settings.")) {
          localStorage.clear();
          musicSlider.value(0.5);
          gameSlider.value(0.5);
          saveSettings();
        }
      });

    createButton("Back")
      .parent(wrapper)
      .addClass("settings-btn")
      .mousePressed(() => {
        gameStateManager.setState(gameStateManager.prev || GameStates.MAIN_MENU);
      });

    return wrapper;
  },

  show: () => {
    const m = select("#settingsMenu");
    if (m) {
      m.show().style("opacity", "1");

      const music = parseFloat(localStorage.getItem("music_vol")) || 0.5;
      const game = parseFloat(localStorage.getItem("game_vol")) || 0.5;

      select("#musicSlider").value(music).input(() => saveSettings());
      select("#gameSlider").value(game).input(() => saveSettings());
    }
  },

  hide: () => {
    const m = select("#settingsMenu");
    if (m) {
      m.style("opacity", "0");
      setTimeout(() => m.hide(), 200);
    }
  }
});

// ==================== CHARACTER SELECT MENU ====================
uiManager.registerScreen("charSelect", {
  validStates: [GameStates.CHAR_SELECT],

  create: () => {
    const wrapper = createDiv().id("charSelectMenu").class("screen");

    createElement("h2", "Character Selection").parent(wrapper);

    // Containers
    createDiv().id("player1Team").class("teamGrid").parent(wrapper);
    createDiv().id("player2Team").class("teamGrid").parent(wrapper);
    createDiv().id("availableChars").class("availableCharsGrid").parent(wrapper);

    // Control toggles (one per team)
    createButton("HUMAN").id("p1Toggle").addClass("menu-btn").parent(wrapper);
    createButton("AI").id("p2Toggle").addClass("menu-btn").parent(wrapper);

    // Navigation
    createButton("Back")
      .parent(wrapper)
      .addClass("menu-btn")
      .mousePressed(() => gameStateManager.setState(GameStates.MAIN_MENU));

    createButton("Start Game")
      .parent(wrapper)
      .addClass("menu-btn")
      .mousePressed(() => {
        if ((window.selectedCharacters?.[0]?.length || 0) > 0 &&
            (window.selectedCharacters?.[1]?.length || 0) > 0) {
          startGame();
        } else {
          alert("Can't start without characters");
        }
      });

    return wrapper;
  },

  show: () => {
    const wrapper = select("#charSelectMenu");
    if (!wrapper) return;
    wrapper.show().style("opacity", "1");

    // ----- ensure global selectedCharacters -----
    if (!window.selectedCharacters) window.selectedCharacters = [[], []];

    // ----- build teams on first show (no duplicates) -----
    if (window.selectedCharacters[0].length === 0 && window.selectedCharacters[1].length === 0) {
      const pool = [...characters];                   // don't mutate original
      // quick shuffle
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }
      const six = pool.slice(0, Math.min(6, pool.length));
      const first3 = six.slice(0, 3).map(c => ({ ...c, isControllable: true }));
      const next3  = six.slice(3, 6).map(c => ({ ...c, isControllable: false }));
      window.selectedCharacters[0].push(...first3);
      window.selectedCharacters[1].push(...next3);
    }

    // inline render function (local, not exported)
    const render = () => {
      const p1Div = select("#player1Team");
      const p2Div = select("#player2Team");
      const availDiv = select("#availableChars");
      const p1Toggle = select("#p1Toggle");
      const p2Toggle = select("#p2Toggle");

      // teams
      p1Div.html("<h3>Player 1 Team</h3>");
      p2Div.html("<h3>Player 2 Team</h3>");

      window.selectedCharacters[0].forEach((char, idx) => {
        const el = createDiv(`${char.name} (${char.isControllable ? "Human" : "AI"})`)
          .addClass("char-display")
          .mousePressed(() => {
            // quick inline toggle on click
            char.isControllable = !char.isControllable;
            render();
          });
        p1Div.child(el);
      });

      window.selectedCharacters[1].forEach((char, idx) => {
        const el = createDiv(`${char.name} (${char.isControllable ? "Human" : "AI"})`)
          .addClass("char-display")
          .mousePressed(() => {
            char.isControllable = !char.isControllable;
            render();
          });
        p2Div.child(el);
      });

      // toggles set label from team state
      const p1IsHuman = window.selectedCharacters[0][0]?.isControllable ?? true;
      const p2IsHuman = window.selectedCharacters[1][0]?.isControllable ?? false;
      p1Toggle.html(p1IsHuman ? "HUMAN" : "AI");
      p2Toggle.html(p2IsHuman ? "HUMAN" : "AI");

      // toggle handlers (flip entire team)
      p1Toggle.mousePressed(() => {
        const allHuman = window.selectedCharacters[0].every(c => c.isControllable);
        window.selectedCharacters[0].forEach(c => (c.isControllable = !allHuman));
        render();
      });
      p2Toggle.mousePressed(() => {
        const allHuman = window.selectedCharacters[1].every(c => c.isControllable);
        window.selectedCharacters[1].forEach(c => (c.isControllable = !allHuman));
        render();
      });

      // available characters (computed; do NOT mutate `characters`)
      availDiv.html("<h3>Available Characters</h3>");
      const selectedNames = [
        ...window.selectedCharacters[0].map(c => c.name),
        ...window.selectedCharacters[1].map(c => c.name),
      ];
      const available = characters.filter(c => !selectedNames.includes(c.name));

      available.forEach(char => {
        const el = createDiv(char.name)
          .addClass("char-display")
          .mousePressed(() => {
            if (window.selectedCharacters[0].length < 3) {
              window.selectedCharacters[0].push({ ...char, isControllable: true });
            } else if (window.selectedCharacters[1].length < 3) {
              window.selectedCharacters[1].push({ ...char, isControllable: false });
            } else {
              alert("Both teams are full. Remove a character first.");
              return;
            }
            render();
          });
        availDiv.child(el);
      });
    };

    render(); // first paint
  },

  hide: () => {
    const wrapper = select("#charSelectMenu");
    if (!wrapper) return;
    wrapper.style("opacity", "0");
    setTimeout(() => wrapper.hide(), 200);
  }
});

// ==================== SAVE SETTINGS ====================
function saveSettings() {
  const musicVal = parseFloat(select("#musicSlider")?.value()) || 0.5;
  const gameVal = parseFloat(select("#gameSlider")?.value()) || 0.5;

  localStorage.setItem("music_vol", musicVal.toFixed(2));
  localStorage.setItem("game_vol", gameVal.toFixed(2));

  if (typeof sound !== "undefined") {
    if (sound.setMusicVolume) sound.setMusicVolume(musicVal);
    if (sound.setGameVolume) sound.setGameVolume(gameVal);
  }
}

}

export {initUI}
