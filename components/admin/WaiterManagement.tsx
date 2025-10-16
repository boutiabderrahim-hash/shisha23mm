
import React from 'react';
// Fix: Corrected import path for types.
import { Waiter } from '../../types';
import { PlusCircleIcon, PencilIcon, TrashIcon } from '../icons';

interface WaiterManagementProps {
  waiters: Waiter[];
  onAdd: () => void;
  onEdit: (waiter: Waiter) => void;
  onDelete: (id: string) => void;
  t: (key: string) => string;
}

const WaiterManagement: React.FC<WaiterManagementProps> = ({ waiters, onAdd, onEdit, onDelete, t }) => (
  <div className="p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">{t('waiterManagement')}</h2>
      <button onClick={onAdd} className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
        <PlusCircleIcon className="w-5 h-5" />{t('addNewWaiter')}
      </button>
    </div>
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">{t('name')}</th>
            <th className="w-32"></th>
          </tr>
        </thead>
        <tbody>
          {waiters.length > 0 ? (
            waiters.map(waiter => (
              <tr key={waiter.id} className="border-b">
                <td className="p-3">{waiter.name}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => onEdit(waiter)} className="text-blue-600"><PencilIcon className="w-5 h-5" /></button>
                  <button onClick={() => onDelete(waiter.id)} className="text-red-600"><TrashIcon className="w-5 h-5" /></button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} className="text-center p-6 text-gray-500">{t('noDataAvailable')}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

export default WaiterManagement;