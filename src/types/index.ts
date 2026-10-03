export type MessageStatus = 'pendiente' | 'publicado' | 'oculto' | 'eliminado';

export interface GeoMessage {
  id: string;
  authorId: string;
  authorName: string;
  authorColor: string; // Color distintivo del autor
  content: string;     // Máximo 140 caracteres
  latitude: number;
  longitude: number;
  createdAt: string;   // ISO timestamp
  expiresAt: string;   // ISO timestamp (asignado automáticamente)
  status: MessageStatus;
}

export interface User {
  id: string;
  username: string;
  email: string;
  color: string;
}

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface MapStyleConfig {
  presetId: string;
  buildingColor: string;
  buildingHeightMultiplier: number;
  buildingOpacity: number;
  waterColor: string;
  roadColor: string;
  parkColor: string;
}
