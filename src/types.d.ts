/**
 * 格子状态
 */
interface Block {
  isMine: boolean;
  isOpen: boolean;
  isFlag: boolean;
  silbingMines: number;
}

type MinesTable = Block[][];

/**
 * 游戏配置
 */
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
 * 格子处理方法参数
 * [row, col, table]
 */
type CellHandlerParamsTube = [number, number, MinesTable];
