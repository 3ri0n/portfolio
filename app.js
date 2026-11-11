import { initAppearance } from './js/appearance.js';
import { initEffects } from './js/effects.js';
import { initNavigation } from './js/navigation.js';
import { initTerminal } from './js/terminal.js';
import { initShowcase } from './js/showcase.js';

const effects = initEffects();
const navigation = initNavigation();
initShowcase();
let game;

initTerminal({
  getPanel: navigation.getPanel,
  navigate: navigation.navigate,
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
