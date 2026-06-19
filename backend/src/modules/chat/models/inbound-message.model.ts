import { ChatMessage } from '@Entities';
import { ChatActionTaken } from './chat-response.model';

// Imagen entrante independiente del canal. El controller in-app la arma desde
// un Express.Multer.File; un futuro canal (WhatsApp) la armaria descargando el
// media del proveedor.
export interface InboundImage {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
}

// Resultado de dominio de sendMessage: entidades persistidas, sin presentacion.
// Cada canal decide como entregarlas (la app las prefirma; WhatsApp leeria el
// texto).
export interface ChatExchange {
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
  actionsTaken: ChatActionTaken[];
}

export interface ProposalResolution {
  proposal: ChatMessage;
  followUp: ChatMessage;
  actionsTaken: ChatActionTaken[];
}
