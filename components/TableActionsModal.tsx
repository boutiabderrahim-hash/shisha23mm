
import React from 'react';
// Fix: Corrected import path for types.
import { Order } from '../types';
import { XMarkIcon, PencilSquareIcon, CreditCardIcon } from './icons';

interface TableActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onAddToOrder: (order: Order) => void;
  onGoToPayment: (order: Order) => void;
  t: (key: string) => string;
}

const TableActionsModal: React.FC<TableActionsModalProps> = ({ isOpen, onClose, order, onAddToOrder, onGoToPayment, t }) => {
  if (!isOpen || !order) return null;

  const handleGoToPayment = () => {
    onClose();
    onGoToPayment(order);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col text-gray-800">
        <div className="p-5 border-b flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{t('table')} {order.tableNumber}</h2>
            <p className="text-gray-600">{t('order')} #{order.id}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XMarkIcon className="w-7 h-7"/></button>
        </div>
        <div className="p-6 space-y-3">
          <button
            onClick={() => onAddToOrder(order)}
            className="w-full bg-blue-600 text-white font-bold py-4 px-4 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center gap-2 text-lg"
          >
            <PencilSquareIcon className="w-6 h-6" />
            {t('addToExistingOrder')}
          </button>
          <button
            onClick={handleGoToPayment}
            className="w-full bg-green-600 text-white font-bold py-4 px-4 rounded-lg hover:bg-green-700 transition duration-300 flex items-center justify-center gap-2 text-lg"
          >
            <CreditCardIcon className="w-6 h-6" />
            {t('proceedToPayment')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableActionsModal;