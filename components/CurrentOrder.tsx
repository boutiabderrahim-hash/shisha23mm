import React, { useState } from 'react';
// Fix: Corrected import path for types.
import { OrderItem, CustomizationOption } from '../types';
import { formatCurrency } from '../utils/helpers';
import { TrashIcon, ChevronDownIcon, PlusIcon, MinusIcon, CalculatorIcon, PencilSquareIcon, CheckCircleIcon } from './icons';
// Fix: Import TAX_RATE to resolve reference error and correct path.
import { TAX_RATE } from '../constants';
import NumpadModal from './NumpadModal';

interface CurrentOrderProps {
  currentOrderItems: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes: string;
  onUpdateNotes: (notes: string) => void;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemoveItem: (itemId: string) => void;
  onProceed: () => void;
  onUpdateItemDiscount: (itemId: string, discount: number) => void;
  onRequestPriceChange: (itemId: string, currentPrice: number) => void;
  onHoldOrder: () => void;
  onCancelOrder: () => void;
  t: (key: string) => string;
  isEditing: boolean;
  originalItemIds: Set<string>;
}

const CurrentOrder: React.FC<CurrentOrderProps> = ({
  currentOrderItems,
  subtotal,
  tax,
  total,
  notes,
  onUpdateNotes,
  onUpdateQuantity,
  onRemoveItem,
  onProceed,
  onUpdateItemDiscount,
  onRequestPriceChange,
  onHoldOrder,
  onCancelOrder,
  t,
  isEditing,
  originalItemIds,
}) => {
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [numpadConfig, setNumpadConfig] = useState<{
    isOpen: boolean;
    itemId: string | null;
    initialValue: number;
  }>({ isOpen: false, itemId: null, initialValue: 0 });


  const openNumpad = (itemId: string, initialValue: number) => {
    setNumpadConfig({
      isOpen: true,
      itemId: itemId,
      initialValue: initialValue,
    });
  };

  const closeNumpad = () => {
    setNumpadConfig({ isOpen: false, itemId: null, initialValue: 0 });
  };

  const handleNumpadConfirm = (value: number) => {
    if (numpadConfig.itemId) {
      onUpdateItemDiscount(numpadConfig.itemId, value);
    }
    closeNumpad();
  };
  
  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const renderCustomizations = (item: OrderItem) => {
    // Fix: Cast flattened array to CustomizationOption[] to resolve type errors.
    const customizations = Object.values(item.customizations).flat() as CustomizationOption[];
    const customizationText = customizations.map(opt => opt.name).join(', ');
    const removedText = item.removedIngredients.length > 0 ? `${t('without')} ${item.removedIngredients.join(', ')}` : '';
    if (!customizationText && !removedText) return null;
    return (
      <p className="text-xs text-gray-500 mt-1 truncate">
        {customizationText}{customizationText && removedText ? '; ' : ''}{removedText}
      </p>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col h-full">
      <div className="p-4 border-b flex-shrink-0">
        <h2 className="text-xl font-bold text-gray-800">{t('currentOrder')}</h2>
      </div>

      <div className="flex-grow overflow-y-auto p-2 space-y-1">
        {currentOrderItems.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">{t('orderIsEmpty')}</p>
          </div>
        ) : (
          currentOrderItems.map((item, index) => {
            const isOriginalItem = isEditing && originalItemIds.has(item.id);
            return (
              <div key={item.id} className={`rounded-lg p-3 ${isOriginalItem ? 'bg-gray-200' : 'bg-gray-50'}`}>
                <div className="flex items-center">
                  <span className="text-sm font-semibold text-gray-500 mr-2">{index + 1}</span>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800">
                        {item.menuItem.name}
                        {item.quantity > 1 && (
                          <span className="text-orange-600 font-bold ltr:ml-2 rtl:mr-2">
                              x{item.quantity}
                          </span>
                        )}
                      </p>
                      <span className="text-xs text-gray-400 font-mono">{formatTime(item.timestamp)}</span>
                      {item.discount && item.discount > 0 && (
                          <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                              -{item.discount}%
                          </span>
                      )}
                    </div>
                     {renderCustomizations(item)}
                  </div>
                  <div className="flex items-center">
                    <p className="font-bold text-gray-800 mx-4">{formatCurrency(item.totalPrice * item.quantity * (1 - (item.discount || 0) / 100))}</p>
                    <button onClick={() => onRemoveItem(item.id)} className="text-gray-400 hover:text-red-500 mx-2 disabled:text-gray-300 disabled:cursor-not-allowed" disabled={isOriginalItem}>
                      <TrashIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)} className="text-gray-500 hover:text-gray-800">
                      <ChevronDownIcon className={`w-5 h-5 transition-transform ${expandedItemId === item.id ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>
                {expandedItemId === item.id && (
                  <div className="mt-3 bg-white p-3 rounded-md grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-gray-700">{t('quantity')}:</label>
                          <div className="flex items-center border rounded-md">
                              <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="p-1 disabled:opacity-50" disabled={item.quantity <= 1 || isOriginalItem}><MinusIcon className="w-4 h-4" /></button>
                              <span className="font-bold w-6 text-center text-sm">{item.quantity}</span>
                              <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="p-1 disabled:opacity-50" disabled={isOriginalItem}><PlusIcon className="w-4 h-4" /></button>
                          </div>
                      </div>
                      <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-gray-700">{t('price')}:</label>
                          <button
                              type="button"
                              onClick={() => !isOriginalItem && onRequestPriceChange(item.id, item.totalPrice)}
                              className="flex-1 p-2 border rounded-md text-center font-bold flex items-center justify-between hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                              disabled={isOriginalItem}
                          >
                              <span>{formatCurrency(item.totalPrice)}</span>
                              <PencilSquareIcon className="w-4 h-4 text-gray-400" />
                          </button>
                      </div>
                      <div className="col-span-2 flex items-center gap-2">
                          <label className="text-sm font-medium text-gray-700">{t('discount')} (%):</label>
                          <button
                              type="button"
                              onClick={() => !isOriginalItem && openNumpad(item.id, item.discount || 0)}
                              className="flex-1 p-2 border rounded-md text-center font-bold flex items-center justify-between hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                              disabled={isOriginalItem}
                          >
                              <span>{item.discount || 0}%</span>
                              <CalculatorIcon className="w-4 h-4 text-gray-400" />
                          </button>
                      </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {currentOrderItems.length > 0 && (
        <div className="flex-shrink-0">
          <div className="p-4 border-t">
            <label htmlFor="order-notes" className="text-sm font-semibold text-gray-700">{t('orderNotes')}</label>
            <textarea
              id="order-notes"
              rows={2}
              className="w-full mt-1 p-2 border rounded-md text-sm"
              placeholder={t('orderNotesPlaceholder')}
              value={notes}
              onChange={(e) => onUpdateNotes(e.target.value)}
            />
          </div>
          <div className="p-4 border-t bg-white rounded-b-lg">
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between items-center text-gray-600">
                <span>{t('subtotal')}:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>{t('tax')} ({(TAX_RATE * 100).toFixed(0)}%):</span>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-800 text-lg">
                <span className="font-bold">{t('payableAmount')}:</span>
                <span className="font-bold">{formatCurrency(total)}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
               <button
                    onClick={onCancelOrder}
                    className="w-full bg-red-100 text-red-700 font-bold py-3 px-4 rounded-lg hover:bg-red-200 transition duration-300"
                >
                    {t('cancel')}
                </button>
               <button
                onClick={onHoldOrder}
                className="w-full bg-orange-100 text-orange-700 font-bold py-3 px-4 rounded-lg hover:bg-orange-200 transition duration-300"
              >
                {t('saveAndClose')}
              </button>
              <button
                onClick={onProceed}
                className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition duration-300 flex items-center justify-center gap-2"
              >
                <CheckCircleIcon className="w-6 h-6"/>
                {t('pay')}
              </button>
            </div>
          </div>
        </div>
      )}
      <NumpadModal
        isOpen={numpadConfig.isOpen}
        onClose={closeNumpad}
        onConfirm={handleNumpadConfirm}
        initialValue={numpadConfig.initialValue}
        title={`${t('discount')} (%)`}
        t={t}
        allowDecimal={false}
      />
    </div>
  );
};

export default CurrentOrder;