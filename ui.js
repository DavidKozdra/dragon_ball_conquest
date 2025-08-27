import { characters } from './characters.js';

let selectedCharacters = [[], []]; // Selected characters for player1 and player2

import {startGame} from "./game.js"

function initUI(uiManager,gameStateManager, GameStates){
uiManager.registerScreen("mainMenu", {
  validStates: [GameStates.MAIN_MENU],

  create: () => {
    const parent = createDiv().id("mainMenu").class("screen fixed inset-0 flex flex-col items-center justify-center min-h-screen space-y-6");
    createImg("./images/logo.png", "Game Logo")
      .style("width", "400px")
      .style("height", "200px")
      .style("object-fit", "contain")
      .style("margin", "0 auto 30px auto")
      .style("display", "block")
      .parent(parent);

    createElement("h1", "Dragon Ball Conquest")
      .parent(parent)
      .addClass("main-title text-6xl font-bold text-yellow-400 mb-8 text-center");

    // Button container for proper spacing
    const buttonContainer = createDiv()
      .addClass("flex flex-col space-y-4 items-center w-full max-w-xs")
      .parent(parent);

    createButton("Start Game")
      .parent(buttonContainer)
      .addClass("menu-btn w-full py-3 px-6 text-xl font-semibold bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors duration-200")
      .mousePressed(() => {
        gameStateManager.setState(GameStates.CHAR_SELECT);
      });

    createButton("Settings")
      .parent(buttonContainer)
      .addClass("menu-btn w-full py-3 px-6 text-xl font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors duration-200")
      .mousePressed(() => {
        gameStateManager.setState(GameStates.SETTINGS);
      });

    createButton("Quit Game")
      .parent(buttonContainer)
      .addClass("menu-btn w-full py-3 px-6 text-xl font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors duration-200")
      .mousePressed(() => {
        window.close(); // Or a custom quit handler
      });

    return parent;
  },

  show: () => {
    const m = select("#mainMenu");
    if (m) m.show().style("opacity", "1");

    // ⭐ Check for URL parameter to start AI-only game
    const urlParams = new URLSearchParams(window.location.search);
    const isAIOnly = urlParams.get('aiOnly') === 'true';

    if (isAIOnly) {
      console.log("AI Only mode detected. Starting game automatically.");
      
      // Select two random characters for the AI teams
      // Make sure 'characters' array is globally available
      window.selectedCharacters = [
        [{ ...characters[0], isControllable: false }],
        [{ ...characters[1], isControllable: false }]
      ];
      
      // Transition directly to the game screen without showing the menu
      startGame();
      
      // Hide the menu immediately
      m.hide();
    } else {
      console.log("main menu loaded");
    }
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
    const wrapper = createDiv()
      .id("pauseMenu")
      .class("screen fixed inset-0 flex flex-col items-center justify-center min-h-screen space-y-8 bg-black bg-opacity-75");

    // Semi-transparent overlay background
    const menuCard = createDiv()
      .addClass("bg-gray-800 rounded-xl p-8 shadow-2xl border border-gray-600 max-w-md w-full mx-4")
      .parent(wrapper);

    createElement("h2", "Game Paused")
      .parent(menuCard)
      .addClass("text-4xl font-bold text-white text-center mb-8");

    // Button container for proper spacing
    const buttonContainer = createDiv()
      .addClass("flex flex-col space-y-4 w-full")
      .parent(menuCard);

    createButton("Resume")
      .parent(buttonContainer)
      .addClass("pause-btn w-full py-3 px-6 text-lg font-semibold bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors duration-200")
      .mousePressed(() => {
        gameStateManager.setState(GameStates.PLAYING);
      });

    createButton("Settings")
      .parent(buttonContainer)
      .addClass("pause-btn w-full py-3 px-6 text-lg font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors duration-200")
      .mousePressed(() => {
        gameStateManager.setState(GameStates.SETTINGS);
      });

    createButton("Quit to Main Menu")
      .parent(buttonContainer)
      .addClass("pause-btn w-full py-3 px-6 text-lg font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors duration-200")
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

uiManager.registerScreen("charSelect", {
  validStates: [GameStates.CHAR_SELECT],
  
  create: () => {
    const wrapper = createDiv().id("charSelectMenu").class("screen");
    
    createElement("h2", "Character Selection").parent(wrapper);
    
    // Containers
    const teamsWrapper = createDiv().addClass("flex flex-col md:flex-row md:space-x-8 w-full p-4");
    createDiv().id("player1Team").class("teamGrid team-dropzone").parent(teamsWrapper);
    createDiv().id("player2Team").class("teamGrid team-dropzone").parent(teamsWrapper);
    teamsWrapper.parent(wrapper);
    
    createDiv().id("availableChars").class("availableCharsGrid").parent(wrapper);
    
    // Control toggles (one per team)
    // Navigation
    const navWrapper = createDiv().addClass("flex justify-center space-x-4 mt-8");
    createButton("Back")
      .parent(navWrapper)
      .addClass("menu-btn")
      .mousePressed(() => gameStateManager.setState(GameStates.MAIN_MENU));
      
    createButton("Start Game")
      .parent(navWrapper)
      .addClass("menu-btn")
      .mousePressed(() => {
        // Only allow starting if both teams have at least one character
        if ((window.selectedCharacters?.[0]?.length || 0) > 0 &&
            (window.selectedCharacters?.[1]?.length || 0) > 0) {
          startGame();
        } else {
          // Use a custom modal instead of alert()
          const modal = createDiv("Can't start without characters on both teams.").addClass("modal");
          modal.parent(select("body"));
          setTimeout(() => modal.remove(), 2000); // Remove after 2 seconds
        }
      });
      
    navWrapper.parent(wrapper);
    
    return wrapper;
  },
  
  show: () => {
    const wrapper = select("#charSelectMenu");
    if (!wrapper) return;
    wrapper.show().style("opacity", "1");
    
    // ----- ensure global selectedCharacters and initialize if empty -----
    if (!window.selectedCharacters) {
      window.selectedCharacters = [[], []];
    }
    
    // Store references to avoid creating new handlers on every render
    let dragEventListenersAttached = false;
    
    // Inline render function to handle all UI updates
    const render = () => {
      const p1Div = select("#player1Team");
      const p2Div = select("#player2Team");
      const availDiv = select("#availableChars");
      // Clear previous content but keep dropzone headers
      p1Div.html("<h3>Player 1 Team</h3>");
      p2Div.html("<h3>Player 2 Team</h3>");
      availDiv.html("<h3>Available Characters</h3>");
      
      // Helper function to create a draggable character element
      const createDraggableChar = (char, teamIndex, charIndex) => {
        const charWrapper = createDiv().addClass("char-display").attribute("draggable", "true");
        
        // Add delete button for team characters
        if (teamIndex !== null && teamIndex !== undefined) {
          const deleteBtn = createElement("span", "×")
            .addClass("delete-btn")
            .style("position: absolute; top: 2px; right: 2px; color: red; cursor: pointer; font-weight: bold; background: rgba(0,0,0,0.7); border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-size: 14px;");
          
          charWrapper.style("position: relative;");
          charWrapper.child(deleteBtn);
          
          // Delete character when X is clicked
          deleteBtn.mousePressed((e) => {
            window.selectedCharacters[teamIndex].splice(charIndex, 1);
            render();
          });
        }
        
        charWrapper.child(createElement("div", char.name).addClass("char-name"));
        charWrapper.child(createElement("div", char.isControllable ? "Human" : "AI")
          .addClass("text-sm text-gray-400 mt-1"));
        
        charWrapper.attribute("data-char-name", char.name);
        charWrapper.attribute("data-is-controllable", char.isControllable);
        charWrapper.attribute("data-team-index", teamIndex);
        charWrapper.attribute("data-char-index", charIndex);
        
        // Drag events - use addEventListener to avoid p5.js wrapper issues
        charWrapper.elt.addEventListener("dragstart", (e) => {
          e.dataTransfer.setData("text/plain", JSON.stringify({
            name: char.name,
            teamIndex: teamIndex,
            charIndex: charIndex
          }));
          e.dataTransfer.effectAllowed = "move";
          charWrapper.addClass("dragging");
        });
        
        charWrapper.elt.addEventListener("dragend", () => {
          charWrapper.removeClass("dragging");
        });

        // Click to toggle control (if it's on a team)
        if (teamIndex !== undefined && teamIndex !== null) {
          charWrapper.elt.addEventListener("click", (e) => {
            // Don't toggle if clicking the delete button
            if (e.target.classList.contains('delete-btn')) return;
            
            const currentTeam = window.selectedCharacters[teamIndex];
            if (currentTeam && currentTeam[charIndex]) {
              currentTeam[charIndex].isControllable = !currentTeam[charIndex].isControllable;
              render();
            }
          });
        }

        return charWrapper;
      };
      
      // Render Player 1 team
      window.selectedCharacters[0].forEach((char, idx) => {
        p1Div.child(createDraggableChar(char, 0, idx));
      });
      
      // Render Player 2 team
      window.selectedCharacters[1].forEach((char, idx) => {
        p2Div.child(createDraggableChar(char, 1, idx));
      });
      
      // Render available characters
      const selectedNames = [
        ...window.selectedCharacters[0].map(c => c.name),
        ...window.selectedCharacters[1].map(c => c.name),
      ];
      const available = characters.filter(c => !selectedNames.includes(c.name));
      
      available.forEach(char => {
        availDiv.child(createDraggableChar(char, null, null));
      });
      
  
      
      // Drag and drop event handlers for team containers (only attach once)
      if (!dragEventListenersAttached) {
        const teamDropZones = [p1Div.elt, p2Div.elt];
        const allDropZones = teamDropZones.concat(availDiv.elt);
        
        allDropZones.forEach(zone => {
          zone.addEventListener("dragover", (e) => {
            e.preventDefault();
            zone.classList.add("drop-active");
            e.dataTransfer.dropEffect = "move";
          });

          zone.addEventListener("dragleave", (e) => {
            // Only remove if we're actually leaving the zone
            if (!zone.contains(e.relatedTarget)) {
              zone.classList.remove("drop-active");
            }
          });

          zone.addEventListener("drop", (e) => {
            e.preventDefault();
            zone.classList.remove("drop-active");
            
            let data;
            try {
              data = JSON.parse(e.dataTransfer.getData("text/plain"));
            } catch (err) {
              console.error("Failed to parse drag data:", err);
              return;
            }
            
            const charName = data.name;
            const sourceTeamIndex = data.teamIndex;
            const sourceCharIndex = data.charIndex;

            const droppedChar = characters.find(c => c.name === charName);
            const destinationId = zone.id;
            
            if (!droppedChar) {
              console.error("Character not found:", charName);
              return;
            }

            // Prevent dropping on the same location
            if (sourceTeamIndex !== null && 
                ((sourceTeamIndex === 0 && destinationId === "player1Team") ||
                 (sourceTeamIndex === 1 && destinationId === "player2Team"))) {
              return;
            }

            // Case 1: Dropping from available characters to a team
            if (sourceTeamIndex === null && (destinationId === "player1Team" || destinationId === "player2Team")) {
              const destTeamIndex = destinationId === "player1Team" ? 0 : 1;
              const newChar = { ...droppedChar, isControllable: destTeamIndex === 0 ? true : false };
              window.selectedCharacters[destTeamIndex].push(newChar);
            }
            // Case 2: Dropping from a team to a different team
            else if (sourceTeamIndex !== null && (destinationId === "player1Team" || destinationId === "player2Team")) {
              const destTeamIndex = destinationId === "player1Team" ? 0 : 1;
              if (sourceTeamIndex !== destTeamIndex) {
                const charToMove = window.selectedCharacters[sourceTeamIndex].splice(sourceCharIndex, 1)[0];
                charToMove.isControllable = destTeamIndex === 0 ? true : false;
                window.selectedCharacters[destTeamIndex].push(charToMove);
              }
            }
            // Case 3: Dropping from a team back to available characters
            else if (sourceTeamIndex !== null && destinationId === "availableChars") {
              window.selectedCharacters[sourceTeamIndex].splice(sourceCharIndex, 1);
            }
            
            render(); // Re-render the UI
          });
        });
        
        dragEventListenersAttached = true;
      }
    };
    
    // Initial render
    render(); 
  },
  
  hide: () => {
    const wrapper = select("#charSelectMenu");
    if (!wrapper) return;
    wrapper.style("opacity", "0");
    setTimeout(() => wrapper.hide(), 200);
  }
});

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


// Game Win Screen
uiManager.registerScreen("gameWon", {
  validStates: [GameStates.GAMEWON],
  
  create: () => {
    const wrapper = createDiv().id("gameWonMenu").class("screen");
    
    // Victory header with styling
    const victoryHeader = createElement("h1", " VICTORY! ")
      .addClass("victory-title text-center text-6xl font-bold text-yellow-400 mb-8 animate-bounce");
    victoryHeader.parent(wrapper);
    
    // Victory message container
    const messageContainer = createDiv().addClass("victory-message text-center mb-8");
    createElement("h2", "Congratulations!")
      .addClass("text-3xl font-semibold text-green-400 mb-4")
      .parent(messageContainer);
    
    createElement("p", "You have emerged victorious in battle!")
      .addClass("text-xl text-gray-300 mb-4")
      .parent(messageContainer);
    

    messageContainer.parent(wrapper);
    
    // Navigation buttons
    const navWrapper = createDiv().addClass("flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mt-8");
    
    createButton("Play Again")
      .parent(navWrapper)
      .addClass("menu-btn bg-green-600 hover:bg-green-500 px-8 py-3 text-lg font-semibold")
      .mousePressed(() => {
        // Reset game state and go to character selection
        if (window.selectedCharacters) {
          window.selectedCharacters = [[], []];
        }
        gameStateManager.setState(GameStates.CHAR_SELECT);
      });
      
    createButton("Main Menu")
      .parent(navWrapper)
      .addClass("menu-btn bg-blue-600 hover:bg-blue-500 px-8 py-3 text-lg font-semibold")
      .mousePressed(() => {
        // Reset game state and return to main menu
        if (window.selectedCharacters) {
          window.selectedCharacters = [[], []];
        }
        gameStateManager.setState(GameStates.MAIN_MENU);
      });
      
    navWrapper.parent(wrapper);
    
    return wrapper;
  },
  
  show: () => {
    const wrapper = select("#gameWonMenu");
    if (!wrapper) return;
    wrapper.show().style("opacity", "1");
    
    // Optional: Update stats with actual game data
    // You can add code here to populate the stats with real data from your game
    // Example:
    // select(".stats-list").html(`
    //   <div class="text-gray-300">• Characters Remaining: ${actualRemainingChars}</div>
    //   <div class="text-gray-300">• Battle Duration: ${actualDuration}</div>
    //   <div class="text-gray-300">• Moves Used: ${actualMoves}</div>
    // `);
  },
  
  hide: () => {
    const wrapper = select("#gameWonMenu");
    if (!wrapper) return;
    wrapper.style("opacity", "0");
    setTimeout(() => wrapper.hide(), 200);
  }
});

// Game Lose Screen
uiManager.registerScreen("gameLose", {
  validStates: [GameStates.GAMELOSE],
  
  create: () => {
    const wrapper = createDiv().id("gameLoseMenu").class("screen");
    
    // Defeat header with styling
    const defeatHeader = createElement("h1", "💀 DEFEAT 💀")
      .addClass("defeat-title text-center text-6xl font-bold text-red-400 mb-8");
    defeatHeader.parent(wrapper);
    
    // Defeat message container
    const messageContainer = createDiv().addClass("defeat-message text-center mb-8");
    createElement("h2", "Game Over")
      .addClass("text-3xl font-semibold text-red-400 mb-4")
      .parent(messageContainer);
    
    createElement("p", "Your team has been defeated in battle.")
      .addClass("text-xl text-gray-300 mb-4")
      .parent(messageContainer);
    
    createElement("p", "Learn from this experience and try again!")
      .addClass("text-lg text-gray-400 italic")
      .parent(messageContainer);
    
    // Stats container (can be populated with game data)
    const statsContainer = createDiv().addClass("stats-container bg-gray-800 rounded-lg p-6 mb-8 max-w-md mx-auto");
    createElement("h3", "Battle Statistics")
      .addClass("text-xl font-semibold text-blue-400 mb-4 text-center")
      .parent(statsContainer);
    
    // Placeholder for battle stats
    const statsList = createDiv().addClass("stats-list space-y-2");
    createElement("div", "• Damage Dealt: -")
      .addClass("text-gray-300")
      .parent(statsList);
    createElement("div", "• Battle Duration: -")
      .addClass("text-gray-300")
      .parent(statsList);
    createElement("div", "• Moves Used: -")
      .addClass("text-gray-300")
      .parent(statsList);
    
    statsList.parent(statsContainer);
    messageContainer.parent(wrapper);
    statsContainer.parent(wrapper);
    
    // Motivational tip section
    const tipContainer = createDiv().addClass("tip-container bg-gray-700 rounded-lg p-4 mb-8 max-w-lg mx-auto");
    createElement("h4", "💡 Battle Tip")
      .addClass("text-lg font-semibold text-yellow-400 mb-2 text-center")
      .parent(tipContainer);
    
    createElement("p", "Try different character combinations or adjust your strategy!")
      .addClass("text-gray-300 text-center text-sm")
      .parent(tipContainer);
    
    tipContainer.parent(wrapper);
    
    // Navigation buttons
    const navWrapper = createDiv().addClass("flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 mt-8");
    
    createButton("Try Again")
      .parent(navWrapper)
      .addClass("menu-btn bg-red-600 hover:bg-red-500 px-8 py-3 text-lg font-semibold")
      .mousePressed(() => {
        // Keep current team setup and restart the game
        gameStateManager.setState(GameStates.PLAYING);
      });
    
    createButton("Change Team")
      .parent(navWrapper)
      .addClass("menu-btn bg-orange-600 hover:bg-orange-500 px-8 py-3 text-lg font-semibold")
      .mousePressed(() => {
        // Go back to character selection to modify team
        gameStateManager.setState(GameStates.CHAR_SELECT);
      });
      
    createButton("Main Menu")
      .parent(navWrapper)
      .addClass("menu-btn bg-blue-600 hover:bg-blue-500 px-8 py-3 text-lg font-semibold")
      .mousePressed(() => {
        // Reset game state and return to main menu
        if (window.selectedCharacters) {
          window.selectedCharacters = [[], []];
        }
        gameStateManager.setState(GameStates.MAIN_MENU);
      });
      
    navWrapper.parent(wrapper);
    
    return wrapper;
  },
  
  show: () => {
    const wrapper = select("#gameLoseMenu");
    if (!wrapper) return;
    wrapper.show().style("opacity", "1");
    
    // Optional: Update stats with actual game data
    // You can add code here to populate the stats with real data from your game
    // Example:
    // select(".stats-list").html(`
    //   <div class="text-gray-300">• Damage Dealt: ${actualDamage}</div>
    //   <div class="text-gray-300">• Battle Duration: ${actualDuration}</div>
    //   <div class="text-gray-300">• Moves Used: ${actualMoves}</div>
    // `);
  },
  
  hide: () => {
    const wrapper = select("#gameLoseMenu");
    if (!wrapper) return;
    wrapper.style("opacity", "0");
    setTimeout(() => wrapper.hide(), 200);
  }
});
}

export {initUI}
