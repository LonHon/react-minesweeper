import { useState } from 'react'
import { countAroundCell, generateMines, getPlainCellMinseNumberEffect, setAroundCellEffect } from './utils';


let mineMap: MinesTable = [];


/**
 * 初始化
 *
 * @param {GameConfig} config
 */
function init (config: GameConfig) {
  mineMap = generateMines(config.rows, config.cols, config.mines);
  getPlainCellMinseNumberEffect(config, mineMap);
}

function App() {
  
  // Game 状态
  const [gameState, setGameState] = useState<GameConfig>({
    rows: 7,
    cols: 7,
    mines: 8,
    opens: 0,
    unFlagMines: 5,
    generated: false,
    finished: false
  })

  /**
   * 状态提示
   */
  const [resultText, setResultText] = useState<string>('👆👆👆点击开始boom boom boom👆👆👆');

  /**
   * Cell状态
   */
  const [mineTable, setMineTable] = useState(mineMap);

  /**
   * 开启格子
   *
   * @param {number} row
   * @param {number} col
   */
  function setCellOpen(tube: CellHandlerParamsTube) {
    const [row, col, table] = tube;
    table[row][col].isOpen = true;
    // 计数
    gameState.opens++;
  }

  /**
   * 打开四周的安全格子
   *
   * @param {CellHandlerParamsTube} tube
   * @return {*}  {void}
   */
  function openAround(tube: CellHandlerParamsTube): void {
    const [row, col, table] = tube;
    if (row < 0 || row >= table.length || col < 0 || col >= table[row].length) return;
    const cell = table[row][col];
    if (!cell || cell.isMine || cell.isFlag || cell.isOpen) {
      return;
    }
    setCellOpen([row, col, table]);
    if (cell.silbingMines === 0) {
      openAround([row-1, col-1, table]);
      openAround([row-1, col, table]);
      openAround([row-1, col+1, table]);
      
      openAround([row, col-1, table]);
      openAround([row, col, table]);
      openAround([row, col+1, table]);

      openAround([row+1, col-1, table]);
      openAround([row+1, col, table]);
      openAround([row+1, col+1, table]);
    }
  }

  /**
   * 挑战失败，全部打开
   *
   * @param {MinesTable} table
   */
  function handleLose(table: MinesTable) {
    table.forEach(row => row.forEach(cell => cell.isOpen = true));
    setMineTable([...table]);
    setResultText('😭😭😭你输了，点击开始重新挑战😭😭😭');
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
   * 处理格子单击事件
   *
   * @param {CellHandlerParamsTube} tube
   * @return {*} 
   */
  function handleClick(tube: CellHandlerParamsTube) {
    const [row, col, table] = tube;
    const cell = table[row][col];
    if (cell.isOpen) {
      return;
    }
    if (cell.isFlag) {
      return;
    }
    if (cell.isMine) {
      handleLose(table);
      return;
    }
    if (cell.silbingMines > 0) {
      setCellOpen(tube);
      setMineTable([...table]);
      // return;
    }
    if (cell.silbingMines === 0) {
      openAround(tube);
      setMineTable([...table]);
    }
    isWin();
  }
  
  /**
   * 右键标记
   *
   * @param {CellHandlerParamsTube} tube
   * @return {*} 
   */
  function handleRightClick(tube: CellHandlerParamsTube) {
    const [row, col, table] = tube;
    const cell = table[row][col];
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
   * 双击打开满足条件的格子
   *
   * @param {CellHandlerParamsTube} tube
   * @return {*} 
   */
  function handleDoubleClick(tube: CellHandlerParamsTube) {
    const [row, col, table] = tube;
    const cell = table[row][col];
    if (!cell.isOpen) return;
    const aroundFlags = countAroundCell([row, col, table], (cell: Block) => cell.isFlag);
    // 四周标记格子 === 当前格子的数值 则开启未开启格子
    if (aroundFlags === cell.silbingMines) {
      setAroundCellEffect([row, col, table], (another: CellHandlerParamsTube) => {
        handleClick(another);
      })
    }
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
   * @param {MinesTable} mineTable
   * @return {*} 
   */
   const renderMines = (mineTable: MinesTable) => {
    return mineTable.map((row, i) => {
      return (
        <div className="row" key={i}>
          {row.map((cell, j) => {
            return (
              <div
                className="cell mr-1 mb-1 inline-block border border-gray-300 w-8 h-8 text-center"
                key={j}
                onClick={() => handleClick([i, j, mineTable])}
                onDoubleClick={() => handleDoubleClick([i, j, mineTable])}
                onContextMenu={(e) => {
                  e.preventDefault();
                  handleRightClick([i, j, mineTable]);
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

  /**
   * 状态栏组件
   */
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
