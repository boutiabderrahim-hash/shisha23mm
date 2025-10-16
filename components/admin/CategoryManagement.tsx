
import React, { useState, useEffect, useRef } from 'react';
// Fix: Corrected import path for types.
import { Category } from '../../types';
import { PlusCircleIcon, PencilIcon, TrashIcon, Bars3Icon } from '../icons';

interface CategoryManagementProps {
  categories: Category[];
  onAdd: () => void;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  t: (key: string) => string;
  onSaveOrder: (categories: Category[]) => void;
}

const CategoryManagement: React.FC<CategoryManagementProps> = ({ categories, onAdd, onEdit, onDelete, t, onSaveOrder }) => {
    const [localCategories, setLocalCategories] = useState<Category[]>([]);
    const [hasChanges, setHasChanges] = useState(false);
    
    const draggedItemIndex = useRef<number | null>(null);
    const dragOverItemIndex = useRef<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);


    useEffect(() => {
        setLocalCategories(categories);
        setHasChanges(false);
    }, [categories]);

    const handleDragStart = (index: number) => {
        draggedItemIndex.current = index;
    };
    
    const handleDragEnter = (index: number) => {
        dragOverItemIndex.current = index;
        setDragOverIndex(index);
    };

    const handleDrop = () => {
        if (draggedItemIndex.current === null || dragOverItemIndex.current === null) return;
        
        const categoriesClone = [...localCategories];
        const draggedItem = categoriesClone.splice(draggedItemIndex.current, 1)[0];
        categoriesClone.splice(dragOverItemIndex.current, 0, draggedItem);
        
        setLocalCategories(categoriesClone);
        setHasChanges(true);
        
        draggedItemIndex.current = null;
        dragOverItemIndex.current = null;
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        draggedItemIndex.current = null;
        dragOverItemIndex.current = null;
        setDragOverIndex(null);
    };

    const handleSaveChanges = () => {
        onSaveOrder(localCategories);
        setHasChanges(false);
    };

    const handleCancelChanges = () => {
        setLocalCategories(categories);
        setHasChanges(false);
    };
    
    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{t('categoryManagement')}</h2>
                 <div className="flex items-center gap-2">
                    {hasChanges && (
                        <>
                            <button onClick={handleCancelChanges} className="bg-gray-500 text-white px-4 py-2 rounded-lg">{t('cancel')}</button>
                            <button onClick={handleSaveChanges} className="bg-blue-600 text-white px-4 py-2 rounded-lg">{t('saveOrder')}</button>
                        </>
                    )}
                    <button onClick={onAdd} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                        <PlusCircleIcon className="w-5 h-5" />{t('addNewCategory')}
                    </button>
                 </div>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
                <thead className="bg-gray-100">
                <tr>
                    <th className="w-10"></th>
                    <th className="p-3 text-left w-20">{t('imageURL')}</th>
                    <th className="p-3 text-left">{t('name')}</th>
                    <th className="w-32"></th>
                </tr>
                </thead>
                <tbody onDragEnd={handleDragEnd}>
                {localCategories.length > 0 ? (
                    localCategories.map((cat, index) => (
                    <tr 
                        key={cat.id} 
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragEnter={() => handleDragEnter(index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDrop}
                        className={`border-b transition-colors ${dragOverIndex === index ? 'bg-blue-100' : ''}`}
                    >
                        <td className="p-3 text-center text-gray-400 cursor-move" title={t('dragHandle')}>
                            <Bars3Icon className="w-5 h-5 inline-block" />
                        </td>
                        <td className="p-3">
                            {cat.imageUrl ? (
                                <img src={cat.imageUrl} alt={cat.name} className="w-12 h-12 object-cover rounded-md" />
                            ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-xs text-gray-500">{t('noImage')}</div>
                            )}
                        </td>
                        <td className="p-3">{cat.name}</td>
                        <td className="p-3 flex gap-2">
                        <button onClick={() => onEdit(cat)} className="text-blue-600"><PencilIcon className="w-5 h-5" /></button>
                        <button onClick={() => onDelete(cat.id)} className="text-red-600"><TrashIcon className="w-5 h-5" /></button>
                        </td>
                    </tr>
                    ))
                ) : (
                    <tr>
                    <td colSpan={4} className="text-center p-6 text-gray-500">{t('noDataAvailable')}</td>
                    </tr>
                )}
                </tbody>
            </table>
            </div>
        </div>
    );
};

export default CategoryManagement;