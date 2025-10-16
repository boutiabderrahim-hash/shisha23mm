import React, { useState } from 'react';
import { Waiter, Language, Category, MenuItem, InventoryItem, Order, Transaction, ShiftReport, Table, RestaurantSettings, UserRole } from '../../types';
import {
  UserGroupIcon, BookOpenIcon, CubeIcon, CurrencyEuroIcon, DocumentTextIcon, Cog6ToothIcon, KeyIcon, UsersIcon,
  ChartBarIcon, BuildingStorefrontIcon, ArrowDownTrayIcon, TicketIcon,
  Squares2X2Icon
} from '../icons';
import Dashboard from '../Dashboard';
import ManagerDashboard from './ManagerDashboard';
import WaiterManagement from './WaiterManagement';
import WaiterFormModal from './WaiterFormModal';
import CategoryManagement from './CategoryManagement';
import CategoryFormModal from './CategoryFormModal';
import MenuManagement from './MenuManagement';
import MenuItemFormModal from './MenuItemFormModal';
import InventoryManagement from './InventoryManagement';
import InventoryFormModal from './InventoryFormModal';
import CashManagement from './CashManagement';
import DailyReport from './DailyReport';
import CreditManagement from './CreditManagement';
import RestaurantSettingsComp from './RestaurantSettings';
import TableLayoutEditor from './TableLayoutEditor';
import DataManagement from './DataManagement';
import ConfirmationModal from '../ConfirmationModal';
// Fix: Import TAX_RATE to resolve reference error.
import { TAX_RATE } from '../../constants';
import { triggerCashDrawer } from '../../utils/helpers';

interface AdminViewProps {
  waiter: Waiter;
  t: (key: string) => string;
  lang: Language;
  overrideRole: UserRole | null;
  data: {
    waiters: Waiter[]; setWaiters: React.Dispatch<React.SetStateAction<Waiter[]>>;
    categories: Category[]; setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
    menuItems: MenuItem[]; setMenuItems: React.Dispatch<React.SetStateAction<MenuItem[]>>;
    inventory: InventoryItem[]; setInventory: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
    orders: Order[]; setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    transactions: Transaction[]; setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    shifts: ShiftReport[]; setShifts: React.Dispatch<React.SetStateAction<ShiftReport[]>>;
    tables: Table[]; setTables: React.Dispatch<React.SetStateAction<Table[]>>;
    restaurantSettings: RestaurantSettings; setRestaurantSettings: React.Dispatch<React.SetStateAction<RestaurantSettings>>;
    activeShift: ShiftReport | undefined;
  };
}

const AdminView: React.FC<AdminViewProps> = ({ waiter, t, lang, overrideRole, data }) => {
  const effectiveRole = overrideRole || waiter.role;
  const isManager = effectiveRole === 'MANAGER';
  const isAdmin = effectiveRole === 'ADMIN';

  const managerTabs = ['dashboard', 'cashManagement', 'inventoryManagement', 'dailyReport', 'tableSettings', 'creditManagement'];
  const adminTabs = [
    'dashboard', 'cashManagement', 'dailyReport', 'menuManagement', 'categoryManagement', 'inventoryManagement',
    'waiterManagement', 'creditManagement', 'tableSettings', 'restaurantSettings', 'dataManagement'
  ];
  
  const availableTabs = isAdmin ? adminTabs : (isManager ? managerTabs : []);

  const [activeTab, setActiveTab] = useState(availableTabs[0] || '');

  // Modal states
  const [waiterModalOpen, setWaiterModalOpen] = useState(false);
  const [editingWaiter, setEditingWaiter] = useState<Waiter | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [menuItemModalOpen, setMenuItemModalOpen] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [editingInventoryItem, setEditingInventoryItem] = useState<InventoryItem | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [deleteHandler, setDeleteHandler] = useState<{ handler: (() => void) | null }>({ handler: null });

  // CRUD Handlers
  const handleSaveWaiter = (w: Waiter) => {
    data.setWaiters(prev => w.id ? prev.map(p => p.id === w.id ? w : p) : [...prev, { ...w, id: `waiter-${Date.now()}` }]);
    setWaiterModalOpen(false);
  };
  
  const handleDelete = (confirmCallback: () => void) => {
    setDeleteHandler({ handler: () => {
        confirmCallback();
        setConfirmationOpen(false);
        setDeleteHandler({ handler: null });
    }});
    setConfirmationOpen(true);
  };
  
  const handleSaveCategory = (cat: Category) => {
    data.setCategories(prev => cat.id ? prev.map(c => c.id === cat.id ? cat : c) : [...prev, { ...cat, id: `cat-${Date.now()}` }]);
    setCategoryModalOpen(false);
  };

  const handleSaveMenuItem = (item: MenuItem) => {
    data.setMenuItems(prev => item.id ? prev.map(m => m.id === item.id ? item : m) : [...prev, { ...item, id: `menu-${Date.now()}` }]);
    setMenuItemModalOpen(false);
  };
  
  const handleSaveInventory = (item: InventoryItem) => {
    data.setInventory(prev => item.id ? prev.map(i => i.id === item.id ? item : i) : [...prev, { ...item, id: `inv-${Date.now()}` }]);
    setInventoryModalOpen(false);
  };

  const handleSettleCreditOrder = (order: Order, method: 'cash' | 'card') => {
    // 1. Update order status and add payment details for receipt consistency
    data.setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'paid', paymentDetails: { method, amount: order.total } } : o));

    // 2. Add transaction and update the active shift report
    if (data.activeShift) {
        const newTransaction: Transaction = {
            id: `tx-settle-${order.id}`,
            type: 'sale',
            amount: order.total,
            timestamp: new Date().toISOString(),
            description: `Settled Credit for Order #${order.id}`,
            paymentMethod: method,
            tax: order.tax,
        };
        data.setTransactions(prev => [...prev, newTransaction]);

        data.setShifts(prev => prev.map(s => {
            if (s.id === data.activeShift?.id) {
                const updatedShift = { ...s };
                if (method === 'cash') {
                    updatedShift.cashSales += order.total;
                } else {
                    updatedShift.cardSales += order.total;
                }
                // The tax for this order was not previously added to the shift, so add it now.
                updatedShift.totalTax += order.tax;
                return updatedShift;
            }
            return s;
        }));
    }
    
    // 3. Trigger cash drawer if it's a cash payment
    if (method === 'cash') {
        triggerCashDrawer();
    }
  };

  const handleAddManualIncome = (amount: number, description: string, method: 'cash' | 'card') => {
    if (!data.activeShift) return;
    const tax = amount - (amount / (1 + TAX_RATE));
    const newTransaction: Transaction = {
      id: `tx-manual-${Date.now()}`,
      type: 'manual',
      amount: amount,
      timestamp: new Date().toISOString(),
      description,
      paymentMethod: method,
      tax: tax,
    };
    data.setTransactions(prev => [...prev, newTransaction]);
    data.setShifts(prev => prev.map(s => s.id === data.activeShift?.id ? {
      ...s,
      manualIncomeCash: s.manualIncomeCash + (method === 'cash' ? amount : 0),
      manualIncomeCard: s.manualIncomeCard + (method === 'card' ? amount : 0),
      totalTax: s.totalTax + tax,
    } : s));
  };
  
  const handleExportData = () => {
    const exportData = {
      waiters: data.waiters,
      categories: data.categories,
      menuItems: data.menuItems,
      inventory: data.inventory,
      orders: data.orders,
      transactions: data.transactions,
      shifts: data.shifts,
      tables: data.tables,
      restaurantSettings: data.restaurantSettings,
    };
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'pos_backup.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };
  
  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        data.setWaiters(json.waiters || []);
        data.setCategories(json.categories || []);
        data.setMenuItems(json.menuItems || []);
        data.setInventory(json.inventory || []);
        data.setOrders(json.orders || []);
        data.setTransactions(json.transactions || []);
        data.setShifts(json.shifts || []);
        data.setTables(json.tables || []);
        data.setRestaurantSettings(json.restaurantSettings || {});
        alert('Data imported successfully!');
      } catch (error) {
        alert('Error importing data. Invalid file format.');
      }
    };
    reader.readAsText(file);
  };
  
  const navItems = {
    dashboard: { label: t('dashboard'), icon: ChartBarIcon },
    cashManagement: { label: t('cashManagement'), icon: CurrencyEuroIcon },
    dailyReport: { label: t('shiftReports'), icon: DocumentTextIcon },
    menuManagement: { label: t('menuManagement'), icon: BookOpenIcon },
    categoryManagement: { label: t('categoryManagement'), icon: KeyIcon },
    inventoryManagement: { label: t('inventoryManagement'), icon: CubeIcon },
    waiterManagement: { label: t('waiterManagement'), icon: UsersIcon },
    creditManagement: { label: t('creditManagement'), icon: TicketIcon },
    tableSettings: { label: t('tableSettings'), icon: Squares2X2Icon },
    restaurantSettings: { label: t('restaurantSettings'), icon: BuildingStorefrontIcon },
    dataManagement: { label: t('dataManagement'), icon: ArrowDownTrayIcon },
  };

  return (
    <div className="h-full flex">
      <div className="w-64 bg-gray-800 text-white flex flex-col">
        <div className="p-4 font-bold text-lg border-b border-gray-700">{t('adminPanel')}</div>
        <nav className="flex-grow p-2 space-y-1">
          {availableTabs.map(tabKey => {
            const item = navItems[tabKey as keyof typeof navItems];
            return (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ${activeTab === tabKey ? 'bg-orange-500 text-white' : 'hover:bg-gray-700 text-gray-300'}`}
              >
                <item.icon className="w-5 h-5" /> {item.label}
              </button>
            )
          })}
        </nav>
      </div>
      <div className="flex-1 overflow-y-auto bg-gray-100">
        {activeTab === 'dashboard' && (isAdmin || isManager) ? 
          (isAdmin ? 
            <Dashboard orders={data.orders} inventory={data.inventory} activeShift={data.activeShift} categories={data.categories} t={t} /> :
            <ManagerDashboard 
              inventory={data.inventory} 
              orders={data.orders} 
              onNavigate={setActiveTab}
              onEditInventoryItem={(item) => { setEditingInventoryItem(item); setInventoryModalOpen(true); }}
              t={t}
            />
          ) : null
        }
        {activeTab === 'waiterManagement' && isAdmin && (
          <WaiterManagement
            waiters={data.waiters}
            onAdd={() => { setEditingWaiter(null); setWaiterModalOpen(true); }}
            onEdit={(w) => { setEditingWaiter(w); setWaiterModalOpen(true); }}
            onDelete={(id) => handleDelete(() => data.setWaiters(p => p.filter(i => i.id !== id)))}
            t={t}
          />
        )}
         {activeTab === 'categoryManagement' && isAdmin && (
          <CategoryManagement
            categories={data.categories}
            onAdd={() => { setEditingCategory(null); setCategoryModalOpen(true); }}
            onEdit={(c) => { setEditingCategory(c); setCategoryModalOpen(true); }}
            onDelete={(id) => handleDelete(() => data.setCategories(p => p.filter(i => i.id !== id)))}
            t={t}
            onSaveOrder={data.setCategories}
          />
        )}
         {activeTab === 'menuManagement' && isAdmin && (
          <MenuManagement
            menuItems={data.menuItems}
            categories={data.categories}
            inventory={data.inventory}
            onAdd={() => { setEditingMenuItem(null); setMenuItemModalOpen(true); }}
            onEdit={(item) => { setEditingMenuItem(item); setMenuItemModalOpen(true); }}
            onDelete={(id) => handleDelete(() => data.setMenuItems(p => p.filter(i => i.id !== id)))}
            t={t}
          />
        )}
        {activeTab === 'inventoryManagement' && (isAdmin || isManager) && (
          <InventoryManagement
            inventory={data.inventory}
            categories={data.categories}
            onAdd={() => { setEditingInventoryItem(null); setInventoryModalOpen(true); }}
            onEdit={(item) => { setEditingInventoryItem(item); setInventoryModalOpen(true); }}
            onDelete={(id) => handleDelete(() => data.setInventory(p => p.filter(i => i.id !== id)))}
            t={t}
            currentUserRole={effectiveRole}
            onSaveOrder={data.setInventory}
          />
        )}
         {activeTab === 'cashManagement' && (isAdmin || isManager) && (
          <CashManagement
            transactions={data.transactions}
            activeShift={data.activeShift}
            onAddManualIncome={handleAddManualIncome}
            t={t}
          />
        )}
        {activeTab === 'dailyReport' && (isAdmin || isManager) && (
            <DailyReport
                activeShift={data.activeShift}
                allShifts={data.shifts}
                orders={data.orders}
                categories={data.categories}
                waiters={data.waiters}
                dayStatus={data.activeShift ? 'OPEN' : 'CLOSED'}
                t={t}
                lang={lang}
            />
        )}
         {activeTab === 'creditManagement' && (isAdmin || isManager) && (
          <CreditManagement
            creditOrders={data.orders.filter(o => o.status === 'on_credit')}
            onSettle={handleSettleCreditOrder}
            t={t}
          />
        )}
        {activeTab === 'restaurantSettings' && isAdmin && (
          <RestaurantSettingsComp
            settings={data.restaurantSettings}
            onSave={data.setRestaurantSettings}
            t={t}
          />
        )}
         {activeTab === 'tableSettings' && (isAdmin || isManager) && (
          <TableLayoutEditor
            tables={data.tables}
            onSave={data.setTables}
            t={t}
            lang={lang}
          />
        )}
         {activeTab === 'dataManagement' && isAdmin && (
          <DataManagement
            onExport={handleExportData}
            onImport={handleImportData}
            t={t}
          />
        )}
      </div>

      {/* Modals */}
      <WaiterFormModal isOpen={waiterModalOpen} onClose={() => setWaiterModalOpen(false)} onSave={handleSaveWaiter} waiter={editingWaiter} t={t} />
      <CategoryFormModal isOpen={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} onSave={handleSaveCategory} category={editingCategory} t={t} />
      <MenuItemFormModal isOpen={menuItemModalOpen} onClose={() => setMenuItemModalOpen(false)} onSave={handleSaveMenuItem} item={editingMenuItem} categories={data.categories} inventory={data.inventory} t={t} />
      <InventoryFormModal isOpen={inventoryModalOpen} onClose={() => setInventoryModalOpen(false)} onSave={handleSaveInventory} item={editingInventoryItem} t={t} currentUserRole={effectiveRole} categories={data.categories} />
      <ConfirmationModal 
        isOpen={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={deleteHandler.handler!}
        title={t('confirmDeletion')}
        message={t('areYouSureDelete')}
        t={t}
        lang={lang}
      />
    </div>
  );
};

export default AdminView;