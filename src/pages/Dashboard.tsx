import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTransactions } from '../hooks/useTransactions';
import { useCategories } from '../hooks/useCategories';
import StatsCard from '../components/Dashboard/StatsCard';
import IncomeExpenseChart from '../components/Charts/IncomeExpenseChart';
import IncomeExpenseBreakdownChart from '../components/Charts/IncomeExpenseBreakdownChart';
import CategoryAnalytics from '../components/Analytics/CategoryAnalytics';
import QuickActions from '../components/Dashboard/QuickActions';
import { formatCurrency } from '../utils/currency';
import { format, startOfMonth, endOfMonth, subMonths, eachMonthOfInterval } from 'date-fns';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { transactions, loading } = useTransactions(user?.id || '');
  const { categories } = useCategories(user?.id || '');
  const [chartType, setChartType] = React.useState<'line' | 'bar'>('line');

  const dashboardStats = useMemo(() => {
    const currentMonth = new Date();
    const startOfCurrentMonth = startOfMonth(currentMonth);
    const endOfCurrentMonth = endOfMonth(currentMonth);
    const startOfLastMonth = startOfMonth(subMonths(currentMonth, 1));
    const endOfLastMonth = endOfMonth(subMonths(currentMonth, 1));

    // Current month transactions
    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = t.date.toDate();
      return transactionDate >= startOfCurrentMonth && transactionDate <= endOfCurrentMonth;
    });

    // Last month transactions
    const lastMonthTransactions = transactions.filter(t => {
      const transactionDate = t.date.toDate();
      return transactionDate >= startOfLastMonth && transactionDate <= endOfLastMonth;
    });

    // Calculate totals
    const currentIncome = currentMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const currentExpenses = currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const lastIncome = lastMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const lastExpenses = lastMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = currentIncome - currentExpenses;
    const lastBalance = lastIncome - lastExpenses;

    // Calculate percentage changes
    const incomeChange = lastIncome > 0 ? ((currentIncome - lastIncome) / lastIncome) * 100 : 0;
    const expenseChange = lastExpenses > 0 ? ((currentExpenses - lastExpenses) / lastExpenses) * 100 : 0;
    const balanceChange = lastBalance > 0 ? ((balance - lastBalance) / lastBalance) * 100 : 0;

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

    return {
      totalIncome: currentIncome,
      totalExpenses: currentExpenses,
      balance,
      incomeChange,
      expenseChange,
      balanceChange,
      transactionCount: currentMonthTransactions.length,
      chartData,
      incomeExpenseData
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
    <div className="space-y-4 sm:space-y-6 pb-20 sm:pb-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 sm:mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.displayName || 'User'}! 👋
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Here's your financial overview for {format(new Date(), 'MMMM yyyy')}
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <StatsCard
          title="Total Income"
          value={formatCurrency(dashboardStats.totalIncome)}
          change={`${dashboardStats.incomeChange > 0 ? '+' : ''}${dashboardStats.incomeChange.toFixed(1)}%`}
          changeType={dashboardStats.incomeChange >= 0 ? 'positive' : 'negative'}
          icon={TrendingUp}
          gradient="bg-gradient-to-r from-emerald-500 to-green-600"
          delay={0}
        />
        
        <StatsCard
          title="Total Expenses"
          value={formatCurrency(dashboardStats.totalExpenses)}
          change={`${dashboardStats.expenseChange > 0 ? '+' : ''}${dashboardStats.expenseChange.toFixed(1)}%`}
          changeType={dashboardStats.expenseChange <= 0 ? 'positive' : 'negative'}
          icon={TrendingDown}
          gradient="bg-gradient-to-r from-red-500 to-pink-600"
          delay={0.1}
        />
        
        <StatsCard
          title="Net Balance"
          value={formatCurrency(dashboardStats.balance)}
          change={`${dashboardStats.balanceChange > 0 ? '+' : ''}${dashboardStats.balanceChange.toFixed(1)}%`}
          changeType={dashboardStats.balance >= 0 ? 'positive' : 'negative'}
          icon={Wallet}
          gradient="bg-gradient-to-r from-blue-500 to-purple-600"
          delay={0.2}
        />
        
        <StatsCard
          title="Transactions"
          value={dashboardStats.transactionCount.toString()}
          change="This month"
          changeType="neutral"
          icon={DollarSign}
          gradient="bg-gradient-to-r from-orange-500 to-yellow-600"
          delay={0.3}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <IncomeExpenseChart
          data={dashboardStats.incomeExpenseData}
          chartType={chartType}
          onChartTypeChange={setChartType}
        />
        
        <IncomeExpenseBreakdownChart
          data={dashboardStats.chartData}
          title="Income & Expense Breakdown"
        />
      </div>

      {/* Category Analytics */}
      <CategoryAnalytics 
        transactions={transactions}
        categories={categories}
      />

      {/* Recent Transactions Section */}
      <div className="grid grid-cols-1 gap-6">
        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              View All
            </button>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {transactions.slice(0, 5).map((transaction, index) => {
              const category = categories.find(c => c.id === transaction.categoryId);
              return (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between py-2 sm:py-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                >
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${
                      transaction.type === 'income' 
                        ? 'bg-emerald-100 text-emerald-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">{transaction.description}</p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">{category?.name || 'Other'}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`font-semibold text-sm sm:text-base ${
                      transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount).replace('₹', '')}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {format(transaction.date.toDate(), 'MMM dd')}
                    </p>
                  </div>
                </motion.div>
              );
            })}
            
            {transactions.length === 0 && (
              <div className="text-center py-6 sm:py-8 text-gray-500 dark:text-gray-400">
                <p>No transactions yet</p>
                <p className="text-xs sm:text-sm">Add your first transaction to get started</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions FAB */}
      <QuickActions />
    </div>
  );
};

export default Dashboard;