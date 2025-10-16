import React, { useState, useMemo } from 'react';
// Fix: Import ShiftReport to use in component props and correct path.
import { Transaction, ShiftReport } from '../../types';
import { PlusCircleIcon } from '../icons';
import { formatCurrency } from '../../utils/helpers';
// Fix: Corrected import path for constants.
import { TAX_RATE } from '../../constants';

interface CashManagementProps {
  transactions: Transaction[];
  // Fix: Added activeShift prop to allow filtering by the current open shift.
  activeShift: ShiftReport | undefined;
  onAddManualIncome: (amount: number, description: string, method: 'cash' | 'card') => void;
  t: (key: string) => string;
}

type TimeFilter = 'day' | 'month' | 'quarter' | 'year';

const CashManagement: React.FC<CashManagementProps> = ({ transactions, activeShift, onAddManualIncome, t }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'cash' | 'card'>('card');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('day');

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const numericAmount = parseFloat(amount);
    if (description.trim() && !isNaN(numericAmount) && numericAmount > 0) {
      onAddManualIncome(numericAmount, description.trim(), method);
      setDescription('');
      setAmount('');
    }
  };
  
  const calculatedTax = useMemo(() => {
    if (!amount) return 0;
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) return 0;
    // Calculate included tax from a tax-inclusive price
    return numericAmount - (numericAmount / (1 + TAX_RATE));
  }, [amount]);

  const { filteredTransactions, summary } = useMemo(() => {
    const filterLogic = (tx: Transaction) => tx.type === 'manual' || (tx.type === 'sale' && tx.paymentMethod !== 'cash');

    // For 'day' filter, use live data from activeShift for accuracy
    if (timeFilter === 'day') {
        const todaysTransactions = activeShift 
            ? transactions.filter(tx => new Date(tx.timestamp) >= new Date(activeShift.dayOpenedTimestamp))
            : [];
            
        const summaryData = activeShift 
            ? {
                totalSales: activeShift.cashSales + activeShift.cardSales,
                // Fix: Corrected property access to sum manual income from both cash and card.
                manualIncome: activeShift.manualIncomeCash + activeShift.manualIncomeCard,
                totalTax: activeShift.totalTax
              }
            : { totalSales: 0, manualIncome: 0, totalTax: 0 };
        
        const transactionsForLog = todaysTransactions.filter(filterLogic);

        return {
            filteredTransactions: transactionsForLog.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
            summary: summaryData
        };
    }
      
    // For historical filters, calculate from the persisted transactions log
    const now = new Date();
    let startDate: Date;

    switch (timeFilter) {
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        // Should not happen, but default to day if it does
        startDate = new Date(); 
        startDate.setHours(0,0,0,0);
    }
    
    const transactionsInPeriod = transactions.filter(tx => new Date(tx.timestamp) >= startDate);

    const summaryData = transactionsInPeriod.reduce((acc, tx) => {
        // Amount is now always tax-inclusive
        if (tx.type === 'sale') {
            acc.totalSales += tx.amount;
        } else if (tx.type === 'manual') {
            acc.manualIncome += tx.amount;
        }
        acc.totalTax += tx.tax || 0;
        return acc;
    }, { totalSales: 0, manualIncome: 0, totalTax: 0 });

    const transactionsForLog = transactionsInPeriod.filter(filterLogic);


    return { 
      filteredTransactions: transactionsForLog.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), 
      summary: summaryData 
    };
  }, [transactions, timeFilter, activeShift]);
  
  const timeFilterButtons: {id: TimeFilter, label: string}[] = [
      { id: 'day', label: t('today')},
      { id: 'month', label: t('thisMonth')},
      { id: 'quarter', label: t('thisQuarter')},
      { id: 'year', label: t('thisYear')},
  ]

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">{t('cashManagement')}</h2>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h3 className="font-bold mb-3">{t('addManualIncome')}</h3>
        <form onSubmit={handleAddIncome} className="space-y-3">
          <div className="flex flex-col sm:flex-row items-start gap-3">
            <div className="flex-grow w-full">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">{t('description')}</label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="mt-1 w-full border p-2 rounded-md"
              />
            </div>
            <div className="w-full sm:w-40">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">{t('amount')}</label>
              <input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="mt-1 w-full border p-2 rounded-md"
              />
              {calculatedTax > 0 && (
                <div className="text-right text-xs text-gray-500 mt-1 pr-1">
                  ({t('taxIncluded')}: {formatCurrency(calculatedTax)})
                </div>
              )}
            </div>
            <button type="submit" className="self-end w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2">
              <PlusCircleIcon className="w-5 h-5" />
              {t('add')}
            </button>
          </div>
          <div className="flex items-center gap-6">
             <p className="text-sm font-medium text-gray-700">{t('method')}:</p>
             <div className="flex items-center">
                <input id="manual-cash" name="manual-payment-method" type="radio" value="cash" checked={method === 'cash'} onChange={() => setMethod('cash')} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                <label htmlFor="manual-cash" className="ml-2 rtl:mr-2 block text-sm text-gray-900">{t('cash')}</label>
              </div>
              <div className="flex items-center">
                <input id="manual-card" name="manual-payment-method" type="radio" value="card" checked={method === 'card'} onChange={() => setMethod('card')} className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500" />
                <label htmlFor="manual-card" className="ml-2 rtl:mr-2 block text-sm text-gray-900">{t('card')}</label>
              </div>
          </div>
        </form>
      </div>

      <div className="mb-6">
            <div className="flex space-x-2 rtl:space-x-reverse border-b mb-4">
                {timeFilterButtons.map(btn => (
                     <button 
                        key={btn.id}
                        onClick={() => setTimeFilter(btn.id)}
                        className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors ${timeFilter === btn.id ? 'bg-white border border-b-0' : 'bg-gray-100 hover:bg-gray-200'}`}
                     >
                        {btn.label}
                    </button>
                ))}
            </div>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-white p-4 rounded-lg shadow"><div className="text-sm text-gray-600">{t('totalSales')}</div><div className="font-bold text-2xl">{formatCurrency(summary.totalSales)}</div></div>
                <div className="bg-white p-4 rounded-lg shadow"><div className="text-sm text-gray-600">{t('manualIncome')}</div><div className="font-bold text-2xl">{formatCurrency(summary.manualIncome)}</div></div>
                <div className="bg-white p-4 rounded-lg shadow"><div className="text-sm text-gray-600">{t('tax')}</div><div className="font-bold text-2xl">{formatCurrency(summary.totalTax)}</div></div>
            </div>
      </div>


      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h3 className="p-4 font-bold">{t('transactionLog')}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">{t('dateTime')}</th>
                <th className="p-3 text-left">{t('type')}</th>
                <th className="p-3 text-left">{t('method')}</th>
                <th className="p-3 text-left">{t('description')}</th>
                <th className="p-3 text-left">{t('amount')}</th>
                <th className="p-3 text-left">{t('tax')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map(tx => {
                  const taxAmount = tx.tax ?? null;
                  return (
                    <tr key={tx.id} className="border-b">
                      <td className="p-3 text-sm text-gray-600">{new Date(tx.timestamp).toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${tx.type === 'sale' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {t(tx.type)}
                        </span>
                      </td>
                      <td className="p-3 text-sm">{tx.paymentMethod ? t(tx.paymentMethod) : '—'}</td>
                      <td className="p-3">{tx.description}</td>
                      <td className="p-3 font-semibold">{formatCurrency(tx.amount)}</td>
                      <td className="p-3 font-mono text-sm">
                        {taxAmount !== null ? formatCurrency(taxAmount) : '—'}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                    <td colSpan={6} className="text-center p-6 text-gray-500">{t('noDataAvailable')}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CashManagement;