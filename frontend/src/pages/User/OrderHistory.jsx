import React, { useEffect, useState } from 'react'
import UserHeader from '../../components/User/Header'
import UserFooter from '../../components/User/Footer'
import { Link, useNavigate } from 'react-router-dom'
import ProfileSidebar from '../../components/User/ProfileSidebar'
import { cancelOrder, getOrderHistory, requestReturn } from '../../api/User/Order'

const OrderHistory = () => {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [cancelling, setCancelling] = useState()

  const fetchOrders = async () => {
    try {

      setLoading(true);

      const result = await getOrderHistory();

      if (result) {
        setOrders(result.orders);
      }
      
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // const handleCancelOrder = async (id) => {
  //   if (window.confirm('Are you sure you want to cancel this order?')) {
  //     try {
  //       setCancelling(true);

  //       const result = await cancelOrder(id);

  //       if (result) {
  //         setOrders(orders.map((order) => 
  //           order._id === id ? result.order : order
  //         ))
  //       }
  //     } catch (error) {
  //       console.error(error)
  //     } finally {
  //       setCancelling(false);
  //     }
  //   }
  // };

  // const handleReturnOrder = async (id) => {
  //   if (window.confirm('Are you sure you want to return this order?')) {
  //     try {
  //       setCancelling(true);

  //       const result = await returnOrder(id);

  //       if (result) {
  //         setOrders(orders.map((order) => 
  //           order._id === id ? result.order : order
  //         ))
  //       }
  //     } catch (error) {
  //       console.error(error)
  //     } finally {
  //       setCancelling(false);
  //     }
  //   }
  // }

  return (
    <div>

      <UserHeader/>

      <nav className="mx-auto w-full mt-4 max-w-[1200px] px-5">
          <ul className="flex items-center">
            <li className="cursor-pointer">
              <Link to="/">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                  <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
                </svg>
              </Link>
            </li>

            <li>
              <span className="mx-2 text-gray-500">&gt;</span>
            </li>

            <li onClick={() => navigate('/profile')} className="cursor-pointer text-gray-500">Account</li>

            <li>
              <span className="mx-2 text-gray-500">&gt;</span>
            </li>

            <li className="cursor-pointer text-gray-500">Order History</li>
          </ul>
      </nav>

      <section
        className="container mx-auto w-full flex-grow max-w-[1200px] border-b py-5 lg:flex lg:flex-row lg:py-10"
      >

      <ProfileSidebar/>

      <section className="w-full max-w-[1200px] px-5 pb-10">
          {loading ? (
            <div className="flex items-center justify-center h-[200px]">
              <div className="text-center">
                <div className="loader border-t-4 border-b-4 border-gray-900 h-10 w-10 mx-auto rounded-full animate-spin"></div>
                <p className="mt-3 text-gray-500">Loading your orders...</p>
              </div>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex items-center justify-center h-[150px]">
              <div className="text-center">
                <p className="text-gray-500 text-lg">No orders found!</p>
                <Link
                  to="/all-products"
                  className="mt-4 inline-block bg-violet-900 text-white px-5 py-2 rounded"
                >
                  Browse Products
                </Link>
              </div>
            </div>
          ) : (
            <table className="table-fixed w-full border-collapse">
              <thead className="h-16 bg-neutral-100">
                <tr>
                  <th className="text-left px-4 py-2 ">ORDER</th>
                  <th className="text-left px-5 py-2">DATE</th>
                  <th className="text-left px-4 py-2">TOTAL</th>
                  <th className="text-left px-4 py-2 w-48">STATUS</th>
                  <th className="text-left px-4 py-2">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="h-[100px] border-b">
                    <td className="text-center align-middle px-4 py-2">
                      #{order._id.slice(5)}
                    </td>
                    <td className="text-center align-middle px-6 py-2">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="text-center align-middle px-4 py-2">
                      ₹{order.total.toFixed(2)}
                    </td>
                    <td className="text-center align-middle px-4 py-2">
                      <span
                        className={`border-2 py-1 px-3 ${
                          (order.orderStatus === "Delivered" && !order.returnReason)
                            ? "text-green-500 border-green-500"
                            : (order.orderStatus === "Cancelled" || order.orderStatus === 'Returned')
                            ? "text-red-600 border-red-600"
                            : "text-orange-400 border-orange-400"
                        }`}
                      >
                        {(order.returnReason && order.orderStatus !== 'Returned') ? 'Return requested' : order.orderStatus}
                      </span>
                    </td>
                    <td className="flex text-center align-middle px-4 py-2">
                      <Link
                        to={`/order/${order._id}`}
                        className="bg-amber-400 px-4 py-2 rounded mt-5"
                      >
                        <button className="text-center">View</button>
                      </Link>
                      {/* {order.orderStatus === "Pending" && (
                        <button
                          disabled={cancelling}
                          onClick={() => handleCancelOrder(order._id)}
                          className="bg-red-500 px-4 py-2 rounded mx-3 mt-5"
                        >
                          Cancel
                        </button>
                      )}
                      {order.orderStatus === "Delivered" && (
                        <button
                          disabled={cancelling}
                          onClick={() => handleReturnOrder(order._id)}
                          className="bg-red-500 px-4 py-2 rounded mx-3 mt-5"
                        >
                          Return
                        </button>
                      )} */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </section>

      <UserFooter/>
      
    </div>
  )
}

export default OrderHistory
