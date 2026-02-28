import Board from './Board';

/**
 * @module Game/Board.stories
 * @description Візуальні сценарії для ігрового поля.
 */

export default {
  title: 'Game/Board',
  component: Board,
  tags: ['autodocs'],
  // Параметри для оформлення самого інтерфейсу Storybook
  parameters: {
    layout: 'fullscreen', // Щоб твій градієнт min-h-screen зайняв увесь простір
  },
  argTypes: {
    // Колор-пікери для реальної конфігурації в реальному часі
    playerColor: { 
      control: 'color', 
      name: 'Колір гравця',
      description: 'Hex-код кольору фішок користувача' 
    },
    botColor: { 
      control: 'color', 
      name: 'Колір опонента',
      description: 'Hex-код кольору фішок бота/іншого гравця' 
    },
    onColumnClick: { action: 'ход в колонку' },
  },
};

// Хелпер для генерації поля (чистого або заповненого)
const createEmptyBoard = (r = 6, c = 7) => Array(r).fill(null).map(() => Array(c).fill(null));

/** * Стан 1: Нова гра (Порожнє поле)
 */
export const NewGame = {
  args: {
    board: createEmptyBoard(),
    playerColor: '#FF0000',
    botColor: '#FFFF00',
  },
};

/** * Стан 2: Активна фаза (Середина гри)
 * Тут ми показуємо, як виглядають фішки в різних позиціях
 */
export const MidGame = {
  args: {
    playerColor: '#ff0080', // Рожевий неон
    botColor: '#00ffff',   // Блакитний неон
    board: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, 'player', null, null, null, null],
      [null, 'bot', 'player', 'bot', null, null, null],
      ['player', 'bot', 'player', 'bot', null, null, null],
      ['player', 'player', 'bot', 'bot', 'player', null, 'bot'],
    ],
  },
};

/** * Стан 3: Фінальна ситуація (Близько до нічиєї)
 * Демонструє заповненість і гнучкість сітки
 */
export const CrowdedBoard = {
  args: {
    playerColor: '#FFA500', // Помаранчевий
    botColor: '#800080',   // Фіолетовий
    board: [
      ['bot', 'player', 'bot', 'player', 'bot', 'player', 'bot'],
      ['player', 'bot', 'player', 'bot', 'player', 'bot', 'player'],
      [null, 'player', 'bot', 'player', 'bot', 'player', null],
      ['player', 'bot', 'player', 'bot', 'player', 'bot', 'player'],
      ['bot', 'player', 'bot', 'player', 'bot', 'player', 'bot'],
      ['player', 'bot', 'player', 'bot', 'player', 'bot', 'player'],
    ],
  },
};