
import React, { useMemo } from 'react';
// Fix: Corrected import path for types.
import { Order, InventoryItem, ShiftReport, Category } from '../types'; 
import { formatCurrency } from '../utils/helpers';
import { BoltIcon, ExclamationTriangleIcon } from './icons';
import SimpleBarChart from './SimpleBarChart';

interface DashboardProps {
  orders: Order[];
  inventory: InventoryItem[];
  activeShift: ShiftReport | undefined;
  categories: Category[];
  t: (key: string) => string;
}

const Dashboard: React.FC<DashboardProps> = ({ orders, inventory, activeShift, categories, t }) => {
  const todaysPaidOrders = activeShift
    ? orders.filter(o => o.status === 'paid' && new Date(o.timestamp) >= new Date(activeShift.dayOpenedTimestamp))
    : [];

  const todaysActiveOrders = activeShift
    ? orders.filter(o => !['paid', 'cancelled', 'on_credit'].includes(o.status) && new Date(o.timestamp) >= new Date(activeShift.dayOpenedTimestamp))
    : [];

  const totalRevenue = todaysPaidOrders.reduce((acc, order) => acc + order.total, 0);
  const totalPaidOrders = todaysPaidOrders.length;
  const activeTablesCount = new Set(todaysActiveOrders.map(o => `${o.area}-${o.tableNumber}`)).size;
  const lowStockItems = inventory.filter(item => item.quantity <= item.lowStockThreshold);

  const topSellingItems = useMemo(() => {
    if (!todaysPaidOrders || todaysPaidOrders.length === 0) return [];
    const itemCounts = new Map<string, { name: string, quantity: number }>();
    todaysPaidOrders.forEach(order => {
        order.items.forEach(item => {
            const existing = itemCounts.get(item.menuItem.id);
            if (existing) {
                existing.quantity += item.quantity;
            } else {
                itemCounts.set(item.menuItem.id, { name: item.menuItem.name, quantity: item.quantity });
            }
        });
    });
    return Array.from(itemCounts.values())
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);
  }, [todaysPaidOrders]);

  const salesByCategory = useMemo(() => categories.map(cat => ({
        ...cat,
        total: todaysPaidOrders.reduce((acc, order) => acc + order.items.filter(item => item.menuItem.categoryId === cat.id).reduce((itemAcc, item) => itemAcc + item.totalPrice, 0), 0)
    })).filter(cat => cat.total > 0).sort((a,b) => b.total - a.total).slice(0, 5), [categories, todaysPaidOrders]);


  return (
    <div className="p-6 bg-gray-100 h-full overflow-y-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">{t('dashboard')}</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-2 bg-green-50 rounded-md">
                            <div className="text-sm text-gray-600">{t('totalRevenue')}</div>
                            <div className="font-bold text-2xl text-green-700">{formatCurrency(totalRevenue)}</div>
                        </div>
                        <div className="p-2 bg-blue-50 rounded-md">
                            <div className="text-sm text-gray-600">{t('totalOrders')}</div>
                            <div className="font-bold text-2xl text-blue-700">{totalPaidOrders}</div>
                        </div>
                        <div className="p-2 bg-yellow-50 rounded-md">
                            <div className="text-sm text-gray-600">Active {t('tables')}</div>
                            <div className="font-bold text-2xl text-yellow-700">{activeTablesCount}</div>
                        </div>
                         <div className="p-2 bg-red-50 rounded-md">
                            <div className="text-sm text-gray-600">{t('lowStock')}</div>
                            <div className="font-bold text-2xl text-red-700">{lowStockItems.length}</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                     <h3 className="text-xl font-bold mb-4 text-gray-700 flex items-center gap-2">
                        <BoltIcon className="w-6 h-6 text-orange-500" />
                        {t('topSellingItems')}
                    </h3>
                    {topSellingItems.length > 0 ? (
                        <div className="space-y-3">
                        {topSellingItems.map((item, index) => (
                            <div key={item.name} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                            <div className="flex items-center">
                                <span className="font-bold text-gray-500 w-6">{index + 1}.</span>
                                <span className="font-semibold text-gray-800">{item.name}</span>
                            </div>
                            <div className="bg-orange-100 text-orange-700 font-bold text-xs px-2 py-1 rounded-full">
                                {item.quantity} {t('quantitySold')}
                            </div>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm">{t('noDataAvailable')}</p>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow flex flex-col">
                <h3 className="text-xl font-bold text-gray-700 p-4 flex items-center gap-2 border-b">
                   <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                   {t('lowStockAlerts')}
                </h3>
                {lowStockItems.length > 0 ? (
                    <div className="overflow-y-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-start py-2 px-4 font-semibold text-gray-600 text-sm">{t('itemName')}</th>
                                    <th className="text-start py-2 px-4 font-semibold text-gray-600 text-sm">{t('quantityRemaining')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStockItems.map(item => (
                                <tr key={item.id} className="border-t hover:bg-red-50">
                                    <td className="py-2 px-4">{item.name}</td>
                                    <td className="py-2 px-4 text-red-600 font-bold">{item.quantity} / {item.lowStockThreshold} {item.unit}</td>
                                </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-6 flex-grow flex items-center justify-center">
                        <p className="text-gray-500">{t('noLowStockItems')}</p>
                    </div>
                )}
            </div>
        </div>

        <div className="mt-6">
            <SimpleBarChart title={t('salesByCategory')} data={salesByCategory} t={t} />
        </div>
    </div>
  );
};

export default Dashboard;