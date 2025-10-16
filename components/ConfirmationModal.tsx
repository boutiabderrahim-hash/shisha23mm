
import React from 'react';
// Fix: Corrected import path for types.
import { Language } from '../types';
import { ExclamationTriangleIcon, XMarkIcon } from './icons';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  t: (key: string) => string;
  lang: Language;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  t,
  lang,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col text-gray-800">
        <div className="p-5 border-b flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-full">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600">{message}</p>
        </div>

        <div className="p-4 border-t mt-auto bg-gray-50 grid grid-cols-2 gap-3">
          <button onClick={onClose} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition duration-300">
            {cancelText || t('cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300"
          >
            {confirmText || t('confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;