import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { EncryptionService } from "@/services/EncryptionService"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generate new encryption keys for a user
 */
export async function generateEncryptionKeys() {
  return await EncryptionService.generateKeyPair();
}

// Encrypt a message using recipient's public key
export async function encryptMessage(message: string, publicKeyBase64: string) {
  try {
    const publicKeyBuffer = base64ToArrayBuffer(publicKeyBase64);
    const publicKey = await window.crypto.subtle.importKey(
      "spki",
      publicKeyBuffer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      false,
      ["encrypt"]
    );

    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: "RSA-OAEP",
      },
      publicKey,
      data
    );

    return arrayBufferToBase64(encryptedData);
  } catch (error) {
    console.error("Error encrypting message:", error);
    throw error;
  }
}

// Decrypt a message using user's private key
export async function decryptMessage(encryptedMessage: string, privateKeyBase64: string) {
  try {
    const privateKeyBuffer = base64ToArrayBuffer(privateKeyBase64);
    const privateKey = await window.crypto.subtle.importKey(
      "pkcs8",
      privateKeyBuffer,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      false,
      ["decrypt"]
    );

    const encryptedData = base64ToArrayBuffer(encryptedMessage);
    const decryptedData = await window.crypto.subtle.decrypt(
      {
        name: "RSA-OAEP",
      },
      privateKey,
      encryptedData
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedData);
  } catch (error) {
    console.error("Error decrypting message:", error);
    throw error;
  }
}

// Utility to convert ArrayBuffer to Base64 string
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Utility to convert Base64 string to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Format date for chat messages
export function formatMessageTime(date: Date): string {
  const now = new Date();
  const messageDate = new Date(date);
  
  // If message is from today, show time only
  if (messageDate.toDateString() === now.toDateString()) {
    return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // If message is from yesterday, show "Yesterday, time"
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (messageDate.toDateString() === yesterday.toDateString()) {
    return `Yesterday, ${messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
  
  // Otherwise show date and time
  return messageDate.toLocaleDateString() + ', ' + 
    messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * Check if a user is online based on their last seen timestamp
 * We consider a user online if they were active in the last 5 minutes
 */
export function isUserOnline(lastSeen?: Date): boolean {
  if (!lastSeen) return false;
  
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  
  return lastSeen > fiveMinutesAgo;
}

/**
 * Format last seen time in a user-friendly way
 */
export function formatLastSeen(lastSeen?: Date): string {
  if (!lastSeen) return 'Never';
  
  const now = new Date();
  const diffMs = now.getTime() - lastSeen.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  
  // For older dates, return the actual date
  return lastSeen.toLocaleDateString();
}
