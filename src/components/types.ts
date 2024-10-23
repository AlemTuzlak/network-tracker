export interface NetworkRequest {
  id: string;
  method: string;
  url: string;
  startTime: number;
  endTime?: number;
  state: 'pending' | 'complete' | 'error';
}

export interface Position {
  x: number;
  y: number;
}