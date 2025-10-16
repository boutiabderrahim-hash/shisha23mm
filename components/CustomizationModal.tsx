
import React, { useState, useEffect } from 'react';
// Fix: Import Language type for i18n and correct path.
import { MenuItem, CustomizationOption, Language } from '../types';
import { formatCurrency } from '../utils/helpers';
// Fix: Replaced non-existent XIcon with XMarkIcon.
import { XMarkIcon } from './icons';

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  onAddToCart: (customizedItem: any) => void;
  t: (key: string) => string;
  lang: Language;
}

const CustomizationModal: React.FC<CustomizationModalProps> = ({ isOpen, onClose, item, onAddToCart, t, lang }) => {
  // Fix: Improved state typing to prevent type errors during property access.
  const [selectedCustomizations, setSelectedCustomizations] = useState<{ [key: string]: CustomizationOption | CustomizationOption[] }>({});
  const [totalPrice, setTotalPrice] = useState(item?.price || 0);

  useEffect(() => {
    if (item) {
      // Fix: Aligned variable type with the improved state type.
      const initialCustomizations: { [key: string]: CustomizationOption | CustomizationOption[] } = {};
      if(item.customizations) {
        item.customizations.forEach(cat => {
          if (cat.type === 'single') {
            initialCustomizations[cat.id] = cat.options[0];
          } else {
            initialCustomizations[cat.id] = [];
          }
        });
      }
      setSelectedCustomizations(initialCustomizations);
    }
  }, [item]);

  useEffect(() => {
    if (item) {
      let currentPrice = item.price;
      Object.values(selectedCustomizations).forEach(val => {
        if(Array.isArray(val)) {
            currentPrice += val.reduce((acc, opt) => acc + opt.priceModifier, 0);
        } else if (val) {
            // Fix: Added type assertion to resolve 'unknown' type error.
            currentPrice += (val as CustomizationOption).priceModifier;
        }
      });
      setTotalPrice(currentPrice);
    }
  }, [selectedCustomizations, item]);
  
  if (!isOpen || !item) return null;

  const handleCustomizationChange = (catId: string, option: CustomizationOption, type: 'single' | 'multiple') => {
      setSelectedCustomizations(prev => {
          const newSelections = {...prev};
          if(type === 'single') {
              newSelections[catId] = option;
          } else {
              const current = newSelections[catId] as CustomizationOption[] || [];
              const isSelected = current.some(o => o.id === option.id);
              if(isSelected) {
                  newSelections[catId] = current.filter(o => o.id !== option.id);
              } else {
                  newSelections[catId] = [...current, option];
              }
          }
          return newSelections;
      });
  };

  const handleConfirm = () => {
    onAddToCart({
        menuItem: item,
        quantity: 1,
        customizations: selectedCustomizations,
        removedIngredients: [],
        totalPrice: totalPrice,
    });
    onClose();
  };

  return (
    // Fix: Use lang prop to set text direction dynamically
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col text-gray-800">
        <div className="p-5 border-b flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-indigo-700">{t('customizeItem')}</h2>
            <p className="text-gray-600">{item.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XMarkIcon className="w-7 h-7"/></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {item.customizations?.map(cat => (
            <div key={cat.id}>
              <h3 className="font-bold text-lg mb-3">{cat.name}</h3>
              <div className="space-y-2">
                {cat.options.map(opt => (
                  <label key={opt.id} className="flex items-center justify-between p-3 bg-gray-100 rounded-lg cursor-pointer">
                    <div className="flex items-center">
                       <input
                          type={cat.type === 'single' ? 'radio' : 'checkbox'}
                          name={cat.id}
                          // Fix: Added type assertions to handle union type property access.
                          checked={cat.type === 'single' ? (selectedCustomizations[cat.id] as CustomizationOption)?.id === opt.id : (selectedCustomizations[cat.id] as CustomizationOption[])?.some((o: CustomizationOption) => o.id === opt.id)}
                          onChange={() => handleCustomizationChange(cat.id, opt, cat.type)}
                          className="w-5 h-5 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                      <span className="ms-3 text-gray-800">{opt.name}</span>
                    </div>
                    {opt.priceModifier > 0 && <span className="font-semibold text-green-600">(+{formatCurrency(opt.priceModifier)})</span>}
                  </label>
                ))}
              </div>
            </div>
          ))}

        </div>

        <div className="p-6 border-t mt-auto flex justify-between items-center bg-gray-50">
           <span className="text-2xl font-bold text-indigo-700">{formatCurrency(totalPrice)}</span>
           <button onClick={handleConfirm} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition duration-300 text-lg">
                {t('addToOrder')}
           </button>
        </div>
      </div>
    </div>
  );
};

export default CustomizationModal;