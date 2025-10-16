import React, { useState, useEffect } from 'react';
// Fix: Corrected import path for types.
import { InventoryItem, UserRole, Category } from '../../types';
import NumpadModal from '../NumpadModal';
import { CalculatorIcon } from '../icons';

interface InventoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: InventoryItem) => void;
  item: InventoryItem | null;
  t: (key: string) => string;
  currentUserRole: UserRole;
  categories: Category[];
}

const InventoryFormModal: React.FC<InventoryFormModalProps> = ({ isOpen, onClose, onSave, item, t, currentUserRole, categories }) => {
  const [formData, setFormData] = useState<Omit<InventoryItem, 'quantity' | 'lowStockThreshold'> & { quantity: string, lowStockThreshold: string }>({
    id: '',
    name: '',
    quantity: '0',
    unit: 'units',
    lowStockThreshold: '0',
    categoryId: categories[0]?.id || ''
  });
  const [quantityToAdd, setQuantityToAdd] = useState('0');
  const [numpadConfig, setNumpadConfig] = useState<{
    isOpen: boolean;
    targetField: 'quantity' | 'lowStockThreshold' | 'quantityToAdd' | null;
    title: string;
    initialValue: number;
    allowDecimal: boolean;
  }>({ isOpen: false, targetField: null, title: '', initialValue: 0, allowDecimal: true });

  const isManagerEditMode = currentUserRole === 'MANAGER' && item;

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData({ ...item, quantity: String(item.quantity), lowStockThreshold: String(item.lowStockThreshold) });
        if (currentUserRole === 'MANAGER') {
          setQuantityToAdd('0');
        }
      } else {
        setFormData({ id: '', name: '', quantity: '0', unit: 'units', lowStockThreshold: '0', categoryId: categories[0]?.id || '' });
      }
    }
  }, [item, isOpen, currentUserRole, categories]);

  if (!isOpen) return null;
  
  const openNumpad = (
    targetField: 'quantity' | 'lowStockThreshold' | 'quantityToAdd',
    title: string,
    initialValue: string,
    allowDecimal: boolean
  ) => {
    setNumpadConfig({
      isOpen: true,
      targetField,
      title,
      initialValue: parseFloat(initialValue) || 0,
      allowDecimal,
    });
  };

  const handleNumpadConfirm = (value: number) => {
    if (numpadConfig.targetField === 'quantityToAdd') {
      setQuantityToAdd(String(value));
    } else if (numpadConfig.targetField) {
      setFormData(prev => ({ ...prev, [numpadConfig.targetField!]: String(value) }));
    }
    closeNumpad();
  };
  
  const closeNumpad = () => {
    setNumpadConfig({ isOpen: false, targetField: null, title: '', initialValue: 0, allowDecimal: false });
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isManagerEditMode && item) {
      const newQuantity = item.quantity + (parseFloat(quantityToAdd) || 0);
      onSave({ ...item, quantity: newQuantity });
    } else {
      onSave({
        ...formData,
        quantity: parseFloat(formData.quantity),
        lowStockThreshold: parseFloat(formData.lowStockThreshold),
      } as InventoryItem);
    }
  };

  const modalTitle = isManagerEditMode ? t('addToStock') : (item ? t('editStock') : t('addNewStock'));

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-md">
          <div className="p-4 border-b font-bold">{modalTitle}</div>
          <div className="p-4 grid grid-cols-2 gap-4">
            {isManagerEditMode && item ? (
              <>
                <div className="col-span-2">
                  <label className="block text-sm">{t('name')}</label>
                  <input value={item.name} disabled className="w-full border p-2 rounded-md bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm">{t('currentQuantity')}</label>
                  <input value={`${item.quantity} ${item.unit}`} disabled className="w-full border p-2 rounded-md bg-gray-100" />
                </div>
                <div>
                  <label className="block text-sm">{t('quantityToAdd')}</label>
                   <button
                    type="button"
                    onClick={() => openNumpad('quantityToAdd', t('quantityToAdd'), quantityToAdd, false)}
                    className="w-full border p-2 rounded-md text-left flex justify-between items-center hover:bg-gray-50"
                  >
                    <span>{quantityToAdd}</span>
                    <CalculatorIcon className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="col-span-2">
                  <label className="block text-sm">{t('name')}</label>
                  <input name="name" type="text" value={formData.name} onChange={handleTextChange} required className="w-full border p-2 rounded-md" autoFocus />
                </div>
                <div className="col-span-2">
                    <label className="block text-sm">{t('category')}</label>
                    <select name="categoryId" value={formData.categoryId} onChange={handleTextChange} className="w-full border p-2 rounded-md">
                        <option value="">{t('selectCategory')}</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                  <label className="block text-sm">{t('quantity')}</label>
                  <button
                    type="button"
                    onClick={() => openNumpad('quantity', t('quantity'), formData.quantity, true)}
                    className="w-full border p-2 rounded-md text-left flex justify-between items-center hover:bg-gray-50"
                  >
                    <span>{formData.quantity}</span>
                    <CalculatorIcon className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
                <div>
                  <label className="block text-sm">{t('unit')}</label>
                  <input name="unit" type="text" value={formData.unit} onChange={handleTextChange} required className="w-full border p-2 rounded-md" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm">{t('threshold')}</label>
                  <button
                    type="button"
                    onClick={() => openNumpad('lowStockThreshold', t('threshold'), formData.lowStockThreshold, true)}
                    className="w-full border p-2 rounded-md text-left flex justify-between items-center hover:bg-gray-50"
                  >
                    <span>{formData.lowStockThreshold}</span>
                    <CalculatorIcon className="w-5 h-5 text-gray-400" />
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="p-4 bg-gray-50 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">{t('cancel')}</button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md">{t('save')}</button>
          </div>
        </form>
      </div>
      <NumpadModal
        isOpen={numpadConfig.isOpen}
        onClose={closeNumpad}
        onConfirm={handleNumpadConfirm}
        initialValue={numpadConfig.initialValue}
        title={numpadConfig.title}
        t={t}
        allowDecimal={numpadConfig.allowDecimal}
      />
    </>
  );
};

export default InventoryFormModal;