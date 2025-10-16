import React, { useState, useEffect, useRef, useMemo } from 'react';
// Fix: Corrected import path for types.
import { InventoryItem, UserRole, Category } from '../../types';
import { PlusCircleIcon, PencilIcon, TrashIcon, Bars3Icon, MagnifyingGlassIcon, ExclamationTriangleIcon } from '../icons';

interface InventoryManagementProps {
  inventory: InventoryItem[];
  categories: Category[];
  onAdd: () => void;
  onEdit: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  t: (key: string) => string;
  currentUserRole: UserRole;
  onSaveOrder: (inventory: InventoryItem[]) => void;
}

const InventoryManagement: React.FC<InventoryManagementProps> = ({ inventory, categories, onAdd, onEdit, onDelete, t, currentUserRole, onSaveOrder }) => {
    const [localInventory, setLocalInventory] = useState<InventoryItem[]>([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const draggedItem = useRef<InventoryItem | null>(null);
    const dragOverItem = useRef<InventoryItem | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);

    useEffect(() => {
        setLocalInventory(inventory);
        setHasChanges(false);
    }, [inventory]);
    
    const filteredAndGroupedInventory = useMemo(() => {
        const filtered = localInventory.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        
        const grouped = new Map<string, InventoryItem[]>();
        categories.forEach(cat => grouped.set(cat.id, []));
        
        filtered.forEach(item => {
            const group = grouped.get(item.categoryId);
            if(group) {
                group.push(item);
            } else {
                 // Fallback for items with no category
                if(!grouped.has('uncategorized')) grouped.set('uncategorized', []);
                grouped.get('uncategorized')?.push(item);
            }
        });
        
        return grouped;

    }, [localInventory, searchTerm, categories]);


    const handleDragStart = (item: InventoryItem) => {
        draggedItem.current = item;
    };
    
    const handleDragEnter = (item: InventoryItem) => {
        dragOverItem.current = item;
        setDragOverId(item.id);
    };

    const handleDrop = () => {
        if (!draggedItem.current || !dragOverItem.current || draggedItem.current.id === dragOverItem.current.id) {
            handleDragEnd();
            return;
        };

        const inventoryClone = [...localInventory];
        const draggedItemIndex = inventoryClone.findIndex(i => i.id === draggedItem.current!.id);
        const dragOverItemIndex = inventoryClone.findIndex(i => i.id === dragOverItem.current!.id);

        // Only allow reordering within the same category
        if (inventoryClone[draggedItemIndex].categoryId === inventoryClone[dragOverItemIndex].categoryId) {
            const movedItem = inventoryClone.splice(draggedItemIndex, 1)[0];
            inventoryClone.splice(dragOverItemIndex, 0, movedItem);
            
            setLocalInventory(inventoryClone);
            setHasChanges(true);
        }
        
        handleDragEnd();
    };

    const handleDragEnd = () => {
        draggedItem.current = null;
        dragOverItem.current = null;
        setDragOverId(null);
    };

    const handleSaveChanges = () => {
        onSaveOrder(localInventory);
        setHasChanges(false);
    };

    const handleCancelChanges = () => {
        setLocalInventory(inventory);
        setHasChanges(false);
    };
    
    return (
        <div className="p-6 h-full flex flex-col">
            <div className="flex-shrink-0 flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{t('inventoryManagement')}</h2>
                <div className="flex items-center gap-2">
                    {hasChanges && (
                        <>
                            <button onClick={handleCancelChanges} className="bg-gray-500 text-white px-4 py-2 rounded-lg">{t('cancel')}</button>
                            <button onClick={handleSaveChanges} className="bg-blue-600 text-white px-4 py-2 rounded-lg">{t('saveOrder')}</button>
                        </>
                    )}
                    {currentUserRole === 'ADMIN' && (
                        <button onClick={onAdd} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                            <PlusCircleIcon className="w-5 h-5" />{t('addNewStock')}
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-shrink-0 mb-4">
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder={t('searchInventory')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>
            </div>

            <div className="flex-grow bg-white rounded-lg shadow overflow-y-auto">
                 <div className="space-y-4 p-2">
                    {categories.map(category => {
                        const items = filteredAndGroupedInventory.get(category.id) || [];
                        if (items.length === 0 && searchTerm) return null;

                        const hasLowStock = items.some(item => item.quantity <= item.lowStockThreshold);

                        return (
                            <details key={category.id} className="bg-gray-50 rounded-lg" open>
                                <summary className="p-3 font-bold text-lg cursor-pointer flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        {category.name}
                                        <span className="text-sm font-normal text-gray-500">({items.length} {t('items')})</span>
                                        {/* Fix: Wrap icon in a span to apply the title attribute correctly, resolving a TypeScript error where 'title' is not a valid prop for the SVG component. */}
                                        {hasLowStock && <span title={t('lowStockAlert')}><ExclamationTriangleIcon className="w-5 h-5 text-red-500" /></span>}
                                    </div>
                                </summary>
                                <div className="overflow-x-auto border-t">
                                    <table className="min-w-full">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="w-10"></th>
                                                <th className="p-3 text-left">{t('name')}</th>
                                                <th className="p-3 text-left">{t('quantity')}</th>
                                                <th className="p-3 text-left">{t('threshold')}</th>
                                                <th className="w-32"></th>
                                            </tr>
                                        </thead>
                                        <tbody onDragEnd={handleDragEnd}>
                                            {items.map((item) => {
                                                const isLowOnStock = item.quantity <= item.lowStockThreshold;
                                                return (
                                                <tr 
                                                    key={item.id} 
                                                    draggable
                                                    onDragStart={() => handleDragStart(item)}
                                                    onDragEnter={() => handleDragEnter(item)}
                                                    onDragOver={(e) => e.preventDefault()}
                                                    onDrop={handleDrop}
                                                    className={`border-b transition-colors ${isLowOnStock ? 'bg-red-50' : ''} ${dragOverId === item.id ? 'bg-blue-100' : ''}`}
                                                >
                                                    <td className="p-3 text-center text-gray-400 cursor-move" title={t('dragHandle')}>
                                                        <Bars3Icon className="w-5 h-5 inline-block" />
                                                    </td>
                                                    <td className="p-3">{item.name}</td>
                                                    <td className={`p-3 ${isLowOnStock ? 'text-red-600 font-bold' : ''}`}>{item.quantity} {item.unit}</td>
                                                    <td className="p-3">{item.lowStockThreshold} {item.unit}</td>
                                                    <td className="p-3 flex gap-2">
                                                    <button onClick={() => onEdit(item)} className="text-blue-600"><PencilIcon className="w-5 h-5" /></button>
                                                    {currentUserRole === 'ADMIN' && (
                                                        <button onClick={() => onDelete(item.id)} className="text-red-600"><TrashIcon className="w-5 h-5" /></button>
                                                    )}
                                                    </td>
                                                </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </details>
                        )
                    })}
                 </div>
            </div>
        </div>
    );
};

export default InventoryManagement;