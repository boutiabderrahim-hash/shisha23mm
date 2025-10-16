import React, { useState, useEffect } from 'react';
import { XMarkIcon } from './icons';

interface NumpadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: number) => void;
  initialValue?: number;
  title: string;
  t: (key: string) => string;
  allowDecimal?: boolean;
}

const NumpadModal: React.FC<NumpadModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialValue = 0,
  title,
  t,
  allowDecimal = true,
}) => {
  const [value, setValue] = useState(initialValue.toString());

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue.toString());
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const handleKeyPress = (key: string) => {
    if (key === '.' && (!allowDecimal || value.includes('.'))) return;
    setValue(prev => (prev === '0' && key !== '.' ? key : prev + key));
  };

  const handleBackspace = () => {
    setValue(prev => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const handleConfirm = () => {
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      onConfirm(numericValue);
    }
    onClose();
  };

  const numpadKeys = [
    '7', '8', '9',
    '4', '5', '6',
    '1', '2', '3',
    '0', '⌫'
  ];
  if(allowDecimal) numpadKeys.push('.');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs flex flex-col text-gray-800">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4">
          <div className="bg-gray-100 text-right text-4xl font-mono p-4 rounded-lg mb-4 break-all">
            {value}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {numpadKeys.map(key => (
              <button
                key={key}
                onClick={() => {
                  if (key === '⌫') handleBackspace();
                  else handleKeyPress(key);
                }}
                className={`py-4 text-2xl font-semibold bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors active:bg-gray-400 ${key === '.' ? 'col-span-3' : ''}`}
              >
                {key}
              </button>
            ))}
          </div>
           <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => setValue('0')}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-lg transition duration-300 text-lg"
              >
                {t('clear')}
              </button>
              <button
                onClick={handleConfirm}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg transition duration-300 text-lg"
              >
                {t('ok')}
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default NumpadModal;