import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Modal,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LocationCoords, MessageStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useMessages } from '../../context/MessagesContext';
import { nintendoTheme } from '../../theme/nintendoTheme';
import { WiiButton } from '../common/WiiButton';
import { StatusBadge } from '../common/StatusBadge';

interface CreateMessageModalProps {
  visible: boolean;
  onClose: () => void;
  targetCoords: LocationCoords;
}

export const CreateMessageModal: React.FC<CreateMessageModalProps> = ({
  visible,
  onClose,
  targetCoords,
}) => {
  const { user } = useAuth();
  const { createMessage } = useMessages();

  const [content, setContent] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<MessageStatus>('publicado');
  const [errorMsg, setErrorMsg] = useState('');

  const charLimit = 140;
  const charsRemaining = charLimit - content.length;

  const handlePublish = () => {
    setErrorMsg('');
    const res = createMessage(content, targetCoords, selectedStatus, 24);
    if (res.success) {
      setContent('');
      onClose();
    } else {
      setErrorMsg(res.error || 'No se pudo publicar la nota.');
    }
  };

  const handleClose = () => {
    setErrorMsg('');
    setContent('');
    onClose();
  };

  // Estimación de expiración a 24 horas
  const estimatedExpiration = new Date(Date.now() + 24 * 3600 * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short',
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleClose}
          />
        </View>

        <View style={styles.modalCard}>
          {/* Cabecera estilo libreta Nintendo DS */}
          <View style={styles.modalHeader}>
            <View style={styles.headerTitleRow}>
              <View style={[styles.stylusIconCircle, { backgroundColor: user?.color || nintendoTheme.colors.wiiBlue }]}>
                <Ionicons name="pencil" size={15} color="#FFFFFF" />
              </View>
              <Text style={styles.modalTitle}>Redactar Nota PictoChat</Text>
            </View>

            <TouchableOpacity onPress={handleClose} style={styles.closeIconButton}>
              <Ionicons name="close" size={20} color={nintendoTheme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Libreta cuadriculada con área de texto */}
          <View style={styles.notepadContainer}>
            {/* Trama cuadriculada decorativa */}
            <View style={styles.notepadGridLine1} />
            <View style={styles.notepadGridLine2} />
            <View style={styles.notepadGridLine3} />

            <TextInput
              style={styles.notepadInput}
              placeholder="Escribe tu mensaje geoespacial contextual (máximo 140 caracteres)..."
              placeholderTextColor={nintendoTheme.colors.textMuted}
              value={content}
              onChangeText={setContent}
              maxLength={charLimit}
              multiline
              autoFocus
              textAlignVertical="top"
            />

            {/* Contador de caracteres reactivo */}
            <View style={styles.counterRow}>
              <Text
                style={[
                  styles.counterText,
                  charsRemaining <= 10 && styles.counterWarning,
                  charsRemaining === 0 && styles.counterExceeded,
                ]}
              >
                {content.length} / {charLimit} caracteres
              </Text>
            </View>
          </View>

          {/* Metadatos asignados automáticamente por el sistema */}
          <View style={styles.systemMetadataBox}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Ubicación asignada:</Text>
              <Text style={styles.metaValue}>
                {targetCoords.latitude.toFixed(4)}, {targetCoords.longitude.toFixed(4)}
              </Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Expiración automática:</Text>
              <Text style={styles.metaValue}>{estimatedExpiration} (+24h)</Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Estado inicial:</Text>
              <View style={styles.statusToggleGroup}>
                <TouchableOpacity
                  style={[
                    styles.statusPillOption,
                    selectedStatus === 'publicado' && styles.statusPillActive,
                  ]}
                  onPress={() => setSelectedStatus('publicado')}
                >
                  <StatusBadge status="publicado" size="sm" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusPillOption,
                    selectedStatus === 'pendiente' && styles.statusPillActive,
                  ]}
                  onPress={() => setSelectedStatus('pendiente')}
                >
                  <StatusBadge status="pendiente" size="sm" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

          {/* Botones de acción estilo Wii */}
          <View style={styles.actionButtonsRow}>
            <WiiButton
              title="Cancelar"
              variant="secondary"
              onPress={handleClose}
              style={{ flex: 1 }}
            />
            <WiiButton
              title="Publicar Nota"
              variant="mint"
              icon={<Ionicons name="paper-plane" size={16} color="#FFFFFF" />}
              onPress={handlePublish}
              disabled={content.trim().length === 0}
              style={{ flex: 1.4 }}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
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
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: nintendoTheme.borderRadius.lg,
    borderWidth: 2,
    borderColor: '#384347',
    padding: 18,
    ...nintendoTheme.shadows.pictoCard,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: '#EEF2F0',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stylusIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: nintendoTheme.colors.textPrimary,
  },
  closeIconButton: {
    padding: 4,
    borderRadius: 16,
    backgroundColor: '#F0F4F3',
  },
  notepadContainer: {
    backgroundColor: '#FAFDFB',
    borderRadius: nintendoTheme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: '#C6D4CF',
    padding: 12,
    position: 'relative',
    height: 125,
  },
  notepadGridLine1: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: 36,
    height: 1,
    backgroundColor: '#E6ECE9',
  },
  notepadGridLine2: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: 68,
    height: 1,
    backgroundColor: '#E6ECE9',
  },
  notepadGridLine3: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: 100,
    height: 1,
    backgroundColor: '#E6ECE9',
  },
  notepadInput: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
    color: nintendoTheme.colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    zIndex: 2,
  },
  counterRow: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  counterText: {
    fontSize: 11,
    fontWeight: '700',
    color: nintendoTheme.colors.textMuted,
  },
  counterWarning: {
    color: '#D97706',
  },
  counterExceeded: {
    color: '#DC2626',
  },
  systemMetadataBox: {
    backgroundColor: '#F5F9F7',
    borderRadius: nintendoTheme.borderRadius.sm,
    padding: 10,
    marginTop: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#DFECE7',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: nintendoTheme.colors.textSecondary,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '700',
    color: nintendoTheme.colors.textPrimary,
  },
  statusToggleGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  statusPillOption: {
    opacity: 0.5,
    padding: 2,
    borderRadius: nintendoTheme.borderRadius.pill,
  },
  statusPillActive: {
    opacity: 1,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
});
