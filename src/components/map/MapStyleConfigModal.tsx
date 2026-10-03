import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MapStyleConfig } from '../../types';
import { nintendoTheme } from '../../theme/nintendoTheme';
import {
  MAP_PRESETS,
  MAP_COLOR_SWATCHES,
  DEFAULT_MAP_STYLE_CONFIG,
} from '../../theme/mapPresets';
import { WiiButton } from '../common/WiiButton';

interface MapStyleConfigModalProps {
  visible: boolean;
  onClose: () => void;
  config: MapStyleConfig;
  onChangeConfig: (newConfig: MapStyleConfig) => void;
}

export const MapStyleConfigModal: React.FC<MapStyleConfigModalProps> = ({
  visible,
  onClose,
  config,
  onChangeConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');

  const handleSelectPreset = (presetId: string) => {
    const found = MAP_PRESETS.find((p) => p.id === presetId);
    if (found) {
      onChangeConfig({ ...found.config });
    }
  };

  const handleUpdateProperty = <K extends keyof MapStyleConfig>(
    key: K,
    value: MapStyleConfig[K]
  ) => {
    onChangeConfig({
      ...config,
      [key]: value,
      presetId: 'custom',
    });
  };

  const handleReset = () => {
    onChangeConfig({ ...DEFAULT_MAP_STYLE_CONFIG });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        >
          <View style={styles.modalBackdrop} />
        </TouchableOpacity>

        <View style={styles.modalCard}>
          {/* Cabecera estilo Nintendo Wii */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleGroup}>
              <View style={styles.paletteIconBg}>
                <Ionicons name="color-palette" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Estilos del Mapa 3D</Text>
                <Text style={styles.headerSubtitle}>Edificios, ríos, vías y vegetación</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={nintendoTheme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Selector de pestañas */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'presets' && styles.tabItemActive]}
              onPress={() => setActiveTab('presets')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="sparkles-outline"
                size={15}
                color={activeTab === 'presets' ? nintendoTheme.colors.wiiBlue : nintendoTheme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'presets' && styles.tabTextActive,
                ]}
              >
                Estilos Predefinidos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabItem, activeTab === 'custom' && styles.tabItemActive]}
              onPress={() => setActiveTab('custom')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="options-outline"
                size={15}
                color={activeTab === 'custom' ? nintendoTheme.colors.miiverseGreen : nintendoTheme.colors.textSecondary}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'custom' && styles.tabTextActive,
                ]}
              >
                Personalizar Capas
              </Text>
            </TouchableOpacity>
          </View>

          {/* Contenido scrolleable */}
          <ScrollView
            style={styles.scrollArea}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 16 }}
          >
            {activeTab === 'presets' ? (
              <View style={styles.presetsGrid}>
                {MAP_PRESETS.map((preset) => {
                  const isSelected = config.presetId === preset.id;
                  return (
                    <TouchableOpacity
                      key={preset.id}
                      style={[
                        styles.presetCard,
                        isSelected && styles.presetCardActive,
                      ]}
                      onPress={() => handleSelectPreset(preset.id)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.presetTopRow}>
                        <View
                          style={[
                            styles.presetIconBubble,
                            { backgroundColor: preset.config.buildingColor },
                          ]}
                        >
                          <Ionicons
                            name={preset.iconName as any}
                            size={20}
                            color={nintendoTheme.colors.textPrimary}
                          />
                        </View>
                        {isSelected && (
                          <View style={styles.checkBadge}>
                            <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                          </View>
                        )}
                      </View>

                      <Text style={styles.presetName}>{preset.name}</Text>
                      <Text style={styles.presetDesc}>{preset.description}</Text>

                      {/* Muestra de colores */}
                      <View style={styles.colorPillPreview}>
                        <View style={[styles.miniColorDot, { backgroundColor: preset.config.buildingColor }]} />
                        <View style={[styles.miniColorDot, { backgroundColor: preset.config.waterColor }]} />
                        <View style={[styles.miniColorDot, { backgroundColor: preset.config.roadColor }]} />
                        <View style={[styles.miniColorDot, { backgroundColor: preset.config.parkColor }]} />
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              /* Configuración detallada de capas */
              <View style={styles.customSection}>
                {/* 1. Edificios 3D */}
                <View style={styles.featureGroup}>
                  <View style={styles.featureHeader}>
                    <Ionicons name="business-outline" size={16} color={nintendoTheme.colors.wiiBlue} />
                    <Text style={styles.featureTitle}>Edificios 3D (Extrusión)</Text>
                  </View>

                  <Text style={styles.sublabel}>Color de fachadas y tejados:</Text>
                  <View style={styles.swatchRow}>
                    {MAP_COLOR_SWATCHES.buildings.map((col) => (
                      <TouchableOpacity
                        key={col}
                        style={[
                          styles.swatchItem,
                          { backgroundColor: col },
                          config.buildingColor === col && styles.swatchActive,
                        ]}
                        onPress={() => handleUpdateProperty('buildingColor', col)}
                      />
                    ))}
                  </View>

                  <Text style={[styles.sublabel, { marginTop: 10 }]}>Altura y volumen 3D:</Text>
                  <View style={styles.heightButtonGroup}>
                    {MAP_COLOR_SWATCHES.heightMultipliers.map((h) => {
                      const isSelected = config.buildingHeightMultiplier === h.value;
                      return (
                        <TouchableOpacity
                          key={h.value}
                          style={[
                            styles.heightPill,
                            isSelected && styles.heightPillActive,
                          ]}
                          onPress={() => handleUpdateProperty('buildingHeightMultiplier', h.value)}
                        >
                          <Text
                            style={[
                              styles.heightPillText,
                              isSelected && styles.heightPillTextActive,
                            ]}
                          >
                            {h.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* 2. Ríos y Agua */}
                <View style={styles.featureGroup}>
                  <View style={styles.featureHeader}>
                    <Ionicons name="water-outline" size={16} color="#00A4D3" />
                    <Text style={styles.featureTitle}>Ríos, Lagos y Agua</Text>
                  </View>
                  <Text style={styles.sublabel}>Color de cuencas y afluentes:</Text>
                  <View style={styles.swatchRow}>
                    {MAP_COLOR_SWATCHES.water.map((col) => (
                      <TouchableOpacity
                        key={col}
                        style={[
                          styles.swatchItem,
                          { backgroundColor: col },
                          config.waterColor === col && styles.swatchActive,
                        ]}
                        onPress={() => handleUpdateProperty('waterColor', col)}
                      />
                    ))}
                  </View>
                </View>

                {/* 3. Carreteras y Vías */}
                <View style={styles.featureGroup}>
                  <View style={styles.featureHeader}>
                    <Ionicons name="navigate-outline" size={16} color="#4A5568" />
                    <Text style={styles.featureTitle}>Carreteras y Calles</Text>
                  </View>
                  <Text style={styles.sublabel}>Tono de pavimentos y vías:</Text>
                  <View style={styles.swatchRow}>
                    {MAP_COLOR_SWATCHES.roads.map((col) => (
                      <TouchableOpacity
                        key={col}
                        style={[
                          styles.swatchItem,
                          { backgroundColor: col },
                          config.roadColor === col && styles.swatchActive,
                        ]}
                        onPress={() => handleUpdateProperty('roadColor', col)}
                      />
                    ))}
                  </View>
                </View>

                {/* 4. Parques y Vegetación */}
                <View style={styles.featureGroup}>
                  <View style={styles.featureHeader}>
                    <Ionicons name="leaf-outline" size={16} color={nintendoTheme.colors.miiverseGreen} />
                    <Text style={styles.featureTitle}>Parques y Zonas Verdes</Text>
                  </View>
                  <Text style={styles.sublabel}>Color de áreas naturales:</Text>
                  <View style={styles.swatchRow}>
                    {MAP_COLOR_SWATCHES.parks.map((col) => (
                      <TouchableOpacity
                        key={col}
                        style={[
                          styles.swatchItem,
                          { backgroundColor: col },
                          config.parkColor === col && styles.swatchActive,
                        ]}
                        onPress={() => handleUpdateProperty('parkColor', col)}
                      />
                    ))}
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Pie de modal con botones de acción */}
          <View style={styles.footerRow}>
            <WiiButton
              title="Restablecer"
              variant="secondary"
              size="md"
              onPress={handleReset}
              style={{ flex: 1 }}
            />
            <WiiButton
              title="Aplicar Estilo"
              variant="primary"
              size="md"
              onPress={onClose}
              style={{ flex: 1.3 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(28, 40, 36, 0.45)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: nintendoTheme.borderRadius.lg,
    borderWidth: 2,
    borderColor: '#384347',
    padding: 18,
    ...nintendoTheme.shadows.pictoCard,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: '#EEF2F0',
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paletteIconBg: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: nintendoTheme.colors.wiiBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: nintendoTheme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 11,
    color: nintendoTheme.colors.textSecondary,
  },
  closeBtn: {
    padding: 4,
    borderRadius: 16,
    backgroundColor: '#F0F4F3',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#EEF3F1',
    borderRadius: nintendoTheme.borderRadius.pill,
    padding: 4,
    marginVertical: 12,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    borderRadius: nintendoTheme.borderRadius.pill,
    gap: 6,
  },
  tabItemActive: {
    backgroundColor: '#FFFFFF',
    ...nintendoTheme.shadows.wiiSoft,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: nintendoTheme.colors.textSecondary,
  },
  tabTextActive: {
    color: nintendoTheme.colors.textPrimary,
    fontWeight: '700',
  },
  scrollArea: {
    maxHeight: 380,
  },
  presetsGrid: {
    gap: 10,
  },
  presetCard: {
    backgroundColor: '#F8FAF9',
    borderRadius: nintendoTheme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: '#DFE7E4',
    padding: 12,
  },
  presetCardActive: {
    borderColor: nintendoTheme.colors.wiiBlue,
    backgroundColor: '#F0F8FD',
  },
  presetTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  presetIconBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  checkBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: nintendoTheme.colors.wiiBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetName: {
    fontSize: 14,
    fontWeight: '700',
    color: nintendoTheme.colors.textPrimary,
  },
  presetDesc: {
    fontSize: 11,
    color: nintendoTheme.colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  colorPillPreview: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  miniColorDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#94A3B8',
  },
  customSection: {
    gap: 14,
  },
  featureGroup: {
    backgroundColor: '#F8FAF9',
    borderRadius: nintendoTheme.borderRadius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: nintendoTheme.colors.textPrimary,
  },
  sublabel: {
    fontSize: 11,
    fontWeight: '600',
    color: nintendoTheme.colors.textSecondary,
    marginBottom: 6,
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  swatchItem: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
  },
  swatchActive: {
    borderColor: nintendoTheme.colors.wiiBlue,
    borderWidth: 3,
    transform: [{ scale: 1.1 }],
  },
  heightButtonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  heightPill: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: nintendoTheme.borderRadius.pill,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  heightPillActive: {
    backgroundColor: nintendoTheme.colors.mintSoft,
    borderColor: nintendoTheme.colors.miiverseGreen,
  },
  heightPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: nintendoTheme.colors.textSecondary,
  },
  heightPillTextActive: {
    color: '#15803D',
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F0',
  },
});
