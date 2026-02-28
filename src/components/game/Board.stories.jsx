import Board from './Board';

/**
 * @module Game/Board.stories
 * @description Візуальні сценарії для ігрового поля з правильною гравітацією.
 */

export default {
  title: 'Game/Board',
  component: Board,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    playerColor: { 
      control: 'color', 
      name: 'Колір гравця',
    },
    botColor: { 
      control: 'color', 
      name: 'Колір опонента',
    },
    onColumnClick: { action: 'ход в колонку' },
  },
};

const createEmptyBoard = (r = 6, c = 7) => Array(r).fill(null).map(() => Array(c).fill(null));

export const NewGame = {
  args: {
    board: createEmptyBoard(),
    playerColor: '#FF0000',
    botColor: '#FFFF00',
  },
};

export const MidGame = {
  args: {
    playerColor: '#ff0080',
    botColor: '#00ffff',
    board: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, null, 'player', 'bot', null, null, null],
      [null, 'bot', 'player', 'player', 'bot', null, null],
      ['player', 'bot', 'bot', 'player', 'player', 'bot', null],
    ],
  },
};

export const CrowdedBoard = {
  args: {
    playerColor: '#FFA500',
    botColor: '#800080',
    board: [
      [null, 'player', null, 'bot', null, 'player', null], 
      ['bot', 'player', 'bot', 'player', 'bot', 'player', 'bot'],
      ['player', 'bot', 'player', 'bot', 'player', 'bot', 'player'],
      ['bot', 'player', 'bot', 'player', 'bot', 'player', 'bot'],
      ['player', 'bot', 'player', 'bot', 'player', 'bot', 'player'],
      ['bot', 'player', 'bot', 'player', 'bot', 'player', 'bot'],
    ],
  },
};

export const WinningLine = {
  args: {
    playerColor: '#FF0000',
    botColor: '#FFFF00',
    board: [
      [null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null],
      [null, 'player', null, null, null, null, null], 
      [null, 'player', 'bot', null, null, null, null], 
      [null, 'player', 'bot', 'bot', null, null, null], 
      ['bot', 'player', 'player', 'bot', null, null, null], 
    ],
  },
};