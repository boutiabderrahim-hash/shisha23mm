
import React, { useEffect } from 'react';
// Fix: Import Language type to use in component props and correct path.
import { Order, Waiter, RestaurantSettings, Language } from '../types';
import Receipt from './Receipt';
import { XMarkIcon, PrinterIcon } from './icons';

interface ReceiptPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  waiters: Waiter[];
  restaurantSettings: RestaurantSettings;
  t: (key: string) => string;
  // Fix: Add lang prop to pass to the Receipt component.
  lang: Language;
}

const ReceiptPreviewModal: React.FC<ReceiptPreviewModalProps> = ({ isOpen, onClose, order, waiters, restaurantSettings, t, lang }) => {
  // This effect handles closing the modal after the print dialog is dismissed.
  useEffect(() => {
    if (isOpen) {
      const handleAfterPrint = () => {
        // onClose(); // This can sometimes close the modal too early. Let user close manually.
      };
      window.addEventListener('afterprint', handleAfterPrint);
      return () => {
        window.removeEventListener('afterprint', handleAfterPrint);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const handlePrintClick = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm max-h-[90vh] flex flex-col text-gray-800 print:shadow-none print:rounded-none print:max-w-full print:max-h-full">
        <div className="p-4 border-b flex justify-between items-center print:hidden">
          <h2 className="text-xl font-bold">{t('printReceipt')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XMarkIcon className="w-6 h-6"/></button>
        </div>

        <div className="p-4 overflow-y-auto bg-gray-100 flex-grow flex justify-center print:bg-white print:p-0">
            {/* The Receipt component itself has the id="receipt-container" which is used for printing styles */}
            {/* Fix: Pass the 'lang' prop to the Receipt component. */}
            <Receipt order={order} waiters={waiters} restaurantSettings={restaurantSettings} t={t} lang={lang} />
        </div>

        <div className="p-4 border-t mt-auto bg-gray-50 print:hidden">
           <button 
                onClick={handlePrintClick} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 flex items-center justify-center gap-2 text-lg"
            >
                <PrinterIcon className="w-6 h-6" />
                {t('printReceipt')}
           </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPreviewModal;