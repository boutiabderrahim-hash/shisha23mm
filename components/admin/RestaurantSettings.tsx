import React, { useState, useEffect } from 'react';
import { RestaurantSettings } from '../../types';

interface RestaurantSettingsProps {
  settings: RestaurantSettings;
  onSave: (settings: RestaurantSettings) => void;
  t: (key: string) => string;
}

const RestaurantSettingsComp: React.FC<RestaurantSettingsProps> = ({ settings, onSave, t }) => {
  const [formData, setFormData] = useState(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    alert('Settings saved!');
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">{t('restaurantSettings')}</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow max-w-lg mx-auto">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">{t('name')}</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border p-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">{t('logoUrl')}</label>
            <input
              type="text"
              name="logoUrl"
              value={formData.logoUrl || ''}
              onChange={handleChange}
              className="w-full border p-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">{t('address')}</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border p-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">{t('phone')}</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border p-2 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">{t('footer')}</label>
            <textarea
              name="footer"
              value={formData.footer}
              onChange={handleChange}
              rows={3}
              className="w-full border p-2 rounded-md"
            />
          </div>
        </div>
        <div className="mt-6 text-right">
          <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-md font-semibold">
            {t('save')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RestaurantSettingsComp;