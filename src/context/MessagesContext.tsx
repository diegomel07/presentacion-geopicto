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

// Semilla de mensajes iniciales con coordenadas geoespaciales reales
const INITIAL_MESSAGES: GeoMessage[] = [
  {
    id: 'msg-seed-1',
    authorId: 'user-demo-1',
    authorName: 'ExploradorGeo',
    authorColor: nintendoTheme.colors.avatarColors[0],
    content: '¡Bienvenidos a la Plaza GeoPicto! Explora notas contextuales en 3D.',
    latitude: 4.6382,
    longitude: -74.0841,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 22).toISOString(),
    status: 'publicado',
  },
  {
    id: 'msg-seed-2',
    authorId: 'user-demo-2',
    authorName: 'ViajeroContextual',
    authorColor: nintendoTheme.colors.avatarColors[1],
    content: 'Café delicioso cerca de la fuente central. ¡Recomendado!',
    latitude: 4.6395,
    longitude: -74.0825,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 19).toISOString(),
    status: 'publicado',
  },
  {
    id: 'msg-seed-3',
    authorId: 'user-demo-3',
    authorName: 'ComunidadLocal',
    authorColor: nintendoTheme.colors.avatarColors[2],
    content: 'Nota informativa en proceso de validación por los guardianes de la plaza.',
    latitude: 4.6368,
    longitude: -74.0858,
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 23).toISOString(),
    status: 'pendiente',
  },
  {
    id: 'msg-seed-4',
    authorId: 'user-demo-2',
    authorName: 'ViajeroContextual',
    authorColor: nintendoTheme.colors.avatarColors[1],
    content: 'Mensaje archivado que ha sido ocultado de la vista pública general.',
    latitude: 4.6408,
    longitude: -74.0862,
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    expiresAt: new Date(Date.now() + 3600000 * 14).toISOString(),
    status: 'oculto',
  },
];

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const MessagesProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<GeoMessage[]>(INITIAL_MESSAGES);
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
