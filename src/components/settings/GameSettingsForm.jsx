import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { gameSchema } from '../../validation/GameSchema';

import { useGameSettings } from '../../hooks/useGameSettings';

export default function GameSettingsForm({ onSubmit, lockedMode, currentSettings, initialRoomCode }) {
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
      roomCode: initialRoomCode || defaultData?.roomCode || '',
    }
  });

  const mode = watch('mode');

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">Connect Four</h1>
          <p className="text-white text-lg drop-shadow-md">Налаштування гри</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-3xl shadow-2xl p-8 md:p-10">
          <div className="mb-8">
            <label className="block text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-3">
              Режим гри
            </label>
            <select 
              {...register('mode')}
              disabled={!!lockedMode}
              className="w-full px-4 py-3 border-2 border-pink-300 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-700 font-medium"
            >
              <option value="">Оберіть режим гри</option>
              <option value="bot">Гра проти бота</option>
              <option value="online">Онлайн гра з гравцем</option>
            </select>
            {errors.mode && <span className="text-red-500 text-sm mt-2 block font-medium">{errors.mode.message}</span>}
          </div>

          {mode === 'bot' && (
            <div className="mb-8 p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border-2 border-pink-200 space-y-4">
              <h3 className="text-lg font-semibold text-purple-700 mb-4">⚙️ Налаштування бота</h3>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Рівень бота</label>
                <select 
                  {...register('LevelBot')}
                  className="w-full px-4 py-2 border-2 border-pink-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition text-gray-700 font-medium"
                >
                  <option value="">Оберіть рівень бота</option>
                  <option value="easy">😊 Легкий бот</option>
                  <option value="medium">🤖 Середній бот</option>
                  <option value="hard">💪 Важкий бот</option>
                </select>
                {errors.LevelBot && <span className="text-red-500 text-sm mt-2 block">{errors.LevelBot.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Хто першим робить хід</label>
                <select 
                  {...register('firstPlayer')}
                  className="w-full px-4 py-2 border-2 border-pink-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition text-gray-700 font-medium"
                >
                  <option value="player">👤 Ви</option>
                  <option value="bot">🤖 Бот</option>
                  <option value="random">🎲 Випадково</option>
                </select>
                {errors.firstPlayer && <span className="text-red-500 text-sm mt-2 block">{errors.firstPlayer.message}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ваш колір</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      {...register('playerColor')}
                      className="w-16 h-12 rounded-lg cursor-pointer border-2 border-pink-300 hover:border-pink-500 transition"
                    />
                    <span className="text-2xl">👤</span>
                  </div>
                  {errors.playerColor && <span className="text-red-500 text-sm mt-1 block">{errors.playerColor.message}</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Колір бота</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      {...register('botColor')}
                      className="w-16 h-12 rounded-lg cursor-pointer border-2 border-pink-300 hover:border-pink-500 transition"
                    />
                    <span className="text-2xl">🤖</span>
                  </div>
                  {errors.botColor && <span className="text-red-500 text-sm mt-1 block">{errors.botColor.message}</span>}
                </div>
              </div>
            </div>
          )}

          {mode === 'online' && (
            <div className="mb-8 p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl border-2 border-pink-200 space-y-4">
              <h3 className="text-lg font-semibold text-purple-700 mb-4">🌐 Онлайн налаштування</h3>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ваш нікнейм</label>
                <input
                  type="text"
                  {...register('nickname')}
                  placeholder="Введіть свій нікнейм"
                  className="w-full px-4 py-2 border-2 border-pink-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition text-gray-700 placeholder-gray-400 font-medium"
                />
                {errors.nickname && <span className="text-red-500 text-sm mt-2 block">{errors.nickname.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Код кімнати</label>
                <input
                  type="text"
                  {...register('roomCode')}
                  placeholder="Залиште порожнім для створення нової гри"
                  className="w-full px-4 py-2 border-2 border-pink-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition text-gray-700 placeholder-gray-400 font-medium"
                />
                <small className="text-gray-600 block mt-2">Якщо приєднуєтесь - введіть код, якщо створюєте - залиште порожнім.</small>
                {errors.roomCode && <span className="text-red-500 text-sm mt-2 block">{errors.roomCode.message}</span>}
              </div>
            </div>
          )}

          <div className="mb-8 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border-2 border-purple-200 space-y-4">
            <h3 className="text-lg font-semibold text-purple-700 mb-4">🎮 Налаштування дошки</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Рядків</label>
                <input 
                  type="number" 
                  {...register('rows')}
                  min="4" 
                  max="10"
                  className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition text-gray-700 font-medium"
                />
                {errors.rows && <span className="text-red-500 text-sm mt-1 block">{errors.rows.message}</span>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Колонок</label>
                <input 
                  type="number" 
                  {...register('columns')}
                  min="4" 
                  max="10"
                  className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition text-gray-700 font-medium"
                />
                {errors.columns && <span className="text-red-500 text-sm mt-1 block">{errors.columns.message}</span>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Час на один хід (секунди)</label>
              <input
                type="number"
                {...register('moveTimeLimit')}
                min="5"
                max="120"
                step="5"
                placeholder="Вимкнено"
                className="w-full px-4 py-2 border-2 border-purple-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition text-gray-700 placeholder-gray-400 font-medium"
              />
              <small className="text-gray-600 block mt-2">Залиште пусто щоб вимкнути обмеження часу</small>
              {errors.moveTimeLimit && <span className="text-red-500 text-sm mt-2 block">{errors.moveTimeLimit.message}</span>}
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 px-6 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-lg rounded-xl transition duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-2xl"
          >
            {lockedMode ? '🎮 Грати (оновлені налаштування)' : '🚀 Почати гру'}
          </button>
        </form>
      </div>
    </div>
  );
}