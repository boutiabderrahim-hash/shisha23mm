import React from 'react';
import { Squares2X2Icon, ClipboardDocumentListIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, UserCircleIcon, TicketIcon, SunIcon, MoonIcon } from './icons';

interface SidebarProps {
  activeView: string;
  onNavigate: (view: 'tables' | 'queue' | 'credit' | 'admin') => void;
  onLogout: () => void;
  waiterName: string;
  t: (key: string) => string;
  dayStatus: 'OPEN' | 'CLOSED';
  onOpenDay: () => void;
  onCloseDay: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onNavigate, onLogout, waiterName, t, dayStatus, onOpenDay, onCloseDay }) => {
  const navItems = [
    { id: 'tables' as const, label: t('tables'), icon: Squares2X2Icon },
    { id: 'queue' as const, label: t('orders'), icon: ClipboardDocumentListIcon },
    { id: 'credit' as const, label: t('creditAccounts'), icon: TicketIcon },
  ];
  
  return (
    <div className="w-24 bg-gray-800 text-white flex flex-col items-center py-4">
      <div className="text-xl font-bold text-orange-400 mb-6">R-POS</div>
      
      <div className="flex-grow w-full px-2">
        <div className="flex flex-col items-center space-y-3">
            {navItems.map(item => (
            <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors w-full h-20 ${
                activeView === item.id ? 'bg-orange-500 text-white' : 'hover:bg-gray-700 text-gray-400'
                }`}
                title={item.label}
            >
                <item.icon className="w-7 h-7" />
                <span className="text-xs mt-1 font-semibold">{item.label}</span>
            </button>
            ))}
        </div>
      </div>
      
      <div className="w-full px-2">
         <div className="border-t border-gray-700 w-full mb-4"></div>
         
         {dayStatus === 'OPEN' ? (
             <button onClick={onCloseDay} className="flex flex-col items-center justify-center p-2 rounded-lg transition-colors w-full h-20 mb-4 hover:bg-red-700 text-gray-400" title={t('closeDay')}>
                 <MoonIcon className="w-7 h-7" />
                 <span className="text-xs mt-1 font-semibold">{t('closeDay')}</span>
             </button>
         ) : (
             <button onClick={onOpenDay} className="flex flex-col items-center justify-center p-2 rounded-lg transition-colors w-full h-20 mb-4 hover:bg-green-700 text-gray-400" title={t('openDay')}>
                 <SunIcon className="w-7 h-7" />
                 <span className="text-xs mt-1 font-semibold">{t('openDay')}</span>
             </button>
         )}

         <button
            onClick={() => onNavigate('admin')}
            className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors w-full h-20 mb-4 ${
            activeView === 'admin' ? 'bg-orange-500 text-white' : 'hover:bg-gray-700 text-gray-400'
            }`}
            title={t('admin')}
        >
            <Cog6ToothIcon className="w-7 h-7" />
            <span className="text-xs mt-1 font-semibold">{t('admin')}</span>
        </button>

        <div className="border-t border-gray-700 w-full mb-4"></div>

        <div className="flex flex-col items-center space-y-2 text-center">
            <UserCircleIcon className="w-8 h-8 text-gray-400"/>
            <div className="text-sm font-semibold text-gray-300">{waiterName}</div>
            <button
            onClick={onLogout}
            className="flex items-center justify-center p-2 rounded-lg hover:bg-red-500 hover:text-white text-gray-400 w-full"
            title={t('logout')}
            >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span className="text-xs ms-2">{t('logout')}</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;