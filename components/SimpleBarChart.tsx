import React from 'react';
import { formatCurrency } from '../utils/helpers';

interface SimpleBarChartProps {
  title: string;
  data: any[];
  t: (key: string) => string;
  labelKey?: string;
  valueKey?: string;
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({ title, data, t, labelKey = 'name', valueKey = 'total' }) => {
    const maxValue = Math.max(...data.map(item => item[valueKey]), 1); // Avoid division by zero
    return (
        <div className="bg-white p-4 rounded-lg shadow h-full flex flex-col">
            <h3 className="font-bold text-lg mb-4">{title}</h3>
            <div className="space-y-3 flex-grow">
                {data.length > 0 ? data.map((item, index) => (
                    <div key={index} className="grid grid-cols-3 items-center gap-2 text-sm">
                        <div className="truncate font-semibold">{item[labelKey]}</div>
                        <div className="col-span-2">
                             <div className="w-full bg-gray-200 rounded-full h-5 relative">
                                <div 
                                    className="bg-blue-500 h-5 rounded-full"
                                    style={{ width: `${(item[valueKey] / maxValue) * 100}%` }}
                                ></div>
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white px-2">{formatCurrency(item[valueKey])}</span>
                            </div>
                        </div>
                    </div>
                )) : <p className="text-gray-500 text-sm">{t('noDataAvailable')}</p>}
            </div>
        </div>
    );
};

export default SimpleBarChart;
