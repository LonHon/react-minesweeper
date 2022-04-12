import { useState } from 'react'

/*
 * TODO:
  * 1. 游戏初始化可配置 √
  * 2. 支持蔓延打开空白格子 √
  * 3. 支持标记 √
  * 4. 实时显示剩余炸弹数量 √
  * 4. 自动判定Win
  * 5. 支持双击数字打开周围格子（可双击判断：标记数量 >= 数字）
  * 6. UI优化
*/
interface Block {
  isMine: boolean;
  isOpen: boolean;
  isFlag: boolean;
  silbingMines: number;
}

type GameConfig = {
  rows: number;
  cols: number;
  minse: number;
  /** 剩余炸弹数量 */
  waitMines: number;
  finished: boolean;
  generated: boolean;
}

function generateMines(rows = 5, cols = 5, mines = 3) {
  const mineMap: Block[][] = new Array(rows);
  for (let i = 0; i < rows; i++) {
    mineMap[i] = new Array(cols)
    for (let j = 0; j < cols; j++) {
      mineMap[i][j] = {
        isMine: false,
        isOpen: false,
        isFlag: false,
        silbingMines: 0
      }
    }
  }
  let minesLeft = mines;
  while (minesLeft > 0) {
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * cols);
    if (!mineMap[row][col].isMine) {
      mineMap[row][col].isMine = true;
      minesLeft--;
    }
  }
  return mineMap;
}


function computedMines(row: number, col: number) {
  let mines = 0;
  if (row > 0) {
    if (mineMap[row - 1][col].isMine) {
      mines++;
    }
    if (col > 0 && mineMap[row - 1][col - 1].isMine) {
      mines++;
    }
    if (col < mineMap[row].length - 1 && mineMap[row - 1][col + 1].isMine) {
      mines++;
    }
  }
  if (row < mineMap.length - 1) {
    if (mineMap[row + 1][col].isMine) {
      mines++;
    }
    if (col > 0 && mineMap[row + 1][col - 1].isMine) {
      mines++;
    }
    if (col < mineMap[row].length - 1 && mineMap[row + 1][col + 1].isMine) {
      mines++;
    }
  }
  if (col > 0 && mineMap[row][col - 1].isMine) {
    mines++;
  }
  if (col < mineMap[row].length - 1 && mineMap[row][col + 1].isMine) {
    mines++;
  }
  return mines;
}

function getPlainCellMinseNumber (config: GameConfig) {
  for (let i = 0; i < config.rows; i++) {
    for (let j = 0; j < config.cols; j++) {
      mineMap[i][j].silbingMines = computedMines(i, j);
    }
  }
}

let mineMap: Block[][] = [];
function init (config: GameConfig) {
  mineMap = generateMines(config.rows, config.cols, config.minse);
  getPlainCellMinseNumber(config);
}

function App() {
  const [mineTable, setMineTable] = useState(mineMap);
  /**
   * 打开周围的空白格
   *
   * @param {Block} cell
   * @return {*} 
   */
  function openAround(row: number, col: number) {
    if (row < 0 || row >= mineMap.length || col < 0 || col >= mineMap[row].length) return;
    const cell = mineTable[row][col];
    if (!cell || cell.isMine || cell.isFlag || cell.isOpen) {
      return;
    }
    cell.isOpen = true;
    if (cell.silbingMines === 0) {
      openAround(row-1, col-1);
      openAround(row-1, col);
      openAround(row-1, col+1);
      
      openAround(row, col-1);
      openAround(row, col);
      openAround(row, col+1);

      openAround(row+1, col-1);
      openAround(row+1, col);
      openAround(row+1, col+1);
    }
  }

  // 挑战失败，全部打开
  function handleLose() {
    mineTable.forEach(row => row.forEach(cell => cell.isOpen = true));
    setMineTable([...mineTable]);
    // alert('You lost')
  }
  
  /**
   * 打开格子
   *
   * @param {Block} cell
   * @return {*} 
   */
  function handleClick(cell: Block, row: number, col: number) {
    if (cell.isOpen) {
      return;
    }
    if (cell.isFlag) {
      return;
    }
    if (cell.isMine) {
      handleLose();
      return;
    }
    if (cell.silbingMines > 0) {
      mineTable[row][col].isOpen = true;
      setMineTable([...mineTable]);
      // return;
    }
    if (cell.silbingMines === 0) {
      openAround(row, col);
      setMineTable([...mineTable]);
    }
  }
  
  function handleRightClick(cell: Block, row: number, col: number) {
    if (cell.isOpen) {
      return;
    }
    if (cell.isFlag) {
      mineTable[row][col].isFlag = false;
      gameState.waitMines++;
    } else {
      mineTable[row][col].isFlag = true;
      gameState.waitMines--;
    }
    setGameState({...gameState})
    setMineTable([...mineTable]);
  }
  
  function renderMines(mineMap: Block[][]) {
    return mineMap.map((row, i) => {
      return (
        <div className="row" key={i}>
          {row.map((cell, j) => {
            return (
              <div
                className="cell mr-1 mb-1 inline-block border border-gray-100 w-8 h-8"
                key={j}
                onClick={() => handleClick(cell, i, j)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleRightClick(cell, i, j)
                }}
              >
                {
                  cell.isOpen ? (
                    cell.isMine ? (
                      <div className="mine">🎇</div>
                    ) : (
                      <div className="text-green-200">{cell.silbingMines}</div>
                    )
                  ) : (
                    cell.isFlag ? (
                      <div>🚩</div>
                    ) : (
                      // <div>{cell.isMine ? '💣' : cell.silbingMines}</div>
                      <div className="cell bg-gray-100 text-black">&nbsp;</div>
                    )
                  )
                }
              </div>
            )
          })}
        </div>
      )
    })
  }

  // Game 操作
  const [gameState, setGameState] = useState<GameConfig>({
    rows: 2,
    cols: 2,
    minse: 1,
    waitMines: 1,
    generated: false,
    finished: false
  })
  // 重置
  function reset () {
    init(gameState);
    setMineTable(mineMap);
    setGameState({...gameState, generated: true, waitMines: gameState.minse});
  }

  
  return (
    <div className='text-lg font-bold h-screen bg-gray-800 text-gray-400 flex flex-col items-center pt-10'>
      <div className='mb-6'>
        行*列：<input type="number" maxLength={2} value={gameState.cols} onChange={e => {
          setGameState({...gameState, rows: Number(e.target.value), cols: Number(e.target.value)})
        }} />
        <br />
        炸弹数量：<input type="number" maxLength={2} value={gameState.minse} onChange={e => {
          setGameState({...gameState, minse: Number(e.target.value), waitMines: Number(e.target.value)})
        }} />
        <br />
        <button className='border px-4 mt-4' onClick={reset}>初始化</button>
      </div>
      <div>
        {renderMines(mineTable)}
      </div>
      {gameState.generated ? <div>
        炸弹剩余数量：{gameState.waitMines}
      </div> : null}
    </div>
  )
}

export default App
