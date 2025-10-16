import React from 'react';
// Fix: Corrected import path for types.
import { ShiftReport, Order, Category, Waiter, Language } from '../../types';
import { formatCurrency } from '../../utils/helpers';
import { MoonIcon, SunIcon } from '../icons';
import SimpleBarChart from '../SimpleBarChart';

interface ShiftReportsProps {
    activeShift: ShiftReport | undefined;
    allShifts: ShiftReport[];
    orders: Order[];
    categories: Category[];
    waiters: Waiter[];
    dayStatus: 'OPEN' | 'CLOSED';
    t: (key: string) => string;
    lang: Language;
}

const ShiftReports: React.FC<ShiftReportsProps> = ({ activeShift, allShifts, orders, categories, waiters, dayStatus, t, lang }) => {
    
    if (!activeShift && dayStatus === 'CLOSED') {
        return (
            <div className="p-6 h-full flex flex-col items-center justify-center bg-gray-100">
                <div className="text-center bg-white p-8 rounded-lg shadow-md">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">{t('shiftReports')}</h2>
                    <p className="text-xl text-gray-600 mb-4">{t('dayIsClosed')}</p>
                </div>
            </div>
        );
    }
    
    const formatDateTime = (isoString: string | null) => {
        if (!isoString) return 'N/A';
        return new Date(isoString).toLocaleString(lang, { dateStyle: 'short', timeStyle: 'short' });
    }

    const paidOrders = activeShift
        ? orders.filter(o => 
            o.status === 'paid' && 
            new Date(o.timestamp) >= new Date(activeShift.dayOpenedTimestamp)
          )
        : [];

    // Prepare data for charts
    const salesByCategory = categories.map(cat => ({
        ...cat,
        total: paidOrders.reduce((acc, order) => acc + order.items.filter(item => item.menuItem.categoryId === cat.id).reduce((itemAcc, item) => itemAcc + item.totalPrice, 0), 0)
    })).filter(cat => cat.total > 0).sort((a,b) => b.total - a.total);

    const revenueByWaiter = waiters.map(waiter => ({
        ...waiter,
        total: paidOrders.filter(o => o.waiterId === waiter.id).reduce((acc, o) => acc + o.total, 0)
    })).filter(w => w.total > 0).sort((a,b) => b.total - a.total);

    const closedShifts = allShifts.filter(s => s.status === 'CLOSED').sort((a, b) => new Date(b.dayOpenedTimestamp).getTime() - new Date(a.dayOpenedTimestamp).getTime());

    const totalManualIncome = activeShift ? (activeShift.manualIncomeCash || 0) + (activeShift.manualIncomeCard || 0) : 0;

    return (
        <div className="p-6 bg-gray-100 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-800">{dayStatus === 'OPEN' ? t('liveShiftReport') : t('shiftReports')}</h2>
            </div>
            
            {activeShift && (
                <>
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                    <h3 className="font-bold text-lg mb-3">{t('financialSummary')} (Live)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-2 bg-gray-50 rounded-md"><div className="text-sm text-gray-600">{t('openingBalanceLabel')}</div><div className="font-bold text-lg">{formatCurrency(activeShift.openingBalance)}</div></div>
                        <div className="p-2 bg-green-50 rounded-md"><div className="text-sm text-gray-600">{t('cashSales')}</div><div className="font-bold text-lg">{formatCurrency(activeShift.cashSales)}</div></div>
                        <div className="p-2 bg-blue-50 rounded-md"><div className="text-sm text-gray-600">{t('cardSales')}</div><div className="font-bold text-lg">{formatCurrency(activeShift.cardSales)}</div></div>
                        <div className="p-2 bg-yellow-50 rounded-md"><div className="text-sm text-gray-600">{t('manualIncome')}</div><div className="font-bold text-lg">{formatCurrency(totalManualIncome)}</div></div>
                    </div>
                </div>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                     <SimpleBarChart title={t('salesByCategory')} data={salesByCategory} t={t} />
                     <SimpleBarChart title={t('revenueByWaiter')} data={revenueByWaiter} t={t} />
                </div>
                </>
            )}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <h3 className="p-4 font-bold text-lg">{t('shiftHistory')}</h3>
                <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3 text-left text-sm font-semibold">{t('openedOn')}</th>
                        <th className="p-3 text-left text-sm font-semibold">{t('closedOn')}</th>
                        <th className="p-3 text-left text-sm font-semibold">{t('totalRevenue')}</th>
                        <th className="p-3 text-left text-sm font-semibold">{t('totalTax')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {closedShifts.length > 0 ? (
                        closedShifts.map(shift => (
                        <tr key={shift.id} className="border-b">
                            <td className="p-3 text-sm">{formatDateTime(shift.dayOpenedTimestamp)}</td>
                            <td className="p-3 text-sm">{formatDateTime(shift.dayClosedTimestamp)}</td>
                            <td className="p-3 text-sm font-semibold">{formatCurrency(shift.finalTotalRevenue || 0)}</td>
                            <td className="p-3 text-sm font-mono">{formatCurrency(shift.finalTotalTax || 0)}</td>
                        </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="text-center p-6 text-gray-500">{t('noDataAvailable')}</td>
                        </tr>
                    )}
                    </tbody>
                </table>
                </div>
            </div>

        </div>
    );
};

export default ShiftReports;