import React, { useState, useEffect } from 'react';
import { XMarkIcon } from './icons';

interface PinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => void;
  t: (key: string) => string;
  title: string;
}

const PinModal: React.FC<PinModalProps> = ({ isOpen, onClose, onConfirm, t, title }) => {
  const [pin, setPin] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPin('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKeyPress = (key: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + key);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleConfirm = () => {
    onConfirm(pin);
  };
  
  const numpadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '⌫', '0', '✓'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs flex flex-col text-gray-800">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4">
          <div className="bg-gray-100 text-center text-4xl font-mono p-4 rounded-lg mb-4 tracking-[.5em]">
            {'*'.repeat(pin.length)}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {numpadKeys.map(key => (
              <button
                key={key}
                onClick={() => {
                  if (key === '⌫') handleBackspace();
                  else if (key === '✓') handleConfirm();
                  else handleKeyPress(key);
                }}
                className={`py-4 text-2xl font-semibold bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors active:bg-gray-400 ${key === '✓' ? 'bg-green-500 text-white hover:bg-green-600' : ''}`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PinModal;
