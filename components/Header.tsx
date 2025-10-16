import React from 'react';
import { KeyIcon } from './icons';
// Fix: Corrected import path for types.
import { Language } from '../types';

interface HeaderProps {
  lang: Language;
  toggleLang: () => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onOpenDrawer: () => void;
  t: (key: string) => string;
}

const Header: React.FC<HeaderProps> = ({ lang, toggleLang, searchTerm, setSearchTerm, onOpenDrawer, t }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-20">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-gray-800">Restro POS</h1>
          </div>
          
          <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-end">
            {/* Search bar removed as per user request */}
          </div>

          <div className="flex items-center space-x-2 rtl:space-x-reverse">
             <button
                onClick={onOpenDrawer}
                title={t('openCashDrawer')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold p-2 rounded-lg transition duration-300"
            >
                <KeyIcon className="w-6 h-6" />
            </button>
             <button
                onClick={toggleLang}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg transition duration-300 text-sm"
            >
                {lang === 'ar' ? 'Español' : 'العربية'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;