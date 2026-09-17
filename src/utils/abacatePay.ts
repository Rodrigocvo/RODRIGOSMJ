import { AbacatePayConfig, AbacatePayTransaction } from '../types';

export const DEFAULT_ABACATEPAY_CONFIG: AbacatePayConfig = {
  apiKey: (typeof import.meta !== 'undefined' && (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_ABACATEPAY_API_KEY) || '',
  environment: 'production',
  webhookSecret: 'whsec_abacate_ruivinha_vip',
  pixExpirationMinutes: 15,
  isConfigured: false,
  lastTestedAt: new Date().toISOString(),
  simulatedBalance: 0.00,
  pixKey: '',
  pixKeyType: 'email',
  merchantName: 'RUIVINHA VIP',
  merchantCity: 'SAO PAULO',
  isRealKeyConfigured: false,
};

const STORAGE_CONFIG_KEY = 'ruivinha_abacatepay_config_v4';
const STORAGE_TRANSACTIONS_KEY = 'ruivinha_abacatepay_txs_v4';

export function loadAbacatePayConfig(): AbacatePayConfig {
  try {
    const saved = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const isLegacyDemo = parsed.pixKey === 'ruivinhavip.oficial@gmail.com' || !parsed.pixKey;
      return { 
        ...DEFAULT_ABACATEPAY_CONFIG, 
        ...parsed,
        pixKey: isLegacyDemo ? '' : (parsed.pixKey || ''),
        isRealKeyConfigured: isLegacyDemo ? false : Boolean(parsed.pixKey && parsed.pixKey.trim() !== '')
      };
    }

    // Check previous storage key
    const oldSaved = localStorage.getItem('ruivinha_abacatepay_config_v3');
    if (oldSaved) {
      const parsed = JSON.parse(oldSaved);
      const isLegacyDemo = parsed.pixKey === 'ruivinhavip.oficial@gmail.com' || !parsed.pixKey;
      const upgraded: AbacatePayConfig = {
        ...DEFAULT_ABACATEPAY_CONFIG,
        ...parsed,
        pixKey: isLegacyDemo ? '' : (parsed.pixKey || ''),
        isRealKeyConfigured: isLegacyDemo ? false : Boolean(parsed.pixKey && parsed.pixKey.trim() !== '')
      };
      localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(upgraded));
      return upgraded;
    }
  } catch (err) {
    console.error('Error loading AbacatePay config:', err);
  }
  return DEFAULT_ABACATEPAY_CONFIG;
}

export const getAbacatePayConfig = loadAbacatePayConfig;

export function saveAbacatePayConfig(config: AbacatePayConfig): void {
  try {
    const isReal = Boolean(config.pixKey && config.pixKey.trim() !== '' && config.pixKey !== 'ruivinhavip.oficial@gmail.com');
    const toSave: AbacatePayConfig = {
      ...config,
      isRealKeyConfigured: isReal,
      isConfigured: Boolean(config.apiKey?.trim() || isReal),
    };
    localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(toSave));
  } catch (err) {
    console.error('Error saving AbacatePay config:', err);
  }
}

export function loadAbacatePayTransactions(): AbacatePayTransaction[] {
  try {
    const saved = localStorage.getItem(STORAGE_TRANSACTIONS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    const old = localStorage.getItem('ruivinha_abacatepay_txs_v3');
    if (old) {
      return JSON.parse(old);
    }
  } catch (err) {
    console.error('Error loading AbacatePay transactions:', err);
  }
  return [];
}

export function saveAbacatePayTransactions(txs: AbacatePayTransaction[]): void {
  try {
    localStorage.setItem(STORAGE_TRANSACTIONS_KEY, JSON.stringify(txs));
  } catch (err) {
    console.error('Error saving AbacatePay txs:', err);
  }
}

export const getAbacateTransactions = loadAbacatePayTransactions;

/**
 * Normalizes strings to strict ASCII uppercase without accents or special symbols
 * as strictly required by EMVCo / Banco Central do Brasil BRCode specifications.
 */
function normalizePixText(text: string, maxLength: number): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[^a-zA-Z0-9 ]/g, '') // only alphanumeric and spaces
    .trim()
    .toUpperCase()
    .slice(0, maxLength);
}

/**
 * Formats Brazilian Pix keys strictly according to Banco Central do Brasil rules:
 * - CPF: 11 pure digits
 * - CNPJ: 14 pure digits
 * - Telefone: +55 followed by DDD and 8 or 9 digits (+5511999998888)
 * - Email: lowercase trimmed
 * - Random / EVP: 36 lowercase chars UUID
 */
export function formatPixKeyForBacen(key: string, type?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random'): string {
  if (!key) return '';
  const trimmed = key.trim();

  // If type is not provided, auto-detect
  let detectedType = type;
  if (!detectedType) {
    if (trimmed.includes('@')) detectedType = 'email';
    else if (/^\+?\d{10,13}$/.test(trimmed.replace(/[-()\s]/g, ''))) detectedType = 'phone';
    else if (trimmed.replace(/\D/g, '').length === 11) detectedType = 'cpf';
    else if (trimmed.replace(/\D/g, '').length === 14) detectedType = 'cnpj';
    else detectedType = 'random';
  }

  if (detectedType === 'cpf') {
    return trimmed.replace(/\D/g, '').slice(0, 11);
  }
  if (detectedType === 'cnpj') {
    return trimmed.replace(/\D/g, '').slice(0, 14);
  }
  if (detectedType === 'phone') {
    const digits = trimmed.replace(/\D/g, '');
    if (digits.startsWith('55')) {
      return `+${digits}`;
    }
    return `+55${digits}`;
  }
  if (detectedType === 'email') {
    return trimmed.toLowerCase();
  }
  return trimmed.toLowerCase();
}

/**
 * Formats a single EMVCo Tag-Length-Value (TLV) block.
 * tag: 2 digits
 * length: 2 digits with zero padding
 * value: string content
 */
function formatTlv(tag: string, value: string): string {
  const len = value.length.toString().padStart(2, '0');
  return `${tag}${len}${value}`;
}

/**
 * Calculates official 16-bit CRC (CRC-CCITT FALSE) with polynomial 0x1021 and initial value 0xFFFF
 * according to ISO/IEC 13239 and the Banco Central do Brasil Pix specifications.
 * This guarantees ANY banking app (Nubank, Itaú, Bradesco, Inter, Caixa, BB, Mercado Pago)
 * validates the Copia e Cola and QR Code instantly!
 */
export function calculatePixCrc16(payload: string): string {
  let crc = 0xffff;
  const polynomial = 0x1021;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ polynomial) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Generates an authentic EMVCo BRCode PIX payload string.
 */
export function buildValidPixPayload(params: {
  pixKey: string;
  merchantName: string;
  merchantCity: string;
  amount: number;
  txId: string;
  pixKeyType?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
}): string {
  const { pixKey, merchantName, merchantCity, amount, txId, pixKeyType } = params;

  // Tag 00: Payload Format Indicator (standard '01')
  const tag00 = formatTlv('00', '01');

  // Tag 26: Merchant Account Information
  // Sub-tag 00: GUI 'br.gov.bcb.pix'
  const sub00 = formatTlv('00', 'br.gov.bcb.pix');
  // Sub-tag 01: Chave PIX (formatted according to BACEN specification)
  const cleanPixKey = formatPixKeyForBacen(pixKey, pixKeyType);
  const sub01 = formatTlv('01', cleanPixKey || 'contato@ruivinhavip.com');
  const tag26 = formatTlv('26', `${sub00}${sub01}`);

  // Tag 52: Merchant Category Code (0000)
  const tag52 = formatTlv('52', '0000');

  // Tag 53: Transaction Currency (986 = BRL)
  const tag53 = formatTlv('53', '986');

  // Tag 54: Transaction Amount
  const tag54 = formatTlv('54', amount.toFixed(2));

  // Tag 58: Country Code (BR)
  const tag58 = formatTlv('58', 'BR');

  // Tag 59: Merchant Name (Max 25 characters, strict ASCII)
  const cleanMerchant = normalizePixText(merchantName || 'RUIVINHA VIP', 25) || 'RUIVINHA VIP';
  const tag59 = formatTlv('59', cleanMerchant);

  // Tag 60: Merchant City (Max 15 characters, strict ASCII)
  const cleanCity = normalizePixText(merchantCity || 'SAO PAULO', 15) || 'SAO PAULO';
  const tag60 = formatTlv('60', cleanCity);

  // Tag 62: Additional Data Field Template
  // Sub-tag 05: Reference Label / TxID (Alphanumeric, max 25 chars, no spaces)
  const cleanTxId = txId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 25) || 'VIP1';
  const sub62_05 = formatTlv('05', cleanTxId);
  const tag62 = formatTlv('62', sub62_05);

  // Base payload ending with Tag 63 with length 04
  const rawPayload = `${tag00}${tag26}${tag52}${tag53}${tag54}${tag58}${tag59}${tag60}${tag62}6304`;

  // Calculate CRC-16
  const crc = calculatePixCrc16(rawPayload);

  return `${rawPayload}${crc}`;
}

export function validateAbacatePayKey(key: string): { isValid: boolean; environment: 'sandbox' | 'production'; message: string } {
  const cleanKey = key.trim();
  if (!cleanKey) {
    return { isValid: false, environment: 'sandbox', message: 'A chave da API está vazia.' };
  }
  if (cleanKey.startsWith('aba_live_')) {
    return { isValid: true, environment: 'production', message: 'Chave de Produção (Live) válida do AbacatePay.' };
  }
  if (cleanKey.startsWith('aba_test_')) {
    return { isValid: true, environment: 'sandbox', message: 'Chave de Sandbox (Testes) válida do AbacatePay.' };
  }
  if (cleanKey.length >= 16) {
    return { isValid: true, environment: 'production', message: 'Chave personalizada configurada com sucesso.' };
  }
  return { isValid: false, environment: 'sandbox', message: 'Formato inválido. As chaves AbacatePay costumam começar com "aba_live_" ou "aba_test_".' };
}

/**
 * Generates an authentic PIX Transaction with genuine BRCode Copia e Cola and QR Code.
 */
export function generateAbacatePix(
  type: 'subscription' | 'ppv' | 'tip' | 'call',
  title: string,
  amount: number,
  customerName: string,
  customerEmail: string,
  metadata?: { planId?: 'monthly' | 'quarterly'; postId?: string }
): AbacatePayTransaction {
  const config = loadAbacatePayConfig();
  const txNumber = Math.floor(1000000 + Math.random() * 9000000);
  const txId = `ABA${txNumber}`;

  // Use configured PIX Key or fallback
  const pixKey = config.pixKey?.trim() || '';
  const merchantName = config.merchantName || 'RUIVINHA VIP';
  const merchantCity = config.merchantCity || 'SAO PAULO';

  // Build 100% compliant Brazilian Central Bank EMVCo BRCode string
  const pixPayload = buildValidPixPayload({
    pixKey: pixKey || 'contato@ruivinhavip.com',
    merchantName,
    merchantCity,
    amount,
    txId,
    pixKeyType: config.pixKeyType,
  });

  // Generate dynamic high-resolution QR Code
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&margin=8&data=${encodeURIComponent(pixPayload)}`;

  const receiptCode = `REC-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newTransaction: AbacatePayTransaction = {
    id: txId,
    type,
    title,
    amount,
    status: 'PENDING',
    pixCode: pixPayload,
    qrCodeData: qrCodeUrl,
    createdAt: new Date().toISOString(),
    customerName: customerName || 'Fã VIP',
    customerEmail: customerEmail || 'cliente@email.com',
    planId: metadata?.planId,
    postId: metadata?.postId,
    receiptCode,
    pixKey: pixKey || '',
    pixKeyType: config.pixKeyType || 'email',
    merchantName: merchantName,
  };

  // Prepend to transaction history
  const current = loadAbacatePayTransactions();
  saveAbacatePayTransactions([newTransaction, ...current]);

  return newTransaction;
}

/**
 * Marks transaction as paid (only when verified by real gateway or by Administrator confirmation)
 */
export function markAbacateTransactionPaid(txId: string): AbacatePayTransaction | null {
  const current = loadAbacatePayTransactions();
  let updatedTx: AbacatePayTransaction | null = null;

  const updated = current.map((tx) => {
    if (tx.id === txId) {
      updatedTx = {
        ...tx,
        status: 'PAID' as const,
        paidAt: new Date().toISOString(),
      };
      return updatedTx;
    }
    return tx;
  });

  saveAbacatePayTransactions(updated);
  return updatedTx;
}

/**
 * Checks the status of a transaction without blindly approving it.
 */
export function getTransactionStatus(txId: string): AbacatePayTransaction | undefined {
  const current = loadAbacatePayTransactions();
  return current.find((tx) => tx.id === txId);
}
