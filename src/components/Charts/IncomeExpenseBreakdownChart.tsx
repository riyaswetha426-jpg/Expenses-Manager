import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

interface ChartData {
  name: string;
  income: number;
  expense: number;
  total: number;
  color: string;
  type: string;
}

interface IncomeExpenseBreakdownChartProps {
  data: ChartData[];
  title: string;
}

const IncomeExpenseBreakdownChart: React.FC<IncomeExpenseBreakdownChartProps> = ({ data, title }) => {
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');
  const [viewType, setViewType] = useState<'total' | 'separate'>('total');

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
          <p className="font-semibold text-gray-900 dark:text-white">{data.name}</p>
          {viewType === 'total' ? (
            <p className="text-blue-600 dark:text-blue-400">
              Total: {formatCurrency(data.total)}
            </p>
          ) : (
            <>
              <p className="text-green-600 dark:text-green-400">
                Income: {formatCurrency(data.income)}
              </p>
              <p className="text-red-600 dark:text-red-400">
                Expense: {formatCurrency(data.expense)}
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  const pieData = viewType === 'total' 
    ? data.filter(item => item.total > 0).map(item => ({
        name: item.name,
        value: item.total,
        color: item.color
      }))
    : [
        ...data.filter(item => item.income > 0).map(item => ({
          name: `${item.name} (Income)`,
          value: item.income,
          color: '#10B981'
        })),
        ...data.filter(item => item.expense > 0).map(item => ({
          name: `${item.name} (Expense)`,
          value: item.expense,
          color: '#EF4444'
        }))
      ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 shadow-sm"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {/* View Type Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewType('total')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewType === 'total'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Total
            </button>
            <button
              onClick={() => setViewType('separate')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewType === 'separate'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              Separate
            </button>
          </div>

          {/* Chart Type Toggle */}
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setChartType('pie')}
              className={`p-2 rounded-lg transition-colors ${
                chartType === 'pie'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <PieChartIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`p-2 rounded-lg transition-colors ${
                chartType === 'bar'
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {data.length > 0 ? (
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'pie' ? (
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={window.innerWidth < 640 ? 60 : 80}
                  innerRadius={window.innerWidth < 640 ? 20 : 30}
                  paddingAngle={2}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value, entry: any) => (
                    <span style={{ color: entry.color, fontSize: window.innerWidth < 640 ? '12px' : '14px' }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            ) : (
              <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  fontSize={window.innerWidth < 640 ? 10 : 12}
                  angle={window.innerWidth < 640 ? -45 : 0}
                  textAnchor={window.innerWidth < 640 ? 'end' : 'middle'}
                  height={window.innerWidth < 640 ? 60 : 30}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={window.innerWidth < 640 ? 10 : 12}
                  tickFormatter={(value) => `₹${value.toLocaleString()}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {viewType === 'total' ? (
                  <Bar 
                    dataKey="total" 
                    fill="#3B82F6" 
                    radius={[4, 4, 0, 0]}
                    name="Total Amount"
                  />
                ) : (
                  <>
                    <Bar 
                      dataKey="income" 
                      fill="#10B981" 
                      radius={[4, 4, 0, 0]}
                      name="Income"
                    />
                    <Bar 
                      dataKey="expense" 
                      fill="#EF4444" 
                      radius={[4, 4, 0, 0]}
                      name="Expense"
                    />
                  </>
                )}
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <PieChartIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No data to display</p>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default IncomeExpenseBreakdownChart;
