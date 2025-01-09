import React, { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AdminSidebar from '../../components/Admin/Sidebar'
import { getChartData, getStats } from '../../api/Admin/Orders';

const Overview = () => {

  const [users, setUsers] = useState(0);
  const [products, setProducts] = useState(0);
  const [orders, setOrders] = useState(0)
  const [loading, setLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [period, setPeriod] = useState('weekly');
  const [topCategories, setTopCategories] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const result = await getStats();

        if (result) {
          console.log(result);
          setUsers(result.counts.activeUsers);
          setProducts(result.counts.activeProducts);
          setOrders(result.counts.totalOrders);
          setTopCategories(result.topSellingCategories);
          setTopProducts(result.topSellingProducts);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setChartLoading(true);
        const result = await getChartData(period);

        if (result) {
          setChartData(result.data);
          console.log(result.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setChartLoading(false);
      }
    }

    fetchData();
  }, [period]);

  const handlePeriodChange = (e) => {
    setPeriod(e.target.value);
  }

  return (

    <div className="min-h-screen  text-white">
      <AdminSidebar />
      {
        loading ? (
          <p>Loading...</p>
        ) :(
          <div className="absolute top-14 right-16 w-[1110px]">
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
              {/* Statistics Cards */}
              <div className="flex justify-between space-x-4 mb-6">
                <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg w-1/3">
                  <h3 className="text-xl font-semibold">Active Products</h3>
                  <p className="text-3xl font-bold">{products}</p>
                </div>
                <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg w-1/3">
                  <h3 className="text-xl font-semibold">Active Users</h3>
                  <p className="text-3xl font-bold">{users}</p>
                </div>
                <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg w-1/3">
                  <h3 className="text-xl font-semibold">Total Orders</h3>
                  <p className="text-3xl font-bold">{orders}</p>
                </div>
              </div>

              {/* Chart */}
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Sales Overview</h2>
                  <select
                    value={period}
                    onChange={handlePeriodChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                { chartLoading? (
                  <p>Loading...</p>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Top Selling Categories Table */}
              <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg mt-6">
                <h2 className="text-2xl mb-4">Top Selling Categories</h2>
                <table className="w-full text-sm text-left text-gray-400">
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3">Category Name</th>
                      <th scope="col" className="px-6 py-3">Total Quantity Sold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topCategories.map((category) => (
                      <tr key={category.categoryId} className="hover:bg-gray-600">
                        <td className="px-6 py-4">{category.categoryName}</td>
                        <td className="px-6 py-4">{category.totalQuantitySold}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
                  
              {/* Top Selling Products Table */}
              <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg mt-6 mb-10">
                <h2 className="text-2xl mb-4">Top Selling Products</h2>
                <table className="w-full text-sm text-left text-gray-400">
                  <thead className="bg-gray-700">
                    <tr>
                      <th scope="col" className="px-6 py-3">Product Name</th>
                      <th scope="col" className="px-6 py-3">Total Quantity Sold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product) => (
                      <tr key={product.productId} className="hover:bg-gray-600">
                        <td className="px-6 py-4">{product.productName}</td>
                        <td className="px-6 py-4">{product.totalQuantitySold}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      }
      
    </div>

  )
}

export default Overview
