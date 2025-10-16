import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocalStorage } from './utils/hooks';
import { translations } from './translations';
import {
  Language, Waiter, Order, MenuItem, OrderItem, Category, InventoryItem, Transaction, ShiftReport, Table, RestaurantSettings, HeldOrder, Area, PaymentDetails, UserRole, CustomizationOption
} from './types';
import {
  mockWaiters, mockCategories, mockMenuItems, mockInventory, mockTables, mockRestaurantSettings
} from './data/mockData';
import { TAX_RATE } from './constants';
import { triggerCashDrawer } from './utils/helpers';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Menu from './components/Menu';
import CurrentOrder from './components/CurrentOrder';
import OrderQueue from './components/OrderQueue';
import WaiterSelectionScreen from './components/WaiterSelectionScreen';
import CustomizationModal from './components/CustomizationModal';
import PaymentModal from './components/PaymentModal';
import ReceiptPreviewModal from './components/ReceiptPreviewModal';
import OpeningBalanceModal from './components/OpeningBalanceModal';
import ConfirmationModal from './components/ConfirmationModal';
import AdminView from './components/admin/AdminView';
import TableSelectionScreen from './components/TableSelectionScreen';
import TableActionsModal from './components/TableActionsModal';
import HeldOrderActionsModal from './components/HeldOrderActionsModal';
import CreditConfirmationModal from './components/admin/CreditConfirmationModal';
import ShiftSummaryModal from './components/admin/ShiftSummaryModal';
import NumpadModal from './components/NumpadModal';

const App: React.FC = () => {
    // State management
    const [lang, setLang] = useLocalStorage<Language>('pos-lang', 'es');
    const [waiters, setWaiters] = useLocalStorage<Waiter[]>('pos-waiters', mockWaiters);
    const [categories, setCategories] = useLocalStorage<Category[]>('pos-categories', mockCategories);
    const [menuItems, setMenuItems] = useLocalStorage<MenuItem[]>('pos-menu-items', mockMenuItems);
    const [inventory, setInventory] = useLocalStorage<InventoryItem[]>('pos-inventory', mockInventory);
    const [orders, setOrders] = useLocalStorage<Order[]>('pos-orders', []);
    const [transactions, setTransactions] = useLocalStorage<Transaction[]>('pos-transactions', []);
    const [shifts, setShifts] = useLocalStorage<ShiftReport[]>('pos-shifts', []);
    const [tables, setTables] = useLocalStorage<Table[]>('pos-tables', mockTables);
    const [restaurantSettings, setRestaurantSettings] = useLocalStorage<RestaurantSettings>('pos-settings', mockRestaurantSettings);
    const [heldOrders, setHeldOrders] = useLocalStorage<HeldOrder[]>('pos-held-orders', []);

    // Active session state
    const [activeWaiter, setActiveWaiter] = useState<Waiter | null>(null);
    const [currentView, setCurrentView] = useState<'tables' | 'queue' | 'credit' | 'admin' | 'pos'>('tables');
    const [currentOrderItems, setCurrentOrderItems] = useState<OrderItem[]>([]);
    const [orderNotes, setOrderNotes] = useState('');
    const [selectedTableInfo, setSelectedTableInfo] = useState<{ number: number, area: Area } | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>(mockCategories[0]?.id || '');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedArea, setSelectedArea] = useState<Area>('Bar');
    
    // Modal states
    const [customizationModal, setCustomizationModal] = useState<{ isOpen: boolean; item: MenuItem | null }>({ isOpen: false, item: null });
    const [paymentModal, setPaymentModal] = useState<{ isOpen: boolean, order: Order | null }>({ isOpen: false, order: null });
    const [receiptModal, setReceiptModal] = useState<{ isOpen: boolean, order: Order | null }>({ isOpen: false, order: null });
    const [openingBalanceModalOpen, setOpeningBalanceModalOpen] = useState(false);
    const [closeDayConfirmation, setCloseDayConfirmation] = useState(false);
    const [cancelOrderConfirmation, setCancelOrderConfirmation] = useState(false);
    const [tableActionsModal, setTableActionsModal] = useState<{isOpen: boolean, order: Order | null}>({isOpen: false, order: null});
    const [heldOrderActionsModal, setHeldOrderActionsModal] = useState<{isOpen: boolean, heldOrder: HeldOrder | null}>({isOpen: false, heldOrder: null});
    const [creditConfirmationModalOpen, setCreditConfirmationModalOpen] = useState(false);
    const [shiftSummaryModal, setShiftSummaryModal] = useState<{isOpen: boolean, report: ShiftReport | null}>({isOpen: false, report: null});
    const [priceChangeModal, setPriceChangeModal] = useState<{isOpen: boolean, itemId: string | null, currentPrice: number}>({isOpen: false, itemId: null, currentPrice: 0});
    
    // Derived state
    const activeShift = useMemo(() => shifts.find(s => s.status === 'OPEN'), [shifts]);
    const dayStatus = activeShift ? 'OPEN' : 'CLOSED';

    // Editing state
    const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
    const originalOrderItems = useMemo(() => {
        if (!activeOrderId) return new Set<string>();
        const order = orders.find(o => o.id === activeOrderId);
        return new Set(order ? order.items.map(item => item.id) : []);
    }, [activeOrderId, orders]);

    // Order Calculations
    const { subtotal, tax, total } = useMemo(() => {
        const currentSubtotal = currentOrderItems.reduce((acc, item) => {
            const discountedPrice = item.totalPrice * (1 - (item.discount || 0) / 100);
            return acc + (discountedPrice * item.quantity);
        }, 0);
        
        // Price is already inclusive of tax
        const total = currentSubtotal;
        const subtotalBeforeTax = total / (1 + TAX_RATE);
        const taxAmount = total - subtotalBeforeTax;

        return { subtotal: subtotalBeforeTax, tax: taxAmount, total };
    }, [currentOrderItems]);
    
    const t = useCallback((key: string, params?: any) => {
        const langFile = translations[lang] || translations.en;
        let translation = langFile[key as keyof typeof langFile] || translations.en[key as keyof typeof translations.en] || key;
        if(params) {
            Object.keys(params).forEach(pKey => {
                translation = translation.replace(`{${pKey}}`, params[pKey]);
            });
        }
        return translation;
    }, [lang]);

    useEffect(() => {
        document.documentElement.lang = lang;
        document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    }, [lang]);
    
    const resetOrderState = useCallback(() => {
        setCurrentOrderItems([]);
        setOrderNotes('');
        setSelectedTableInfo(null);
        setActiveOrderId(null);
        setCurrentView('tables');
    }, []);
    
    // This function is now responsible for opening the payment modal directly.
    const handleProceed = () => {
        if (!activeWaiter || !selectedTableInfo || currentOrderItems.length === 0) return;

        // Construct a temporary order object to pass to the payment modal.
        // A temporary ID of -1 signifies a new, unsaved order.
        const tempOrderForPayment: Order = {
            id: activeOrderId || -1,
            waiterId: activeWaiter.id,
            tableNumber: selectedTableInfo.number,
            area: selectedTableInfo.area,
            items: currentOrderItems,
            status: 'pending', // This is a temporary status
            timestamp: new Date().toISOString(),
            subtotal,
            tax,
            total,
            notes: orderNotes,
        };
        setPaymentModal({ isOpen: true, order: tempOrderForPayment });
    };

    const handleAddItemToOrder = (itemToAdd: MenuItem | OrderItem, isCustomized = false) => {
        const menuItem = 'menuItem' in itemToAdd ? itemToAdd.menuItem : itemToAdd;

        if (menuItem.stockItemId) {
            const stockIndex = inventory.findIndex(i => i.id === menuItem.stockItemId);
            if (stockIndex !== -1) {
                const stockItem = inventory[stockIndex];
                const consumption = menuItem.stockConsumption;
                if (stockItem.quantity < consumption) {
                    alert(`Not enough stock for ${menuItem.name}`);
                    return;
                }
                setInventory(prev => prev.map(inv => inv.id === menuItem.stockItemId ? { ...inv, quantity: inv.quantity - consumption } : inv));
            }
        }
        
        const now = new Date();
        const GROUPING_THRESHOLD_MS = 15 * 1000; // 15 seconds

        const existingItemIndex = isCustomized ? -1 : currentOrderItems.findIndex(
            item => {
                const itemTimestamp = new Date(item.timestamp);
                const isRecent = (now.getTime() - itemTimestamp.getTime()) < GROUPING_THRESHOLD_MS;
    
                return item.menuItem.id === menuItem.id && 
                       Object.keys(item.customizations).length === 0 && 
                       item.removedIngredients.length === 0 && 
                       !item.discount &&
                       isRecent;
            }
        );

        if (existingItemIndex > -1) {
             setCurrentOrderItems(prev => prev.map((item, index) => 
                index === existingItemIndex 
                ? { ...item, quantity: item.quantity + 1 } 
                : item
            ));
        } else {
            const orderItem: OrderItem = 'menuItem' in itemToAdd
            ? { ...itemToAdd, id: `orderitem-${Date.now()}-${Math.random()}`, timestamp: new Date().toISOString() }
            : {
                id: `orderitem-${Date.now()}-${Math.random()}`,
                menuItem: menuItem,
                quantity: 1,
                customizations: {},
                removedIngredients: [],
                totalPrice: menuItem.price,
                timestamp: new Date().toISOString(),
              };
            setCurrentOrderItems(prev => [...prev, orderItem]);
        }
    };

    const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) return;
    
        const itemToUpdate = currentOrderItems.find(item => item.id === itemId);
        if (!itemToUpdate) return;
    
        const quantityChange = newQuantity - itemToUpdate.quantity;
    
        // Do nothing if quantity is not changing
        if (quantityChange === 0) return;
    
        // Stock check is only necessary when INCREASING quantity
        if (quantityChange > 0 && itemToUpdate.menuItem.stockItemId) {
            const stockItem = inventory.find(i => i.id === itemToUpdate.menuItem.stockItemId);
            const requiredStock = quantityChange * itemToUpdate.menuItem.stockConsumption;
    
            if (!stockItem || stockItem.quantity < requiredStock) {
                alert(`Not enough stock for ${itemToUpdate.menuItem.name}. Only ${stockItem?.quantity.toFixed(2) || 0} ${stockItem?.unit} available.`);
                return; // Abort the update if stock is insufficient
            }
        }
    
        // Update inventory first
        if (itemToUpdate.menuItem.stockItemId) {
            setInventory(prevInv => 
                prevInv.map(inv => 
                    inv.id === itemToUpdate.menuItem.stockItemId 
                    ? { ...inv, quantity: inv.quantity - (quantityChange * itemToUpdate.menuItem.stockConsumption) } 
                    : inv
                )
            );
        }
    
        // Then, update the order items
        setCurrentOrderItems(prevItems => 
            prevItems.map(item => 
                item.id === itemId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const handleRemoveItem = (itemId: string) => {
        const itemToRemove = currentOrderItems.find(item => item.id === itemId);
        if (!itemToRemove) return;
    
        // First, restore stock if the item is tracked
        if (itemToRemove.menuItem.stockItemId) {
            setInventory(prevInv =>
                prevInv.map(inv =>
                    inv.id === itemToRemove.menuItem.stockItemId
                        ? { ...inv, quantity: inv.quantity + (itemToRemove.quantity * itemToRemove.menuItem.stockConsumption) }
                        : inv
                )
            );
        }
    
        // Then, remove the item from the current order
        setCurrentOrderItems(prevItems => prevItems.filter(item => item.id !== itemId));
    };
    
    const handleUpdateItemDiscount = (itemId: string, discount: number) => {
        setCurrentOrderItems(prev => prev.map(item => item.id === itemId ? { ...item, discount: Math.max(0, Math.min(100, discount)) } : item));
    };

    // This function is now for saving an order to continue later.
    const handleHoldOrder = () => {
        if (!activeWaiter || !selectedTableInfo || currentOrderItems.length === 0) return;

        if (activeOrderId) {
            // Update existing order
            setOrders(prev => prev.map(o => o.id === activeOrderId
                ? { ...o, items: currentOrderItems, notes: orderNotes, total, subtotal, tax, status: 'pending' as const }
                : o
            ));
        } else {
            // Create new order
            const newOrder: Order = {
                id: Date.now(),
                waiterId: activeWaiter.id,
                tableNumber: selectedTableInfo.number,
                area: selectedTableInfo.area,
                items: currentOrderItems,
                status: 'pending' as const,
                timestamp: new Date().toISOString(),
                subtotal,
                tax,
                total,
                notes: orderNotes
            };
            setOrders(prev => [...prev, newOrder]);
        }
        resetOrderState();
    };

     const handleCancelOrder = () => {
        // Restore stock for all items being cancelled
        currentOrderItems.forEach(item => {
            // Only restore stock for items that were not part of an original, saved order
            if (item.menuItem.stockItemId && !originalOrderItems.has(item.id)) {
                 setInventory(prevInv =>
                    prevInv.map(inv =>
                        inv.id === item.menuItem.stockItemId
                            ? { ...inv, quantity: inv.quantity + (item.quantity * item.menuItem.stockConsumption) }
                            : inv
                    )
                );
            }
        });
        resetOrderState();
    };

    const handleConfirmPayment = (orderId: number, details: PaymentDetails, finalTotal: number, finalTax: number) => {
        let orderToUpdate: Order;
    
        // If orderId is -1, it's a new temporary order from the proceed flow
        if (orderId === -1) {
             if (!activeWaiter || !selectedTableInfo) return;
             orderToUpdate = {
                 id: Date.now(),
                 waiterId: activeWaiter.id,
                 tableNumber: selectedTableInfo.number,
                 area: selectedTableInfo.area,
                 items: currentOrderItems,
                 status: 'paid',
                 timestamp: new Date().toISOString(),
                 subtotal: finalTotal / (1 + TAX_RATE), // Recalculate based on final total
                 tax: finalTax,
                 total: finalTotal,
                 notes: orderNotes,
                 paymentDetails: details
             };
             setOrders(prev => [...prev, orderToUpdate]);
        } else {
            const existingOrder = orders.find(o => o.id === orderId);
            if (!existingOrder) return;
            orderToUpdate = { 
                ...existingOrder, 
                status: 'paid', 
                paymentDetails: details,
                total: finalTotal,
                tax: finalTax,
                subtotal: finalTotal / (1 + TAX_RATE)
            };
            setOrders(prev => prev.map(o => o.id === orderId ? orderToUpdate : o));
        }
    
        // Record transaction
        if (activeShift) {
            let cashAmount = 0;
            let cardAmount = 0;

            if(details.method === 'cash') cashAmount = finalTotal;
            else if(details.method === 'card') cardAmount = finalTotal;
            else if(details.method === 'multiple' && details.payments) {
                details.payments.forEach(p => {
                    if (p.method === 'cash') cashAmount += p.amount;
                    else if (p.method === 'card') cardAmount += p.amount;
                });
            } else if (details.method === 'split') {
                cashAmount = details.cashAmount || 0;
                cardAmount = details.cardAmount || 0;
            }

            const newTransaction: Transaction = {
                id: `tx-sale-${orderToUpdate.id}`,
                type: 'sale',
                amount: finalTotal,
                timestamp: new Date().toISOString(),
                description: `Order #${orderToUpdate.id}`,
                paymentMethod: details.method === 'cash' ? 'cash' : 'card', // Simplified for log
                tax: finalTax,
            };
            setTransactions(prev => [...prev, newTransaction]);

            setShifts(prev => prev.map(s => s.id === activeShift.id ? {
                ...s,
                cashSales: s.cashSales + cashAmount,
                cardSales: s.cardSales + cardAmount,
                totalTax: s.totalTax + finalTax,
            } : s));
        }
    
        setPaymentModal({ isOpen: false, order: null });
        setReceiptModal({ isOpen: true, order: orderToUpdate }); // Show receipt after payment
        resetOrderState(); // Reset after payment is fully processed
    };

    const handleSelectTable = (tableNumber: number, area: Area) => {
        // Check for held orders for this table
        const heldOrder = heldOrders.find(ho => ho.tableNumber === tableNumber && ho.area === area);
        if (heldOrder) {
            setHeldOrderActionsModal({ isOpen: true, heldOrder });
            return;
        }

        setSelectedTableInfo({ number: tableNumber, area });
        setCurrentView('pos');
    };

    const handleLogout = () => {
        setActiveWaiter(null);
        resetOrderState();
    };

    const handleOpenDay = (openingBalance: number) => {
        if (dayStatus === 'OPEN') return;
        const newShift: ShiftReport = {
            id: `shift-${Date.now()}`,
            dayOpenedTimestamp: new Date().toISOString(),
            dayClosedTimestamp: null,
            openingBalance,
            cashSales: 0,
            cardSales: 0,
            manualIncomeCash: 0,
            manualIncomeCard: 0,
            totalTax: 0,
            status: 'OPEN'
        };
        setShifts(prev => [...prev, newShift]);
        setOpeningBalanceModalOpen(false);
    };

    const handleCloseDay = () => {
        if (!activeShift) return;

        const openOrders = orders.filter(o => 
            !['paid', 'cancelled', 'on_credit'].includes(o.status) &&
            new Date(o.timestamp) >= new Date(activeShift.dayOpenedTimestamp)
        );

        if (openOrders.length > 0) {
            setCreditConfirmationModalOpen(true);
            return;
        }

        setCloseDayConfirmation(true);
    };
    
    const confirmCloseDay = () => {
        if (!activeShift) return;
        
        const finalTotalRevenue = activeShift.cashSales + activeShift.cardSales + activeShift.manualIncomeCash + activeShift.manualIncomeCard;

        const updatedShift = {
            ...activeShift,
            status: 'CLOSED' as const,
            dayClosedTimestamp: new Date().toISOString(),
            finalTotalRevenue,
            finalTotalTax: activeShift.totalTax,
            finalCashSales: activeShift.cashSales,
            finalManualIncomeCash: activeShift.manualIncomeCash,
        };
        setShifts(prev => prev.map(s => s.id === activeShift.id ? updatedShift : s));
        setCloseDayConfirmation(false);
        setShiftSummaryModal({ isOpen: true, report: updatedShift });
    };

    const handleCreditOrdersAndCloseDay = (ordersToCredit: (Order & { customerName: string })[]) => {
        setOrders(prevOrders => {
            const orderIdsToCredit = new Set(ordersToCredit.map(o => o.id));
            return prevOrders.map(o => {
                if (orderIdsToCredit.has(o.id)) {
                    const creditInfo = ordersToCredit.find(co => co.id === o.id);
                    return {
                        ...o,
                        status: 'on_credit' as const,
                        customerName: creditInfo?.customerName || 'N/A'
                    };
                }
                return o;
            });
        });
        setCreditConfirmationModalOpen(false);
        // Timeout to allow state to update before closing day
        setTimeout(() => confirmCloseDay(), 100);
    };

    const handleRequestPriceChange = (itemId: string, currentPrice: number) => {
        setPriceChangeModal({isOpen: true, itemId, currentPrice});
    };

    const handleConfirmPriceChange = (pin: string, newPrice: number) => {
        const admin = waiters.find(w => w.role === 'ADMIN' && w.pin === pin);
        if(!admin) {
            alert('Invalid Admin PIN');
            return false;
        }

        if (priceChangeModal.itemId) {
            setCurrentOrderItems(prev => prev.map(item => 
                item.id === priceChangeModal.itemId 
                ? { ...item, totalPrice: newPrice } 
                : item
            ));
        }
        setPriceChangeModal({isOpen: false, itemId: null, currentPrice: 0});
        return true;
    };
    
     const handleOpenDrawerWithPin = (pin: string) => {
        const managerOrAdmin = waiters.find(w => (w.role === 'MANAGER' || w.role === 'ADMIN') && w.pin === pin);
        if (managerOrAdmin) {
            triggerCashDrawer();
            
            // Log this action as a manual transaction with 0 amount for tracking
            if(activeShift) {
                const newTransaction: Transaction = {
                  id: `tx-drawer-${Date.now()}`,
                  type: 'manual',
                  amount: 0,
                  timestamp: new Date().toISOString(),
                  description: `Cash Drawer Opened by ${managerOrAdmin.name}`,
                  paymentMethod: 'cash',
                  tax: 0,
                };
                setTransactions(prev => [...prev, newTransaction]);
            }
            return true; // Pin correct
        }
        alert('Invalid PIN');
        return false; // Pin incorrect
    };
    
    // Main render logic
    if (!activeWaiter) {
        return <WaiterSelectionScreen 
            waiters={waiters} 
            onSelectWaiter={setActiveWaiter} 
            t={t}
            restaurantName={restaurantSettings.name}
            logoUrl={restaurantSettings.logoUrl}
        />;
    }

    if (dayStatus === 'CLOSED' && currentView !== 'admin') {
        return (
            <div className="flex h-screen">
                <Sidebar
                    activeView={currentView}
                    onNavigate={setCurrentView}
                    onLogout={handleLogout}
                    waiterName={activeWaiter.name}
                    t={t}
                    dayStatus={dayStatus}
                    onOpenDay={() => setOpeningBalanceModalOpen(true)}
                    onCloseDay={handleCloseDay}
                />
                <main className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-100">
                    <div className="text-center bg-white p-8 rounded-lg shadow-md">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">{t('dayIsClosed')}</h2>
                        <p className="text-xl text-gray-600 mb-4">{t('openNewDay')}</p>
                        <button onClick={() => setOpeningBalanceModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300">
                            {t('openDay')}
                        </button>
                    </div>
                </main>
                 <OpeningBalanceModal isOpen={openingBalanceModalOpen} onClose={() => setOpeningBalanceModalOpen(false)} onConfirm={handleOpenDay} t={t} lang={lang} />
            </div>
        )
    }

    return (
        <div className="flex h-screen bg-gray-100" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <Sidebar
                activeView={currentView}
                onNavigate={(view) => {
                    // Fix: Removed redundant comparison `view !== 'pos'` that caused a type error.
                    // The `onNavigate` prop is only called from the sidebar with views other than 'pos'.
                    // The `currentOrderItems.length > 0` check is sufficient to determine if the user
                    // is navigating away from an active order.
                    if (currentOrderItems.length > 0) {
                        if (window.confirm("You have an active order. Are you sure you want to navigate away? The current order will be lost.")) {
                             handleCancelOrder(); // Clear the order
                             setCurrentView(view);
                        }
                    } else {
                        setCurrentView(view);
                    }
                }}
                onLogout={handleLogout}
                waiterName={activeWaiter.name}
                t={t}
                dayStatus={dayStatus}
                onOpenDay={() => setOpeningBalanceModalOpen(true)}
                onCloseDay={handleCloseDay}
            />

            <main className="flex-1 flex flex-col">
                {currentView !== 'admin' && (
                    <Header
                        lang={lang}
                        toggleLang={() => setLang(prev => prev === 'es' ? 'ar' : 'es')}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        onOpenDrawer={() => {
                            if (activeWaiter.role === 'WAITER') {
                                // Waiters might not have permission, but for now we allow
                                triggerCashDrawer();
                            } else {
                                // Require PIN for managers/admins
                                const pin = prompt("Enter Manager/Admin PIN to open drawer:");
                                if (pin) handleOpenDrawerWithPin(pin);
                            }
                        }}
                        t={t}
                    />
                )}
                <div className="flex-grow overflow-hidden">
                    {currentView === 'tables' && (
                        <TableSelectionScreen
                           orders={orders}
                           heldOrders={heldOrders}
                           activeShift={activeShift}
                           tables={tables}
                           onSelectTable={handleSelectTable}
                           onOpenTableActions={(order) => setTableActionsModal({isOpen: true, order})}
                           selectedArea={selectedArea}
                           setSelectedArea={setSelectedArea}
                           t={t}
                           inventory={inventory}
                           onOpenDrawer={() => {
                                const pin = prompt("Enter Manager/Admin PIN to open drawer:");
                                if (pin) handleOpenDrawerWithPin(pin);
                           }}
                        />
                    )}
                     {currentView === 'pos' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full p-4">
                            <div className="lg:col-span-2 h-full">
                                <Menu
                                    menuItems={menuItems}
                                    categories={categories}
                                    inventory={inventory}
                                    selectedCategory={selectedCategory}
                                    onSelectCategory={setSelectedCategory}
                                    onSelectItem={(item) => handleAddItemToOrder(item)}
                                    onCustomizeItem={(item) => setCustomizationModal({ isOpen: true, item })}
                                    searchTerm={searchTerm}
                                    t={t}
                                />
                            </div>
                            <div className="h-full">
                                <CurrentOrder
                                    currentOrderItems={currentOrderItems}
                                    subtotal={subtotal}
                                    tax={tax}
                                    total={total}
                                    notes={orderNotes}
                                    onUpdateNotes={setOrderNotes}
                                    onUpdateQuantity={handleUpdateQuantity}
                                    onRemoveItem={handleRemoveItem}
                                    onProceed={handleProceed}
                                    onUpdateItemDiscount={handleUpdateItemDiscount}
                                    onRequestPriceChange={handleRequestPriceChange}
                                    onHoldOrder={handleHoldOrder}
                                    onCancelOrder={() => setCancelOrderConfirmation(true)}
                                    t={t}
                                    isEditing={!!activeOrderId}
                                    originalItemIds={originalOrderItems}
                                />
                            </div>
                        </div>
                    )}
                    {currentView === 'queue' && (
                        <div className="p-4 h-full">
                           <OrderQueue
                            orders={orders}
                            waiters={waiters}
                            onUpdateStatus={(orderId, status) => setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o))}
                            onPayOrder={(order) => setPaymentModal({ isOpen: true, order })}
                            onReprintReceipt={(order) => setReceiptModal({ isOpen: true, order })}
                            t={t}
                            lang={lang}
                            activeShift={activeShift}
                           />
                        </div>
                    )}
                    {currentView === 'admin' && (
                       <AdminView
                            waiter={activeWaiter}
                            t={t}
                            lang={lang}
                            overrideRole={null} // Can be used for temporary permission escalation
                            data={{
                                waiters, setWaiters, categories, setCategories, menuItems, setMenuItems,
                                inventory, setInventory, orders, setOrders, transactions, setTransactions,
                                shifts, setShifts, tables, setTables, restaurantSettings, setRestaurantSettings,
                                activeShift
                            }}
                       />
                    )}
                </div>
            </main>
            
            {/* Modals */}
            <CustomizationModal
                isOpen={customizationModal.isOpen}
                onClose={() => setCustomizationModal({ isOpen: false, item: null })}
                item={customizationModal.item}
                onAddToCart={(item) => handleAddItemToOrder(item, true)}
                t={t}
                lang={lang}
            />
            <PaymentModal
                isOpen={paymentModal.isOpen}
                onClose={() => setPaymentModal({ isOpen: false, order: null })}
                order={paymentModal.order}
                onConfirmPayment={handleConfirmPayment}
                onPrint={(order) => setReceiptModal({ isOpen: true, order })}
                t={t}
                lang={lang}
            />
            <ReceiptPreviewModal
                isOpen={receiptModal.isOpen}
                onClose={() => setReceiptModal({ isOpen: false, order: null })}
                order={receiptModal.order}
                waiters={waiters}
                restaurantSettings={restaurantSettings}
                t={t}
                lang={lang}
            />
            <OpeningBalanceModal isOpen={openingBalanceModalOpen} onClose={() => setOpeningBalanceModalOpen(false)} onConfirm={handleOpenDay} t={t} lang={lang} />
            <ConfirmationModal 
                isOpen={closeDayConfirmation}
                onClose={() => setCloseDayConfirmation(false)}
                onConfirm={confirmCloseDay}
                title={t('confirmCloseDay')}
                message={t('areYouSureCloseDay')}
                t={t}
                lang={lang}
            />
            <ConfirmationModal 
                isOpen={cancelOrderConfirmation}
                onClose={() => setCancelOrderConfirmation(false)}
                onConfirm={() => { handleCancelOrder(); setCancelOrderConfirmation(false); }}
                title={t('confirmCancelOrder')}
                message={t('areYouSureCancelOrder')}
                t={t}
                lang={lang}
            />
            <TableActionsModal 
                isOpen={tableActionsModal.isOpen}
                onClose={() => setTableActionsModal({isOpen: false, order: null})}
                order={tableActionsModal.order}
                onAddToOrder={(order) => {
                    setCurrentOrderItems(order.items);
                    setOrderNotes(order.notes || '');
                    setSelectedTableInfo({number: order.tableNumber, area: order.area});
                    setActiveOrderId(order.id);
                    setTableActionsModal({isOpen: false, order: null});
                    setCurrentView('pos');
                }}
                onGoToPayment={(order) => setPaymentModal({isOpen: true, order})}
                t={t}
            />
            <HeldOrderActionsModal
                isOpen={heldOrderActionsModal.isOpen}
                onClose={() => setHeldOrderActionsModal({ isOpen: false, heldOrder: null })}
                heldOrder={heldOrderActionsModal.heldOrder}
                onResume={(heldOrder) => {
                    setCurrentOrderItems(heldOrder.items);
                    setOrderNotes(heldOrder.notes || '');
                    setSelectedTableInfo({ number: heldOrder.tableNumber, area: heldOrder.area });
                    setHeldOrders(prev => prev.filter(ho => ho.id !== heldOrder.id)); // Remove from held
                    setHeldOrderActionsModal({ isOpen: false, heldOrder: null });
                    setCurrentView('pos');
                }}
                onStartNew={(heldOrder) => {
                    setHeldOrders(prev => prev.filter(ho => ho.id !== heldOrder.id)); // Remove old
                    setSelectedTableInfo({ number: heldOrder.tableNumber, area: heldOrder.area });
                    setHeldOrderActionsModal({ isOpen: false, heldOrder: null });
                    setCurrentView('pos');
                }}
                t={t}
            />
            <CreditConfirmationModal 
                isOpen={creditConfirmationModalOpen}
                onClose={() => setCreditConfirmationModalOpen(false)}
                onConfirm={handleCreditOrdersAndCloseDay}
                openOrders={orders.filter(o => !['paid', 'cancelled', 'on_credit'].includes(o.status) && activeShift && new Date(o.timestamp) >= new Date(activeShift.dayOpenedTimestamp))}
                t={t}
                lang={lang}
            />
            <ShiftSummaryModal 
                isOpen={shiftSummaryModal.isOpen}
                onClose={() => setShiftSummaryModal({isOpen: false, report: null})}
                shiftReport={shiftSummaryModal.report}
                t={t}
                lang={lang}
            />
             <NumpadModal 
                isOpen={priceChangeModal.isOpen}
                onClose={() => setPriceChangeModal({isOpen: false, itemId: null, currentPrice: 0})}
                onConfirm={(newPrice) => {
                    const pin = prompt("Enter Admin PIN:");
                    if (pin) {
                        handleConfirmPriceChange(pin, newPrice);
                    }
                }}
                initialValue={priceChangeModal.currentPrice}
                title={t('enterNewPrice')}
                t={t}
                allowDecimal
            />
        </div>
    );
};

export default App;