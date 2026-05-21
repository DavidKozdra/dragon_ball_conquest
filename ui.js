import { characters } from './characters.js';
import { startGame } from './game.js';

// Force screen div to properly flex-center after p5.js show() clears inline display
function showScreen(id) {
  const el = select(id);
  if (el) el.style('display', 'flex');
  return el;
}

const resultIcons = {
  victory: `
    <svg viewBox="0 0 64 64" role="img" aria-label="Victory trophy" focusable="false">
      <path d="M22 10h20v8c0 9.4-3.6 16-10 19.2C25.6 34 22 27.4 22 18v-8Z" />
      <path d="M22 16H10v4c0 8 4.7 13.4 13.2 15.2" />
      <path d="M42 16h12v4c0 8-4.7 13.4-13.2 15.2" />
      <path d="M32 37.2V48" />
      <path d="M22 54h20" />
      <path d="M26 48h12l2 6H24l2-6Z" />
    </svg>
  `,
  defeat: `
    <svg viewBox="0 0 64 64" role="img" aria-label="Defeat skull" focusable="false">
      <path d="M16 30c0-10.5 6.3-18 16-18s16 7.5 16 18c0 6.2-2.4 10.4-6.8 13.2V52H22.8v-8.8C18.4 40.4 16 36.2 16 30Z" />
      <circle cx="25" cy="31" r="4" />
      <circle cx="39" cy="31" r="4" />
      <path d="M32 37l-3 5h6l-3-5Z" />
      <path d="M25 52v-5" />
      <path d="M32 52v-5" />
      <path d="M39 52v-5" />
    </svg>
  `
};

function createResultIcon(type) {
  return createElement('div')
    .addClass(`result-icon ${type}`)
    .html(resultIcons[type]);
}

function initUI(uiManager, gameStateManager, GameStates) {

  // ==================== MAIN MENU ====================
  uiManager.registerScreen('mainMenu', {
    validStates: [GameStates.MAIN_MENU],

    create: () => {
      const screen = createDiv().id('mainMenu').class('screen');
      const card = createDiv().addClass('card').parent(screen);

      createImg('./images/logo.png', 'Dragon Ball Conquest')
        .addClass('logo')
        .parent(card);

      createElement('h1').html('<span class="title-accent">Dragon Ball</span> Conquest')
        .addClass('title')
        .parent(card);

      createElement('p', 'Choose your fighter')
        .addClass('subtitle')
        .parent(card);

      const btns = createDiv().addClass('btn-stack').parent(card);

      createButton('Start Game')
        .addClass('btn btn-primary')
        .parent(btns)
        .mousePressed(() => gameStateManager.setState(GameStates.CHAR_SELECT));

      createButton('Settings')
        .addClass('btn btn-secondary')
        .parent(btns)
        .mousePressed(() => gameStateManager.setState(GameStates.SETTINGS));

      createButton('Quit')
        .addClass('btn btn-danger')
        .parent(btns)
        .mousePressed(() => window.close());

      return screen;
    },

    show: () => {
      showScreen('#mainMenu');
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('aiOnly') === 'true') {
        window.selectedCharacters = [
          [{ ...characters[0], isControllable: false }],
          [{ ...characters[1], isControllable: false }]
        ];
        const m = select('#mainMenu');
        if (m) m.hide();
      }
    },

    hide: () => {}
  });

  // ==================== PAUSE MENU ====================
  uiManager.registerScreen('pauseMenu', {
    validStates: [GameStates.PAUSED],
    create: () => {
      const screen = createDiv().id('pauseMenu').class('screen');
      const card = createDiv().addClass('card').parent(screen);

      createElement('h2', 'Paused').addClass('title').parent(card);
      createElement('p', 'Press space to resume').addClass('subtitle').parent(card);

      const btns = createDiv().addClass('btn-stack').parent(card);

      createButton('Resume')
        .addClass('btn btn-primary')
        .parent(btns)
        .mousePressed(() => gameStateManager.setState(GameStates.PLAYING));

      createButton('Settings')
        .addClass('btn btn-secondary')
        .parent(btns)
        .mousePressed(() => gameStateManager.setState(GameStates.SETTINGS));

      createButton('Main Menu')
        .addClass('btn btn-danger')
        .parent(btns)
        .mousePressed(() => gameStateManager.setState(GameStates.MAIN_MENU));

      return screen;
    },

    show: () => { showScreen('#pauseMenu'); },
    hide: () => {}
  });

  // ==================== SETTINGS ====================
  uiManager.registerScreen('settingsMenu', {
    validStates: [GameStates.SETTINGS],

    create: () => {
      const screen = createDiv().id('settingsMenu').class('screen');
      const card = createDiv().addClass('card').parent(screen);

      createElement('h2', 'Settings').addClass('title').parent(card);
      createElement('p', 'Audio preferences').addClass('subtitle').parent(card);

      const body = createDiv().addClass('settings-body').parent(card);

      // Music Volume row
      const musicRow = createDiv().addClass('setting-row').parent(body);
      createElement('span', 'Music').addClass('setting-label').parent(musicRow);
      const musicControls = createDiv().addClass('setting-controls').parent(musicRow);
      createSlider(0, 1, 0.5, 0.01).id('musicSlider').parent(musicControls);
      createElement('span', '50%').addClass('setting-value').id('musicVal').parent(musicControls);

      // Game Volume row
      const gameRow = createDiv().addClass('setting-row').parent(body);
      createElement('span', 'Effects').addClass('setting-label').parent(gameRow);
      const gameControls = createDiv().addClass('setting-controls').parent(gameRow);
      createSlider(0, 1, 0.5, 0.01).id('gameSlider').parent(gameControls);
      createElement('span', '50%').addClass('setting-value').id('gameVal').parent(gameControls);

      const btns = createDiv().addClass('btn-stack').parent(card);

      createButton('Clear Saved Data')
        .addClass('btn btn-danger')
        .parent(btns)
        .mousePressed(() => {
          if (confirm('Delete all saved data?')) {
            localStorage.clear();
            const ms = select('#musicSlider');
            const gs = select('#gameSlider');
            if (ms) ms.value(0.5);
            if (gs) gs.value(0.5);
            const mv = select('#musicVal');
            const gv = select('#gameVal');
            if (mv) mv.html('50%');
            if (gv) gv.html('50%');
          }
        });

      createButton('Back')
        .addClass('btn btn-secondary')
        .parent(btns)
        .mousePressed(() => gameStateManager.setState(gameStateManager.prev || GameStates.MAIN_MENU));

      return screen;
    },

    show: () => {
      showScreen('#settingsMenu');
      const music = parseFloat(localStorage.getItem('music_vol')) || 0.5;
      const game = parseFloat(localStorage.getItem('game_vol')) || 0.5;

      const ms = select('#musicSlider');
      const gs = select('#gameSlider');
      const mv = select('#musicVal');
      const gv = select('#gameVal');

      if (ms) {
        ms.value(music);
        ms.input(() => {
          const v = parseFloat(ms.value());
          if (mv) mv.html(Math.round(v * 100) + '%');
          saveSettings();
        });
      }
      if (mv) mv.html(Math.round(music * 100) + '%');

      if (gs) {
        gs.value(game);
        gs.input(() => {
          const v = parseFloat(gs.value());
          if (gv) gv.html(Math.round(v * 100) + '%');
          saveSettings();
        });
      }
      if (gv) gv.html(Math.round(game * 100) + '%');
    },

    hide: () => {}
  });

  // ==================== CHARACTER SELECT ====================
  uiManager.registerScreen('charSelect', {
    validStates: [GameStates.CHAR_SELECT],

    create: () => {
      const screen = createDiv().id('charSelectMenu').class('screen');
      const card = createDiv().addClass('card card-wide').parent(screen);

      createElement('h2', 'Select Fighters').addClass('title').parent(card);

      // Two columns rebuilt on each render
      createDiv().id('fighterCols').addClass('fighter-cols').parent(card);

      // Nav bar: Back | [Time] | Start Game
      const nav = createDiv().addClass('match-nav').parent(card);

      createButton('Back')
        .addClass('btn btn-secondary')
        .parent(nav)
        .mousePressed(() => gameStateManager.setState(GameStates.MAIN_MENU));

      const timeWrap = createDiv().addClass('match-time-select').parent(nav);
      createElement('span', 'Time').addClass('match-time-label').parent(timeWrap);
      const timeSel = createElement('select').id('matchTimeSel').addClass('setting-select').parent(timeWrap);
      [
        { label: '30s',     value: '30'  },
        { label: '1 min',   value: '60'  },
        { label: '2 min',   value: '120' },
        { label: '5 min',   value: '300' },
        { label: '∞',       value: '0'   },
      ].forEach(({ label, value }) => {
        createElement('option', label).attribute('value', value).parent(timeSel);
      });
      timeSel.elt.addEventListener('change', () => {
        localStorage.setItem('time_limit', timeSel.elt.value);
      });

      createButton('Start Game')
        .addClass('btn btn-primary')
        .parent(nav)
        .mousePressed(() => {
          const t1 = window.selectedCharacters?.[0]?.length || 0;
          const t2 = window.selectedCharacters?.[1]?.length || 0;
          if (t1 > 0 && t2 > 0) {
            startGame();
          } else {
            const toast = createDiv('Each team needs at least one fighter').addClass('modal');
            toast.parent(select('body'));
            setTimeout(() => toast.remove(), 2500);
          }
        });

      return screen;
    },

    show: () => {
      showScreen('#charSelectMenu');
      if (!window.selectedCharacters) window.selectedCharacters = [[], []];

      // Restore saved time limit
      const ts = select('#matchTimeSel');
      if (ts) ts.elt.value = localStorage.getItem('time_limit') || '60';

      const render = () => {
        const cols = select('#fighterCols');
        if (!cols) return;
        cols.html('');

        [0, 1].forEach(ti => {
          const col = createDiv().addClass('fighter-col').parent(cols);
          createElement('div', ti === 0 ? 'Player 1' : 'Player 2')
            .addClass('fighter-col-header ' + (ti === 0 ? 'p1' : 'p2'))
            .parent(col);

          characters.forEach(char => {
            const myIdx   = window.selectedCharacters[ti].findIndex(c => c.name === char.name);
            const theirIdx = window.selectedCharacters[1 - ti].findIndex(c => c.name === char.name);
            const onMyTeam    = myIdx !== -1;
            const onTheirTeam = theirIdx !== -1;

            let rowClass = 'fighter-row';
            if (onMyTeam)    rowClass += ti === 0 ? ' selected-p1' : ' selected-p2';
            if (onTheirTeam) rowClass += ' taken';

            const row = createDiv().addClass(rowClass).parent(col);
            createElement('span', char.name).addClass('fighter-name').parent(row);

            // Human / AI badge — only when on this team
            if (onMyTeam) {
              const isHuman = window.selectedCharacters[ti][myIdx].isControllable;
              const badge = createButton(isHuman ? 'Human' : 'AI')
                .addClass('fighter-badge ' + (isHuman ? 'human' : 'ai'))
                .parent(row);
              // Use native listener so stopPropagation reliably prevents the row click
              badge.elt.addEventListener('click', e => {
                e.stopPropagation();
                const idx = window.selectedCharacters[ti].findIndex(c => c.name === char.name);
                if (idx !== -1) window.selectedCharacters[ti][idx].isControllable = !isHuman;
                render();
              });
            }

            // Click the row (but not the badge) to toggle membership
            row.elt.addEventListener('click', () => {
              if (onMyTeam) {
                window.selectedCharacters[ti].splice(myIdx, 1);
              } else {
                window.selectedCharacters[ti].push({ ...char, isControllable: ti === 0 });
              }
              render();
            });
          });
        });
      };

      render();
    },

    hide: () => {}
  });

  // ==================== GAME WON ====================
  uiManager.registerScreen('gameWon', {
    validStates: [GameStates.GAMEWON],

    create: () => {
      const screen = createDiv().id('gameWonMenu').class('screen');
      const card = createDiv().addClass('card').parent(screen);

      createResultIcon('victory').parent(card);
      createElement('h1', 'Victory').addClass('result-title victory').parent(card);
      createElement('p', 'Your team wins the battle').addClass('result-sub').parent(card);

      const btns = createDiv().addClass('btn-stack').parent(card);

      createButton('Play Again')
        .addClass('btn btn-primary')
        .parent(btns)
        .mousePressed(() => {
          if (window.selectedCharacters) window.selectedCharacters = [[], []];
          gameStateManager.setState(GameStates.CHAR_SELECT);
        });

      createButton('Main Menu')
        .addClass('btn btn-secondary')
        .parent(btns)
        .mousePressed(() => {
          if (window.selectedCharacters) window.selectedCharacters = [[], []];
          gameStateManager.setState(GameStates.MAIN_MENU);
        });

      return screen;
    },

    show: () => { showScreen('#gameWonMenu'); },
    hide: () => {}
  });

  // ==================== GAME LOSE ====================
  uiManager.registerScreen('gameLose', {
    validStates: [GameStates.GAMELOSE],

    create: () => {
      const screen = createDiv().id('gameLoseMenu').class('screen');
      const card = createDiv().addClass('card').parent(screen);

      createResultIcon('defeat').parent(card);
      createElement('h1', 'Defeat').addClass('result-title defeat').parent(card);
      createElement('p', 'Your team has been defeated').addClass('result-sub').parent(card);

      const btns = createDiv().addClass('btn-stack').parent(card);

      createButton('Try Again')
        .addClass('btn btn-primary')
        .parent(btns)
        .mousePressed(() => gameStateManager.setState(GameStates.PLAYING));

      createButton('Change Team')
        .addClass('btn btn-secondary')
        .parent(btns)
        .mousePressed(() => gameStateManager.setState(GameStates.CHAR_SELECT));

      createButton('Main Menu')
        .addClass('btn btn-danger')
        .parent(btns)
        .mousePressed(() => {
          if (window.selectedCharacters) window.selectedCharacters = [[], []];
          gameStateManager.setState(GameStates.MAIN_MENU);
        });

      return screen;
    },

    show: () => { showScreen('#gameLoseMenu'); },
    hide: () => {}
  });
}

function saveSettings() {
  const ms = select('#musicSlider');
  const gs = select('#gameSlider');
  const musicVal = ms ? parseFloat(ms.value()) : 0.5;
  const gameVal = gs ? parseFloat(gs.value()) : 0.5;

  localStorage.setItem('music_vol', musicVal.toFixed(2));
  localStorage.setItem('game_vol', gameVal.toFixed(2));

  if (typeof sound !== 'undefined') {
    if (sound.setMusicVolume) sound.setMusicVolume(musicVal);
    if (sound.setGameVolume) sound.setGameVolume(gameVal);
  }
}

export { initUI };
