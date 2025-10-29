
export default function Board({ board, onColumnClick, playerColor, botColor }) {
  
  const pColor = playerColor || 'red';
  const bColor = botColor || 'yellow';

  return (
    <table className='table table-bordered' style={{ backgroundColor: '#4da6ff', borderCollapse: 'collapse' }}>
      <tbody>
        {board.map((row, rowIdx) => (
          <tr key={rowIdx}>
            {row.map((cell, colIdx) => (
              <td
                key={`${rowIdx}-${colIdx}`}
                onClick={() => onColumnClick(colIdx)}
                style={{
                  width: '60px',
                  height: '60px',
                  padding: '0',
                  cursor: 'pointer',
                  border: '2px solid white',
                  backgroundColor: '#4da6ff',
                  textAlign: 'center',
                  verticalAlign: 'middle'
                }}
              >
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: cell === null ? 'white' : cell === 'player' ? pColor : bColor,
                    margin: 'auto',
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}