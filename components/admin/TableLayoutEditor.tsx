import React, { useState, useRef, useEffect } from 'react';
// Fix: Corrected import path for types.
import { Table, Language, Area } from '../../types';
import TableSettingsModal from './TableSettingsModal';
import ConfirmationModal from '../ConfirmationModal';
import { PlusCircleIcon } from '../icons';

interface TableLayoutEditorProps {
  tables: Table[];
  onSave: (tables: Table[]) => void;
  t: (key: string) => string;
  lang: Language;
}

const TableLayoutEditor: React.FC<TableLayoutEditorProps> = ({ tables, onSave, t, lang }) => {
  const [layout, setLayout] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isConfirmationOpen, setConfirmationOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<string | null>(null);

  const [dragging, setDragging] = useState<string | null>(null);
  const [resizing, setResizing] = useState<string | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentArea, setCurrentArea] = useState<Area>('Bar');
  const areas: Area[] = ['Bar', 'VIP', 'Barra', 'Gaming'];

  useEffect(() => {
    setLayout(JSON.parse(JSON.stringify(tables)));
  }, [tables]);

  const handleSaveLayout = () => {
    onSave(layout);
    alert(t('layoutSaved'));
  };

  const handleAddTable = () => {
    const numbersInArea = layout.filter(t => t.area === currentArea).map(t => t.number);
    const maxNumber = numbersInArea.length > 0 ? Math.max(...numbersInArea) : 0;
    const newTable: Table = {
      id: `table-new-${Date.now()}`,
      number: maxNumber + 1,
      area: currentArea,
      shape: 'square',
      x: 10,
      y: 10,
      width: 10,
      height: 10,
    };
    setLayout(prev => [...prev, newTable]);
  };

  const handleTableMouseDown = (e: React.MouseEvent<HTMLDivElement>, tableId: string) => {
    if (e.button !== 0) return;
    e.preventDefault();
    const tableElement = e.currentTarget;
    const rect = tableElement.getBoundingClientRect();
    setDragging(tableId);
    setOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>, tableId: string) => {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    setResizing(tableId);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();

    if (resizing) {
        const table = layout.find(t => t.id === resizing);
        if (!table) return;

        let newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100 - table.x;
        let newHeight = ((e.clientY - containerRect.top) / containerRect.height) * 100 - table.y;
        
        newWidth = Math.max(5, Math.min(newWidth, 100 - table.x));
        newHeight = Math.max(5, Math.min(newHeight, 100 - table.y));
        
        setLayout(prev => prev.map(t => t.id === resizing ? { ...t, width: Math.round(newWidth), height: Math.round(newHeight) } : t));
        return;
    }
    
    if (dragging) {
        const table = layout.find(t => t.id === dragging);
        if(!table) return;

        let newX = ((e.clientX - containerRect.left - offset.x) / containerRect.width) * 100;
        let newY = ((e.clientY - containerRect.top - offset.y) / containerRect.height) * 100;

        newX = Math.max(0, Math.min(newX, 100 - table.width));
        newY = Math.max(0, Math.min(newY, 100 - table.height));

        setLayout(prev =>
          prev.map(t => (t.id === dragging ? { ...t, x: newX, y: newY } : t))
        );
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
    setResizing(null);
  };

  const handleTableClick = (e: React.MouseEvent<HTMLDivElement>, table: Table) => {
    if (e.detail === 2) { // Double click
      setSelectedTable(table);
      setSettingsModalOpen(true);
    }
  };
  
  const handleSaveTableSettings = (updatedTable: Table) => {
    setLayout(prev => prev.map(t => t.id === updatedTable.id ? updatedTable : t));
    setSettingsModalOpen(false);
    setSelectedTable(null);
  };
  
  const handleDeleteTableRequest = (tableId: string) => {
    setTableToDelete(tableId);
    setSettingsModalOpen(false);
    setConfirmationOpen(true);
  };

  const confirmDeleteTable = () => {
    if (tableToDelete) {
        setLayout(prev => prev.filter(t => t.id !== tableToDelete));
    }
    setConfirmationOpen(false);
    setTableToDelete(null);
    setSelectedTable(null);
  };
  
  const tablesInCurrentArea = layout.filter(table => table.area === currentArea);

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex-shrink-0 flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{t('tableSettings')}</h2>
        <div className="flex items-center gap-3">
            <button onClick={handleAddTable} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <PlusCircleIcon className="w-5 h-5" />{t('addTable')}
            </button>
            <button onClick={handleSaveLayout} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold">
                {t('saveLayout')}
            </button>
        </div>
      </div>
      
      <div className="flex-shrink-0 border-b border-gray-200 mb-2">
        <nav className="-mb-px flex space-x-4 rtl:space-x-reverse px-2" aria-label="Tabs">
            {areas.map((area) => (
            <button
                key={area}
                onClick={() => setCurrentArea(area)}
                className={`${
                currentArea === area
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm`}
            >
                {t(area.toLowerCase())}
            </button>
            ))}
        </nav>
      </div>

      <div className="flex-grow bg-white rounded-lg shadow-inner p-2">
        <div 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full h-full bg-gray-200 rounded-md relative overflow-hidden border-2 border-dashed"
            style={{
                backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
            }}
        >
            {tablesInCurrentArea.map(table => (
            <div
                key={table.id}
                onMouseDown={(e) => handleTableMouseDown(e, table.id)}
                onClick={(e) => handleTableClick(e, table)}
                style={{ 
                    left: `${table.x}%`, 
                    top: `${table.y}%`, 
                    width: `${table.width}%`, 
                    height: `${table.height}%`,
                    cursor: dragging ? 'grabbing' : 'grab',
                }}
                className={`absolute flex items-center justify-center font-bold text-white shadow-inner select-none transition-shadow ${table.shape === 'circle' ? 'rounded-full' : 'rounded-md'} ${dragging === table.id ? 'shadow-2xl z-10 scale-105' : 'shadow-md'} ${table.shape === 'fixture' ? 'bg-gray-500 border-gray-700' : 'bg-amber-700 border-amber-900'}`}
                title={`Double click to edit`}
            >
                {table.shape !== 'fixture' && table.number}
                 <div
                    onMouseDown={(e) => handleResizeMouseDown(e, table.id)}
                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-white border-2 border-slate-700 rounded-full cursor-se-resize z-20"
                    title="Resize"
                />
            </div>
            ))}
        </div>
      </div>
      <TableSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
        onSave={handleSaveTableSettings}
        onDelete={handleDeleteTableRequest}
        table={selectedTable}
        t={t}
      />
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={() => confirmDeleteTable()}
        title={t('confirmDeletion')}
        message={t('areYouSureDelete')}
        t={t}
        lang={lang}
      />
    </div>
  );
};

export default TableLayoutEditor;