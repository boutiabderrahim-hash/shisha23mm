import React from 'react';
// Fix: Corrected import path for types.
import { Order, OrderItem, Waiter, RestaurantSettings, Language, CustomizationOption } from '../types';
import { formatCurrency } from '../utils/helpers';
// Fix: Corrected import path for constants.
import { TAX_RATE } from '../constants';

interface ReceiptProps {
  order: Order | null;
  waiters: Waiter[];
  restaurantSettings: RestaurantSettings;
  t: (key: string, params?: any) => string;
  lang: Language;
}

const Receipt: React.FC<ReceiptProps> = ({ order, waiters, restaurantSettings, t, lang }) => {
  if (!order) return null;
  
  const formatTime = (date: Date | string) => {
    // When data is reloaded from localStorage, date is a string.
    return new Date(date).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit' });
  };

  const subtotal = order.subtotal;
  const tax = order.tax;
  const waiterName = waiters.find(w => w.id === order.waiterId)?.name || 'N/A';
  
  let paymentMethodText = 'N/A';
  if (order.paymentDetails) {
      switch (order.paymentDetails.method) {
          case 'cash':
              paymentMethodText = t('cash');
              break;
          case 'card':
              paymentMethodText = t('card');
              break;
          case 'split':
              paymentMethodText = `${t('cash')}: ${formatCurrency(order.paymentDetails.cashAmount || 0)} / ${t('card')}: ${formatCurrency(order.paymentDetails.cardAmount || 0)}`;
              break;
          case 'multiple':
              paymentMethodText = t('multiple'); // This won't be displayed directly
              break;
      }
  }

  return (
    <div id="receipt-container" className="bg-white text-black font-mono" style={{ width: '288px', padding: '8px', fontSize: '12px' }}>
      {/* Header */}
      <div className="text-center mb-3">
        <h1 className="text-xl font-bold uppercase">{restaurantSettings.name}</h1>
        <p className="text-xs">{restaurantSettings.address}</p>
        <p className="text-xs">Tel: {restaurantSettings.phone}</p>
      </div>

      {/* Order Info */}
      <div className="text-xs space-y-1 mb-3">
        <p><strong>{t('order')}:</strong> #{order.id}</p>
        <p><strong>{t('table')}:</strong> {order.tableNumber} ({t(order.area.toLowerCase())})</p>
        <p><strong>{t('waiter')}:</strong> {waiterName}</p>
        <p><strong>{t('dateTime')}:</strong> {new Date(order.timestamp).toLocaleString()}</p>
      </div>

      {order.notes && (
        <>
          <div className="border-t border-dashed border-black my-2"></div>
          <div className="text-xs mb-2">
            <p className="font-bold uppercase">{t('notes')}:</p>
            <p>{order.notes}</p>
          </div>
        </>
      )}

      {/* Separator */}
      <div className="border-t border-black my-2"></div>

      {/* Items Header */}
      <div className="flex font-bold text-xs">
        <div className="w-[12.5%]">Q.</div>
        <div className="flex-grow">Item</div>
        <div className="w-[37.5%] text-right">Price</div>
      </div>
      
      {/* Items */}
      <div className="border-b border-black pb-2">
        {order.items.map(item => {
            // Fix: Cast flattened array to CustomizationOption[] to resolve type errors.
            const customizations = Object.values(item.customizations).flat() as CustomizationOption[];
            const customizationText = customizations.map(opt => opt.name).join(', ');
            const removedText = item.removedIngredients.length > 0 ? `${t('without')} ${item.removedIngredients.join(', ')}` : '';
            const hasDetails = customizationText || removedText;

            return (
                <div key={item.id} className="mt-2 text-xs">
                    <div className="flex">
                        <div className="w-[12.5%] align-top">{item.quantity}</div>
                        <div className="flex-grow">{item.menuItem.name}</div>
                        <div className="w-[37.5%] text-right">{formatCurrency(item.totalPrice * item.quantity * (1 - (item.discount || 0) / 100))}</div>
                    </div>
                    {/* Timestamp and customizations below item name */}
                    <div className="flex">
                        <div className="w-[12.5%]"></div> {/* Spacer */}
                        <div className="flex-grow text-gray-600" style={{fontSize: '10px', paddingLeft: '4px'}}>
                            @{formatTime(item.timestamp)}
                            {hasDetails && <span className="mx-2">|</span>}
                            {customizationText}
                            {customizationText && removedText ? '; ' : ''}
                            {removedText}
                        </div>
                    </div>
                </div>
            );
        })}
      </div>

      {/* Totals */}
      <div className="mt-3 space-y-1 text-xs">
        <div className="flex justify-between">
          <span>{t('subtotal')}:</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>{t('tax')} ({(TAX_RATE * 100).toFixed(0)}%):</span>
          <span>{formatCurrency(tax)}</span>
        </div>
      </div>
      
      <div className="border-t border-black my-2"></div>
      
      <div className="flex justify-between font-bold text-base mb-2">
        <span>TOTAL:</span>
        <span>{formatCurrency(order.total)}</span>
      </div>

       <div className="border-t border-black my-2"></div>

      {/* Payment Info */}
       <div className="text-xs space-y-1">
        <p className="font-bold uppercase text-center mb-1">{t('paymentDetails')}</p>
        {order.paymentDetails?.method === 'multiple' ? (
            order.paymentDetails.payments?.map((p, i) => (
                <div key={i} className="flex justify-between">
                    <span>{t('paymentX', {num: i + 1})} ({t(p.method)}):</span>
                    <span>{formatCurrency(p.amount)}</span>
                </div>
            ))
        ) : (
            <div className="flex justify-between">
                <span>{t('paymentMethod')}:</span>
                <span>{paymentMethodText}</span>
            </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="text-center mt-4 text-xs">
        <p className="font-bold">{restaurantSettings.footer}</p>
      </div>
    </div>
  );
};

export default Receipt;