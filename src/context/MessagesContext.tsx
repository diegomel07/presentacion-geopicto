import React, { createContext, useContext, useState, ReactNode } from 'react';
import { GeoMessage, MessageStatus, LocationCoords } from '../types';
import { useAuth } from './AuthContext';
import { nintendoTheme } from '../theme/nintendoTheme';

interface MessagesContextType {
  messages: GeoMessage[];
  activeMessages: GeoMessage[];
  createMessage: (
    content: string,
    coords: LocationCoords,
    customStatus?: MessageStatus,
    expirationHours?: number
  ) => { success: boolean; error?: string };
  deleteMessage: (messageId: string) => { success: boolean; error?: string };
  selectedMessage: GeoMessage | null;
  setSelectedMessage: (message: GeoMessage | null) => void;
  statusFilter: MessageStatus | 'todos';
  setStatusFilter: (filter: MessageStatus | 'todos') => void;
}

import { BOGOTA_SEED_MESSAGES } from '../data/bogotaMessages';

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const MessagesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<GeoMessage[]>(BOGOTA_SEED_MESSAGES);
  const [selectedMessage, setSelectedMessage] = useState<GeoMessage | null>(null);
  const [statusFilter, setStatusFilter] = useState<MessageStatus | 'todos'>('todos');

  const createMessage = (
    content: string,
    coords: LocationCoords,
    customStatus: MessageStatus = 'publicado',
    expirationHours: number = 24
  ): { success: boolean; error?: string } => {
    if (!user) {
      return { success: false, error: 'Debes iniciar sesión para publicar un mensaje.' };
    }

    const trimmed = content.trim();
    if (!trimmed) {
      return { success: false, error: 'El mensaje no puede estar vacío.' };
    }

    if (trimmed.length > 140) {
      return { success: false, error: 'El mensaje no puede superar los 140 caracteres.' };
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + expirationHours * 3600 * 1000).toISOString();

    const newMessage: GeoMessage = {
      id: `msg-${Date.now()}`,
      authorId: user.id,
      authorName: user.username,
      authorColor: user.color,
      content: trimmed,
      latitude: coords.latitude,
      longitude: coords.longitude,
      createdAt: now.toISOString(),
      expiresAt,
      status: customStatus,
    };

    setMessages((prev) => [newMessage, ...prev]);
    return { success: true };
  };

  const deleteMessage = (messageId: string): { success: boolean; error?: string } => {
    if (!user) {
      return { success: false, error: 'Debes iniciar sesión para realizar esta acción.' };
    }

    const target = messages.find((m) => m.id === messageId);
    if (!target) {
      return { success: false, error: 'Mensaje no encontrado.' };
    }

    if (target.authorId !== user.id) {
      return { success: false, error: 'Solo el autor original tiene permiso para eliminar este mensaje.' };
    }

    // Actualizamos el estado a 'eliminado' cumpliendo con la regla de estados
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, status: 'eliminado' as MessageStatus } : m))
    );

    // Si el mensaje estaba abierto en el visor modal, actualizamos la referencia
    if (selectedMessage?.id === messageId) {
      setSelectedMessage((prev) => (prev ? { ...prev, status: 'eliminado' } : null));
    }

    return { success: true };
  };

  // Filtrado de mensajes visibles
  const activeMessages = messages.filter((m) => {
    if (statusFilter === 'todos') {
      // Por defecto no mostramos los eliminados a menos que se filtren explícitamente
      return m.status !== 'eliminado';
    }
    return m.status === statusFilter;
  });

  return (
    <MessagesContext.Provider
      value={{
        messages,
        activeMessages,
        createMessage,
        deleteMessage,
        selectedMessage,
        setSelectedMessage,
        statusFilter,
        setStatusFilter,
      }}
    >
      {children}
    </MessagesContext.Provider>
  );
};

export const useMessages = (): MessagesContextType => {
  const context = useContext(MessagesContext);
  if (!context) {
    throw new Error('useMessages debe ser utilizado dentro de un MessagesProvider');
  }
  return context;
};
