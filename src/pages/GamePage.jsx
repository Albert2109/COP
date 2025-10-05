
import { useState } from 'react';
import Board from '../components/Board'
export default function GamePage({ onEnd }) {
  
  const [activeCell, setActiveCell] = useState(null);

  return (
    <>
      <h2>Гра йде...</h2>
      <Board activeCell ={activeCell} setActiveCell={setActiveCell} />

      
      <button className='btn btn-danger' onClick={onEnd}>Закінчити гру</button>
    </>
  );
}
