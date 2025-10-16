
import React, { useState, useEffect } from 'react';
import { Table, Area } from '../../types';
import { XMarkIcon, TrashIcon } from '../icons';

interface TableSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (table: Table) => void;
  onDelete: (tableId: string) => void;
  table: Table | null;
  t: (key: string) => string;
}

const TableSettingsModal: React.FC<TableSettingsModalProps> = ({ isOpen, onClose, onSave, onDelete, table, t }) => {
  const [formData, setFormData] = useState<Table | null>(null);

  useEffect(() => {
    if (table) {
      setFormData(JSON.parse(JSON.stringify(table)));
    }
  }, [table]);

  if (!isOpen || !formData) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const parsedValue = ['number', 'width', 'height'].includes(name) ? parseInt(value, 10) || 0 : value;
    setFormData(prev => prev ? { ...prev, [name]: parsedValue } : null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      onSave(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-sm">
        <div className="p-4 border-b font-bold flex justify-between items-center">
            {t('editTable')} #{formData.number}
            <button type="button" onClick={onClose}><XMarkIcon className="w-6 h-6" /></button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm">{t('tableNumber')}</label>
            <input name="number" type="number" value={formData.number} onChange={handleChange} required className="w-full border p-2 rounded-md" />
          </div>
          <div>
            <label className="block text-sm">{t('area')}</label>
            <select name="area" value={formData.area} onChange={handleChange} className="w-full border p-2 rounded-md">
                <option value="Bar">{t('bar')}</option>
                <option value="VIP">{t('vip')}</option>
                <option value="Barra">{t('barra')}</option>
                <option value="Gaming">{t('gaming')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm">{t('shape')}</label>
             <div className="grid grid-cols-2 gap-2 mt-1">
                <label className="flex items-center"><input type="radio" name="shape" value="square" checked={formData.shape === 'square'} onChange={handleChange} className="mr-2"/>{t('square')}</label>
                <label className="flex items-center"><input type="radio" name="shape" value="circle" checked={formData.shape === 'circle'} onChange={handleChange} className="mr-2"/>{t('circle')}</label>
                <label className="flex items-center"><input type="radio" name="shape" value="rectangle" checked={formData.shape === 'rectangle'} onChange={handleChange} className="mr-2"/>{t('rectangle')}</label>
                {/* Fix: Changed translation key to 'barShape' to resolve conflict with 'bar' area. */}
                <label className="flex items-center"><input type="radio" name="shape" value="bar" checked={formData.shape === 'bar'} onChange={handleChange} className="mr-2"/>{t('barShape')}</label>
                <label className="flex items-center"><input type="radio" name="shape" value="fixture" checked={formData.shape === 'fixture'} onChange={handleChange} className="mr-2"/>{t('fixture')}</label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm">{t('width')} (%)</label>
                <input name="width" type="number" value={formData.width} onChange={handleChange} required className="w-full border p-2 rounded-md" min="5" max="100"/>
            </div>
             <div>
                <label className="block text-sm">{t('height')} (%)</label>
                <input name="height" type="number" value={formData.height} onChange={handleChange} required className="w-full border p-2 rounded-md" min="5" max="100"/>
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-50 flex justify-between items-center gap-2">
          <button type="button" onClick={() => onDelete(formData.id)} className="px-4 py-2 bg-red-600 text-white rounded-md flex items-center gap-2"><TrashIcon className="w-5 h-5"/> {t('delete')}</button>
          <div className="flex-grow"></div>
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">{t('cancel')}</button>
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md">{t('save')}</button>
        </div>
      </form>
    </div>
  );
};

export default TableSettingsModal;