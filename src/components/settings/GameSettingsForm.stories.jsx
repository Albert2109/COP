/** @module Components/GameSettingsForm.stories */
import GameSettingsForm from './GameSettingsForm';

export default {
  title: 'Components/GameSettingsForm',
  component: GameSettingsForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    onSubmit: { action: 'form submitted' },
    lockedMode: { 
      control: 'select', 
      options: [null, 'bot', 'online'],
      name: 'Фіксований режим'
    },
  },
};

/** * Сценарій 1: Початковий стан. 
 * Користувач тільки зайшов, нічого ще не обрав.
 */
export const EmptyInitial = {
  args: {
    onSubmit: (data) => console.log('Submit:', data),
  },
};

/** * Сценарій 2: Гра проти бота. 
 * Показує розгорнуті налаштування складності та кольорів.
 */
export const BotModeActive = {
  args: {
    onSubmit: (data) => console.log('Bot Mode Submit:', data),
    currentSettings: {
      mode: 'bot',
      LevelBot: 'medium',
      firstPlayer: 'player',
      playerColor: '#ff0080',
      botColor: '#00ffff',
    }
  },
};

/** * Сценарій 3: Онлайн режим. 
 * Демонструє поля для нікнейму та коду кімнати.
 */
export const OnlineModeActive = {
  args: {
    onSubmit: (data) => console.log('Online Mode Submit:', data),
    currentSettings: {
      mode: 'online',
      nickname: 'SuperPlayer_2026',
      roomCode: 'RTX-3090',
    }
  },
};

/** * Сценарій 4: Заблокований режим (наприклад, зміна налаштувань під час гри). 
 * Користувач не може змінити 'bot' на 'online'.
 */
export const LockedBotMode = {
  args: {
    lockedMode: 'bot',
    currentSettings: {
      mode: 'bot',
      LevelBot: 'hard',
    }
  },
};