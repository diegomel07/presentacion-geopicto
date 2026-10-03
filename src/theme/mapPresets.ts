import { MapStyleConfig } from '../types';

export interface MapPreset {
  id: string;
  name: string;
  description: string;
  iconName: string;
  config: MapStyleConfig;
}

export const MAP_PRESETS: MapPreset[] = [
  {
    id: 'nintendo-mint',
    name: 'Nintendo Menta',
    description: 'Estilo clásico suave con verde menta y edificios porcelana',
    iconName: 'leaf-outline',
    config: {
      presetId: 'nintendo-mint',
      buildingColor: '#d6eae3',
      buildingHeightMultiplier: 1.0,
      buildingOpacity: 0.92,
      waterColor: '#8ed1e0',
      roadColor: '#ffffff',
      parkColor: '#c8eedb',
    },
  },
  {
    id: 'wii-sky',
    name: 'Wii Celeste',
    description: 'Tonos brillantes del Menú Wii con aguas cristalinas',
    iconName: 'sunny-outline',
    config: {
      presetId: 'wii-sky',
      buildingColor: '#e0eff7',
      buildingHeightMultiplier: 1.2,
      buildingOpacity: 0.95,
      waterColor: '#00a4d3',
      roadColor: '#f0f7fb',
      parkColor: '#bde7d4',
    },
  },
  {
    id: 'picto-mono',
    name: 'PictoChat Papel',
    description: 'Estilo bloc de notas DS en escala limpia de grises y tinta',
    iconName: 'document-text-outline',
    config: {
      presetId: 'picto-mono',
      buildingColor: '#ebebeb',
      buildingHeightMultiplier: 1.0,
      buildingOpacity: 0.9,
      waterColor: '#c5cbcf',
      roadColor: '#ffffff',
      parkColor: '#dfe4e3',
    },
  },
  {
    id: 'sunset-gold',
    name: 'Diorama Dorado',
    description: 'Atardecer cálido con sombras marcadas y rascacielos altos',
    iconName: 'flame-outline',
    config: {
      presetId: 'sunset-gold',
      buildingColor: '#f7d6b8',
      buildingHeightMultiplier: 1.6,
      buildingOpacity: 0.96,
      waterColor: '#63849e',
      roadColor: '#fff5e8',
      parkColor: '#dfc19c',
    },
  },
];

export const MAP_COLOR_SWATCHES = {
  buildings: ['#d6eae3', '#e0eff7', '#ebebeb', '#f7d6b8', '#d0d7de', '#e8d5f5'],
  water: ['#8ed1e0', '#00a4d3', '#3bb2d0', '#63849e', '#c5cbcf', '#2c5282'],
  roads: ['#ffffff', '#f4f6f8', '#fff5e8', '#e2e8f0', '#cbd5e1', '#334155'],
  parks: ['#c8eedb', '#bde7d4', '#dfe4e3', '#dfc19c', '#a3e635', '#86efac'],
  heightMultipliers: [
    { label: 'Baja (0.6x)', value: 0.6 },
    { label: 'Normal (1.0x)', value: 1.0 },
    { label: 'Alta (1.5x)', value: 1.5 },
    { label: '3D Max (2.0x)', value: 2.0 },
  ],
};

export const DEFAULT_MAP_STYLE_CONFIG: MapStyleConfig = MAP_PRESETS[0].config;
