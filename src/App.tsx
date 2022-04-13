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
  opens: number;
  /** 已开格子数量 */
  mines: number;
  /** 待标记炸弹数量 */
  unFlagMines: number;
  /** 已结束 */
  finished: boolean;
  /** 已初始化 */
  generated: boolean;
}

/**
 * 生成格子数据&标记炸弹
 *
 * @param {number} [rows=5]
 * @param {number} [cols=5]
 * @param {number} [mines=3]
 * @return {*} 
 */
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

/**
 * 计算四周的炸弹数量
 *
 * @param {number} row
 * @param {number} col
 * @return {*} 
 */
function computedAroundMines(row: number, col: number) {
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

/**
 * 计算安全格子内的数值
 *
 * @param {GameConfig} config
 */
function getPlainCellMinseNumber (config: GameConfig) {
  for (let i = 0; i < config.rows; i++) {
    for (let j = 0; j < config.cols; j++) {
      mineMap[i][j].silbingMines = computedAroundMines(i, j);
    }
  }
}

let mineMap: Block[][] = [];
/**
 * 初始化
 *
 * @param {GameConfig} config
 */
function init (config: GameConfig) {
  mineMap = generateMines(config.rows, config.cols, config.mines);
  getPlainCellMinseNumber(config);
}

function App() {
  
  // Game 状态
  const [gameState, setGameState] = useState<GameConfig>({
    rows: 5,
    cols: 5,
    mines: 4,
    opens: 0,
    unFlagMines: 5,
    generated: false,
    finished: false
  })

  const [resultText, setResultText] = useState<string>('👆👆👆点击开始boom boom boom👆👆👆');

  // Cell 状态
  const [mineTable, setMineTable] = useState(mineMap);

  /**
   * 开启格子
   *
   * @param {number} row
   * @param {number} col
   */
  function setCellOpen(row: number, col: number) {
    mineTable[row][col].isOpen = true;
    // 计数
    gameState.opens++;
  }

  /**
   * 打开四周的安全格子
   *
   * @param {Block} cell
   * @return {*} 
   */
  function openAround(row: number, col: number) {
    if (row < 0 || row >= mineTable.length || col < 0 || col >= mineTable[row].length) return;
    const cell = mineTable[row][col];
    if (!cell || cell.isMine || cell.isFlag || cell.isOpen) {
      return;
    }
    setCellOpen(row, col);
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

  /**
   * 挑战失败，全部打开
   *
   */
  function handleLose() {
    mineTable.forEach(row => row.forEach(cell => cell.isOpen = true));
    setMineTable([...mineTable]);
    setResultText('😭😭😭你输了，点击开始重新挑战😭😭😭');
    // alert('You lost')
  }

  /**
   * 判定是否赢得胜利
   *
   */
  function isWin() {
    const { rows, cols, opens, mines } = gameState;
    if (opens + mines === rows * cols) {
      setResultText('🎉🎉🎉 You win 🎉🎉🎉');
      setGameState({...gameState, finished: true});
    }
  }
  
  /**
   * 开启格子
   *
   * @param {Block} cell
   * @param {number} row
   * @param {number} col
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
      setCellOpen(row, col);
      setMineTable([...mineTable]);
      // return;
    }
    if (cell.silbingMines === 0) {
      openAround(row, col);
      setMineTable([...mineTable]);
    }
    isWin();
  }
  
  /**
   * 右键标记
   *
   * @param {Block} cell
   * @param {number} row
   * @param {number} col
   * @return {*} 
   */
  function handleRightClick(cell: Block, row: number, col: number) {
    if (cell.isOpen) {
      return;
    }
    if (cell.isFlag) {
      mineTable[row][col].isFlag = false;
      gameState.unFlagMines++;
    } else {
      mineTable[row][col].isFlag = true;
      gameState.unFlagMines--;
    }
    setGameState({...gameState})
    setMineTable([...mineTable]);
    setResultText('剩余炸弹数量：' + gameState.unFlagMines);
  }
  
  
  /**
   * 重置游戏
   *
   */
  function reset () {
    init(gameState);
    setMineTable(mineMap);
    setGameState({
      ...gameState,
      generated: true,
      unFlagMines: gameState.mines,
      opens: 0,
      finished: false
    });
    setResultText('剩余炸弹数量：' + gameState.mines);
    // setResultText('剩余炸弹数量：' + gameState.unFlagMines); // unFlagMines由于setGameState异步，导致此处会拿到旧值，所以改为直接赋值mines
  }

  
  /**
   * 渲染所有格子
   *
   * @param {Block[][]} mineMap
   * @return {*} 
   */
   const renderMines = (mineMap: Block[][]) => {
    return mineMap.map((row, i) => {
      return (
        <div className="row" key={i}>
          {row.map((cell, j) => {
            return (
              <div
                className="cell mr-1 mb-1 inline-block border border-gray-300 w-8 h-8 text-center"
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
                      <div className="text-green-500">{cell.silbingMines}</div>
                    )
                  ) : (
                    cell.isFlag ? (
                      <div className="bg-gray-100">🚩</div>
                    ) : (
                      <div className="unpack-cell bg-gray-100">&nbsp;</div>
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

  const Result = () => {
    return (
      <div className='mt-4'>
        <div className="text-center">{resultText}</div>
      </div>
    )
  }

  
  return (
    <div className='text-lg font-bold h-screen bg-gray-800 text-gray-400 flex flex-col items-center pt-10'>
      <div className='mb-6'>
        <div>
          行列数量：<input type="number" className='ghost-input' step="1" min="0" max="50" value={gameState.cols} onChange={e => {
            setGameState({...gameState, rows: Number(e.target.value), cols: Number(e.target.value)})
          }} />
        </div>
        <div className='mt-2'>
          炸弹数量：<input type="number" className='ghost-input' step="1" min="1" max="100" value={gameState.mines} onChange={e => {
            setGameState({...gameState, mines: Number(e.target.value), unFlagMines: Number(e.target.value)})
          }} />
        </div>
        <div className='text-center'>
          <button className='border-2 border-green-400 text-green-500 rounded-lg px-4 mt-4' onClick={reset}>开始游戏</button>
        </div>
      </div>
      <div className={(gameState.finished ? 'game-disable' : '') + ' game-rect'}>
        {renderMines(mineTable)}
      </div>
      <Result />
    </div>
  )
}

export default App
