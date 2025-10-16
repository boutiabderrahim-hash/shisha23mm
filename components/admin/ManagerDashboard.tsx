import React from 'react';
// Fix: Corrected import path for types.
import { InventoryItem, Order } from '../../types';
import { CubeIcon, TicketIcon, Squares2X2Icon, PencilIcon } from '../icons';

interface ManagerDashboardProps {
  inventory: InventoryItem[];
  orders: Order[];
  onNavigate: (tab: string) => void;
  onEditInventoryItem: (item: InventoryItem) => void;
  t: (key: string) => string;
}

const StatCard: React.FC<{ icon: React.FC<any>, title: string, value: string | number, color: string }> = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
        <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4 rtl:mr-4 rtl:ml-0">
            <div className="text-sm text-gray-500">{title}</div>
            <div className="text-2xl font-bold text-gray-800">{value}</div>
        </div>
    </div>
);

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ inventory, orders, onNavigate, onEditInventoryItem, t }) => {
    const lowStockItems = inventory.filter(item => item.quantity <= item.lowStockThreshold);
    const activeOrders = orders.filter(o => o.status !== 'paid' && o.status !== 'cancelled');
    const activeTablesCount = new Set(activeOrders.map(o => `${o.area}-${o.tableNumber}`)).size;

    return (
        <div className="p-6 bg-gray-50 h-full overflow-y-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">{t('manager')} {t('dashboard')}</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <StatCard icon={Squares2X2Icon} title={t('tables')} value={activeTablesCount} color="bg-blue-500" />
                <StatCard icon={CubeIcon} title={t('lowStock')} value={lowStockItems.length} color="bg-red-500" />
            </div>

            {/* Main Content */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h3 className="text-xl font-bold text-red-600">{t('lowStockAlerts')}</h3>
                    <button onClick={() => onNavigate('inventoryManagement')} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors text-sm">
                        {t('inventoryManagement')}
                    </button>
                </div>

                {lowStockItems.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-3 text-left text-sm font-semibold text-gray-600">{t('itemName')}</th>
                                    <th className="p-3 text-left text-sm font-semibold text-gray-600">{t('quantityRemaining')}</th>
                                    <th className="p-3 text-left text-sm font-semibold text-gray-600">{t('threshold')}</th>
                                    <th className="w-24"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStockItems.map(item => (
                                    <tr key={item.id} className="border-b hover:bg-red-50">
                                        <td className="p-3 font-medium">{item.name}</td>
                                        <td className="p-3 text-red-600 font-bold">{item.quantity} {item.unit}</td>
                                        <td className="p-3">{item.lowStockThreshold} {item.unit}</td>
                                        <td className="p-3">
                                            <button 
                                                onClick={() => onEditInventoryItem(item)} 
                                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-semibold"
                                                title={t('addToStock')}
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                                {t('add')}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500 py-4">{t('noLowStockItems')}</p>
                )}
            </div>
        </div>
    );
};

export default ManagerDashboard;