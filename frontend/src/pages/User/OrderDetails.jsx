import React, { useEffect, useState } from 'react'
import UserHeader from '../../components/User/Header';
import UserFooter from '../../components/User/Footer';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ProfileSidebar from '../../components/User/ProfileSidebar';
import { cancelOrder, getOrderDetails, retryPayment, requestReturn, updatePaymentStatus } from '../../api/User/Order';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const initiatePayment = async (orderId, razorpayOrderId, amount, onSuccess) => {
  const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY, 
      amount: amount * 100, 
      currency: 'INR',
      name: 'MayBell Handbags', 
      description: 'Order Payment',
      order_id: razorpayOrderId, 
      handler: async function (response) {
          try {
            const paymentUpdate = await updatePaymentStatus(orderId, response.razorpay_order_id);
            if (paymentUpdate) {
              // toast.success('Payment successfull!');
              onSuccess();
            }
          } catch (error) {
            console.error('payment error', error);
          }
      },
      theme: {
          color: '#3399cc', 
      },
  };

  const rzp = new window.Razorpay(options);
  rzp.open();
};

const OrderDetails = () => {

  const { orderId } = useParams();
  const [loading, setLoading] = useState('');
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shippingAddress, setShippingAddress] = useState({});
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Pending');
  const [cancelling, setCancelling] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [reason, setReason] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);

      const result = await getOrderDetails(orderId);

      if (result) {
        setItems(result.order.items);
        setSubtotal(result.order.subtotal);
        if (result.order.discount) setDiscount(result.order.discount);
        setShippingAddress(result.order.shippingAddress);
        setStatus(result.order.orderStatus);
        setPaymentMethod(result.order.paymentMethod);
        setPaymentStatus(result.order?.paymentStatus);
        setDate(new Date(result.order.createdAt).toLocaleDateString());
        setReason(result?.order?.returnReason);
      }

    } catch (error) {
      console.error(error);
      navigate('/not-found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleCancelOrder = async () => {
    if (window.confirm('Do you want to cancel this entire order?')) {
      try {
        setCancelling(true);

        const result = await cancelOrder(orderId);

        if (result) {
          setStatus('Cancelled');
          toast.success('Order cancelled successfully!');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setCancelling(false);
      }
    }
  };

  const handleReturnRequest = async () => {
      try {
        setCancelling(true);

        if (!reason || reason.length < 5) {
          toast.error('Reason should be atleast five letters long!');
          return;
        }

        const result = await requestReturn(orderId, reason);

        if (result) {
          setStatus('Return requested');
          toast.success('Return requested successfully!');
          onClose();
        }
      } catch (error) {
        console.error(error);
      } finally {
        setCancelling(false);
      }
  };

  const onClose = () => {
    setIsModalOpen(false);
    setReason('');
  }

  const handlePaymentSuccess = () => {
    toast.success('Payment succssful!')
    setPaymentStatus('Paid');
  };

  const handleRetryPayment = async () => {
    try {
      setRetrying(true);

      const result = await retryPayment(orderId);
      if (result) {
        await initiatePayment(orderId, result.razorpayOrderId, result.amount, handlePaymentSuccess);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setRetrying(false);
    }
  };

  const handleInvoiceDownload = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width

    doc.setFont("helvetica", "normal"); 
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("MayBell", pageWidth - 20, 20, { align: "right" });
    doc.text("support@maybell.com", pageWidth - 20, 25, { align: "right" });
    doc.text("Room No.III/9, 3rd Floor, SDF Building,", pageWidth - 20, 30, { align: "right" });
    doc.text("Kinfra Techno Industrialpark", pageWidth - 20, 35, { align: "right" });
    doc.text("Calicut University PO, Kakkanchery,", pageWidth - 20, 40, { align: "right" });
    doc.text("Kerala 673635", pageWidth - 20, 45, { align: "right" });

    const invoiceData = {
      items,
      subtotal,
      discount,
      date,
      status,
      shippingAddress,
      paymentMethod,
      paymentStatus,
      total: subtotal + 100 - discount,
    }

    doc.setFontSize(22);
    doc.setTextColor(0);
    doc.text("INVOICE", 20, 70);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Invoice Number: INV-${orderId.slice(6)}`, 20, 80);
    doc.text(`Date: ${invoiceData.date}`, 20, 85);
    // doc.text(`Order ID: ${order.orderReference}`, 20, 90);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Bill To:', 20, 95);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`${invoiceData.shippingAddress?.name}`, 20, 102);
    doc.text(`${invoiceData.shippingAddress?.street}`, 20, 107);
    doc.text(`${invoiceData.shippingAddress?.city}`, 20, 112);
    doc.text(`${invoiceData.shippingAddress?.state}`, 20, 117);
    doc.text(`${invoiceData.shippingAddress?.country}`, 20, 122);
    doc.text(`Phone: ${invoiceData.shippingAddress?.phone}`, 20, 127);

    doc.setFillColor(240, 240, 240);
    doc.rect(20, 140, pageWidth - 40, 10, "F");
    doc.setTextColor(0);
    doc.setFontSize(10);
    doc.text("Item", 25, 147);
    doc.text("Quantity", 100, 147, { align: "center" });
    doc.text("Price", 140, 147, { align: "center" });
    doc.text("Total", 180, 147, { align: "right" });

    let yPos = 160;
    invoiceData.items.forEach((item) => {
      doc.setTextColor(100);
      doc.text(item.product.name, 25, yPos);
      doc.text(item.quantity.toString(), 100, yPos, { align: "center" });
      doc.setFontSize(10); 
      doc.text(item.price.toString(), 140, yPos, { align: "center" });
      doc.text((item.price * item.quantity).toString(), 180, yPos, { align: "right" });
      yPos += 10;
    });

    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 5;
    doc.setTextColor(0);
    doc.text("Subtotal:", 140, yPos);
    doc.setFontSize(10); 
    doc.text(invoiceData.subtotal.toFixed(2).toString(), 180, yPos, { align: "right" });
    yPos += 10;
    doc.text("Shipping Charge:", 140, yPos);
    doc.setFontSize(10); 
    const shippingCharge = 100; 
    doc.text(shippingCharge.toFixed(2).toString(), 180, yPos, { align: "right" });
    yPos += 10;
    doc.text("Discount:", 140, yPos);
    doc.setFontSize(10); 
    doc.text(invoiceData.discount.toFixed(2).toString(), 180, yPos, { align: "right" });
    yPos += 10;
    doc.setFontSize(12);
    doc.text("Total:", 140, yPos);
    doc.text(`Rs. ${(invoiceData.total).toFixed(2)}`, 180, yPos, { align: "right" });

    yPos += 15;
    doc.setFontSize(10);
    doc.text(`Payment Method: ${invoiceData.paymentMethod}`, 20, yPos);
    doc.text(`Payment Status: ${invoiceData.paymentStatus}`, 20, yPos + 5);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Thank you for shopping with MayBell!", pageWidth / 2, 270, { align: "center" });

    doc.save(`Order_${orderId.slice(6)}_Invoice.pdf`);
  }

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

            <li onClick={() => navigate('/order-history')} className="cursor-pointer text-gray-500">Order History</li>

            <li>
              <span className="mx-2 text-gray-500">&gt;</span>
            </li>

            <li className="cursor-pointer text-gray-500">Order Overview</li>
          </ul>
      </nav>

      <section
        className="container mx-auto w-full flex-grow max-w-[1200px] border-b py-5 lg:flex lg:flex-row lg:py-10"
      >
        <ProfileSidebar/>

        {loading ? (
          <div className="flex items-center justify-center h-[600px]">
          <div className="text-center">
            <div className="loader border-t-4 border-b-4 border-gray-900 h-10 w-10 mx-auto rounded-full animate-spin"></div>
            <p className="mt-3 text-gray-500">Loading your orders...</p>
          </div>
        </div>
        ) : (
          <section className="w-full max-w-[1200px] gap-3 px-5 pb-10">
          <table className="hidden w-full md:table">
            <thead className="h-16 bg-neutral-100">
              <tr>
                <th>ITEM</th>
                <th>PRICE</th>
                <th>QUANTITY</th>
                <th>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="h-[100px] border-b">
                  <td className="align-middle">
                    <div className="flex">
                      <img
                        className="w-[90px]"
                        src={item.product.images[0]}
                        alt='item.alt'
                      />
                      <div className="ml-3 flex flex-col justify-center">
                        <p className="text-xl font-bold">{item.product.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="mx-auto text-center">₹{item.price}</td>
                  <td className="text-center align-middle">{item.quantity}</td>
                  <td className="mx-auto text-center">₹{item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <section className="my-5 flex w-full flex-col gap-4 lg:flex-row">
            {/* Order Summary */}
            <div className="lg:w-1/2">
              <div className="border py-5 px-4 shadow-md">
                <p className="font-bold">ORDER SUMMARY</p>

                <div className="flex justify-between border-b py-5">
                  <p>Subtotal</p>
                  <p>₹{subtotal}</p>
                </div>

                <div className="flex justify-between border-b py-5">
                  <p>Shipping</p>
                  <p>₹100</p>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between border-b py-5">
                    <p>Discount</p>
                    <p>-₹{discount}</p>
                  </div>
                )}

                <div className="flex justify-between py-5">
                  <p>Total</p>
                  <p>₹{subtotal + 100 - discount}</p>
                </div>
                
                <div className="flex flex-wrap justify-between mt-5">
                  {status === 'Pending' && (
                    <button
                      onClick={() => handleCancelOrder()}
                      disabled={cancelling}
                      className="bg-red-500 px-4 py-2 rounded"
                    >
                      Cancel Order
                    </button>
                  )}
                  {(status === 'Delivered' && !reason) && (
                    <button
                      onClick={() => setIsModalOpen(true)}
                      disabled={cancelling}
                      className="bg-red-500 px-4 py-2 rounded"
                    >
                      Request Return
                    </button>
                  )}
                  {status !== 'Cancelled' && (paymentStatus === 'Paid' || paymentStatus === 'Refunded') && (
                    <button
                      onClick={() => handleInvoiceDownload()}
                      className="bg-violet-900 px-4 py-2 rounded text-white"
                    >
                      Download Invoice
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Order Information */}
            <div className="lg:w-1/2">
              <div className="border py-5 px-4 shadow-md">
                <p className="font-bold">ORDER INFORMATION</p>

                <div>
                  <p>Order #{orderId}</p>
                </div>

                <div className="flex flex-col border-b py-5">
                  <p>
                    Status:{" "}
                    <span className={`font-bold ${
                          (status === "Delivered" && !reason)
                            ? "text-green-500 border-green-500"
                            : (status === "Cancelled" || status === "Returned")
                            ? "text-red-600 border-red-600"
                            : "text-orange-400 border-orange-400"
                        }`}>
                      {(reason && status !== 'Returned') ? 'Return requested' : status}
                    </span>
                  </p>
                  <p>Date: {date}</p>
                </div>

                <div className="flex flex-col border-b py-5">
                  <p className="font-bold">ADDRESS INFORMATION</p>
                  <p>Name: {shippingAddress?.name}</p>
                  <p>Country: {shippingAddress?.country}</p>
                  <p>State: {shippingAddress?.state}</p>
                  <p>City: {shippingAddress?.city}</p>
                  <p>Zip-Code: {shippingAddress?.zipCode}</p>
                  <p>Street: {shippingAddress?.street}</p>
                  <p>Phone: {shippingAddress?.phone}</p>
                </div>

                <div className="flex flex-col py-5">
                  <div className="flex justify-between items-center">
                    <p className="font-bold">PAYMENT INFORMATION</p>
                    {paymentStatus === 'Pending' &&
                      paymentMethod === 'Razorpay' && (
                      <button 
                        className="bg-violet-900 text-white px-4 py-1 rounded-md hover:bg-violet-800 transition"
                        onClick={handleRetryPayment}
                        disabled={retrying}
                      >
                        {retrying ? 'Retrying...' : 'Retry Payment'}
                      </button>
                    )}
                  </div>
                  <p>Payment method: {paymentMethod}</p>
                  <p>Payment status: {paymentStatus}</p>
                </div>
              </div>
            </div>
          </section>
        </section>
        )}
        

      </section>

      {isModalOpen && 
        (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-lg w-96">
                <h2 className="text-lg font-semibold mb-4">Request Return</h2>
                <textarea
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter your reason for return..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                />
                <div className="mt-4 flex justify-between">
                    <button
                        className="bg-gray-500 text-white py-2 px-4 rounded-md"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className="bg-blue-500 text-white py-2 px-4 rounded-md"
                        onClick={handleReturnRequest}
                        disabled={cancelling}
                    >
                        {cancelling ? "Processing..." : "Submit Request"}
                    </button>
                </div>
            </div>
        </div>
      )}

      <UserFooter/>
    </div>
  )
}

export default OrderDetails;
