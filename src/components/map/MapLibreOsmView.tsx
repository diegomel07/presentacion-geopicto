import React, { useRef, useEffect, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GeoMessage, LocationCoords, MapStyleConfig } from '../../types';
import { nintendoTheme } from '../../theme/nintendoTheme';
import { DEFAULT_MAP_STYLE_CONFIG } from '../../theme/mapPresets';

// WebView condicional para plataformas nativas
let WebViewComponent: any = null;
if (Platform.OS !== 'web') {
  try {
    WebViewComponent = require('react-native-webview').WebView;
  } catch (e) {
    console.warn('react-native-webview no disponible', e);
  }
}

interface MapLibreOsmViewProps {
  userLocation: LocationCoords;
  messages: GeoMessage[];
  onSelectMessage: (message: GeoMessage) => void;
  styleConfig?: MapStyleConfig;
  onOpenStyleConfig?: () => void;
}

export const MapLibreOsmView: React.FC<MapLibreOsmViewProps> = ({
  userLocation,
  messages,
  onSelectMessage,
  styleConfig = DEFAULT_MAP_STYLE_CONFIG,
  onOpenStyleConfig,
}) => {
  const webViewRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Generamos el HTML embebido de MapLibre con OpenStreetMap, perspectiva isométrica 3D y personalización dinámica
  const mapHtml = useMemo(() => {
    const messagesJson = JSON.stringify(messages);
    const styleConfigJson = JSON.stringify(styleConfig);
    const userLat = userLocation.latitude;
    const userLng = userLocation.longitude;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>MapLibre OSM 3D</title>
  <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" />
  <script src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #map {
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #e6f0ed;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    
    /* Marcador del Usuario con halo pulsante */
    .user-marker {
      width: 26px;
      height: 26px;
      position: relative;
      cursor: pointer;
    }
    .user-marker-pulse {
      position: absolute;
      width: 44px;
      height: 44px;
      left: -9px;
      top: -9px;
      border-radius: 50%;
      background: rgba(0, 156, 216, 0.32);
      animation: pulse 2s infinite ease-out;
    }
    .user-marker-dot {
      position: absolute;
      width: 22px;
      height: 22px;
      left: 2px;
      top: 2px;
      border-radius: 50%;
      background: #009CD8;
      border: 3px solid #ffffff;
      box-shadow: 0 4px 12px rgba(0, 70, 100, 0.5);
    }
    @keyframes pulse {
      0% { transform: scale(0.6); opacity: 0.9; }
      100% { transform: scale(1.6); opacity: 0; }
    }

    /* Marcador 3D estilo Billboard elevado sobre el terreno */
    .billboard-marker {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transform-style: preserve-3d;
      transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .billboard-marker:hover, .billboard-marker:active {
      transform: translateY(-8px) scale(1.1);
    }
    .billboard-bubble {
      background: #ffffff;
      border-radius: 16px;
      border: 2px solid #2e383c;
      padding: 6px 11px;
      display: flex;
      align-items: center;
      gap: 7px;
      box-shadow: 0 8px 20px rgba(35, 45, 50, 0.28);
      position: relative;
      white-space: nowrap;
      max-width: 150px;
    }
    .billboard-bubble::after {
      content: '';
      position: absolute;
      bottom: -7px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 7px solid #2e383c;
    }
    .billboard-avatar {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .billboard-text {
      font-size: 11px;
      font-weight: 700;
      color: #283338;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    /* Sombra 3D proyectada en el plano del suelo */
    .billboard-shadow {
      width: 22px;
      height: 8px;
      background: rgba(0, 0, 0, 0.25);
      border-radius: 50%;
      margin-top: 9px;
      filter: blur(2px);
    }

    /* Badge indicador 3D */
    .camera-badge {
      position: absolute;
      top: 14px;
      left: 14px;
      background: rgba(255, 255, 255, 0.94);
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      color: #283338;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      border: 1px solid #D8E2E0;
      display: flex;
      align-items: center;
      gap: 6px;
      z-index: 10;
      pointer-events: none;
    }
    .camera-badge-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #2DC653;
      box-shadow: 0 0 6px #2DC653;
    }
  </style>
</head>
<body>
  <div class="camera-badge">
    <div class="camera-badge-dot"></div>
    <span>MapLibre 3D (OSM Personalizable)</span>
  </div>
  <div id="map"></div>

  <script>
    const userCoords = [${userLng}, ${userLat}];
    const rawMessages = ${messagesJson};
    let activeConfig = ${styleConfigJson};

    // Estilo vectorial abierto de OpenStreetMap con capas de extrusión 3D
    const osmVectorStyle = 'https://tiles.openfreemap.org/styles/liberty';

    // Inicializamos MapLibre con proyección 3D isométrica y cámara inclinada
    const map = new maplibregl.Map({
      container: 'map',
      style: osmVectorStyle,
      center: userCoords,
      zoom: 16.5,
      pitch: 62,          // Inclinación 3D pronunciada para apreciar volumen
      bearing: -20,       // Rotación isométrica diorama
      antialias: true,
      maxPitch: 85,
    });

    // Control de navegación suave
    map.addControl(new maplibregl.NavigationControl({
      showCompass: true,
      showZoom: false,
      visualizePitch: true
    }), 'top-right');

    // Marcador del usuario actual
    const userEl = document.createElement('div');
    userEl.className = 'user-marker';
    userEl.innerHTML = '<div class="user-marker-pulse"></div><div class="user-marker-dot"></div>';
    new maplibregl.Marker({ element: userEl, anchor: 'center' })
      .setLngLat(userCoords)
      .addTo(map);

    // Marcadores 3D tipo Billboard para cada mensaje
    const markers = [];
    function renderMessages(msgs) {
      markers.forEach(m => m.remove());
      markers.length = 0;

      msgs.forEach(msg => {
        if (msg.status === 'eliminado') return;

        const el = document.createElement('div');
        el.className = 'billboard-marker';
        el.innerHTML = \`
          <div class="billboard-bubble">
            <div class="billboard-avatar" style="background: \${msg.authorColor};"></div>
            <div class="billboard-text">\${msg.content.substring(0, 20)}\${msg.content.length > 20 ? '...' : ''}</div>
          </div>
          <div class="billboard-shadow"></div>
        \`;

        // Tocar el marcador abre el detalle del mensaje
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          notifyParent({ type: 'SELECT_MESSAGE', id: msg.id });
        });

        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([msg.longitude, msg.latitude])
          .addTo(map);

        markers.push(marker);
      });
    }

    renderMessages(rawMessages);

    // Función para aplicar de forma dinámica las configuraciones de edificios, agua, vías y parques
    function applyMapStyles(cfg) {
      if (!cfg || !map.isStyleLoaded()) return;

      // 1. Edificios 3D (Color, altura y opacidad)
      if (map.getLayer('building-3d')) {
        map.setPaintProperty('building-3d', 'fill-extrusion-color', cfg.buildingColor || '#d6eae3');
        map.setPaintProperty('building-3d', 'fill-extrusion-opacity', cfg.buildingOpacity || 0.92);
        const mult = Number(cfg.buildingHeightMultiplier) || 1.0;
        map.setPaintProperty('building-3d', 'fill-extrusion-height', [
          '*',
          ['coalesce', ['get', 'render_height'], 15],
          mult
        ]);
      } else if (map.getSource('openmaptiles') && !map.getLayer('custom-3d-buildings')) {
        map.addLayer({
          'id': 'custom-3d-buildings',
          'source': 'openmaptiles',
          'source-layer': 'building',
          'type': 'fill-extrusion',
          'minzoom': 13,
          'paint': {
            'fill-extrusion-color': cfg.buildingColor || '#d6eae3',
            'fill-extrusion-height': ['*', ['coalesce', ['get', 'render_height'], 15], cfg.buildingHeightMultiplier || 1.0],
            'fill-extrusion-base': ['coalesce', ['get', 'render_min_height'], 0],
            'fill-extrusion-opacity': cfg.buildingOpacity || 0.92
          }
        });
      }

      // 2. Agua, Lagos y Ríos
      if (cfg.waterColor) {
        if (map.getLayer('water')) {
          map.setPaintProperty('water', 'fill-color', cfg.waterColor);
        }
        ['waterway_river', 'waterway_other', 'waterway_tunnel'].forEach(layerId => {
          if (map.getLayer(layerId)) {
            map.setPaintProperty(layerId, 'line-color', cfg.waterColor);
          }
        });
      }

      // 3. Parques y Zonas Verdes
      if (cfg.parkColor) {
        ['park', 'landuse_residential', 'landuse_pitch', 'landuse_track'].forEach(layerId => {
          if (map.getLayer(layerId)) {
            map.setPaintProperty(layerId, 'fill-color', cfg.parkColor);
          }
        });
      }

      // 4. Carreteras y Vías
      if (cfg.roadColor) {
        [
          'road_area_pattern',
          'road_motorway_link_casing',
          'road_service_track_casing',
          'road_link_casing',
          'road_minor_casing',
          'road_secondary_tertiary_casing',
          'road_trunk_primary_casing',
          'road_motorway_casing'
        ].forEach(layerId => {
          if (map.getLayer(layerId)) {
            map.setPaintProperty(layerId, 'line-color', cfg.roadColor);
          }
        });
      }
    }

    // Inicialización de estilos al cargar el mapa
    map.on('load', () => {
      // Luz direccional 3D para acentuar sombras y volumen
      map.setLight({
        anchor: 'viewport',
        color: '#ffffff',
        intensity: 0.65,
        position: [1.5, 210, 45]
      });

      applyMapStyles(activeConfig);
    });

    // Envío de eventos hacia React Native / Host Web
    function notifyParent(data) {
      const payload = JSON.stringify(data);
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(payload);
      } else if (window.parent) {
        window.parent.postMessage(payload, '*');
      }
    }

    // Escuchar mensajes entrantes desde React Native
    window.addEventListener('message', (event) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data.type === 'UPDATE_MESSAGES') {
          renderMessages(data.messages);
        } else if (data.type === 'UPDATE_STYLE_CONFIG') {
          activeConfig = data.config;
          applyMapStyles(data.config);
        } else if (data.type === 'RECENTER') {
          map.flyTo({
            center: [data.longitude, data.latitude],
            zoom: 16.5,
            pitch: 62,
            bearing: -20,
            essential: true
          });
        } else if (data.type === 'TOGGLE_3D') {
          const currentPitch = map.getPitch();
          map.easeTo({
            pitch: currentPitch > 25 ? 0 : 62,
            bearing: currentPitch > 25 ? 0 : -20,
            duration: 800
          });
        } else if (data.type === 'ROTATE_3D') {
          const currentBearing = map.getBearing();
          map.easeTo({
            bearing: currentBearing - 45,
            duration: 700
          });
        }
      } catch (err) {}
    });
  </script>
</body>
</html>
    `;
  }, [userLocation.latitude, userLocation.longitude, messages]);

  // Manejador de eventos entrantes desde el mapa
  const handleMapMessage = (eventData: string) => {
    try {
      const parsed = JSON.parse(eventData);
      if (parsed.type === 'SELECT_MESSAGE') {
        const found = messages.find((m) => m.id === parsed.id);
        if (found) onSelectMessage(found);
      }
    } catch (e) {
      // Ignorar mensajes no serializados
    }
  };

  // Notificar al mapa cuando cambia la configuración de estilos
  useEffect(() => {
    const payload = JSON.stringify({
      type: 'UPDATE_STYLE_CONFIG',
      config: styleConfig,
    });
    if (Platform.OS === 'web' && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(payload, '*');
    } else if (webViewRef.current) {
      webViewRef.current.postMessage(payload);
    }
  }, [styleConfig]);

  // Función para recentrar el mapa
  const recenterMap = () => {
    const payload = JSON.stringify({
      type: 'RECENTER',
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
    });
    if (Platform.OS === 'web' && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(payload, '*');
    } else if (webViewRef.current) {
      webViewRef.current.postMessage(payload);
    }
  };

  // Alternar entre 3D Isométrico y 2D
  const toggleIsometricAngle = () => {
    const payload = JSON.stringify({ type: 'TOGGLE_3D' });
    if (Platform.OS === 'web' && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(payload, '*');
    } else if (webViewRef.current) {
      webViewRef.current.postMessage(payload);
    }
  };

  // Rotar la vista 3D en 45 grados
  const rotateCamera = () => {
    const payload = JSON.stringify({ type: 'ROTATE_3D' });
    if (Platform.OS === 'web' && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(payload, '*');
    } else if (webViewRef.current) {
      webViewRef.current.postMessage(payload);
    }
  };

  // Listener en Web para eventos emitidos por el iframe
  useEffect(() => {
    if (Platform.OS === 'web') {
      const listener = (event: MessageEvent) => {
        if (typeof event.data === 'string') {
          handleMapMessage(event.data);
        }
      };
      window.addEventListener('message', listener);
      return () => window.removeEventListener('message', listener);
    }
  }, [messages, onSelectMessage]);

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        <iframe
          ref={iframeRef}
          srcDoc={mapHtml}
          style={styles.webIframe as any}
          title="MapLibre OpenStreetMap 3D"
        />
      ) : WebViewComponent ? (
        <WebViewComponent
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: mapHtml }}
          onMessage={(event: any) => handleMapMessage(event.nativeEvent.data)}
          style={styles.nativeWebView}
          javaScriptEnabled
          domStorageEnabled
        />
      ) : (
        <View style={styles.fallbackContainer}>
          <Text style={styles.fallbackText}>Cargando mapa 3D...</Text>
        </View>
      )}

      {/* Botones de control de cámara 3D estilo consola Nintendo */}
      <View style={styles.controlsOverlay}>
        {onOpenStyleConfig && (
          <TouchableOpacity
            style={[styles.circleButton, styles.paletteButton]}
            onPress={onOpenStyleConfig}
            activeOpacity={0.8}
          >
            <Ionicons name="color-palette" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.circleButton}
          onPress={recenterMap}
          activeOpacity={0.8}
        >
          <Ionicons name="locate" size={20} color={nintendoTheme.colors.wiiBlue} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.circleButton}
          onPress={toggleIsometricAngle}
          activeOpacity={0.8}
        >
          <Ionicons name="cube-outline" size={20} color={nintendoTheme.colors.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.circleButton}
          onPress={rotateCamera}
          activeOpacity={0.8}
        >
          <Ionicons name="sync-outline" size={18} color={nintendoTheme.colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#EAF1EE',
  },
  webIframe: {
    width: '100%',
    height: '100%',
    borderWidth: 0,
  },
  nativeWebView: {
    flex: 1,
    backgroundColor: '#EAF1EE',
  },
  fallbackContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackText: {
    color: nintendoTheme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  controlsOverlay: {
    position: 'absolute',
    bottom: 24,
    right: 18,
    flexDirection: 'column',
    gap: 12,
    zIndex: 30,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#D3DFDC',
    ...nintendoTheme.shadows.wiiSoft,
  },
  paletteButton: {
    backgroundColor: nintendoTheme.colors.wiiBlue,
    borderColor: '#0083B8',
  },
});
