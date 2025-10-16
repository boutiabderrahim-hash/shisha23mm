
import React from 'react';
// Fix: Corrected import path for types.
import { HeldOrder } from '../types';
import { XMarkIcon, PencilSquareIcon, PlusCircleIcon } from './icons';

interface HeldOrderActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  heldOrder: HeldOrder | null;
  onResume: (order: HeldOrder) => void;
  onStartNew: (order: HeldOrder) => void;
  t: (key: string) => string;
}

const HeldOrderActionsModal: React.FC<HeldOrderActionsModalProps> = ({ isOpen, onClose, heldOrder, onResume, onStartNew, t }) => {
  if (!isOpen || !heldOrder) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col text-gray-800">
        <div className="p-5 border-b flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{t('table')} {heldOrder.tableNumber}</h2>
            <p className="text-gray-600">{t('heldOrderFound')}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XMarkIcon className="w-7 h-7"/></button>
        </div>
        <div className="p-6 space-y-4">
            <p className="text-center text-gray-700">{t('heldOrderMessage')}</p>
            <button
                onClick={() => onResume(heldOrder)}
                className="w-full bg-blue-600 text-white font-bold py-4 px-4 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center gap-2 text-lg"
            >
                <PencilSquareIcon className="w-6 h-6" />
                {t('resumeHeldOrder')}
            </button>
            <button
                onClick={() => onStartNew(heldOrder)}
                className="w-full bg-red-600 text-white font-bold py-4 px-4 rounded-lg hover:bg-red-700 transition duration-300 flex items-center justify-center gap-2 text-lg"
            >
                <PlusCircleIcon className="w-6 h-6" />
                {t('startNewOrder')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default HeldOrderActionsModal;