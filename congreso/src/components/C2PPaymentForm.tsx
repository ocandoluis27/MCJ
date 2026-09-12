'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, AlertCircle, CreditCard, KeyRound } from 'lucide-react';
import { cn } from '@/lib/utils';

interface C2PPaymentFormProps {
  amountBs: number;
  onSuccess: (reference: string) => void;
  onError: (msg: string) => void;
}

const BANKS = [
  { code: '0102', name: 'Banco de Venezuela' },
  { code: '0104', name: 'Venezolano de Crédito' },
  { code: '0105', name: 'Mercantil' },
  { code: '0108', name: 'BBVA Provincial' },
  { code: '0114', name: 'Bancaribe' },
  { code: '0115', name: 'Exterior' },
  { code: '0128', name: 'Banesco' },
  { code: '0134', name: 'Banplus' },
  { code: '0137', name: 'Sofitasa' },
  { code: '0138', name: 'Banco Plaza' },
  { code: '0151', name: 'Fondo Común (BFC)' },
  { code: '0156', name: '100% Banco' },
  { code: '0157', name: 'Del Sur' },
  { code: '0163', name: 'Banco del Tesoro' },
  { code: '0166', name: 'Agrícola de Venezuela' },
  { code: '0168', name: 'Bancrecer' },
  { code: '0169', name: 'Mi Banco' },
  { code: '0171', name: 'Banco Activo' },
  { code: '0172', name: 'Bancamiga' },
  { code: '0175', name: 'Bicentenario' },
  { code: '0177', name: 'BANFANB' },
  { code: '0191', name: 'BNC' }
];

type Status = 'idle' | 'requesting_otp' | 'otp_sent' | 'verifying' | 'success' | 'error';

export function C2PPaymentForm({ amountBs, onSuccess, onError }: C2PPaymentFormProps) {
  const [status, setStatus] = useState<Status>('idle');
  const [bank, setBank] = useState('');
  const [phone, setPhone] = useState('');
  const [docType, setDocType] = useState('V');
  const [docId, setDocId] = useState('');
  const [otp, setOtp] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const formatAmount = (amt: number) => {
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(amt);
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bank || !phone || !docId) {
      setErrorMsg('Por favor complete todos los campos');
      return;
    }

    setStatus('requesting_otp');
    setErrorMsg('');

    try {
      // Simulate API call to POST /api/c2p
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus('otp_sent');
    } catch (err) {
      setStatus('idle');
      setErrorMsg('Error al solicitar clave dinámica. Intente de nuevo.');
      onError('Error al solicitar clave dinámica');
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setErrorMsg('Debe ingresar la clave dinámica');
      return;
    }

    setStatus('verifying');
    setErrorMsg('');

    try {
      // Simulate API call to PUT /api/c2p
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatus('success');
      
      // Simulate generating a reference
      const reference = Math.floor(10000000 + Math.random() * 90000000).toString();
      setTimeout(() => onSuccess(reference), 1000);
    } catch (err) {
      setStatus('otp_sent');
      setErrorMsg('Clave inválida o error en el pago.');
      onError('Error al procesar el pago');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center animate-fade-in">
        <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 size={32} />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Pago Exitoso</h3>
        <p className="text-white/60">Su pago ha sido procesado correctamente.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 relative overflow-hidden">
      {/* Absolute overlay for loading states */}
      {(status === 'requesting_otp' || status === 'verifying') && (
        <div className="absolute inset-0 z-10 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white">
          <Loader2 size={40} className="animate-spin text-gold mb-4" />
          <p className="font-medium">
            {status === 'requesting_otp' ? 'Conectando con el banco...' : 'Procesando pago...'}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-deep/20 text-blue-deep rounded-xl flex items-center justify-center shrink-0">
          <CreditCard size={20} className="text-sky-blue" />
        </div>
        <div>
          <h3 className="font-semibold text-white">Cobro C2P</h3>
          <p className="text-sm text-white/50">Débito inmediato a su cuenta</p>
        </div>
        <div className="ml-auto text-right">
          <span className="block text-xl font-bold text-gold">{formatAmount(amountBs)}</span>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-400 text-sm">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <p>{errorMsg}</p>
        </div>
      )}

      {status === 'idle' || status === 'error' ? (
        <form onSubmit={handleRequestOTP} className="space-y-4 animate-fade-in">
          <div>
            <label htmlFor="bank" className="block text-sm font-medium text-white/80 mb-1.5">
              Banco Emisor
            </label>
            <select
              id="bank"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gold/50 appearance-none"
            >
              <option value="">Seleccione su banco</option>
              {BANKS.map(b => (
                <option key={b.code} value={b.code}>{b.code} - {b.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-white/80 mb-1.5">
                Teléfono Afiliado
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-white/10 bg-slate-800 text-white/60 text-sm">
                  04
                </span>
                <input
                  type="text"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
                  className="w-full bg-slate-950 border border-white/10 rounded-r-xl px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gold/50"
                  placeholder="1234567"
                />
              </div>
            </div>

            <div>
              <label htmlFor="docId" className="block text-sm font-medium text-white/80 mb-1.5">
                Cédula de Identidad
              </label>
              <div className="flex">
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="bg-slate-800 border border-r-0 border-white/10 rounded-l-xl px-2 py-3 text-white/80 focus:outline-none focus:ring-2 focus:ring-gold/50 appearance-none"
                >
                  <option value="V">V</option>
                  <option value="E">E</option>
                  <option value="J">J</option>
                </select>
                <input
                  type="text"
                  id="docId"
                  value={docId}
                  onChange={(e) => setDocId(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full bg-slate-950 border border-white/10 rounded-r-xl px-3 py-3 text-white focus:outline-none focus:ring-2 focus:ring-gold/50"
                  placeholder="12345678"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gold hover:bg-gold/90 text-slate-950 font-bold py-3.5 rounded-xl transition-transform active:scale-[0.98] mt-2 flex justify-center items-center gap-2"
          >
            <KeyRound size={18} />
            Solicitar Clave Dinámica
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOTP} className="space-y-4 animate-fade-in">
          <div className="bg-slate-800/50 rounded-xl p-4 mb-4 text-center">
            <p className="text-white/80 text-sm mb-1">Se ha solicitado el cobro a:</p>
            <p className="font-mono text-white text-lg">{docType}-{docId}</p>
            <p className="text-white/50 text-xs mt-2">Revise sus SMS o aplicación bancaria para la clave dinámica</p>
          </div>

          <div>
            <label htmlFor="otp" className="block text-sm font-medium text-white/80 mb-1.5 text-center">
              Ingrese la Clave Dinámica (OTP)
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
              className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-4 text-white text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-gold/50"
              placeholder="000000"
              autoComplete="one-time-code"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="w-1/3 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3.5 rounded-xl transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-2/3 bg-gold hover:bg-gold/90 text-slate-950 font-bold py-3.5 rounded-xl transition-transform active:scale-[0.98]"
            >
              Confirmar Pago
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
