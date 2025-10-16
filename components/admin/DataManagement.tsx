import React, { useRef } from 'react';
import { ArrowDownTrayIcon, ArrowUpTrayIcon } from '../icons';

interface DataManagementProps {
  onExport: () => void;
  onImport: (file: File) => void;
  t: (key: string) => string;
}

const DataManagement: React.FC<DataManagementProps> = ({ onExport, onImport, t }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImport(file);
      // Reset file input to allow importing the same file again
      event.target.value = '';
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">{t('dataManagement')}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <ArrowDownTrayIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{t('exportData')}</h3>
            </div>
          </div>
          <p className="text-gray-600 my-4">
            {t('exportDescription')}
          </p>
          <button
            onClick={onExport}
            className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center gap-2"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            {t('exportData')}
          </button>
        </div>

        {/* Import Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-full">
              <ArrowUpTrayIcon className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{t('importData')}</h3>
            </div>
          </div>
          <p className="text-gray-600 my-4">
            {t('importDescription')}
          </p>
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 rounded-r-lg text-sm mb-4">
            <strong>{t('importWarning')}</strong>
          </div>
          <button
            onClick={handleImportClick}
            className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition duration-300 flex items-center justify-center gap-2"
          >
            <ArrowUpTrayIcon className="w-5 h-5" />
            {t('selectFile')}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="application/json"
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
