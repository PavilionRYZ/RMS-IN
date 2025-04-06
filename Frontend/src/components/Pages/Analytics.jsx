// src/components/AnalyticsDashboard.jsx
import { Fragment, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { FiDownload } from 'react-icons/fi';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import {
  fetchAnalytics,
  generateAnalytics,
  setPeriod,
  setStartDate,
  setEndDate,
  clearError,
} from '../Redux/Slices/analyticsSlice';
import { getMenuItems } from '../Redux/Slices/menuSlice';
import FloatingSidebar from '../Layout/FloatingSidebar';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AnalyticsDashboard = () => {
  const dispatch = useDispatch();
  const { data, period, startDate, endDate, loading: analyticsLoading, error: analyticsError } = useSelector((state) => state.analytics);
  const { menu, loading: menuLoading, error: menuError } = useSelector((state) => state.menu);
  const [isExportOpen, setIsExportOpen] = useState(false);

  useEffect(() => {
    if (!data && !analyticsLoading) {
      dispatch(fetchAnalytics({ period, startDate, endDate }));
    }
  }, [dispatch, period, startDate, endDate, data, analyticsLoading]);

  useEffect(() => {
    if (!menu.length && !menuLoading) {
      dispatch(getMenuItems());
    }
  }, [dispatch, menu, menuLoading]);

  const handleGenerateReport = () => {
    dispatch(generateAnalytics({ period, startDate, endDate }));
  };

  // Debug data
  // console.log('Analytics Data:', data);

  // Export functions
  const exportToJSON = () => {
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      saveAs(blob, `analytics-report-${period}-${new Date().toISOString()}.json`);
    }
  };

  const exportToExcel = () => {
    if (data) {
      const worksheetData = [
        ['Metric', 'Value'],
        ['Total Sales', data.totalSales || 0],
        ['Total Profit', data.totalProfit || 0],
        ['Total Loss', data.totalLoss || 0],
        ['Order Types', ''],
        ['Dine-in', data.orderTypes?.dineIn?.amount || 0],
        ['Takeaway', data.orderTypes?.takeaway?.amount || 0],
        ['Online', data.orderTypes?.online?.amount || 0],
        ['Payment Methods', ''],
        ['Cash', data.paymentMethods?.cash?.amount || 0],
        ['Card', data.paymentMethods?.card?.amount || 0],
        ['Online', data.paymentMethods?.online?.amount || 0],
        ['Order Status', ''],
        ['Confirmed', data.orderStatus?.confirmed || 0],
        ['Cancelled', data.orderStatus?.cancelled || 0],
        ['Inventory Analysis - Stock', ''],
        ...(data.inventoryAnalysis?.stock?.map((item, index) => [
          `${index + 1}. ${item.item?.name || 'Unknown'} (Stock)`,
          item.currentStock || 0,
          item.unitCost || 0,
          item.totalValue || 0,
        ]) || []),
        ['Inventory Analysis - Usage', ''],
        ...(data.inventoryAnalysis?.usage?.map((item, index) => [
          `${index + 1}. ${item.item?.name || 'Unknown'} (Used)`,
          item.usedQuantity || 0,
          item.totalCost || 0,
        ]) || []),
        ['Top Selling Items', ''],
        ...(data.topSellingItems?.map((item, index) => [
          `${index + 1}. ${menu.find((m) => m._id === (item.item?._id || item._id))?.name || 'Unknown'}`,
          item.quantity || 0,
        ]) || []),
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Analytics');
      XLSX.writeFile(workbook, `analytics-report-${period}-${new Date().toISOString()}.xlsx`);
    }
  };

  const exportToPDF = () => {
    if (data) {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Analytics Report', 20, 20);
      doc.setFontSize(12);

      let y = 30;
      doc.text(`Period: ${period}`, 20, y);
      y += 10;
      doc.text(`Date Range: ${startDate || 'N/A'} to ${endDate || 'N/A'}`, 20, y);
      y += 10;

      doc.text('Key Metrics:', 20, y);
      y += 10;
      doc.text(`Total Sales: $${(data.totalSales || 0).toFixed(2)}`, 20, y);
      y += 10;
      doc.text(`Total Profit: $${(data.totalProfit || 0).toFixed(2)}`, 20, y);
      y += 10;
      doc.text(`Total Loss: $${(data.totalLoss || 0).toFixed(2)}`, 20, y);
      y += 10;

      doc.text('Order Types:', 20, y);
      y += 10;
      doc.text(`Dine-in: $${data.orderTypes?.dineIn?.amount || 0}`, 20, y);
      y += 10;
      doc.text(`Takeaway: $${data.orderTypes?.takeaway?.amount || 0}`, 20, y);
      y += 10;
      doc.text(`Online: $${data.orderTypes?.online?.amount || 0}`, 20, y);
      y += 10;

      doc.text('Payment Methods:', 20, y);
      y += 10;
      doc.text(`Cash: $${data.paymentMethods?.cash?.amount || 0}`, 20, y);
      y += 10;
      doc.text(`Card: $${data.paymentMethods?.card?.amount || 0}`, 20, y);
      y += 10;
      doc.text(`Online: $${data.paymentMethods?.online?.amount || 0}`, 20, y);
      y += 10;

      doc.text('Order Status:', 20, y);
      y += 10;
      doc.text(`Confirmed: ${data.orderStatus?.confirmed || 0}`, 20, y);
      y += 10;
      doc.text(`Cancelled: ${data.orderStatus?.cancelled || 0}`, 20, y);
      y += 10;

      doc.text('Inventory Analysis - Stock:', 20, y);
      y += 10;
      data.inventoryAnalysis?.stock?.forEach((item, index) => {
        doc.text(
          `${index + 1}. ${item.item?.name || 'Unknown'}: ${item.currentStock || 0} ($${item.unitCost || 0}/unit, Total: $${item.totalValue || 0})`,
          20,
          y
        );
        y += 10;
      });

      doc.text('Inventory Analysis - Usage:', 20, y);
      y += 10;
      data.inventoryAnalysis?.usage?.forEach((item, index) => {
        doc.text(
          `${index + 1}. ${item.item?.name || 'Unknown'}: ${item.usedQuantity || 0} (Total Cost: $${item.totalCost || 0})`,
          20,
          y
        );
        y += 10;
      });

      doc.text('Top Selling Items:', 20, y);
      y += 10;
      data.topSellingItems?.forEach((item, index) => {
        const name = menu.find((m) => m._id === (item.item?._id || item._id))?.name || 'Unknown';
        doc.text(`${index + 1}. ${name}: ${item.quantity || 0}`, 20, y);
        y += 10;
      });

      doc.save(`analytics-report-${period}-${new Date().toISOString()}.pdf`);
    }
  };

  // Chart data with robust fallbacks and top 10 limit for readability
  const salesChartData = {
    labels: ['Dine-in', 'Takeaway', 'Online'],
    datasets: [
      {
        label: 'Sales by Order Type',
        data: [
          data?.orderTypes?.dineIn?.amount || 0,
          data?.orderTypes?.takeaway?.amount || 0,
          data?.orderTypes?.online?.amount || 0,
        ],
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56'],
      },
    ],
  };

  const paymentChartData = {
    labels: ['Cash', 'Card', 'Online'],
    datasets: [
      {
        label: 'Payment Methods',
        data: [
          data?.paymentMethods?.cash?.amount || 0,
          data?.paymentMethods?.card?.amount || 0,
          data?.paymentMethods?.online?.amount || 0,
        ],
        backgroundColor: ['#4BC0C0', '#9966FF', '#FF9F40'],
      },
    ],
  };

  const topItemsChartData = {
    labels:
      data?.topSellingItems?.length > 0
        ? data.topSellingItems.map((topItem) => {
            const itemId = topItem.item?._id || topItem._id;
            const menuItem = menu.find((item) => item._id === itemId);
            return menuItem?.name || 'Loading...';
          })
        : ['No Data'],
    datasets: [
      {
        label: 'Top Selling Items',
        data:
          data?.topSellingItems?.length > 0
            ? data.topSellingItems.map((item) => item?.quantity || 0)
            : [0],
        backgroundColor: '#36A2EB',
      },
    ],
  };

  // const inventoryUsageChartData = {
  //   labels:
  //     data?.inventoryAnalysis?.usage?.length > 0
  //       ? data.inventoryAnalysis.usage
  //           .slice(0, 10) // Limit to top 10 for readability
  //           .map((item) => item.item?.name || 'Unknown')
  //       : ['No Data'],
  //   datasets: [
  //     {
  //       label: 'Inventory Usage (Quantity)',
  //       data:
  //         data?.inventoryAnalysis?.usage?.length > 0
  //           ? data.inventoryAnalysis.usage
  //               .slice(0, 10)
  //               .map((item) => item.usedQuantity || 0)
  //           : [0],
  //       backgroundColor: '#FF6384',
  //     },
  //     {
  //       label: 'Inventory Usage (Cost)',
  //       data:
  //         data?.inventoryAnalysis?.usage?.length > 0
  //           ? data.inventoryAnalysis.usage.slice(0, 10).map((item) => item.totalCost || 0)
  //           : [0],
  //       backgroundColor: '#FF9F40',
  //     },
  //   ],
  // };

  // const inventoryStockChartData = {
  //   labels:
  //     data?.inventoryAnalysis?.stock?.length > 0
  //       ? data.inventoryAnalysis.stock
  //           .slice(0, 10) // Limit to top 10 for readability
  //           .map((item) => item.item?.name || 'Unknown')
  //       : ['No Data'],
  //   datasets: [
  //     {
  //       label: 'Current Stock (Quantity)',
  //       data:
  //         data?.inventoryAnalysis?.stock?.length > 0
  //           ? data.inventoryAnalysis.stock.slice(0, 10).map((item) => item.currentStock || 0)
  //           : [0],
  //       backgroundColor: '#4BC0C0',
  //     },
  //     {
  //       label: 'Current Stock (Value)',
  //       data:
  //         data?.inventoryAnalysis?.stock?.length > 0
  //           ? data.inventoryAnalysis.stock.slice(0, 10).map((item) => item.totalValue || 0)
  //           : [0],
  //       backgroundColor: '#36A2EB',
  //     },
  //   ],
  // };

  return (
    <Fragment>
      <div className="flex flex-col items-center">
        <FloatingSidebar />
        <div className="container mx-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            className="bg-white rounded-lg shadow-lg p-6 mb-6"
          >
            <h1 className="text-2xl font-bold mb-4">Analytics Dashboard</h1>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
              <select
                value={period}
                onChange={(e) => dispatch(setPeriod(e.target.value))}
                className="border rounded-md p-2"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom</option>
              </select>

              {period === 'custom' && (
                <>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => dispatch(setStartDate(e.target.value))}
                    className="border rounded-md p-2"
                  />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => dispatch(setEndDate(e.target.value))}
                    className="border rounded-md p-2"
                  />
                </>
              )}

              <button
                onClick={handleGenerateReport}
                disabled={analyticsLoading}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-400"
              >
                {analyticsLoading ? 'Generating...' : 'Generate Report'}
              </button>

              {/* Export Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsExportOpen(!isExportOpen)}
                  disabled={!data || analyticsLoading}
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:bg-gray-400"
                >
                  <FiDownload /> Export
                </button>
                {isExportOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-lg z-10">
                    <button
                      onClick={() => {
                        exportToJSON();
                        setIsExportOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      JSON
                    </button>
                    <button
                      onClick={() => {
                        exportToExcel();
                        setIsExportOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      Excel
                    </button>
                    <button
                      onClick={() => {
                        exportToPDF();
                        setIsExportOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                    >
                      PDF
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Error Display */}
            {(analyticsError || menuError) && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {analyticsError || menuError}
                <button
                  onClick={() => dispatch(clearError())}
                  className="ml-2 text-sm underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Loading State */}
            {(analyticsLoading || menuLoading) && !data && (
              <div className="text-center py-4">Loading analytics data...</div>
            )}

            {/* Key Metrics */}
            {data && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="bg-gray-100 p-4 rounded-lg"
                >
                  <h3 className="font-semibold">Total Sales</h3>
                  <p className="text-2xl">${(data.totalSales || 0).toFixed(2)}</p>
                </motion.div>
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="bg-gray-100 p-4 rounded-lg"
                >
                  <h3 className="font-semibold">Total Profit</h3>
                  <p className="text-2xl">${(data.totalProfit || 0).toFixed(2)}</p>
                </motion.div>
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="bg-gray-100 p-4 rounded-lg"
                >
                  <h3 className="font-semibold">Total Loss</h3>
                  <p className="text-2xl">${(data.totalLoss || 0).toFixed(2)}</p>
                </motion.div>
              </div>
            )}

            {/* Charts */}
            {data && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-100 p-4 rounded-lg"
                >
                  <h3 className="font-semibold mb-2">Sales by Order Type</h3>
                  <Pie data={salesChartData} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-100 p-4 rounded-lg"
                >
                  <h3 className="font-semibold mb-2">Payment Methods</h3>
                  <Pie data={paymentChartData} />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-100 p-4 rounded-lg col-span-1 lg:col-span-2"
                >
                  <h3 className="font-semibold mb-2">Top Selling Items</h3>
                  <Bar data={topItemsChartData} options={{ responsive: true }} />
                </motion.div>

                {/* <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-100 p-4 rounded-lg col-span-1 lg:col-span-2"
                >
                  <h3 className="font-semibold mb-2">Inventory Usage</h3>
                  {data.inventoryAnalysis?.usage?.length > 0 ? (
                    <Bar
                      data={inventoryUsageChartData}
                      options={{
                        responsive: true,
                        scales: {
                          y: { beginAtZero: true, title: { display: true, text: 'Quantity / Cost ($)' } },
                        },
                        plugins: {
                          legend: { position: 'top' },
                          tooltip: {
                            callbacks: {
                              label: (context) => `${context.dataset.label}: ${context.raw}`,
                            },
                          },
                        },
                      }}
                    />
                  ) : (
                    <p className="text-center text-gray-500">
                      No inventory usage data available for this period
                    </p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-100 p-4 rounded-lg col-span-1 lg:col-span-2"
                >
                  <h3 className="font-semibold mb-2">Inventory Stock</h3>
                  {data.inventoryAnalysis?.stock?.length > 0 ? (
                    <Bar
                      data={inventoryStockChartData}
                      options={{
                        responsive: true,
                        scales: {
                          y: { beginAtZero: true, title: { display: true, text: 'Quantity / Value ($)' } },
                        },
                        plugins: {
                          legend: { position: 'top' },
                          tooltip: {
                            callbacks: {
                              label: (context) => `${context.dataset.label}: ${context.raw}`,
                            },
                          },
                        },
                      }}
                    />
                  ) : (
                    <p className="text-center text-gray-500">No inventory stock data available</p>
                  )}
                </motion.div> */}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Fragment>
  );
};

export default AnalyticsDashboard;