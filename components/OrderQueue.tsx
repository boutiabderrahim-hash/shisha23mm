
import React, { useState } from 'react';
// Fix: Corrected import path for types.
import { Order, Waiter, Language, ShiftReport } from '../types';
import { formatCurrency } from '../utils/helpers';
import { ClockIcon, CheckCircleIcon, InformationCircleIcon, PrinterIcon } from './icons';
// Fix: Corrected import path for constants.
import { TAX_RATE } from '../constants';

interface OrderQueueProps {
  orders: Order[];
  waiters: Waiter[];
  onUpdateStatus: (orderId: number, newStatus: Order['status']) => void;
  onPayOrder: (order: Order) => void;
  onReprintReceipt: (order: Order) => void;
  t: (key: string, params?: any) => string;
  lang: Language;
  activeShift: ShiftReport | undefined;
}

const OrderQueue: React.FC<OrderQueueProps> = ({ orders, waiters, onUpdateStatus, onPayOrder, onReprintReceipt, t, lang, activeShift }) => {
  const [filter, setFilter] = useState<'active' | 'paid' | 'all'>('active');
  
  const getStatusClasses = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'paid':
        return 'bg-gray-200 text-gray-800';
      case 'on_credit':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getWaiterName = (waiterId: string) => {
    return waiters.find(w => w.id === waiterId)?.name || 'Unknown';
  };

  const todaysOrders = activeShift
    ? orders.filter(order => new Date(order.timestamp) >= new Date(activeShift.dayOpenedTimestamp))
    : [];
  
  const filteredOrders = todaysOrders
    .filter(order => {
        if (order.status === 'cancelled') return false;
        if (filter === 'active') return order.status !== 'paid' && order.status !== 'on_credit';
        if (filter === 'paid') return order.status === 'paid';
        return true; // 'all'
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col h-full" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">{t('orders')}</h2>
            <div className="flex space-x-2 rtl:space-x-reverse">
                <button onClick={() => setFilter('active')} className={`px-3 py-1 text-sm rounded-md transition-colors ${filter === 'active' ? 'bg-orange-500 text-white font-semibold' : 'bg-gray-200 hover:bg-gray-300'}`}>{t('active')}</button>
                <button onClick={() => setFilter('paid')} className={`px-3 py-1 text-sm rounded-md transition-colors ${filter === 'paid' ? 'bg-orange-500 text-white font-semibold' : 'bg-gray-200 hover:bg-gray-300'}`}>{t('paid')}</button>
                <button onClick={() => setFilter('all')} className={`px-3 py-1 text-sm rounded-md transition-colors ${filter === 'all' ? 'bg-orange-500 text-white font-semibold' : 'bg-gray-200 hover:bg-gray-300'}`}>{t('all')}</button>
            </div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-2 space-y-2">
        {filteredOrders.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">{t('noOrdersFound')}</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-gray-50 rounded-lg shadow-sm p-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-md font-bold text-gray-800">{t('order')} #{order.id}</h3>
                  <p className="text-xs text-gray-500">{t('table')}: {order.tableNumber} ({order.area}) | {t('waiter')}: {getWaiterName(order.waiterId)}</p>
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded-full ${getStatusClasses(order.status)}`}>
                  {t(order.status)}
                </div>
              </div>

              <div className="border-t pt-2 mb-2">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between text-xs text-gray-600 py-0.5">
                    <span>{item.quantity}x {item.menuItem.name}</span>
                    <span className="font-mono">{formatCurrency(item.quantity * item.totalPrice * (1 - (item.discount || 0)/100))}</span>
                  </div>
                ))}
              </div>
              
              {order.notes && (
                <div className="border-t pt-2 mb-2 flex items-start gap-2 text-xs text-gray-700 bg-yellow-50 p-2 rounded-md">
                   <InformationCircleIcon className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5"/>
                   <p>{order.notes}</p>
                </div>
              )}

              {order.customerName && (
                <div className="border-t pt-2 mb-2 text-xs text-red-700 bg-red-50 p-2 rounded-md font-semibold">
                  {t('creditedTo', { name: order.customerName })}
                </div>
              )}


              <div className="flex justify-between items-center border-t pt-2">
                 <div className="font-bold text-md">{t('total')}: {formatCurrency(order.total)}</div>
                 <div>
                    {order.status === 'pending' || order.status === 'preparing' ? (
                         <button 
                            onClick={() => onUpdateStatus(order.id, order.status === 'pending' ? 'preparing' : 'ready')}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-1 px-3 rounded-md text-sm transition-colors"
                        >
                            {t(order.status === 'pending' ? 'startPreparing' : 'markReady')}
                        </button>
                    ) : order.status === 'ready' || order.status === 'on_credit' ? (
                        <button
                            onClick={() => onPayOrder(order)}
                            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-1 px-3 rounded-md text-sm transition-colors flex items-center gap-1"
                        >
                           <CheckCircleIcon className="w-4 h-4" /> {order.status === 'on_credit' ? t('settlePayment') : t('pay')}
                        </button>
                    ) : order.status === 'paid' ? (
                        <button
                            onClick={() => onReprintReceipt(order)}
                            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-1 px-3 rounded-md text-sm transition-colors flex items-center gap-1"
                        >
                           <PrinterIcon className="w-4 h-4" /> {t('reprintReceipt')}
                        </button>
                    ) : null}
                 </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OrderQueue;
