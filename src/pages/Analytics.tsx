import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import CategoryAnalytics from '../components/Analytics/CategoryAnalytics';
import IncomeExpenseChart from '../components/Charts/IncomeExpenseChart';
import IncomeExpenseBreakdownChart from '../components/Charts/IncomeExpenseBreakdownChart';
import { useState, useMemo } from 'react';
import { formatCurrency } from '../utils/currency';
import { format, startOfMonth, endOfMonth, subMonths, eachMonthOfInterval } from 'date-fns';
import { TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

const Analytics = () => {
  const { user } = useAuth();
  const { transactions, loading } = useTransactions(user?.id || '');
  const { categories } = useCategories(user?.id || '');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  const analyticsData = useMemo(() => {
    const currentMonth = new Date();
    const startOfCurrentMonth = startOfMonth(currentMonth);
    const endOfCurrentMonth = endOfMonth(currentMonth);

    // Current month transactions
    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = t.date.toDate();
      return transactionDate >= startOfCurrentMonth && transactionDate <= endOfCurrentMonth;
    });

    // Category breakdown for both income and expenses
    const categoryMap = new Map();
    categories.forEach(cat => categoryMap.set(cat.id, cat));

    const transactionsByCategory = currentMonthTransactions.reduce((acc, t) => {
      const category = categoryMap.get(t.categoryId);
      const categoryName = category?.name || 'Other';
      const categoryColor = category?.color || '#6B7280';
      
      if (!acc[categoryName]) {
        acc[categoryName] = { 
          income: 0, 
          expense: 0, 
          color: categoryColor,
          type: category?.type || 'expense'
        };
      }
      
      if (t.type === 'income') {
        acc[categoryName].income += t.amount;
      } else {
        acc[categoryName].expense += t.amount;
      }
      
      return acc;
    }, {} as Record<string, { income: number; expense: number; color: string; type: string }>);

    const chartData = Object.entries(transactionsByCategory)
      .filter(([_, data]) => data.income > 0 || data.expense > 0)
      .map(([name, data]) => ({
        name,
        income: data.income,
        expense: data.expense,
        total: data.income + data.expense,
        color: data.color,
        type: data.type
      }))
      .sort((a, b) => b.total - a.total);

    // Generate income/expense chart data for last 6 months
    const sixMonthsAgo = subMonths(currentMonth, 5);
    const monthsRange = eachMonthOfInterval({
      start: startOfMonth(sixMonthsAgo),
      end: endOfCurrentMonth
    });

    const incomeExpenseData = monthsRange.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthTransactions = transactions.filter(t => {
        const transactionDate = t.date.toDate();
        return transactionDate >= monthStart && transactionDate <= monthEnd;
      });

      const monthIncome = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const monthExpenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        month: format(month, 'MMM yyyy'),
        income: monthIncome,
        expenses: monthExpenses,
        netBalance: monthIncome - monthExpenses
      };
    });

    const totalIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      chartData,
      incomeExpenseData,
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      transactionCount: currentMonthTransactions.length
    };
  }, [transactions, categories]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Analytics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
          Detailed insights into your financial patterns
        </p>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl p-4 sm:p-6 text-white"
        >
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />
            <span className="text-xs sm:text-sm opacity-90">This Month</span>
          </div>
          <h3 className="text-lg sm:text-2xl font-bold mb-1">{formatCurrency(analyticsData.totalIncome)}</h3>
          <p className="text-xs sm:text-sm opacity-90">Total Income</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-r from-red-500 to-pink-600 rounded-xl p-4 sm:p-6 text-white"
        >
          <div className="flex items-center justify-between mb-3">
            <TrendingDown className="w-6 h-6 sm:w-8 sm:h-8" />
            <span className="text-xs sm:text-sm opacity-90">This Month</span>
          </div>
          <h3 className="text-lg sm:text-2xl font-bold mb-1">{formatCurrency(analyticsData.totalExpenses)}</h3>
          <p className="text-xs sm:text-sm opacity-90">Total Expenses</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={`rounded-xl p-4 sm:p-6 text-white ${
            analyticsData.netBalance >= 0 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600'
              : 'bg-gradient-to-r from-orange-500 to-red-600'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8" />
            <span className="text-xs sm:text-sm opacity-90">Net</span>
          </div>
          <h3 className="text-lg sm:text-2xl font-bold mb-1">{formatCurrency(Math.abs(analyticsData.netBalance))}</h3>
          <p className="text-xs sm:text-sm opacity-90">{analyticsData.netBalance >= 0 ? 'Savings' : 'Deficit'}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gradient-to-r from-indigo-500 to-cyan-600 rounded-xl p-4 sm:p-6 text-white"
        >
          <div className="flex items-center justify-between mb-3">
            <PieChartIcon className="w-6 h-6 sm:w-8 sm:h-8" />
            <span className="text-xs sm:text-sm opacity-90">Count</span>
          </div>
          <h3 className="text-lg sm:text-2xl font-bold mb-1">{analyticsData.transactionCount}</h3>
          <p className="text-xs sm:text-sm opacity-90">Transactions</p>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <IncomeExpenseChart
          data={analyticsData.incomeExpenseData}
          chartType={chartType}
          onChartTypeChange={setChartType}
        />
        
        <IncomeExpenseBreakdownChart
          data={analyticsData.chartData}
          title="Category Breakdown"
        />
      </div>

      {/* Category Analytics */}
      <CategoryAnalytics 
        transactions={transactions}
        categories={categories}
      />
    </div>
  );
};

export default Analytics;
