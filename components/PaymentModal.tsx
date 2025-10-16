import React, { useState, useEffect, useMemo } from 'react';
// Fix: Corrected import path for types.
import { Order, Language, OrderItem, PaymentDetails, PartialPayment } from '../types';
import { formatCurrency, triggerCashDrawer } from '../utils/helpers';
import { XMarkIcon, ChevronDownIcon, CalculatorIcon, TrashIcon, CreditCardIcon } from './icons';
// Fix: Corrected import path for constants.
import { TAX_RATE } from '../constants';
import NumpadModal from './NumpadModal';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onConfirmPayment: (orderId: number, details: PaymentDetails, finalTotal: number, finalTax: number) => void;
  onPrint: (order: Order) => void;
  t: (key: string, params?: any) => string;
  lang: Language;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, order, onConfirmPayment, onPrint, t, lang }) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [amountReceived, setAmountReceived] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [partialPayments, setPartialPayments] = useState<PartialPayment[]>([]);
  const [amountForNextPayment, setAmountForNextPayment] = useState('');
  
  const [numpadConfig, setNumpadConfig] = useState<{
    isOpen: boolean;
    target: 'discount' | 'received' | 'split' | null;
    initialValue: number;
    title: string;
    allowDecimal: boolean;
  }>({ isOpen: false, target: null, initialValue: 0, title: '', allowDecimal: true });
  
  const finalTotal = order ? Math.max(0, order.total - discountAmount) : 0;
  const finalTax = finalTotal - (finalTotal / (1 + TAX_RATE));

  const totalPaid = useMemo(() => partialPayments.reduce((sum, p) => sum + p.amount, 0), [partialPayments]);
  const remainingAmount = finalTotal - totalPaid;

  useEffect(() => {
    if (order) {
        setDiscountAmount(0);
        setShowSummary(false);
        setPaymentMethod('cash');
        setIsSplitMode(false);
        setPartialPayments([]);
    }
  },[order, isOpen]);

  useEffect(() => {
    if (order && !isSplitMode) {
        setAmountReceived(finalTotal.toFixed(2));
    } else if (isSplitMode) {
        setAmountForNextPayment(remainingAmount > 0.001 ? remainingAmount.toFixed(2) : '');
    }
  }, [finalTotal, order, isSplitMode, partialPayments, remainingAmount]);

  if (!isOpen || !order) return null;

  const handleConfirm = () => {
    let details: PaymentDetails;
    let hasCashPayment = false;

    if (isSplitMode) {
        details = { method: 'multiple', payments: partialPayments };
        if (partialPayments.some(p => p.method === 'cash')) {
            hasCashPayment = true;
        }
    } else {
        details = { method: paymentMethod, amount: finalTotal };
        if (paymentMethod === 'cash') {
            hasCashPayment = true;
        }
    }
    
    if (hasCashPayment) {
        triggerCashDrawer();
    }

    onConfirmPayment(order.id, details, finalTotal, finalTax);
  };
  
  const openNumpad = (
    target: 'discount' | 'received' | 'split',
    title: string,
    initialValue: number
  ) => {
    setNumpadConfig({ isOpen: true, target, title, initialValue, allowDecimal: true });
  };

  const handleNumpadConfirm = (value: number) => {
    switch(numpadConfig.target) {
      case 'discount': setDiscountAmount(value); break;
      case 'received': setAmountReceived(String(value)); break;
      case 'split': setAmountForNextPayment(String(value)); break;
    }
    closeNumpad();
  };
  
  const closeNumpad = () => {
    setNumpadConfig({ isOpen: false, target: null, initialValue: 0, title: '', allowDecimal: false });
  }

  const handleAddPartialPayment = (method: 'cash' | 'card') => {
    const amount = parseFloat(amountForNextPayment);
    if (!isNaN(amount) && amount > 0 && amount <= remainingAmount + 0.009) { // Allow for small float inaccuracies
        setPartialPayments(prev => [...prev, { method, amount }]);
    }
  };

  const handleRemovePartialPayment = (index: number) => {
    setPartialPayments(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleQuickSplit = (numPeople: number) => {
    if (numPeople <= 0 || finalTotal <= 0) return;

    const newPayments: PartialPayment[] = [];
    const baseAmount = Math.floor((finalTotal / numPeople) * 100) / 100;
    let remainder = finalTotal - (baseAmount * numPeople);

    for (let i = 0; i < numPeople; i++) {
      let paymentAmount = baseAmount;
      if (remainder > 0.009) { // Distribute pennies
        paymentAmount += 0.01;
        remainder -= 0.01;
      }
      const finalAmount = parseFloat(paymentAmount.toFixed(2));
      newPayments.push({ method: 'cash', amount: finalAmount });
    }
    setPartialPayments(newPayments);
  };

  const change = parseFloat(amountReceived) - finalTotal;

  return (
    <>
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col text-gray-800">
        <div className="p-5 border-b flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-indigo-700">{t('payment')}</h2>
              <p className="text-gray-600">{t('order')} #{order.id === -1 ? t('newOrder') : order.id} - {t('table')} {order.tableNumber}</p>
            </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800"><XMarkIcon className="w-7 h-7"/></button>
        </div>

        <div className="flex-grow flex p-2 gap-2 overflow-hidden">
          {/* Left Side: Order Summary & Discount */}
          <div className="w-1/3 bg-gray-50 rounded-lg p-4 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">{t('order')}</h3>
                   <button onClick={() => setShowSummary(!showSummary)} className="text-sm text-indigo-600 font-semibold flex items-center gap-1">
                      {t('viewOrderSummary')} <ChevronDownIcon className={`w-4 h-4 transition-transform ${showSummary ? 'rotate-180' : ''}`} />
                  </button>
              </div>

              {showSummary && (
                <div className="text-xs space-y-1 mb-4 border-b pb-4 flex-grow overflow-y-auto">
                    {order.items.map((item: OrderItem) => (
                        <div key={item.id} className="flex justify-between">
                            <span>{item.quantity}x {item.menuItem.name}</span>
                            <span>{formatCurrency(item.quantity * item.totalPrice * (1-(item.discount || 0)/100))}</span>
                        </div>
                    ))}
                </div>
              )}
              
              <div className="mt-auto space-y-2">
                   <div className="flex justify-between text-sm"><span>{t('subtotal')}:</span><span>{formatCurrency(order.subtotal)}</span></div>
                   <div className="flex justify-between text-sm"><span>{t('tax')}:</span><span>{formatCurrency(order.tax)}</span></div>
                   <div className="flex justify-between font-bold text-md"><span>{t('total')}:</span><span>{formatCurrency(order.total)}</span></div>
                   <div className="border-t pt-2 mt-2">
                       <label className="block text-sm font-medium text-gray-700">{t('discountAmount')}</label>
                       <button
                          type="button"
                          onClick={() => openNumpad('discount', t('discountAmount'), discountAmount)}
                          className="w-full mt-1 border p-2 rounded-md text-right text-lg font-bold flex items-center justify-between hover:bg-gray-50"
                       >
                           <CalculatorIcon className="w-5 h-5 text-gray-400" />
                           <span>{formatCurrency(discountAmount)}</span>
                       </button>
                   </div>
                   {discountAmount > finalTotal && (
                      <div className="bg-green-100 text-green-800 p-2 rounded-md text-center font-bold">{t('free')}</div>
                   )}
              </div>
          </div>
          
          {/* Right Side: Payment Methods */}
          <div className="w-2/3 flex flex-col">
              <div className="flex-shrink-0 flex items-center justify-between p-4 bg-gray-100 rounded-t-lg">
                  <span className="text-3xl font-bold text-indigo-700">{formatCurrency(finalTotal)}</span>
                   <div className="flex gap-2">
                      <button onClick={() => setIsSplitMode(false)} className={`px-4 py-2 rounded-lg font-semibold ${!isSplitMode ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-200'}`}>{t('fullPayment')}</button>
                      <button onClick={() => setIsSplitMode(true)} className={`px-4 py-2 rounded-lg font-semibold ${isSplitMode ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-gray-200'}`}>{t('splitBill')}</button>
                   </div>
              </div>

              {isSplitMode ? (
                  <div className="flex-grow bg-white border-x border-b rounded-b-lg p-4 flex flex-col">
                      <div className="flex items-center gap-2 mb-4">
                          <button onClick={() => handleQuickSplit(2)} className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-md font-semibold">Split x2</button>
                          <button onClick={() => handleQuickSplit(3)} className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-md font-semibold">Split x3</button>
                          <button onClick={() => handleQuickSplit(4)} className="flex-1 bg-gray-200 hover:bg-gray-300 py-2 rounded-md font-semibold">Split x4</button>
                      </div>
                      <div className="border-t pt-4 flex-grow flex gap-4">
                          <div className="w-1/2 flex flex-col">
                              <h4 className="font-bold mb-2">{t('addPayment')}</h4>
                              <div className="mb-2">
                                <label className="block text-sm font-medium text-gray-700">{t('amountToPay')}</label>
                                <button type="button" onClick={() => openNumpad('split', t('amountToPay'), parseFloat(amountForNextPayment) || 0)} className="w-full mt-1 border p-2 rounded-md text-right text-lg font-bold flex items-center justify-between hover:bg-gray-50">
                                    <CalculatorIcon className="w-5 h-5 text-gray-400" />
                                    <span>{formatCurrency(parseFloat(amountForNextPayment) || 0)}</span>
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-2 mt-auto">
                                <button onClick={() => handleAddPartialPayment('cash')} disabled={remainingAmount < 0.001} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg disabled:bg-gray-400">{t('addCashPayment')}</button>
                                <button onClick={() => handleAddPartialPayment('card')} disabled={remainingAmount < 0.001} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg disabled:bg-gray-400">{t('addCardPayment')}</button>
                              </div>
                          </div>
                          <div className="w-1/2 bg-gray-50 p-3 rounded-lg flex flex-col">
                            <h4 className="font-bold mb-2">{t('paymentDetails')}</h4>
                             <div className="flex-grow overflow-y-auto space-y-1">
                                {partialPayments.map((p, i) => (
                                    <div key={i} className="flex justify-between items-center bg-white p-2 rounded-md">
                                        <div className="text-sm">
                                            {t('paymentX', {num: i+1})} ({t(p.method)})
                                        </div>
                                        <div className="font-semibold flex items-center gap-2">
                                            {formatCurrency(p.amount)}
                                            <button onClick={() => handleRemovePartialPayment(i)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t mt-2 pt-2 space-y-1 text-sm">
                                <div className="flex justify-between"><span>{t('totalPaid')}:</span><span className="font-bold">{formatCurrency(totalPaid)}</span></div>
                                <div className="flex justify-between text-red-600"><span>{t('remaining')}:</span><span className="font-bold">{formatCurrency(remainingAmount)}</span></div>
                            </div>
                          </div>
                      </div>
                  </div>
              ) : (
                  <div className="flex-grow bg-white border-x border-b rounded-b-lg p-4 flex justify-around items-center">
                     <div className="flex-1 text-center">
                          <h3 className="font-bold text-lg mb-2">{t('paymentMethod')}</h3>
                          <div className="flex justify-center gap-3">
                              <button onClick={() => setPaymentMethod('cash')} className={`p-4 rounded-lg border-2 ${paymentMethod === 'cash' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}><img src="https://img.icons8.com/color/48/000000/cash-in-hand.png" alt="cash" className="w-16 h-16"/></button>
                              <button onClick={() => setPaymentMethod('card')} className={`p-4 rounded-lg border-2 ${paymentMethod === 'card' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'}`}><CreditCardIcon className="w-16 h-16 text-blue-500"/></button>
                          </div>
                      </div>
                      <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700">{t('amountReceived')}</label>
                          <button type="button" onClick={() => openNumpad('received', t('amountReceived'), parseFloat(amountReceived) || 0)} className="w-full mt-1 border p-2 rounded-md text-right text-xl font-bold flex items-center justify-between hover:bg-gray-50">
                              <CalculatorIcon className="w-5 h-5 text-gray-400" />
                              <span>{formatCurrency(parseFloat(amountReceived) || 0)}</span>
                          </button>
                           {change >= 0 && paymentMethod === 'cash' && (
                                <div className="mt-2 text-right">
                                    <span className="text-lg font-semibold">{t('change')}: </span>
                                    <span className="text-xl font-bold text-green-600">{formatCurrency(change)}</span>
                                </div>
                            )}
                      </div>
                  </div>
              )}
          </div>
        </div>

        <div className="p-4 border-t mt-auto bg-gray-50">
           <button 
                onClick={handleConfirm} 
                disabled={isSplitMode && remainingAmount > 0.009}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition duration-300 text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
                {t('confirmPayment')}
           </button>
        </div>
      </div>
    </div>
    <NumpadModal 
      isOpen={numpadConfig.isOpen}
      onClose={closeNumpad}
      onConfirm={handleNumpadConfirm}
      title={numpadConfig.title}
      initialValue={numpadConfig.initialValue}
      allowDecimal={numpadConfig.allowDecimal}
      t={t}
    />
    </>
  );
};

export default PaymentModal;