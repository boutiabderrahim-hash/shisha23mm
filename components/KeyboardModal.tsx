
import React, { useState, useEffect } from 'react';
import { XMarkIcon } from './icons';
// Fix: Corrected import path for types.
import { Language } from '../types';

interface KeyboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  initialValue?: string;
  title: string;
  t: (key: string) => string;
  lang: Language;
}

const arKeys = [
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', 'د'],
  ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ط'],
  ['ئ', 'ء', 'ؤ', 'ر', 'لا', 'ى', 'ة', 'و', 'ز', 'ظ'],
];

const esKeys = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

const KeyboardModal: React.FC<KeyboardModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialValue = '',
  title,
  t,
  lang,
}) => {
  const [value, setValue] = useState(initialValue);
  const [layout, setLayout] = useState<Language>(lang);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
      setLayout(lang);
    }
  }, [isOpen, initialValue, lang]);

  if (!isOpen) return null;

  const handleKeyPress = (key: string) => {
    setValue(prev => prev + key);
  };

  const handleBackspace = () => {
    setValue(prev => prev.slice(0, -1));
  };

  const handleConfirm = () => {
    onConfirm(value);
    onClose();
  };
  
  const currentKeys = layout === 'ar' ? arKeys : esKeys;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60] p-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col text-gray-800">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-4">
          <div className="bg-gray-100 text-right text-3xl font-sans p-4 rounded-lg mb-4 break-all min-h-[60px]">
            {value}
          </div>
          <div className="space-y-2" dir="ltr">
            {currentKeys.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-2">
                {row.map(key => (
                  <button
                    key={key}
                    onClick={() => handleKeyPress(key)}
                    className="flex-1 h-14 text-xl font-semibold bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors active:bg-gray-400"
                  >
                    {key}
                  </button>
                ))}
              </div>
            ))}
            <div className="flex justify-center gap-2">
                <button onClick={() => setLayout(p => p === 'ar' ? 'es' : 'ar')} className="h-14 text-lg font-semibold bg-gray-300 rounded-lg px-4 hover:bg-gray-400">{t('language')}</button>
                <button onClick={() => handleKeyPress(' ')} className="flex-grow h-14 text-xl font-semibold bg-gray-200 rounded-lg hover:bg-gray-300">{t('space')}</button>
                <button onClick={handleBackspace} className="h-14 text-xl font-semibold bg-gray-300 rounded-lg px-4 hover:bg-gray-400">⌫</button>
            </div>
          </div>
          <button
            onClick={handleConfirm}
            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-lg transition duration-300 text-lg active:bg-green-800"
          >
            {t('ok')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeyboardModal;