/**
 * 生成格子数据&标记炸弹
 *
 * @param {number} [rows=5]
 * @param {number} [cols=5]
 * @param {number} [mines=3]
 * @return {*} 
 */
export function generateMines(rows = 5, cols = 5, mines = 3): MinesTable {
  const mineMap: MinesTable = new Array(rows);
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
 * 统计周围满足条件的格子数量
 *
 * @param {CellHandlerParamsTube} tube
 * @param {(cell: Block) => boolean} filter
 * @return {*}  {number}
 */
export function countAroundCell (tube: CellHandlerParamsTube, filter: (cell: Block) => boolean): number {
  const [row, col, table] = tube;
  let count = 0;
  for (let offsetR = -1; offsetR < 2; offsetR++) {
    // 越界:跳过
    if (!table[row + offsetR]) continue;
    for (let offsetC = -1; offsetC < 2; offsetC++) {
      const cell = table[row + offsetR][col + offsetC];
      // 排除越界和自身
      if (!cell || (offsetR === 0 && offsetC === 0)) continue;
      filter(cell) && count++;
    }
  }
  return count;
}


/**
 * 修改四周格子状态
 *
 * @param {CellHandlerParamsTube} tube
 * @param {(cell: CellHandlerParamsTube) => void} filter
 * @return {*}  {MinesTable}
 */
export function setAroundCellEffect (tube: CellHandlerParamsTube, filter: (cell: CellHandlerParamsTube) => void): MinesTable {
  const [row, col, table] = tube;
  for (let offsetR = -1; offsetR < 2; offsetR++) {
    // 越界:跳过
    if (!table[row + offsetR]) continue;
    for (let offsetC = -1; offsetC < 2; offsetC++) {
      const cell = table[row + offsetR][col + offsetC];
      // 排除越界和自身
      if (!cell || (offsetR === 0 && offsetC === 0)) continue;
      filter([row + offsetR, col + offsetC, table]);
    }
  }
  return table;
}


/**
 * 计算四周的炸弹数量
 *
 * @param {CellHandlerParamsTube} tube
 * @return {*} 
 */
export function computedAroundMines(tube: CellHandlerParamsTube): number {
  const [row, col, table] = tube;
  let mines = countAroundCell([row, col, table], (cell: Block) => cell.isMine);
  return mines;
}


/**
 * 计算安全格子内的数值
 *
 * @param {GameConfig} config
 * @param {MinesTable} table
 */
export function getPlainCellMinseNumberEffect (config: GameConfig, table: MinesTable) {
  for (let i = 0; i < config.rows; i++) {
    for (let j = 0; j < config.cols; j++) {
      table[i][j].silbingMines = computedAroundMines([i, j, table]);
    }
  }
}

