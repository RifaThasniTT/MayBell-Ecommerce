import React, { useEffect, useState } from 'react'
import AdminSidebar from '../../components/Admin/Sidebar';
import { getSalesReport } from '../../api/Admin/Orders';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const SalesReport = () => {

  const [salesData, setSalesData] = useState([]);
  const [overallSummary, setOverallSummary] = useState({
    totalSalesCount: 0,
    totalOrderAmount: 0,
    totalDiscounts: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('weekly');
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  const fetchSales = async () => {
    try {
      setLoading(true);

      const result = await getSalesReport(selectedFilter, startDate, endDate);

      if (result) {
        setSalesData(result.dailyReport);
        setOverallSummary(result.overAllSummary);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleFilterChange = (e) => {
    setSelectedFilter(e.target.value);
    if (e.target.value !== "custom") {
      setStartDate("");  
      setEndDate("");
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    if (name === "startDate") {
      setStartDate(value);
    } else if (name === "endDate") {
      setEndDate(value);
    }
  };

  const validateDates = () => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];  

    if (startDate > todayString || endDate > todayString) {
      toast.error("Dates cannot be in the future.");
      return false;
    }
  
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      toast.error("End date must be after start date.");
      return false;
    }
  
    if (selectedFilter === "custom" && (!startDate || !endDate)) {
      toast.error("Please select both start and end dates.");
      return false;
    }

    return true;
  };

  const applyFilters = async () => {
    if (!validateDates()) return;

    fetchSales();
  };

  const handleDownloadExcel = () => {
    // Summary Data
    const summaryData = [
      {
        Description: 'Total Sales',
        Value: overallSummary.totalSalesCount,
      },
      {
        Description: 'Total Amount',
        Value: `₹${overallSummary.totalOrderAmount}`,
      },
      {
        Description: 'Total Discounts',
        Value: `₹${overallSummary.totalDiscounts}`,
      },
      {
        Description: 'Total Revenue',
        Value: `₹${overallSummary.totalRevenue}`,
      },
    ];
  
    // Sales Data
    const dataForExcel = salesData.map((sale) => ({
      Date: sale._id,
      SalesCount: sale.totalSalesCount,
      OrderAmount: `₹${sale.totalOrderAmount}`,
      Discount: `₹${sale.totalDiscounts}`,
      Revenue: `₹${sale.totalRevenue}`,
    }));
  
    // Combine Summary and Sales Data
    const combinedData = [
      ...summaryData,
      ...dataForExcel,
    ];
  
    // Convert to Excel format
    const ws = XLSX.utils.json_to_sheet(combinedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Report');
    XLSX.writeFile(wb, 'sales_report.xlsx');
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    const websiteDetails = {
      name: 'MayBell',
      address: 'Room No.III/9, 3rd Floor, SDF Building, Kinfra',
      contact: '+91 98771318932',
      email: 'support@maybell.com',
    };

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text(websiteDetails.name, 14, 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Address: ${websiteDetails.address}`, 14, 17);
    doc.text(`Contact: ${websiteDetails.contact}`, 14, 22);
    doc.text(`Email: ${websiteDetails.email}`, 14, 27);


    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Sales Report', 14, 37);

    const summaryContent = [
      ['Total Sales', overallSummary.totalSalesCount],
      ['Total Amount', `Rs.${overallSummary.totalOrderAmount}`],
      ['Total Discounts', `Rs.${overallSummary.totalDiscounts}`],
      ['Total Revenue', `Rs.${overallSummary.totalRevenue}`],
    ];

    doc.autoTable({
      head: [['Description', 'Value']],
      body: summaryContent,
      startY: 47,
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: { fillColor: [0, 0, 0], textColor: 255 }, 
    });

    const reportContent = salesData.map((sale) => [
      sale._id,
      sale.totalSalesCount,
      sale.totalOrderAmount,
      sale.totalDiscounts,
      sale.totalRevenue,
    ]);

    doc.autoTable({
      head: [['Date', 'Sales Count', ' Order Amount', 'Discount', 'Revenue']],
      body: reportContent,
      startY: doc.lastAutoTable.finalY + 10,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [0, 0, 0], textColor: 255 },
    });

    doc.save('sales_report.pdf');
  };

  return (
    <div>

      <AdminSidebar />

      <div className="absolute top-14 right-16 w-[1110px]">
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 py-4 px-5 bg-white dark:bg-[#1f2937]">
            <h1 className="text-white text-2xl">Sales Report</h1>
          </div>

         {/* Filter Section */}
        <div className="flex items-center justify-between py-4 px-5 bg-white">
          <div className="flex items-center space-x-4 w-full">
            <h2 className="text-gray-800 text-md">Filter Sales: </h2>
            <select
              name="filter"
              value={selectedFilter}
              onChange={handleFilterChange}
              className="bg-gray-50 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 p-2 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
            >
              <option value="daily">Today</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="custom">Custom Date</option>
            </select>

            {/* Custom Date Range Inputs */}
            {selectedFilter === "custom" && (
              <div className="flex items-center space-x-4">
                <input
                  type="date"
                  name="startDate"
                  value={startDate}
                  onChange={handleDateChange}
                  className="bg-gray-50 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 p-2 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                />
                <span className="text-white">to</span>
                <input
                  type="date"
                  name="endDate"
                  value={endDate}
                  onChange={handleDateChange}
                  className="bg-gray-50 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 p-2 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                />
              </div>
            )}

            {/* Apply Filters Button */}
            <button
              onClick={applyFilters}
              className="bg-blue-800 text-white p-2 rounded-lg focus:ring-4 focus:ring-blue-300 hover:bg-blue-900"
            >
              Apply Filters
            </button>
          </div>
        </div>
          
        {/* Action Buttons (Download PDF & Excel) */}
        {salesData.length !== 0 && (
          <div className="flex justify-start py-4 px-5">
          <button
            onClick={handleDownloadPDF}
            className="bg-blue-800 text-white p-2.5 rounded-lg focus:ring-4 focus:ring-blue-300 hover:bg-blue-900"
          >
            Download as PDF
          </button>
          <button
            onClick={handleDownloadExcel}
            className="bg-blue-800 text-white p-2.5 rounded-lg focus:ring-4 focus:ring-blue-300 hover:bg-blue-900 ml-4"
          >
            Download as Excel
          </button>
        </div>
        )} 

          {/* Sales Data Table */}
          <div className="relative overflow-x-auto shadow-md ">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Sales Count</th>
                  <th className="px-6 py-3">Total Amount</th>
                  <th className="px-6 py-3">Discount</th>
                  <th className="px-6 py-3">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {salesData && salesData.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4">
                      {loading ? 'Loading...' : 'No sales found.'}
                    </td>
                  </tr>
                ) : (
                  salesData.map((sale) => (
                    <tr
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      key={sale._id}
                    >
                      <td className="px-6 py-4">{sale?._id}</td>
                      <td className="px-6 py-4">{sale?.totalSalesCount}</td>
                      <td className="px-6 py-4">₹{sale?.totalOrderAmount}</td>
                      <td className="px-6 py-4">₹{sale?.totalDiscounts}</td>
                      <td className="px-6 py-4">₹{sale?.totalRevenue}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        { loading ? (
          <p>Loading...</p>
        ): (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-4 px-5">
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4">
              <h2 className="text-gray-500 dark:text-gray-400 text-sm">Sales Count</h2>
              <p className="text-2xl font-semibold">{overallSummary?.totalSalesCount}</p>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4">
              <h2 className="text-gray-500 dark:text-gray-400 text-sm">Order Amount</h2>
              <p className="text-2xl font-semibold">₹{overallSummary?.totalOrderAmount}</p>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4">
              <h2 className="text-gray-500 dark:text-gray-400 text-sm">Discount Amount</h2>
              <p className="text-2xl font-semibold">₹{overallSummary?.totalDiscounts}</p>
            </div>
            <div className="bg-white dark:bg-gray-700 rounded-lg shadow-md p-4">
              <h2 className="text-gray-500 dark:text-gray-400 text-sm">Revenue</h2>
              <p className="text-2xl font-semibold">₹{overallSummary?.totalRevenue}</p>
            </div>
          </div>
        )}
          
      </div>
              
    </div>

  )
}

export default SalesReport
