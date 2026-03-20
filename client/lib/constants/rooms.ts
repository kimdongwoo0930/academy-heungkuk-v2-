export type RoomType = '1인실' | '2인실' | '4인실';

export interface RoomInfo {
  number: string;
  type: RoomType;
  cap: number;
}

// 호실 정보 (타입·정원)
export const ROOM_INFO: Record<string, RoomInfo> = {
  '101': { number: '101', type: '4인실', cap: 4 },
  '102': { number: '102', type: '4인실', cap: 4 },
  '103': { number: '103', type: '4인실', cap: 4 },
  '104': { number: '104', type: '4인실', cap: 4 },
  '105': { number: '105', type: '4인실', cap: 4 },
  '106': { number: '106', type: '4인실', cap: 4 },
  '107': { number: '107', type: '4인실', cap: 4 },
  '108': { number: '108', type: '4인실', cap: 4 },
  '109': { number: '109', type: '1인실', cap: 1 },
  '110': { number: '110', type: '2인실', cap: 2 },
  '111': { number: '111', type: '2인실', cap: 2 },
  '112': { number: '112', type: '4인실', cap: 4 },
  '113': { number: '113', type: '4인실', cap: 4 },
  '114': { number: '114', type: '4인실', cap: 4 },
  '115': { number: '115', type: '4인실', cap: 4 },
  '116': { number: '116', type: '4인실', cap: 4 },
  '117': { number: '117', type: '4인실', cap: 4 },
  '118': { number: '118', type: '4인실', cap: 4 },
  '119': { number: '119', type: '4인실', cap: 4 },
  '120': { number: '120', type: '4인실', cap: 4 },
  '121': { number: '121', type: '4인실', cap: 4 },
  '122': { number: '122', type: '4인실', cap: 4 },
  '123': { number: '123', type: '4인실', cap: 4 },
  '124': { number: '124', type: '4인실', cap: 4 },
  '125': { number: '125', type: '4인실', cap: 4 },
  '126': { number: '126', type: '1인실', cap: 1 },
  '127': { number: '127', type: '2인실', cap: 2 },
};

// 도면 레이아웃 (null = 빈 칸)
// 각 셀: 호실번호 | null(복도/빈칸) | 'LABEL:텍스트'(표시용 라벨)
export type FloorCell = string | null;

export const FLOOR_PLAN: FloorCell[][] = [
  // 위쪽 호실
  ['105', '106', '107', '108', '109', '110', '111', '119', '120', '121', '122', '123', '124', '125'],
  // 복도 (빈 줄)
  [null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  // 아래쪽 호실
  ['104', '103', '102', '101', '112', '113', '114', '115', '116', '117', '118', '126', '127', null],
];
