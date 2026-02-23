import React from 'react';

export default function MoveTimer({ timeLeft, moveTimeLimit }) {
  const timePercentage = timeLeft ? (timeLeft / moveTimeLimit) * 100 : 100;
  
  const getTimerColor = () => {
    if (timePercentage > 50) return { bg: 'from-green-400 to-emerald-500', text: 'text-green-600', glow: '#10b981' };
    if (timePercentage > 25) return { bg: 'from-yellow-400 to-orange-500', text: 'text-yellow-600', glow: '#f59e0b' };
    return { bg: 'from-red-500 to-red-600', text: 'text-red-600', glow: '#ef4444' };
  };

  const colors = getTimerColor();
  const isLowTime = timePercentage <= 25;

  return (
    <div className="flex justify-center items-center py-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-3">
          <p className="text-white text-sm font-semibold drop-shadow-lg">
            ⏱️ ЧАС НА ХІД
          </p>
        </div>

        <div className="relative">
          <div 
            className={`absolute -inset-2 bg-gradient-to-r ${colors.bg} rounded-2xl blur-lg opacity-40 ${isLowTime ? 'animate-pulse' : ''}`}
          ></div>

          <div className="relative bg-white rounded-2xl p-1 shadow-2xl">
            <div className="w-full h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl overflow-hidden border-2 border-gray-300 shadow-inner flex items-center justify-center relative">
              
              <div
                className={`absolute left-0 top-0 h-full bg-gradient-to-r ${colors.bg} rounded-lg transition-all duration-300 ease-out ${
                  isLowTime ? 'animate-pulse' : ''
                }`}
                style={{
                  width: `${timePercentage}%`,
                  boxShadow: `inset 0 0 10px rgba(0,0,0,0.1), 0 0 20px ${colors.glow}80`
                }}
              ></div>


              <div className="absolute top-0 left-0 h-1/2 w-full bg-white opacity-20 rounded-t-lg"></div>

              <span className={`relative font-black text-4xl drop-shadow-lg z-10 ${colors.text} ${isLowTime ? 'animate-bounce' : ''}`}>
                {timeLeft}s
              </span>
            </div>

            <div className="mt-2 flex justify-center">
              <span className="text-xs font-bold text-gray-600 drop-shadow-sm">
                {Math.round(timePercentage)}% ЧАСУ ЗАЛИШИЛОСЬ
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-4">
            <div className={`h-3 w-3 rounded-full ${timePercentage > 50 ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <div className={`h-3 w-3 rounded-full ${timePercentage > 25 && timePercentage <= 50 ? 'bg-yellow-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <div className={`h-3 w-3 rounded-full ${timePercentage <= 25 ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
          </div>

          {isLowTime && (
            <div className="mt-4 bg-red-100 border-2 border-red-500 rounded-lg p-3 text-center animate-pulse">
              <p className="text-red-700 font-bold text-sm">⚠️ ПОСПІШАЙТЕСЯ!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}