import React, { useState } from 'react';
import { X, CreditCard, Lock, CheckCircle, Loader2, ShieldCheck } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
  amount: number;
  title: string;
  description: string;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onPaymentSuccess, amount, title, description }) => {
  const [step, setStep] = useState(1); // 1: Input, 2: Processing, 3: Success
  
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
    
    // Simulate API delay
    setTimeout(() => {
      onPaymentSuccess();
      setStep(3);
    }, 2000);
  };

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Secure Payment
          </h3>
          <button onClick={handleClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800 text-center">
                  <p className="text-sm text-indigo-800 dark:text-indigo-300 font-medium mb-1">{title}</p>
                  <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">₹{amount.toFixed(2)}</p>
                  <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 mt-1">{description}</p>
               </div>

               <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Card Details</label>
                  <div className="space-y-3">
                     <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                           type="text" 
                           placeholder="0000 0000 0000 0000" 
                           className="w-full pl-10 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                           defaultValue="4242 4242 4242 4242"
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <input 
                           type="text" 
                           placeholder="MM/YY" 
                           className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                           defaultValue="12/25"
                        />
                        <input 
                           type="text" 
                           placeholder="CVC" 
                           className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                           defaultValue="123"
                        />
                     </div>
                  </div>
               </div>
               
               <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all mt-2 flex items-center justify-center gap-2">
                 <Lock className="w-4 h-4" /> Pay ₹{amount}
               </button>
               <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                 <Lock className="w-3 h-3" /> Payments are secure and encrypted
               </p>
            </form>
          )}

          {step === 2 && (
            <div className="py-12 flex flex-col items-center justify-center text-center">
               <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
               <h4 className="text-lg font-bold text-slate-900 dark:text-white">Processing Payment...</h4>
               <p className="text-slate-500 dark:text-slate-400">Please do not close this window.</p>
            </div>
          )}

          {step === 3 && (
            <div className="py-8 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
               <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-4">
                 <CheckCircle className="w-10 h-10" />
               </div>
               <h4 className="text-xl font-bold text-slate-900 dark:text-white">Payment Successful!</h4>
               <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6">
                 Your application fee has been processed.
               </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;