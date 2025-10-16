

import React from 'react';
// Fix: Corrected import path for types.
import { MenuItem, Category } from '../types';
import { formatCurrency } from '../utils/helpers';
import { Cog6ToothIcon } from './icons';

interface MenuProps {
  menuItems: MenuItem[];
  categories: Category[];
  inventory: any;
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  onSelectItem: (item: MenuItem) => void;
  onCustomizeItem: (item: MenuItem) => void;
  searchTerm: string;
  t: (key: string) => string;
}

const Menu: React.FC<MenuProps> = ({ menuItems, categories, inventory, selectedCategory, onSelectCategory, onSelectItem, onCustomizeItem, searchTerm, t }) => {
  const filteredItems = menuItems.filter(item => 
    item.categoryId === selectedCategory && 
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      {/* Categories */}
      <div className="px-4 sm:px-6 lg:px-8 border-b border-gray-200">
        <div className="flex space-x-4 rtl:space-x-reverse -mb-px overflow-x-auto">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`whitespace-nowrap py-3 px-4 border-b-4 font-semibold text-base transition-colors duration-200 flex items-center ${
                selectedCategory === cat.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {cat.imageUrl && (
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-8 h-8 rounded-md ltr:mr-3 rtl:ml-3 object-cover shadow-sm"
                />
              )}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-4 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 sm:gap-6 sm:space-y-0">
          {filteredItems.map(item => {
             const stockItem = inventory.find(i => i.id === item.stockItemId);
             const isOutOfStock = stockItem ? stockItem.quantity <= 0 : false;
            
            return (
            <div
              key={item.id}
              onClick={() => !isOutOfStock && onSelectItem(item)}
              className={`bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-lg transition-all duration-200 flex flex-row sm:flex-col text-left sm:text-center relative ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {isOutOfStock && <div className="absolute inset-0 bg-gray-400 bg-opacity-50 flex items-center justify-center rounded-lg"><span className="text-white font-bold bg-black bg-opacity-60 px-2 py-1 rounded">{t('outOfStock')}</span></div>}
              <img src={item.imageUrl} alt={item.name} className="w-24 h-24 sm:w-full sm:h-32 object-cover rounded-l-lg sm:rounded-bl-none sm:rounded-t-lg" />
              <div className="p-3 flex-1 flex flex-col justify-center sm:justify-between">
                <h3 className="font-semibold text-gray-800 text-sm leading-tight">{item.name}</h3>
                <p className="text-gray-800 font-bold mt-2">{formatCurrency(item.price)}</p>
              </div>
              {item.customizations && (
                <button onClick={(e) => { e.stopPropagation(); if(!isOutOfStock) onCustomizeItem(item); }} disabled={isOutOfStock} className="absolute top-2 right-2 bg-white bg-opacity-70 p-1.5 rounded-full text-gray-600 hover:bg-opacity-100 hover:text-orange-500">
                    <Cog6ToothIcon className="w-5 h-5"/>
                </button>
              )}
            </div>
          )})}
        </div>
      </div>
    </div>
  );
};

export default Menu;