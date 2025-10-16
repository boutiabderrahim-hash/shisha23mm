
import React, { useState } from 'react';
// Fix: Corrected import path for types.
import { Language } from '../types';
import { formatCurrency } from '../utils/helpers';
import NumpadModal from './NumpadModal';
import { CalculatorIcon } from './icons';

interface OpeningBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (balance: number) => void;
  t: (key: string) => string;
  lang: Language;
}

const OpeningBalanceModal: React.FC<OpeningBalanceModalProps> = ({ isOpen, onClose, onConfirm, t, lang }) => {
  const [balance, setBalance] = useState('');
  const [isNumpadOpen, setNumpadOpen] = useState(false);

  if (!isOpen) return null;

  const handleConfirmClick = () => {
    const balanceValue = parseFloat(balance);
    if (!isNaN(balanceValue) && balanceValue >= 0) {
      onConfirm(balanceValue);
      setBalance('');
    }
  };
  
  const handleNumpadConfirm = (value: number) => {
    setBalance(String(value));
    setNumpadOpen(false);
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col text-gray-800">
          <div className="p-5 border-b">
            <h2 className="text-2xl font-bold text-indigo-700">{t('openNewDay')}</h2>
            <p className="text-gray-600">{t('enterOpeningBalance')}</p>
          </div>

          <div className="p-6 space-y-4">
              <label htmlFor="balance" className="block text-sm font-medium text-gray-700">{t('openingBalance')}</label>
              <button
                  id="balance"
                  type="button"
                  onClick={() => setNumpadOpen(true)}
                  className="w-full text-center border-gray-300 rounded-md p-3 text-2xl font-bold focus:ring-indigo-500 focus:border-indigo-500 hover:bg-gray-50 flex justify-between items-center"
              >
                  <span>{formatCurrency(parseFloat(balance) || 0)}</span>
                  <CalculatorIcon className="w-8 h-8 text-gray-400" />
              </button>
          </div>

          <div className="p-4 border-t mt-auto grid grid-cols-2 gap-3 bg-gray-50">
            <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition duration-300">
                  {t('cancel')}
            </button>
            <button onClick={handleConfirmClick} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
                  {t('confirm')}
            </button>
          </div>
        </div>
      </div>
      <NumpadModal
        isOpen={isNumpadOpen}
        onClose={() => setNumpadOpen(false)}
        onConfirm={handleNumpadConfirm}
        initialValue={parseFloat(balance) || 0}
        title={t('openingBalance')}
        t={t}
        allowDecimal={true}
      />
    </>
  );
};

export default OpeningBalanceModal;