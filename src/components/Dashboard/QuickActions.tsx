import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import TransactionModal from '../Transactions/TransactionModal';

const QuickActions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>('expense');

  const handleQuickAction = (type: 'income' | 'expense') => {
    setTransactionType(type);
    setIsModalOpen(true);
    setIsOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bottom-12 sm:bottom-16 right-0 space-y-2 sm:space-y-3"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickAction('income')}
                className="flex items-center space-x-2 sm:space-x-3 bg-emerald-500 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow text-sm sm:text-base"
              >
                <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium">Add Income</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleQuickAction('expense')}
                className="flex items-center space-x-2 sm:space-x-3 bg-red-500 text-white px-3 py-2 sm:px-4 sm:py-3 rounded-full shadow-lg hover:shadow-xl transition-shadow text-sm sm:text-base"
              >
                <ArrowDownLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium">Add Expense</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center ${
            isOpen ? 'rotate-45' : ''
          }`}
        >
          {isOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Plus className="w-5 h-5 sm:w-6 sm:h-6" />}
        </motion.button>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialType={transactionType}
      />
    </>
  );
};

export default QuickActions;