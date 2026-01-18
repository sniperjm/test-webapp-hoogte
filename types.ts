
export interface Coordinates {
  latitude: number;
  longitude: number;
  altitude: number | null;
  accuracy: number;
}

export interface TerrainAnalysis {
  elevation: number;
  locationName: string;
  geographicalFeatures: string[];
  climateZone: string;
  notableFacts: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
