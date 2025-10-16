
// Fix: Created the TableSelectionScreen component to allow users to select a table.
import React from 'react';
// Fix: Corrected import path for types.
import { Order, ShiftReport, InventoryItem, HeldOrder, Table, Area } from '../types';
import { UserGroupIcon, StarIcon, ExclamationTriangleIcon, KeyIcon, CubeIcon } from './icons';

interface TableSelectionScreenProps {
  orders: Order[];
  heldOrders: HeldOrder[];
  activeShift: ShiftReport | undefined;
  tables: Table[];
  onSelectTable: (tableId: number, area: Area) => void;
  onOpenTableActions: (order: Order) => void;
  selectedArea: Area;
  setSelectedArea: (area: Area) => void;
  t: (key: string) => string;
  inventory: InventoryItem[];
  onOpenDrawer: () => void;
}

const TableSelectionScreen: React.FC<TableSelectionScreenProps> = ({ orders, heldOrders, activeShift, tables, onSelectTable, onOpenTableActions, selectedArea, setSelectedArea, t, inventory, onOpenDrawer }) => {
  const areas: { name: Area; icon: React.FC<any>; }[] = [
    { name: 'Bar', icon: UserGroupIcon },
    { name: 'VIP', icon: StarIcon },
    { name: 'Barra', icon: UserGroupIcon },
    { name: 'Gaming', icon: CubeIcon },
  ];
  
  const lowStockItemsCount = inventory.filter(item => item.quantity <= item.lowStockThreshold).length;

  const getTableStatus = (table: Table) => {
    const order = orders.find(o => 
        o.tableNumber === table.number && 
        o.area === table.area && 
        o.status !== 'paid' && 
        o.status !== 'cancelled' &&
        o.status !== 'on_credit' &&
        activeShift && new Date(o.timestamp) >= new Date(activeShift.dayOpenedTimestamp)
    );
    if (order) return { status: order.status, order: order };
    
    const heldOrder = heldOrders.find(ho => ho.tableNumber === table.number && ho.area === table.area);
    if (heldOrder) return { status: 'held', order: null };
    
    return { status: 'available', order: null };
  };

  const tablesInSelectedArea = tables.filter(t => t.area === selectedArea);

  return (
    <div className="h-full flex flex-col p-4 bg-gray-800 text-white">
        {/* Top Header: Alerts & Main Actions */}
        <div className="flex-shrink-0 flex justify-between items-center mb-4">
            <div className="flex-1">
                {lowStockItemsCount > 0 && (
                    <div className="inline-flex items-center gap-3 bg-yellow-500/20 text-yellow-300 px-5 py-3 rounded-full border border-yellow-500/30 shadow-md animate-pulse">
                        <ExclamationTriangleIcon className="w-7 h-7" />
                        <span className="font-semibold">{t('lowStockAlerts')}: {lowStockItemsCount}</span>
                    </div>
                )}
            </div>
            <div className="flex-1 flex justify-end">
                <button
                    onClick={onOpenDrawer}
                    className="flex bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 md:py-4 md:px-8 rounded-lg items-center gap-2 md:gap-3 text-base md:text-lg transition-transform duration-200 ease-in-out hover:scale-105 shadow-lg"
                    aria-label={t('openCashDrawer')}
                >
                    <KeyIcon className="w-6 h-6 md:w-8 md:h-8" />
                    <span>{t('openCashDrawer')}</span>
                </button>
            </div>
        </div>
        
        {/* Area Navigation */}
        <div className="flex-shrink-0 border-b border-gray-700 mb-4">
            <nav className="-mb-px flex space-x-4 rtl:space-x-reverse" aria-label="Tabs">
                {areas.map((area) => (
                <button
                    key={area.name}
                    onClick={() => setSelectedArea(area.name)}
                    className={`${
                    selectedArea === area.name
                        ? 'border-orange-500 text-orange-500'
                        : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'
                    } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                    <area.icon className="w-5 h-5"/>
                    {t(area.name.toLowerCase())}
                </button>
                ))}
            </nav>
        </div>

        {/* Tables Grid */}
        <div className="flex-grow overflow-auto relative">
             <div className="relative w-full h-full min-h-[500px]">
              {tablesInSelectedArea.map(table => {
                  if (table.shape === 'fixture') {
                    return (
                      <div
                        key={table.id}
                        style={{
                          left: `${table.x}%`,
                          top: `${table.y}%`,
                          width: `${table.width}%`,
                          height: `${table.height}%`,
                        }}
                        className="absolute bg-gray-500 border-2 border-gray-700 shadow-inner rounded-md"
                      ></div>
                    );
                  }

                  const { status, order } = getTableStatus(table);
                  let bgColor = 'bg-green-600 hover:bg-green-700';
                  let statusText = null;
                  
                  if (status === 'available') {
                    bgColor = 'bg-green-600 hover:bg-green-700';
                  } else if (status === 'held') {
                    bgColor = 'bg-orange-500 hover:bg-orange-600';
                    statusText = t('holdOrder');
                  } else {
                    // Any other status ('pending', 'preparing', 'ready') means it's occupied
                    bgColor = 'bg-red-500 hover:bg-red-600';
                    statusText = t(status);
                  }

                  const handleClick = () => {
                    if (order) { onOpenTableActions(order); } 
                    else { onSelectTable(table.number, table.area); }
                  }
                  
                  return (
                      <button
                          key={table.id}
                          onClick={handleClick}
                          style={{ 
                              left: `${table.x}%`, 
                              top: `${table.y}%`, 
                              width: `${table.width}%`, 
                              height: `${table.height}%` 
                          }}
                          className={`absolute p-1 flex flex-col items-center justify-center transition-transform duration-200 transform hover:scale-110 focus:scale-110 text-white ${bgColor} ${table.shape === 'circle' ? 'rounded-full' : 'rounded-md'}`}
                      >
                          <span className="text-xl font-bold">{table.number}</span>
                          {statusText && <span className="text-xs mt-1">{statusText}</span>}
                      </button>
                  )
              })}
             </div>
        </div>
    </div>
  );
};

export default TableSelectionScreen;
