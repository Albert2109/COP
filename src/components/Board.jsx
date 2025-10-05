
export default function Board({activeCell,setActiveCell}){
    return(
        <>
        <table className='table table-bordered'>
        <tbody>
          {Array.from({ length: 6 }).map((_, row) => (
            <tr key={row}>
              {Array.from({ length: 7 }).map((_, col) => (
                <td
                  key={col}
                  onClick={() => setActiveCell(`${row}-${col}`)}
                  style={{ 
                    width: "10em",
                    height: "10em",
                    border: "1px solid black",
                    backgroundColor: activeCell === `${row}-${col}` ? 'yellow' : 'white' 
                  }}
                ></td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
        </>
    )
}