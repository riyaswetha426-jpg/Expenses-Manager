import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import ExportModal from '../components/Export/ExportModal';

const Export = () => {
  const [showExportModal, setShowExportModal] = useState(false);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Export Data
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
          Download your financial data in various formats
        </p>
      </motion.div>

      {/* Export Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-sm text-center"
      >
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Download className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Export Your Financial Data
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          Download your transactions, categories, and financial reports in Excel or CSV format.
          Perfect for tax preparation or external analysis.
        </p>
        
        <button
          onClick={() => setShowExportModal(true)}
          className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center space-x-2 mx-auto"
        >
          <Download className="w-5 h-5" />
          <span>Start Export</span>
        </button>

        {/* Export Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Custom Date Range</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Select specific date ranges for your export to get exactly the data you need
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Multiple Formats</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Export in Excel (.xlsx) or CSV format, compatible with most financial software
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Category Filtering</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Filter by specific categories to export only the data you're interested in
            </p>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Summary Reports</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Includes summary sheets with totals, averages, and insights
            </p>
          </div>
        </div>
      </motion.div>

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
};

export default Export;
