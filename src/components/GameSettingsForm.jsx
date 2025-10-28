import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { gameSchema } from '../validation/GameSchema';

import { useGameSettings } from '../hooks/useGameSettings';

import './GameSettingsForm.css';

export default function GameSettingsForm({ onSubmit, lockedMode, currentSettings }) {
  const { settings: savedSettings } = useGameSettings(); 

  const defaultData = currentSettings || savedSettings;

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: yupResolver(gameSchema),
    defaultValues: {
      mode: lockedMode || defaultData?.mode || '',
      LevelBot: defaultData?.LevelBot || '',
      firstPlayer: defaultData?.firstPlayer || 'player',
      playerColor: defaultData?.playerColor || '#FF0000',
      botColor: defaultData?.botColor || '#FFFF00',
      rows: defaultData?.rows || 6,
      columns: defaultData?.columns || 7,
      moveTimeLimit: defaultData?.moveTimeLimit || 30,
      nickname: defaultData?.nickname || '',
      roomCode: defaultData?.roomCode || ''
    }
  });

  const mode = watch('mode');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="game-settings-form">
      <div className="form-group">
        <label>Режим гри:</label>
        <select {...register('mode')}>
          <option value="">Оберіть режим гри</option>
          <option value="bot">Гра проти бота</option>
          <option value="online">Онлайн гра з гравцем</option>
        </select>
        {errors.mode && <span className="error">{errors.mode.message}</span>}
      </div>

      {mode === 'bot' && (
        <>
          <div className="form-group">
            <label>Рівень бота:</label>
            <select {...register('LevelBot')}>
              <option value="">Оберіть рівень бота</option>
              <option value="easy">Легкий бот</option>
              <option value="medium">Середній бот</option>
              <option value="hard">Важкий бот</option>
            </select>
            {errors.LevelBot && <span className="error">{errors.LevelBot.message}</span>}
          </div>

          <div className="form-group">
            <label>Хто першим робить хід:</label>
            <select {...register('firstPlayer')}>
              <option value="player">Ви</option>
              <option value="bot">Бот</option>
              <option value="random">Випадково</option>
            </select>
            {errors.firstPlayer && <span className="error">{errors.firstPlayer.message}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Ваш колір:</label>
              <input type="color" {...register('playerColor')} />
              {errors.playerColor && <span className="error">{errors.playerColor.message}</span>}
            </div>

            <div className="form-group">
              <label>Колір бота:</label>
              <input type="color" {...register('botColor')} />
              {errors.botColor && <span className="error">{errors.botColor.message}</span>}
            </div>
          </div>
        </>
      )}

      {mode === 'online' && (
        <>
          <div className="form-group">
            <label>Ваш нікнейм:</label>
            <input
              type="text"
              {...register('nickname')}
              placeholder="Введіть свій нікнейм"
            />
            {errors.nickname && <span className="error">{errors.nickname.message}</span>}
          </div>

          <div className="form-group">
            <label>Код кімнати:</label>
            <input
              type="text"
              {...register('roomCode')}
              placeholder="Залиште порожнім для створення нової гри"
            />
            <small>Якщо приєднуєтесь - введіть код, якщо створюєте - залиште порожнім.</small>
            {errors.roomCode && <span className="error">{errors.roomCode.message}</span>}
          </div>
        </>
      )}

      <div className="form-row">
        <div className="form-group">
          <label>Рядків:</label>
          <input type="number" {...register('rows')} min="4" max="10" />
          {errors.rows && <span className="error">{errors.rows.message}</span>}
        </div>

        <div className="form-group">
          <label>Колонок:</label>
          <input type="number" {...register('columns')} min="4" max="10" />
          {errors.columns && <span className="error">{errors.columns.message}</span>}
        </div>
      </div>

      <div className="form-group">
        <label>Час на один хід (секунди):</label>
        <input
          type="number"
          {...register('moveTimeLimit')}
          min="5"
          max="120"
          step="5"
        />
        <small>Залиште пусто щоб вимкнути обмеження часу</small>
        {errors.moveTimeLimit && <span className="error">{errors.moveTimeLimit.message}</span>}
      </div>

      <button type="submit" className="btn btn-primary btn-lg">
        {lockedMode ? 'Грати (оновлені налаштування)' : 'Почати гру'}
      </button>
    </form>
  );
}