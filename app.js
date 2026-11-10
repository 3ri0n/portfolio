import { initAppearance } from './js/appearance.js';
import { initEffects } from './js/effects.js';
import { initNavigation } from './js/navigation.js';
import { initTerminal } from './js/terminal.js';

const effects = initEffects();
const navigation = initNavigation();
let game;

initTerminal({
  getPanel: navigation.getPanel,
  async openGame() {
    if (!game) {
      const { initGame } = await import('./js/game.js');
      game ??= initGame();
    }
    game.open();
  },
});
initAppearance({
  onWelcomeChange: effects,
  onEnter: navigation.focusCurrent,
});
document.documentElement.classList.add('enhanced');
