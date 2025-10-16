
import React, { useState, useEffect } from 'react';
// Fix: Corrected import path for types.
import { Order, Language } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { XMarkIcon, ExclamationTriangleIcon, KeyboardIcon } from '../icons';
import KeyboardModal from '../KeyboardModal';

interface CreditConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (ordersToCredit: (Order & { customerName: string })[]) => void;
  openOrders: Order[];
  t: (key: string, params?: any) => string;
  lang: Language;
}

const CreditConfirmationModal: React.FC<CreditConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  openOrders,
  t,
  lang,
}) => {
  const [customerNames, setCustomerNames] = useState<{ [orderId: number]: string }>({});
  const [keyboardState, setKeyboardState] = useState<{
    isOpen: boolean;
    orderId: number | null;
    initialValue: string;
  }>({ isOpen: false, orderId: null, initialValue: ''});

  useEffect(() => {
    if (isOpen) {
      setCustomerNames({});
    }
  }, [isOpen]);


  if (!isOpen) return null;

  const allNamesEntered = openOrders.every(order => customerNames[order.id]?.trim());

  const handleFinalConfirm = () => {
    if (!allNamesEntered) {
      alert(t('allCustomerNamesRequired'));
      return;
    }
    const ordersToCredit = openOrders.map(order => ({
      ...order,
      customerName: customerNames[order.id].trim(),
    }));
    onConfirm(ordersToCredit);
  };

  const openKeyboard = (orderId: number) => {
    setKeyboardState({
      isOpen: true,
      orderId,
      initialValue: customerNames[orderId] || '',
    });
  };

  const handleKeyboardConfirm = (name: string) => {
    if (keyboardState.orderId === null) {
      setKeyboardState({ isOpen: false, orderId: null, initialValue: '' });
      return;
    }

    const newCustomerNames = { ...customerNames, [keyboardState.orderId]: name };
    setCustomerNames(newCustomerNames);

    setKeyboardState({ isOpen: false, orderId: null, initialValue: '' });

    // Smart auto-confirm: Check if all names are now entered
    const allNamesNowEntered = openOrders.every(order => newCustomerNames[order.id]?.trim());
    
    if (allNamesNowEntered) {
      const ordersToCredit = openOrders.map(order => ({
        ...order,
        customerName: newCustomerNames[order.id].trim(),
      }));
      // Call onConfirm directly to prevent potential race conditions with the timeout.
      onConfirm(ordersToCredit);
    }
  };


  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col text-gray-800">
          <div className="p-5 border-b flex justify-between items-center">
              <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-full"><ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" /></div>
                  <h2 className="text-xl font-bold text-gray-800">{t('closeDayWithCreditTitle')}</h2>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><XMarkIcon className="w-6 h-6" /></button>
          </div>
          
          <div className="p-6 overflow-y-auto">
            <p className="text-gray-600 mb-4">{t('closeDayWithCreditMessage', { count: openOrders.length })}</p>
            <div className="space-y-3">
              {openOrders.map(order => (
                <div key={order.id} className="grid grid-cols-3 gap-3 items-center">
                  <div className="font-semibold text-sm">
                    {t('table')} {order.tableNumber} ({formatCurrency(order.total)})
                  </div>
                  <div className="col-span-2">
                    <button
                      type="button"
                      onClick={() => openKeyboard(order.id)}
                      className="w-full border p-2 rounded-md text-left flex justify-between items-center hover:bg-gray-50"
                    >
                      <span className={customerNames[order.id] ? 'text-gray-800' : 'text-gray-400'}>
                        {customerNames[order.id] || t('customerName')}
                      </span>
                      <KeyboardIcon className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 border-t mt-auto bg-gray-50 grid grid-cols-2 gap-3">
            <button onClick={onClose} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition duration-300">
              {t('cancel')}
            </button>
            <button
              onClick={handleFinalConfirm}
              disabled={!allNamesEntered}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {t('confirmAndMoveToCredit')}
            </button>
          </div>
        </div>
      </div>

      <KeyboardModal
        isOpen={keyboardState.isOpen}
        onClose={() => setKeyboardState({ isOpen: false, orderId: null, initialValue: '' })}
        onConfirm={handleKeyboardConfirm}
        initialValue={keyboardState.initialValue}
        title={t('enterCustomerName')}
        t={t}
        lang={lang}
      />
    </>
  );
};

export default CreditConfirmationModal;