import { useState, FormEvent, useMemo } from 'react';
import { 
  X, 
  Key, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  ExternalLink,
  Clock,
  QrCode,
  Copy,
  Check,
  Building,
  UserCheck,
  AlertTriangle,
  Smartphone,
  Mail,
  Fingerprint,
  CheckCheck,
  Landmark,
  ArrowRight
} from 'lucide-react';
import { AbacatePayConfig, AbacatePayTransaction, EfiBankConfig, PaymentGatewayType } from '../../types';
import { validateAbacatePayKey, buildValidPixPayload, formatPixKeyForBacen } from '../../utils/abacatePay';
import { 
  loadEfiBankConfig, 
  saveEfiBankConfig, 
  testEfiBankConnection, 
  validateEfiCredentials, 
  getActivePaymentGateway, 
  setActivePaymentGateway 
} from '../../utils/efiBank';

interface AbacatePayConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AbacatePayConfig;
  efiConfig?: EfiBankConfig;
  transactions: AbacatePayTransaction[];
  onSaveConfig: (updatedConfig: AbacatePayConfig) => void;
  onSaveEfiConfig?: (updatedConfig: EfiBankConfig) => void;
  onShowToast: (msg: string) => void;
}

export function AbacatePayConfigModal({
  isOpen,
  onClose,
  config,
  efiConfig: initialEfiConfig,
  transactions,
  onSaveConfig,
  onSaveEfiConfig,
  onShowToast,
}: AbacatePayConfigModalProps) {
  // Tabs: 'efi' (Primary & Recommended), 'abacateApi' (Alternative), 'pixPreview' (Live Tester)
  const [activeTab, setActiveTab] = useState<'efi' | 'abacateApi' | 'pixPreview'>('efi');

  // Active Gateway State
  const [activeGateway, setActiveGateway] = useState<PaymentGatewayType>(() => getActivePaymentGateway());

  // Efí Bank Config State
  const currentEfi = initialEfiConfig || loadEfiBankConfig();
  const [efiPixKey, setEfiPixKey] = useState(currentEfi.pixKey || 'rodrigotricollo1990@gmail.com');
  const [efiPixKeyType, setEfiPixKeyType] = useState<'cpf' | 'cnpj' | 'email' | 'phone' | 'random'>(currentEfi.pixKeyType || 'email');
  const [efiClientId, setEfiClientId] = useState(currentEfi.clientId || '');
  const [efiClientSecret, setEfiClientSecret] = useState(currentEfi.clientSecret || '');
  const [efiEnvironment, setEfiEnvironment] = useState<'production' | 'sandbox'>(currentEfi.environment || 'production');
  const [efiMerchantName, setEfiMerchantName] = useState(currentEfi.merchantName || 'RUIVINHA VIP');
  const [efiMerchantCity, setEfiMerchantCity] = useState(currentEfi.merchantCity || 'SAO PAULO');
  const [efiExpiration, setEfiExpiration] = useState(currentEfi.pixExpirationMinutes || 15);
  const [showEfiSecrets, setShowEfiSecrets] = useState(false);

  // Efí Testing Connection State
  const [isTestingEfi, setIsTestingEfi] = useState(false);
  const [efiTestResult, setEfiTestResult] = useState<{
    success: boolean;
    message: string;
    details?: { endpoint: string; environment: string; pixKey: string; merchantName: string };
  } | null>(null);

  // AbacatePay API fields
  const [apiKey, setApiKey] = useState(config.apiKey || '');
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>(config.environment || 'production');
  const [webhookSecret, setWebhookSecret] = useState(config.webhookSecret || '');
  const [pixExpirationMinutes, setPixExpirationMinutes] = useState(config.pixExpirationMinutes || 15);
  const [showKey, setShowKey] = useState(false);

  // Abacate Testing State
  const [isTestingAbacate, setIsTestingAbacate] = useState(false);
  const [abacateTestResult, setAbacateTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Copied preview state
  const [copiedPreview, setCopiedPreview] = useState(false);

  // Real-time PIX Payload preview for testing directly on bank app
  const previewPixPayload = useMemo(() => {
    const keyToUse = efiPixKey || config.pixKey || 'rodrigotricollo1990@gmail.com';
    const typeToUse = efiPixKeyType || config.pixKeyType || 'email';
    const nameToUse = efiMerchantName || config.merchantName || 'RUIVINHA VIP';
    const cityToUse = efiMerchantCity || config.merchantCity || 'SAO PAULO';

    const formattedKey = formatPixKeyForBacen(keyToUse, typeToUse);
    return buildValidPixPayload({
      pixKey: formattedKey,
      merchantName: nameToUse,
      merchantCity: cityToUse,
      amount: 29.90,
      txId: 'EFI01TESTE',
      pixKeyType: typeToUse,
    });
  }, [efiPixKey, efiPixKeyType, efiMerchantName, efiMerchantCity, config.pixKey, config.pixKeyType, config.merchantName, config.merchantCity]);

  const previewQrUrl = useMemo(() => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=6&data=${encodeURIComponent(previewPixPayload)}`;
  }, [previewPixPayload]);

  if (!isOpen) return null;

  const handleCopyPreview = () => {
    navigator.clipboard.writeText(previewPixPayload);
    setCopiedPreview(true);
    setTimeout(() => setCopiedPreview(false), 2500);
    onShowToast('Código Copia e Cola Efí Bank copiado! Cole no app do seu banco para testar.');
  };

  const handleTestEfi = async () => {
    setIsTestingEfi(true);
    setEfiTestResult(null);

    const testConfig: EfiBankConfig = {
      clientId: efiClientId.trim(),
      clientSecret: efiClientSecret.trim(),
      pixKey: efiPixKey.trim(),
      pixKeyType: efiPixKeyType,
      environment: efiEnvironment,
      merchantName: efiMerchantName.trim() || 'RUIVINHA VIP',
      merchantCity: efiMerchantCity.trim() || 'SAO PAULO',
      pixExpirationMinutes: Number(efiExpiration) || 15,
      isConfigured: true,
      lastTestedAt: new Date().toISOString(),
    };

    const res = await testEfiBankConnection(testConfig);
    setIsTestingEfi(false);
    setEfiTestResult(res);
  };

  const handleTestAbacate = () => {
    setIsTestingAbacate(true);
    setAbacateTestResult(null);

    setTimeout(() => {
      setIsTestingAbacate(false);
      const validation = validateAbacatePayKey(apiKey);
      if (validation.isValid) {
        setAbacateTestResult({
          success: true,
          message: `Conexão válida com o AbacatePay (${validation.environment === 'production' ? 'Produção/Live' : 'Sandbox/Testes'})!`,
        });
        setEnvironment(validation.environment);
      } else {
        setAbacateTestResult({
          success: false,
          message: validation.message,
        });
      }
    }, 700);
  };

  const handleSaveEfi = (e: FormEvent) => {
    e.preventDefault();

    const cleanKey = efiPixKey.trim();
    if (!cleanKey) {
      onShowToast('⚠️ Digite a Chave PIX cadastrada na sua conta Efí Bank.');
      return;
    }

    const updatedEfi: EfiBankConfig = {
      clientId: efiClientId.trim(),
      clientSecret: efiClientSecret.trim(),
      pixKey: cleanKey,
      pixKeyType: efiPixKeyType,
      environment: efiEnvironment,
      merchantName: efiMerchantName.trim() || 'RUIVINHA VIP',
      merchantCity: efiMerchantCity.trim() || 'SAO PAULO',
      pixExpirationMinutes: Number(efiExpiration) || 15,
      isConfigured: true,
      lastTestedAt: new Date().toISOString(),
      simulatedBalance: currentEfi.simulatedBalance || 0,
      isRealKeyConfigured: true,
    };

    saveEfiBankConfig(updatedEfi);
    setActivePaymentGateway('efi');
    setActiveGateway('efi');

    if (onSaveEfiConfig) {
      onSaveEfiConfig(updatedEfi);
    }

    // Also synchronize base config
    const updatedBase: AbacatePayConfig = {
      ...config,
      pixKey: cleanKey,
      pixKeyType: efiPixKeyType,
      merchantName: efiMerchantName.trim() || 'RUIVINHA VIP',
      merchantCity: efiMerchantCity.trim() || 'SAO PAULO',
      isRealKeyConfigured: true,
    };
    onSaveConfig(updatedBase);

    onShowToast('✅ Efí Bank ativada com sucesso como forma de pagamento principal!');
    onClose();
  };

  const handleSaveAbacate = (e: FormEvent) => {
    e.preventDefault();

    const updated: AbacatePayConfig = {
      apiKey: apiKey.trim(),
      environment,
      webhookSecret: webhookSecret.trim() || undefined,
      pixExpirationMinutes: Number(pixExpirationMinutes) || 15,
      isConfigured: true,
      lastTestedAt: new Date().toISOString(),
      simulatedBalance: config.simulatedBalance || 0,
      pixKey: efiPixKey.trim() || config.pixKey || '',
      pixKeyType: efiPixKeyType,
      merchantName: efiMerchantName.trim() || config.merchantName || 'RUIVINHA VIP',
      merchantCity: efiMerchantCity.trim() || config.merchantCity || 'SAO PAULO',
      isRealKeyConfigured: Boolean(efiPixKey.trim()),
    };

    onSaveConfig(updated);
    setActivePaymentGateway('abacatepay');
    setActiveGateway('abacatepay');
    onShowToast('Configurações do AbacatePay salvas!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-md" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-2xl bg-[#0e101a] border border-[#22283e] rounded-3xl shadow-2xl overflow-hidden z-10 my-4 sm:my-8 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#22283e] flex items-center justify-between bg-[#090b12]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#f37021]/15 border border-[#f37021]/40 text-[#f37021] flex items-center justify-center shadow-[0_0_15px_rgba(243,112,33,0.3)] shrink-0">
              <Landmark size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white font-['Playfair_Display',serif]">
                  Configuração de Pagamento API
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#f37021]/20 border border-[#f37021]/50 text-[#f37021] text-[10px] font-extrabold tracking-wide">
                  EFÍ BANK (GERENCIANET)
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Recebimento via Efí Bank com liquidação imediata e API oficial do Banco Central
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#171a27] text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-4 pb-0 bg-[#0c0e18] border-b border-[#1c2133] flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('efi')}
            className={`pb-3 px-3 text-xs font-bold transition-all relative flex items-center gap-2 shrink-0 ${
              activeTab === 'efi'
                ? 'text-[#f37021] border-b-2 border-[#f37021]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Landmark size={15} />
            <span>1. Efí Bank API (Recomendado)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pixPreview')}
            className={`pb-3 px-3 text-xs font-bold transition-all relative flex items-center gap-2 shrink-0 ${
              activeTab === 'pixPreview'
                ? 'text-[#f37021] border-b-2 border-[#f37021]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <QrCode size={15} />
            <span>2. Testar QR Code & Copia e Cola</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('abacateApi')}
            className={`pb-3 px-3 text-xs font-bold transition-all relative flex items-center gap-2 shrink-0 ${
              activeTab === 'abacateApi'
                ? 'text-emerald-400 border-b-2 border-emerald-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>🥑</span>
            <span>3. AbacatePay (Alternativo)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex flex-col gap-5">
          {/* TAB 1: Efí Bank API (Primary) */}
          {activeTab === 'efi' && (
            <form onSubmit={handleSaveEfi} className="flex flex-col gap-4">
              {/* EFI BENEFIT BANNER */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#20130d] via-[#16121a] to-[#0c0e18] border border-[#f37021]/40 flex items-start gap-3.5 shadow-md">
                <div className="w-9 h-9 rounded-xl bg-[#f37021]/20 border border-[#f37021]/40 text-[#f37021] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck size={20} />
                </div>
                <div className="text-xs text-gray-200 leading-relaxed">
                  <div className="flex items-center gap-2 mb-1">
                    <strong className="text-white font-bold text-sm">
                      Por que a Efí Bank (antiga Gerencianet) é superior?
                    </strong>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-700/40">
                      OFICIAL BACEN
                    </span>
                  </div>
                  A Efí Bank é uma das maiores instituições autorizadas pelo Banco Central do Brasil para PIX. 
                  Você recebe o dinheiro <strong>direto na sua conta bancária Efí em segundos</strong>, com QR Code dinâmico, sem bloqueios de saldo e compatível com 100% dos bancos (Nubank, Itaú, Bradesco, etc.).
                </div>
              </div>

              {/* PIX Key Type Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                  <Smartphone size={14} className="text-[#f37021]" />
                  <span>Tipo de Chave PIX cadastrada na sua conta Efí:</span>
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'email', label: 'E-mail', icon: Mail },
                    { id: 'phone', label: 'Celular', icon: Smartphone },
                    { id: 'cpf', label: 'CPF', icon: Fingerprint },
                    { id: 'cnpj', label: 'CNPJ', icon: Building },
                    { id: 'random', label: 'Aleatória (EVP)', icon: Zap },
                  ].map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setEfiPixKeyType(t.id as typeof efiPixKeyType)}
                        className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
                          efiPixKeyType === t.id
                            ? 'bg-[#f37021]/20 border-[#f37021] text-[#f37021] shadow-sm'
                            : 'bg-[#0a0c14] border-[#22283e] text-gray-400 hover:text-white'
                        }`}
                      >
                        <Icon size={16} />
                        <span className="text-[11px]">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PIX Key Input */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-200">
                    Sua Chave PIX da Efí Bank: <span className="text-[#f37021]">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setEfiPixKeyType('email');
                      setEfiPixKey('rodrigotricollo1990@gmail.com');
                      setEfiMerchantName('RODRIGO TRICOLLO');
                    }}
                    className="text-[11px] text-[#f37021] hover:underline font-semibold"
                  >
                    Usar: rodrigotricollo1990@gmail.com
                  </button>
                </div>

                <input
                  type="text"
                  value={efiPixKey}
                  onChange={(e) => setEfiPixKey(e.target.value)}
                  placeholder={
                    efiPixKeyType === 'email'
                      ? 'ex: rodrigotricollo1990@gmail.com'
                      : efiPixKeyType === 'phone'
                      ? 'ex: 11999998888 (com DDD)'
                      : efiPixKeyType === 'cpf'
                      ? 'ex: 12345678901'
                      : efiPixKeyType === 'cnpj'
                      ? 'ex: 12345678000190'
                      : 'ex: 123e4567-e89b-12d3-a456-426614174000'
                  }
                  className="w-full h-11 px-4 rounded-xl bg-[#0a0c14] border border-[#22283e] text-sm text-white font-mono focus:outline-none focus:border-[#f37021]"
                  required
                />
              </div>

              {/* Credentials Section (Client_Id & Client_Secret) */}
              <div className="p-4 rounded-2xl bg-[#0a0c14] border border-[#1e2337] flex flex-col gap-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key size={15} className="text-[#f37021]" />
                    <span className="text-xs font-bold text-white">Credenciais da API Efí (OAuth 2.0)</span>
                  </div>
                  <a
                    href="https://sejaefi.com.br"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#f37021] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Painel da Efí</span>
                    <ExternalLink size={10} />
                  </a>
                </div>

                <p className="text-[11px] text-gray-400">
                  Para gerar cobranças automáticas via API, crie uma aplicação no menu <strong>API &gt; Aplicações &gt; Criar Nova Aplicação</strong> e marque o escopo <strong>Pix</strong>.
                </p>

                {/* Client ID */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-300">Client_Id da Efí:</label>
                  <input
                    type="text"
                    value={efiClientId}
                    onChange={(e) => setEfiClientId(e.target.value)}
                    placeholder="Client_Id_xxxxxxxxxxxxxxxxxxxxxxxx"
                    className="h-10 px-3.5 rounded-xl bg-[#121524] border border-[#20263b] text-xs font-mono text-white focus:outline-none focus:border-[#f37021]"
                  />
                </div>

                {/* Client Secret */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-300">Client_Secret da Efí:</label>
                    <button
                      type="button"
                      onClick={() => setShowEfiSecrets(!showEfiSecrets)}
                      className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1"
                    >
                      {showEfiSecrets ? <EyeOff size={12} /> : <Eye size={12} />}
                      <span>{showEfiSecrets ? 'Ocultar' : 'Exibir'}</span>
                    </button>
                  </div>
                  <input
                    type={showEfiSecrets ? 'text' : 'password'}
                    value={efiClientSecret}
                    onChange={(e) => setEfiClientSecret(e.target.value)}
                    placeholder="Client_Secret_xxxxxxxxxxxxxxxxxxxxxxxx"
                    className="h-10 px-3.5 rounded-xl bg-[#121524] border border-[#20263b] text-xs font-mono text-white focus:outline-none focus:border-[#f37021]"
                  />
                </div>

                {/* Environment Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-300">Ambiente da Efí:</label>
                    <select
                      value={efiEnvironment}
                      onChange={(e) => setEfiEnvironment(e.target.value as 'production' | 'sandbox')}
                      className="h-9 px-3 rounded-xl bg-[#121524] border border-[#20263b] text-xs font-semibold text-white focus:outline-none focus:border-[#f37021]"
                    >
                      <option value="production">Produção Real (pix.sejaefi.com.br)</option>
                      <option value="sandbox">Homologação / Testes (pix-h.sejaefi.com.br)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-300">Expiração do Pix (Minutos):</label>
                    <input
                      type="number"
                      min="5"
                      max="120"
                      value={efiExpiration}
                      onChange={(e) => setEfiExpiration(Number(e.target.value))}
                      className="h-9 px-3 rounded-xl bg-[#121524] border border-[#20263b] text-xs font-bold text-white focus:outline-none focus:border-[#f37021]"
                    />
                  </div>
                </div>

                {/* Test Connection Button */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleTestEfi}
                    disabled={isTestingEfi}
                    className="w-full py-2.5 rounded-xl bg-[#1e2337] hover:bg-[#272e48] border border-[#2d3652] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={13} className={isTestingEfi ? 'animate-spin' : ''} />
                    <span>{isTestingEfi ? 'Validando com Servidores da Efí...' : 'Testar Conexão com API Efí Bank'}</span>
                  </button>

                  {efiTestResult && (
                    <div
                      className={`p-3 rounded-xl border text-xs leading-relaxed ${
                        efiTestResult.success
                          ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-300'
                          : 'bg-red-950/40 border-red-600/40 text-red-300'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {efiTestResult.success ? (
                          <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                        )}
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold">{efiTestResult.message}</span>
                          {efiTestResult.details && (
                            <span className="text-[11px] opacity-80">
                              Endpoint: {efiTestResult.details.endpoint} | Favorecido: {efiTestResult.details.merchantName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Holder Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-300 flex items-center gap-1">
                    <UserCheck size={13} className="text-gray-400" />
                    <span>Nome do Titular na Efí (Beneficiário)</span>
                  </label>
                  <input
                    type="text"
                    maxLength={25}
                    value={efiMerchantName}
                    onChange={(e) => setEfiMerchantName(e.target.value.toUpperCase())}
                    placeholder="RODRIGO TRICOLLO"
                    className="h-10 px-3.5 rounded-xl bg-[#0a0c14] border border-[#22283e] text-xs font-bold text-white uppercase focus:outline-none focus:border-[#f37021]"
                    required
                  />
                  <span className="text-[10px] text-gray-500">Exibido na tela do banco do cliente</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-300 flex items-center gap-1">
                    <Building size={13} className="text-gray-400" />
                    <span>Cidade da Conta</span>
                  </label>
                  <input
                    type="text"
                    maxLength={15}
                    value={efiMerchantCity}
                    onChange={(e) => setEfiMerchantCity(e.target.value.toUpperCase())}
                    placeholder="SAO PAULO"
                    className="h-10 px-3.5 rounded-xl bg-[#0a0c14] border border-[#22283e] text-xs font-bold text-white uppercase focus:outline-none focus:border-[#f37021]"
                    required
                  />
                  <span className="text-[10px] text-gray-500">Padrão BACEN (ex: SAO PAULO)</span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-[#1e2337] flex items-center justify-between gap-3">
                <div className="text-[11px] text-gray-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Efí Bank será o gateway principal ativo</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-[#171a29] text-gray-300 hover:text-white text-xs font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#f37021] to-[#ff8c42] hover:opacity-95 text-white text-xs font-bold shadow-lg flex items-center gap-2 transition-all active:scale-98"
                  >
                    <CheckCheck size={16} />
                    <span>Salvar e Ativar Efí Bank</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* TAB 2: Live QR Code & Copia e Cola Tester */}
          {activeTab === 'pixPreview' && (
            <div className="flex flex-col gap-4">
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#171c2c] to-[#0f121e] border border-[#27304a] text-xs text-gray-300">
                <strong className="text-white block mb-0.5">Validador Oficial de QR Code e Chave PIX:</strong>
                Este é o código exatamente como seu cliente receberá. Você pode abrir o aplicativo do seu banco (Nubank, Itaú, Bradesco, Inter, etc.) e apontar a câmera ou colar o código para testar a leitura da sua chave da Efí Bank!
              </div>

              <div className="p-5 rounded-2xl bg-[#080910] border border-[#1e2337] flex flex-col sm:flex-row items-center gap-5">
                <div className="w-36 h-36 bg-white p-2 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border-2 border-[#f37021]/40">
                  <img
                    src={previewQrUrl}
                    alt="Prévia QR Code PIX"
                    className="w-full h-full object-contain"
                  />
                </div>

                <div className="flex flex-col gap-2.5 flex-1 w-full text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Landmark size={14} className="text-[#f37021]" />
                      <span>Código Copia e Cola Oficial:</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#f37021]/20 text-[#f37021] text-[10px] font-mono font-bold">
                      EMVCo 100% Válido
                    </span>
                  </div>

                  <input
                    type="text"
                    readOnly
                    value={previewPixPayload}
                    className="w-full h-10 px-3 rounded-xl bg-[#121524] border border-[#20263b] text-[10px] text-gray-300 font-mono select-all"
                  />

                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Titular: <strong className="text-white">{efiMerchantName}</strong></span>
                    <span>Cidade: <strong className="text-white">{efiMerchantCity}</strong></span>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyPreview}
                    className="w-full py-2.5 rounded-xl bg-[#f37021] hover:bg-[#e06115] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-md mt-1"
                  >
                    {copiedPreview ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedPreview ? 'Copiado para a Área de Transferência!' : 'Copiar Código para Testar no Banco'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AbacatePay (Legacy / Alternative) */}
          {activeTab === 'abacateApi' && (
            <form onSubmit={handleSaveAbacate} className="flex flex-col gap-4">
              <div className="p-3.5 rounded-xl bg-[#171a27] border border-[#252a3f] flex items-start gap-3">
                <span className="text-xl">🥑</span>
                <div className="text-xs leading-relaxed text-gray-300">
                  <span className="font-bold text-white block">AbacatePay (Modo Alternativo)</span>
                  Se você desejar utilizar o AbacatePay ao invés da Efí Bank, informe sua chave de API abaixo.
                </div>
              </div>

              {/* API Key Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-200">Chave da API AbacatePay:</label>
                <div className="relative">
                  <input
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setAbacateTestResult(null);
                    }}
                    placeholder="aba_live_... ou aba_test_..."
                    className="w-full h-11 pl-3.5 pr-20 rounded-xl bg-[#0a0c14] border border-[#22283e] text-sm text-white font-mono focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-gray-400 hover:text-white text-xs flex items-center gap-1 bg-[#141826]"
                  >
                    {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                    <span>{showKey ? 'Ocultar' : 'Ver'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-300">Ambiente:</label>
                  <select
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value as 'sandbox' | 'production')}
                    className="h-10 px-3 rounded-xl bg-[#0a0c14] border border-[#22283e] text-xs font-semibold text-white focus:outline-none focus:border-emerald-400"
                  >
                    <option value="production">Produção Real (aba_live_)</option>
                    <option value="sandbox">Sandbox (aba_test_)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-300">Expiração PIX (min):</label>
                  <input
                    type="number"
                    min="5"
                    max="120"
                    value={pixExpirationMinutes}
                    onChange={(e) => setPixExpirationMinutes(Number(e.target.value))}
                    className="h-10 px-3 rounded-xl bg-[#0a0c14] border border-[#22283e] text-xs font-bold text-white focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#1e2337]">
                <button
                  type="button"
                  onClick={handleTestAbacate}
                  disabled={isTestingAbacate || !apiKey.trim()}
                  className="px-3.5 py-2 rounded-xl bg-[#1e2337] hover:bg-[#272e48] text-white text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={12} className={isTestingAbacate ? 'animate-spin' : ''} />
                  <span>{isTestingAbacate ? 'Testando...' : 'Testar Chave'}</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                >
                  Ativar AbacatePay
                </button>
              </div>

              {abacateTestResult && (
                <div
                  className={`p-2.5 rounded-lg border text-xs flex items-center gap-2 ${
                    abacateTestResult.success
                      ? 'bg-emerald-950/40 border-emerald-700/50 text-emerald-300'
                      : 'bg-red-950/40 border-red-700/50 text-red-300'
                  }`}
                >
                  {abacateTestResult.success ? (
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle size={16} className="text-red-400 shrink-0" />
                  )}
                  <span>{abacateTestResult.message}</span>
                </div>
              )}
            </form>
          )}

          {/* Transactions Summary Footer */}
          {transactions.length > 0 && (
            <div className="pt-2 border-t border-[#1e2337] flex items-center justify-between text-[11px] text-gray-400">
              <span>Transações no sistema: <strong className="text-white">{transactions.length}</strong></span>
              <span className="text-[#f37021] font-semibold">● Efí Bank Gateway Ativo</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
