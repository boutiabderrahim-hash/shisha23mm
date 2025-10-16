import React, { useState, useMemo } from 'react';
// Fix: Corrected import path for types.
import { MenuItem, Category, InventoryItem } from '../../types';
import { PlusCircleIcon, PencilIcon, TrashIcon, ExclamationTriangleIcon, MagnifyingGlassIcon } from '../icons';
import { formatCurrency } from '../../utils/helpers';

interface MenuManagementProps {
  menuItems: MenuItem[];
  categories: Category[];
  inventory: InventoryItem[];
  onAdd: () => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  t: (key: string) => string;
}

const MenuManagement: React.FC<MenuManagementProps> = ({ menuItems, categories, inventory, onAdd, onEdit, onDelete, t }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAndGroupedMenu = useMemo(() => {
    const filtered = menuItems.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const grouped = new Map<string, MenuItem[]>();
    categories.forEach(cat => grouped.set(cat.id, []));

    filtered.forEach(item => {
      const group = grouped.get(item.categoryId);
      if (group) {
        group.push(item);
      } else {
        if (!grouped.has('uncategorized')) grouped.set('uncategorized', []);
        grouped.get('uncategorized')?.push(item);
      }
    });

    return grouped;
  }, [menuItems, searchTerm, categories]);


  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex-shrink-0 flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{t('menuManagement')}</h2>
        <button onClick={onAdd} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <PlusCircleIcon className="w-5 h-5" />{t('addNewItem')}
        </button>
      </div>

      <div className="flex-shrink-0 mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={t('searchMenu')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div className="flex-grow bg-white rounded-lg shadow overflow-y-auto">
        <div className="space-y-4 p-2">
          {categories.map(category => {
            const items = filteredAndGroupedMenu.get(category.id) || [];
            if (items.length === 0 && searchTerm) return null;

            return (
              <details key={category.id} className="bg-gray-50 rounded-lg" open>
                <summary className="p-3 font-bold text-lg cursor-pointer flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {category.name}
                    <span className="text-sm font-normal text-gray-500">({items.length} {t('items')})</span>
                  </div>
                </summary>
                <div className="overflow-x-auto border-t">
                  <table className="min-w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-3 text-left">{t('name')}</th>
                        <th className="p-3 text-left">{t('price')}</th>
                        <th className="w-32"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map(item => {
                        const stockItem = inventory.find(i => i.id === item.stockItemId);
                        const isLowOnStock = stockItem && stockItem.quantity <= stockItem.lowStockThreshold;
                        return (
                          <tr key={item.id} className="border-b">
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                {item.name}
                                {isLowOnStock && <span title={t('lowStock')}><ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" /></span>}
                              </div>
                            </td>
                            <td className="p-3">{formatCurrency(item.price)}</td>
                            <td className="p-3 flex gap-2">
                              <button onClick={() => onEdit(item)} className="text-blue-600"><PencilIcon className="w-5 h-5" /></button>
                              <button onClick={() => onDelete(item.id)} className="text-red-600"><TrashIcon className="w-5 h-5" /></button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </details>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default MenuManagement;