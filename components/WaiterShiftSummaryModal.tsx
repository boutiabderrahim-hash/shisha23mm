
import React from 'react';
// Fix: Corrected import path for types.
import { ShiftReport, Language } from '../types';
import { formatCurrency } from '../utils/helpers';
import { CheckCircleIcon, XMarkIcon } from './icons';

interface WaiterShiftSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftReport: ShiftReport | null;
  t: (key: string) => string;
  lang: Language;
}

const WaiterShiftSummaryModal: React.FC<WaiterShiftSummaryModalProps> = ({ isOpen, onClose, shiftReport, t, lang }) => {
  if (!isOpen || !shiftReport) return null;

  const openingBalance = shiftReport.openingBalance;
  const cashSales = shiftReport.finalCashSales || 0;
  const manualCashIncome = shiftReport.finalManualIncomeCash || 0;
  const expectedCashInDrawer = openingBalance + cashSales + manualCashIncome;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] flex flex-col text-gray-800">
        <div className="p-5 border-b flex justify-between items-center">
            <div className="flex items-center gap-3">
                <CheckCircleIcon className="w-8 h-8 text-green-500" />
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">{t('shiftSummary')}</h2>
                    <p className="text-sm text-gray-500">{t('dayClosedSuccessfully')}</p>
                </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><XMarkIcon className="w-6 h-6"/></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
            <div className="space-y-2 text-md">
                <div className="flex justify-between items-center text-gray-600">
                    <span>{t('openingBalanceLabel')}:</span>
                    <span className="font-medium">{formatCurrency(openingBalance)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                    <span>{t('cashSales')}:</span>
                    <span className="font-medium">{formatCurrency(cashSales)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                    <span>{t('manualCashIncome')}:</span>
                    <span className="font-medium">{formatCurrency(manualCashIncome)}</span>
                </div>
            </div>
            <div className="border-t pt-4">
                <div className="flex justify-between items-center text-gray-800 text-xl">
                    <span className="font-bold">{t('expectedCashInDrawer')}:</span>
                    <span className="font-bold">{formatCurrency(expectedCashInDrawer)}</span>
                </div>
            </div>
        </div>

        <div className="p-4 border-t mt-auto bg-gray-50">
           <button onClick={onClose} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
                {t('close')}
           </button>
        </div>
      </div>
    </div>
  );
};

export default WaiterShiftSummaryModal;