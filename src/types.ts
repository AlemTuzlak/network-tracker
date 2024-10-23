export interface NetworkRequest {
  id: string;
  url: string;
  method: string;
  status: number;
  startTime: number;
  endTime: number | null;
  size: number;
  type: string;
  state: 'pending' | 'complete' | 'error';
}