
import React, { useState, useEffect } from 'react';
// Fix: Corrected import path for types.
import { MenuItem, Category, InventoryItem } from '../../types';

interface MenuItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: MenuItem) => void;
  item: MenuItem | null;
  categories: Category[];
  inventory: InventoryItem[];
  t: (key: string) => string;
}

const MenuItemFormModal: React.FC<MenuItemFormModalProps> = ({ isOpen, onClose, onSave, item, categories, inventory, t }) => {
  const [formData, setFormData] = useState<Omit<MenuItem, 'price'|'stockConsumption'> & { price: string; stockConsumption: string; }>({
    id: '',
    name: '',
    price: '',
    categoryId: categories[0]?.id || '',
    imageUrl: '',
    stockItemId: inventory[0]?.id || '',
    stockConsumption: '1',
    ingredients: [],
  });

  useEffect(() => {
    if (isOpen) {
      setFormData(item ? { ...item, price: String(item.price), stockConsumption: String(item.stockConsumption) } : {
          id: '', name: '', price: '', categoryId: categories[0]?.id || '', imageUrl: '', stockItemId: inventory[0]?.id || '', stockConsumption: '1', ingredients: [],
      });
    }
  }, [item, categories, inventory, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ 
        ...formData, 
        price: parseFloat(formData.price),
        stockConsumption: parseFloat(formData.stockConsumption)
    } as MenuItem);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b font-bold">{item ? t('editItem') : t('addNewItem')}</div>
        <div className="p-4 grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
          <div><label className="block text-sm">{t('name')}</label><input name="name" type="text" value={formData.name} onChange={handleChange} required className="w-full border p-2 rounded-md" autoFocus /></div>
          <div>
            <label className="block text-sm">{t('price')}</label>
            <input name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required className="w-full border p-2 rounded-md" />
            <p className="text-xs text-gray-500 mt-1 text-right">{`(${t('taxIncluded')})`}</p>
          </div>
          <div className="col-span-2"><label className="block text-sm">{t('category')}</label><select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full border p-2 rounded-md"><option value="">Select</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div className="col-span-2"><label className="block text-sm">{t('imageURL')}</label><input name="imageUrl" type="text" value={formData.imageUrl} onChange={handleChange} className="w-full border p-2 rounded-md" /></div>
          <div className="col-span-2"><label className="block text-sm">{t('stockItem')}</label><select name="stockItemId" value={formData.stockItemId} onChange={handleChange} className="w-full border p-2 rounded-md"><option value="">Select</option>{inventory.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}</select></div>
          <div><label className="block text-sm">{t('consumption')}</label><input name="stockConsumption" type="number" step="0.1" value={formData.stockConsumption} onChange={handleChange} required className="w-full border p-2 rounded-md" /></div>
        </div>
        <div className="p-4 bg-gray-50 flex justify-end gap-2"><button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">{t('cancel')}</button><button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md">{t('save')}</button></div>
      </form>
    </div>
  );
};

export default MenuItemFormModal;