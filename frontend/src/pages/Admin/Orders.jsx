import React, { useEffect } from 'react';
import AdminSidebar from '../../components/Admin/Sidebar';
import { getAllOrders, updateOrderStatus } from '../../api/Admin/Orders';

const Orders = () => {
  const [orders, setOrders] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [updatingStatus, setUpdatingStatus] = React.useState(false);

  const fetchOrders = async () => {
    try {
        setLoading(true);

        const result = await getAllOrders();

        if (result) {
            setOrders(result.orders)
        }
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [])

  const handleStatusChange = async (orderId, newStatus) => {
    try {
        setUpdatingStatus(true);

        const result = await updateOrderStatus(orderId, newStatus);

        if (result) {
            setOrders(orders.map((order) =>
                order._id === orderId ? result.order : order 
            ))
        }
    } catch (error) {
        console.error(error);
    } finally {
        setUpdatingStatus(false);
    }
  };

  const getStatusOptions = (status) => {
    const options = [status];
    if (status === 'Cancelled' || status === 'Returned' || status === 'Delivered') {
      return options;
    } else if (status === 'Pending') {
      return [...options, 'Processing', 'Cancelled'];
    } else if (status === 'Processing') {
      return [...options, 'Shipped'];
    } else if (status === 'Shipped') {
      return [...options, 'Delivered']
    } else {
      return options;
    }
  };

//   const handleViewMore = (orderId) => {
//     console.log('viewmore clicked');
//   };

  return (
    <div>
      <AdminSidebar />
      <div className="absolute top-14 right-16 w-[1110px]">
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 py-4 px-5 bg-white dark:bg-[#1f2937]">
            <h1 className="text-white text-2xl">Order Management</h1>
          </div>

          {/* Orders Table */}
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3 w-50">Order ID</th>
                <th className="px-6 py-3">Username</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Total Amount</th>
                <th className="px-6 py-3">Payment Method</th>
                <th className="px-6 py-3">Status</th>
                {/* <th className="px-6 py-3">Action</th> */}
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    {loading ? 'Loading...' : 'No orders found.'}
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr
                    className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    key={order._id}
                  >
                    <td className="px-6 py-4 w-50">{order._id}</td>
                    <td className="px-6 py-4">{order?.user?.username}</td>
                    <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">₹{order.total}</td>
                    <td className="px-6 py-4">{order.paymentMethod}</td>
                    <td className="px-6 py-4">
                      <div className='relative'>
                      <select
                        className="block w-full px-2 py-1 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white"
                        value={order.orderStatus}
                        onChange={(e) =>
                          handleStatusChange(order._id, e.target.value)
                        }
                        disabled={updatingStatus}
                      >
                        {getStatusOptions(order.orderStatus).map((option) => (
                          <option key={option} value={option}> {option} </option>
                        ))}
                        { (order.returnReason && order.orderStatus !== 'Returned') && (<option value='Returned'> Returned </option>) }
                          {/* <option value='Returned'> Returned </option> */}
                          {/* <option disabled={getDisabledOptions(order.orderStatus).includes("Pending")} value="Pending">Pending</option>
                        <option disabled={getDisabledOptions(order.orderStatus).includes("Processing")} value="Processing">Processing</option>
                        <option disabled={getDisabledOptions(order.orderStatus).includes("Shipped")} value="Shipped">Shipped</option>
                        <option disabled={getDisabledOptions(order.orderStatus).includes("Delivered")} value="Delivered">Delivered</option>
                        <option disabled={getDisabledOptions(order.orderStatus).includes("Cancelled")} value="Cancelled">Cancelled</option>
                        <option disabled={getDisabledOptions(order.orderStatus).includes("Returned")} value="Returned">Returned</option> */}
                      </select>
                      {order.returnReason && order.orderStatus !== 'Returned' && (
                        <span className="absolute top-0 right-0 w-3 h-3 bg-red-700 rounded-full animate-pulse"></span>
                      )}
                      </div>
                    </td>
                    {/* <td className="px-6 py-4">
                      <button
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                        onClick={() => handleViewMore(order._id)}
                      >
                        View More
                      </button>
                    </td> */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
