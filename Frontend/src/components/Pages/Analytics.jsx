/* eslint-disable no-unused-vars */
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
import autoTable from 'jspdf-autotable';
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

  // Set default date ranges based on period
  useEffect(() => {
    const now = new Date();
    let newStartDate, newEndDate;

    switch (period) {
      case 'daily':
        newStartDate = now.toISOString().split('T')[0];
        newEndDate = newStartDate;
        break;
      case 'weekly': {
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        newStartDate = weekStart.toISOString().split('T')[0];
        newEndDate = new Date(weekStart.setDate(weekStart.getDate() + 6)).toISOString().split('T')[0];
        break;
      }
      case 'monthly':
        newStartDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        newEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      default:
        newStartDate = startDate;
        newEndDate = endDate;
    }

    if (newStartDate !== startDate || newEndDate !== endDate) {
      dispatch(setStartDate(newStartDate));
      dispatch(setEndDate(newEndDate));
    }
  }, [period, dispatch, startDate, endDate]);

  useEffect(() => {
    if (startDate && endDate) {
      dispatch(fetchAnalytics({ period, startDate, endDate }));
    }
  }, [dispatch, period, startDate, endDate]);

  useEffect(() => {
    if (!menu.length && !menuLoading) {
      dispatch(getMenuItems());
    }
  }, [dispatch, menu, menuLoading]);

  // Debugging: Log inventory data
  // useEffect(() => {
  //   if (data?.inventoryAnalysis) {
  //     console.log("Frontend Inventory Stock:", JSON.stringify(data.inventoryAnalysis.stock, null, 2));
  //     console.log("Frontend Inventory Usage:", JSON.stringify(data.inventoryAnalysis.usage, null, 2));
  //     console.log("Frontend Low Stock:", JSON.stringify(data.inventoryAnalysis.lowStock, null, 2));
  //   }
  // }, [data]);

  const handleGenerateReport = () => {
    if (startDate && endDate) {
      dispatch(generateAnalytics({ period, startDate, endDate }));
    }
  };

  // Export functions
  const exportToJSON = () => {
    if (data) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      saveAs(blob, `analytics-report-${period}-${new Date().toISOString()}.json`);
    }
  };

  const exportToExcel = () => {
    if (data) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const workbook = XLSX.utils.book_new();

      // Summary Sheet
      const summaryData = [
        ['Analytics Report'],
        ['Company Name:', 'RestoMaster'],
        ['Report Period:', period.charAt(0).toUpperCase() + period.slice(1)],
        ['Date Range:', `${startDate || 'N/A'} to ${endDate || 'N/A'}`],
        ['Generated On:', new Date().toLocaleString()],
        [''],
        ['Key Metrics'],
        ['Metric', 'Value'],
        ['Total Sales', `$${Number(data.totalSales || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        ['Total Profit', `$${Number(data.totalProfit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        ['Total Loss', `$${Number(data.totalLoss || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        [''],
        ['Order Types'],
        ['Type', 'Amount'],
        ['Dine-in', `$${Number(data.orderTypes?.dineIn?.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        ['Takeaway', `$${Number(data.orderTypes?.takeaway?.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        ['Online', `$${Number(data.orderTypes?.online?.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        [''],
        ['Payment Methods'],
        ['Method', 'Amount'],
        ['Cash', `$${Number(data.paymentMethods?.cash?.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        ['Card', `$${Number(data.paymentMethods?.card?.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        ['Online', `$${Number(data.paymentMethods?.online?.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        [''],
        ['Order Status'],
        ['Status', 'Count'],
        ['Confirmed', data.orderStatus?.confirmed || 0],
        ['Cancelled', data.orderStatus?.cancelled || 0],
        [''],
        ['Inventory Summary'],
        ['Metric', 'Count', 'Value'],
        ['Added', data.inventory?.added?.count || 0, `$${Number(data.inventory?.added?.value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        ['Used', data.inventory?.used?.count || 0, `$${Number(data.inventory?.used?.value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
      ];

      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      // Apply formatting
      summarySheet['!cols'] = [
        { wch: 20 }, // Metric
        { wch: 15 }, // Value
        { wch: 15 }, // Extra column for Inventory Summary
      ];
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // Inventory Analysis Sheet
      const inventoryData = [
        ['Inventory Analysis'],
        [''],
        ['Current Stock'],
        ['Item Name', 'Current Stock', 'Unit Cost', 'Total Value'],
        ...(data.inventoryAnalysis?.stock?.map((item) => [
          item.item?.name || 'Unknown Item',
          item.currentStock || 0,
          `$${Number(item.unitCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          `$${Number(item.totalValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        ]) || []),
        [''],
        ['Usage'],
        ['Item Name', 'Used Quantity', 'Total Cost'],
        ...(data.inventoryAnalysis?.usage?.map((item) => [
          item.item?.name || 'Unknown Item',
          item.usedQuantity || 0,
          `$${Number(item.totalCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        ]) || []),
        [''],
        ['Low Stock Alerts'],
        ['Item Name', 'Current Stock', 'Unit Cost'],
        ...(data.inventoryAnalysis?.lowStock?.map((item) => [
          item.name || 'Unknown Item',
          item.currentStock || 0,
          `$${Number(item.unitCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        ]) || []),
      ];

      const inventorySheet = XLSX.utils.aoa_to_sheet(inventoryData);
      inventorySheet['!cols'] = [
        { wch: 25 }, // Item Name
        { wch: 15 }, // Current Stock / Used Quantity
        { wch: 15 }, // Unit Cost / Total Cost
        { wch: 15 }, // Total Value
      ];
      XLSX.utils.book_append_sheet(workbook, inventorySheet, 'Inventory Analysis');

      // Top Selling Items Sheet
      const topItemsData = [
        ['Top Selling Items'],
        ['Item Name', 'Quantity Sold'],
        ...(data.topSellingItems?.map((item) => [
          menu.find((m) => m._id === (item.item?._id || item._id))?.name || 'Unknown',
          item.quantity || 0,
        ]) || []),
      ];

      const topItemsSheet = XLSX.utils.aoa_to_sheet(topItemsData);
      topItemsSheet['!cols'] = [
        { wch: 25 }, // Item Name
        { wch: 15 }, // Quantity Sold
      ];
      XLSX.utils.book_append_sheet(workbook, topItemsSheet, 'Top Selling Items');

      XLSX.writeFile(workbook, `analytics-report-${period}-${timestamp}.xlsx`);
    }
  };

  const exportToPDF = () => {
    if (data) {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 15;
      const timestamp = new Date().toLocaleString();

      // Fonts and Colors
      doc.setFont('helvetica', 'normal');
      const primaryColor = '#1D3557'; // Dark blue for headers
      const textColor = '#333333'; // Dark gray for body text

      // Header for all pages
      const addHeader = () => {
        doc.setFontSize(16);
        doc.setTextColor(primaryColor);
        doc.setFont('helvetica', 'bold');
        doc.text('Analytics Report', margin, 20);
        doc.setFontSize(10);
        doc.setTextColor(textColor);
        doc.setFont('helvetica', 'normal');
        doc.text('RestoMaster', margin, 28);
        doc.text(`Generated On: ${timestamp}`, pageWidth - margin - 60, 28, { align: 'right' });
        doc.setLineWidth(0.5);
        doc.setDrawColor(primaryColor);
        doc.line(margin, 32, pageWidth - margin, 32); // Horizontal line
      };

      // Footer for all pages
      const addFooter = () => {
        doc.setFontSize(8);
        doc.setTextColor('#666666');
        doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber}`, pageWidth - margin - 10, pageHeight - 10, { align: 'right' });
      };

      // Initialize first page
      addHeader();
      addFooter();

      // Report Metadata
      doc.setFontSize(12);
      doc.setTextColor(textColor);
      let y = 40;
      doc.text(`Period: ${period.charAt(0).toUpperCase() + period.slice(1)}`, margin, y);
      y += 8;
      doc.text(`Date Range: ${startDate || 'N/A'} to ${endDate || 'N/A'}`, margin, y);
      y += 10;

      // Key Metrics
      doc.setFontSize(14);
      doc.setTextColor(primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text('Key Metrics', margin, y);
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [['Metric', 'Value']],
        body: [
          ['Total Sales', `$${Number(data.totalSales || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
          ['Total Profit', `$${Number(data.totalProfit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
          ['Total Loss', `$${Number(data.totalLoss || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        ],
        styles: { fontSize: 10, textColor: textColor },
        headStyles: { fillColor: primaryColor, textColor: '#FFFFFF', fontStyle: 'bold' },
        margin: { left: margin, right: margin },
      });

      y = doc.lastAutoTable.finalY + 10;

      // Order Types
      doc.setFontSize(14);
      doc.setTextColor(primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text('Order Types', margin, y);
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [['Type', 'Amount']],
        body: [
          ['Dine-in', `$${Number(data.orderTypes?.dineIn?.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
          ['Takeaway', `$${Number(data.orderTypes?.takeaway?.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
          ['Online', `$${Number(data.orderTypes?.online?.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        ],
        styles: { fontSize: 10, textColor: textColor },
        headStyles: { fillColor: primaryColor, textColor: '#FFFFFF', fontStyle: 'bold' },
        margin: { left: margin, right: margin },
        didDrawPage: addFooter,
      });

      y = doc.lastAutoTable.finalY + 10;

      // Payment Methods
      doc.setFontSize(14);
      doc.setTextColor(primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text('Payment Methods', margin, y);
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [['Method', 'Amount']],
        body: [
          ['Cash', `$${Number(data.paymentMethods?.cash?.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
          ['Card', `$${Number(data.paymentMethods?.card?.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
          ['Online', `$${Number(data.paymentMethods?.online?.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
        ],
        styles: { fontSize: 10, textColor: textColor },
        headStyles: { fillColor: primaryColor, textColor: '#FFFFFF', fontStyle: 'bold' },
        margin: { left: margin, right: margin },
        didDrawPage: (data) => {
          addHeader();
          addFooter();
        },
      });

      y = doc.lastAutoTable.finalY + 10;

      // Order Status
      doc.setFontSize(14);
      doc.setTextColor(primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text('Order Status', margin, y);
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [['Status', 'Count']],
        body: [
          ['Confirmed', data.orderStatus?.confirmed || 0],
          ['Cancelled', data.orderStatus?.cancelled || 0],
        ],
        styles: { fontSize: 10, textColor: textColor },
        headStyles: { fillColor: primaryColor, textColor: '#FFFFFF', fontStyle: 'bold' },
        margin: { left: margin, right: margin },
        didDrawPage: addFooter,
      });

      y = doc.lastAutoTable.finalY + 10;

      // Inventory Summary
      doc.setFontSize(14);
      doc.setTextColor(primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text('Inventory Summary', margin, y);
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [['Metric', 'Count', 'Value']],
        body: [
          [
            'Added',
            data.inventory?.added?.count || 0,
            `$${Number(data.inventory?.added?.value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          ],
          [
            'Used',
            data.inventory?.used?.count || 0,
            `$${Number(data.inventory?.used?.value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          ],
        ],
        styles: { fontSize: 10, textColor: textColor },
        headStyles: { fillColor: primaryColor, textColor: '#FFFFFF', fontStyle: 'bold' },
        margin: { left: margin, right: margin },
        didDrawPage: (data) => {
          addHeader();
          addFooter();
        },
      });

      y = doc.lastAutoTable.finalY + 10;

      // Inventory Analysis - Stock
      doc.setFontSize(14);
      doc.setTextColor(primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text('Inventory Analysis - Current Stock', margin, y);
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [['Item Name', 'Current Stock', 'Unit Cost', 'Total Value']],
        body: data.inventoryAnalysis?.stock?.map((item) => [
          item.item?.name || 'Unknown Item',
          item.currentStock || 0,
          `$${Number(item.unitCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          `$${Number(item.totalValue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        ]) || [],
        styles: { fontSize: 10, textColor: textColor },
        headStyles: { fillColor: primaryColor, textColor: '#FFFFFF', fontStyle: 'bold' },
        margin: { left: margin, right: margin },
        didDrawPage: (data) => {
          addHeader();
          addFooter();
        },
      });

      y = doc.lastAutoTable.finalY + 10;

      // Inventory Analysis - Usage
      doc.setFontSize(14);
      doc.setTextColor(primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text('Inventory Analysis - Usage', margin, y);
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [['Item Name', 'Used Quantity', 'Total Cost']],
        body: data.inventoryAnalysis?.usage?.map((item) => [
          item.item?.name || 'Unknown Item',
          item.usedQuantity || 0,
          `$${Number(item.totalCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        ]) || [],
        styles: { fontSize: 10, textColor: textColor },
        headStyles: { fillColor: primaryColor, textColor: '#FFFFFF', fontStyle: 'bold' },
        margin: { left: margin, right: margin },
        didDrawPage: (data) => {
          addHeader();
          addFooter();
        },
      });

      y = doc.lastAutoTable.finalY + 10;

      // Low Stock Alerts
      doc.setFontSize(14);
      doc.setTextColor(primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text('Low Stock Alerts', margin, y);
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [['Item Name', 'Current Stock', 'Unit Cost']],
        body: data.inventoryAnalysis?.lowStock?.map((item) => [
          item.name || 'Unknown Item',
          item.currentStock || 0,
          `$${Number(item.unitCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        ]) || [],
        styles: { fontSize: 10, textColor: textColor },
        headStyles: { fillColor: primaryColor, textColor: '#FFFFFF', fontStyle: 'bold' },
        margin: { left: margin, right: margin },
        didDrawPage: (data) => {
          addHeader();
          addFooter();
        },
      });

      y = doc.lastAutoTable.finalY + 10;

      // Top Selling Items
      doc.setFontSize(14);
      doc.setTextColor(primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text('Top Selling Items', margin, y);
      y += 8;

      autoTable(doc, {
        startY: y,
        head: [['Item Name', 'Quantity Sold']],
        body: data.topSellingItems?.map((item) => [
          menu.find((m) => m._id === (item.item?._id || item._id))?.name || 'Unknown',
          item.quantity || 0,
        ]) || [],
        styles: { fontSize: 10, textColor: textColor },
        headStyles: { fillColor: primaryColor, textColor: '#FFFFFF', fontStyle: 'bold' },
        margin: { left: margin, right: margin },
        didDrawPage: (data) => {
          addHeader();
          addFooter();
        },
      });

      doc.save(`analytics-report-${period}-${timestamp.replace(/[:.]/g, '-')}.pdf`);
    }
  };

  // Chart data
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
            return menuItem?.name || 'Unknown';
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

  const inventoryUsageChartData = {
    labels:
      data?.inventoryAnalysis?.usage?.length > 0
        ? data.inventoryAnalysis.usage
            .slice(0, 10)
            .map((item) => item.item?.name || 'Unknown Item')
        : ['No Usage Data'],
    datasets: [
      {
        label: 'Inventory Usage (Quantity)',
        data:
          data?.inventoryAnalysis?.usage?.length > 0
            ? data.inventoryAnalysis.usage.slice(0, 10).map((item) => item.usedQuantity || 0)
            : [0],
        backgroundColor: '#FF6384',
      },
      {
        label: 'Inventory Usage (Cost)',
        data:
          data?.inventoryAnalysis?.usage?.length > 0
            ? data.inventoryAnalysis.usage.slice(0, 10).map((item) => item.totalCost || 0)
            : [0],
        backgroundColor: '#FF9F40',
      },
    ],
  };

  const inventoryStockChartData = {
    labels:
      data?.inventoryAnalysis?.stock?.length > 0
        ? data.inventoryAnalysis.stock
            .slice(0, 10)
            .map((item) => item.item?.name || 'Unknown Item')
        : ['No Stock Data'],
    datasets: [
      {
        label: 'Current Stock (Quantity)',
        data:
          data?.inventoryAnalysis?.stock?.length > 0
            ? data.inventoryAnalysis.stock.slice(0, 10).map((item) => item.currentStock || 0)
            : [0],
        backgroundColor: '#4BC0C0',
      },
      {
        label: 'Current Stock (Value)',
        data:
          data?.inventoryAnalysis?.stock?.length > 0
            ? data.inventoryAnalysis.stock.slice(0, 10).map((item) => item.totalValue || 0)
            : [0],
        backgroundColor: '#36A2EB',
      },
    ],
  };

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
                disabled={analyticsLoading || !startDate || !endDate}
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
                  <p className="text-2xl">${Number(data.totalSales || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </motion.div>
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="bg-gray-100 p-4 rounded-lg"
                >
                  <h3 className="font-semibold">Total Profit</h3>
                  <p className="text-2xl">${Number(data.totalProfit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </motion.div>
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="bg-gray-100 p-4 rounded-lg"
                >
                  <h3 className="font-semibold">Total Loss</h3>
                  <p className="text-2xl">${Number(data.totalLoss || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </motion.div>
              </div>
            )}

            {/* Low Stock Alerts */}
            {data?.inventoryAnalysis?.lowStock?.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-100 p-4 rounded-lg mb-6"
              >
                <h3 className="font-semibold text-red-700 mb-2">Low Stock Alerts</h3>
                <ul className="list-disc pl-5">
                  {data.inventoryAnalysis.lowStock.map((item, index) => (
                    <li key={index} className="text-red-600">
                      {item.name || 'Unknown Item'}: {item.currentStock} units remaining ($
                      {Number(item.unitCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/unit)
                    </li>
                  ))}
                </ul>
              </motion.div>
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

                <motion.div
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
                    <p className="text-center text-gray-500">
                      No inventory stock data available. Check if inventory items are configured.
                    </p>
                  )}
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </Fragment>
  );
};

export default AnalyticsDashboard;