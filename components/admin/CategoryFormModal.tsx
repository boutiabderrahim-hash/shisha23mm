

import React, { useState, useEffect } from 'react';
// Fix: Corrected import path for types.
import { Category } from '../../types';

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Category) => void;
  category: Category | null;
  t: (key: string) => string;
}

const CategoryFormModal: React.FC<CategoryFormModalProps> = ({ isOpen, onClose, onSave, category, t }) => {
  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName(category?.name || '');
      setImageUrl(category?.imageUrl || '');
    }
  }, [category, isOpen]);
  
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ id: category?.id || '', name, imageUrl });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b font-bold">{category ? t('editCategory') : t('addNewCategory')}</div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm">{t('name')}</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="w-full border p-2 rounded-md"
              autoFocus
            />
          </div>
           <div>
            <label className="block text-sm">{t('imageURL')}</label>
            <input
              type="text"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              className="w-full border p-2 rounded-md"
              placeholder="https://example.com/image.png"
            />
          </div>
        </div>
        <div className="p-4 bg-gray-50 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">{t('cancel')}</button>
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md">{t('save')}</button>
        </div>
      </form>
    </div>
  );
};

export default CategoryFormModal;