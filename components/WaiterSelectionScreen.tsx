import React, { useState } from 'react';
import { Waiter } from '../types';
import PinModal from './PinModal';
import { UserCircleIcon } from './icons';

interface WaiterSelectionScreenProps {
  waiters: Waiter[];
  onSelectWaiter: (waiter: Waiter) => void;
  // Fix: Corrected the type for the `t` function to allow for parameters.
  t: (key: string, params?: any) => string;
  restaurantName: string;
  logoUrl?: string;
}

const WaiterSelectionScreen: React.FC<WaiterSelectionScreenProps> = ({ waiters, onSelectWaiter, t, restaurantName, logoUrl }) => {
  const [selectedWaiter, setSelectedWaiter] = useState<Waiter | null>(null);
  const [isPinModalOpen, setPinModalOpen] = useState(false);

  const handleWaiterClick = (waiter: Waiter) => {
    setSelectedWaiter(waiter);
    setPinModalOpen(true);
  };

  const handlePinConfirm = (pin: string) => {
    if (selectedWaiter && selectedWaiter.pin === pin) {
      onSelectWaiter(selectedWaiter);
      setPinModalOpen(false);
      setSelectedWaiter(null);
    } else {
      alert('Incorrect PIN');
      // Keep modal open for another try
    }
  };

  const handleClosePinModal = () => {
    setPinModalOpen(false);
    setSelectedWaiter(null);
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen bg-slate-800 text-white">
        {logoUrl && <img src={logoUrl} alt="Restaurant Logo" className="w-32 h-32 mb-4 object-contain rounded-full bg-white p-2 shadow-lg" />}
        <h1 className="text-4xl font-bold mb-2">{restaurantName}</h1>
        <h2 className="text-2xl font-semibold text-slate-300 mb-8">{t('selectYourProfile')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-6">
          {waiters.map(waiter => (
            <button
              key={waiter.id}
              onClick={() => handleWaiterClick(waiter)}
              className="flex flex-col items-center p-6 bg-slate-700 rounded-lg shadow-md hover:shadow-xl hover:bg-slate-600 transition-all duration-200"
            >
              <UserCircleIcon className="w-20 h-20 text-slate-400 mb-3" />
              <span className="text-lg font-semibold text-slate-100">{waiter.name}</span>
              <span className="text-sm text-slate-400">{t(waiter.role.toLowerCase())}</span>
            </button>
          ))}
        </div>
      </div>
      <PinModal
        isOpen={isPinModalOpen}
        onClose={handleClosePinModal}
        onConfirm={handlePinConfirm}
        t={t}
        title={t('enterPinFor', { name: selectedWaiter?.name || '' })}
      />
    </>
  );
};

export default WaiterSelectionScreen;