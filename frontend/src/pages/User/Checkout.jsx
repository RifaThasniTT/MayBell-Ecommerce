import React, { useEffect, useState } from 'react'
import UserHeader from '../../components/User/Header'
import UserFooter from '../../components/User/Footer'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { getAddresses } from '../../api/User/Address';
import { placeOrder, updatePaymentStatus } from '../../api/User/Order';
import { toast } from 'react-toastify';
import { clearCart } from '../../api/User/Cart';
import { FaGift, FaTimes } from 'react-icons/fa';
import { getApplicableCoupons } from '../../api/User/Coupons';

const initiatePayment = async (orderId, razorpayOrderId, amount) => {
  const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY, 
      amount: amount * 100, 
      currency: 'INR',
      name: 'MayBell Handbags', 
      description: 'Order Payment',
      order_id: razorpayOrderId, 
      handler: async function (response) {
          console.log('Payment Success:', response);
          console.log(orderId);
          console.log(response.razorpay_order_id);
          try {
            const paymentUpdate = await updatePaymentStatus(orderId, response.razorpay_order_id);
            if (paymentUpdate) {
              console.log('payed????');
              toast.success('Payment successfull!');
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

const Checkout = () => {

    const [modalOpen, setModalOpen] = useState(false);
    const navigate = useNavigate();
    const [paymentMethod, setPaymentMethod] = useState('');
    const [addresses, setAddresses] = useState([]);
    const [address, setAddress] = useState({
        name: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
    });
    const location = useLocation();
    const { subtotal } = location?.state;
    const [loading, setLoading] = useState();
    const [errors, setErrors] = useState(null);
    const [placing, setPlacing] = useState(false);
    const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
    const [coupons, setCoupons] = useState([]);
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);

    const handleModalOpen = () => {
        const fetchAddresses = async () => {
            try {
                setLoading(true);

                const result = await getAddresses();

                if (result) {
                    setAddresses(result.addresses);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAddresses();
        setModalOpen(true);
    };

    const handlePaymentChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddress((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddressSelection = (selectedAddress) => {
        setAddress(selectedAddress);
        setModalOpen(false);
    };

    const validateForm = () => {
        let tempErrors = {};
      
        if (!address.name.trim()) {
          tempErrors.name = "Name is required!";
        } else if (/^\s/.test(address.name)) {
          tempErrors.name = "Name cannot start with a space!";
        } else if (address.name.length < 3) {
          tempErrors.name = "Name must be at least 3 characters long!";
        } else if (!/^[A-Za-z\s]+$/.test(address.name)) {
          tempErrors.name = "Name can only contain letters and spaces!";
        }
      
        if (!address.phone.trim()) {
          tempErrors.phone = "Phone number is required!";
        } else if (!/^\d{10}$/.test(address.phone)) {
          tempErrors.phone = "Phone number must be exactly 10 digits!";
        }
      
        if (!address.street.trim()) {
          tempErrors.street = "Street address is required!";
        } else if (address.street.length < 5) {
          tempErrors.street = "Street address must be at least 5 characters long!";
        }
      
        if (!address.city.trim()) {
          tempErrors.city = "City is required!";
        } else if (!/^[A-Za-z\s]+$/.test(address.city)) {
          tempErrors.city = "City can only contain letters and spaces!";
        }
      
        if (!address.state.trim()) {
          tempErrors.state = "State is required!";
        } else if (!/^[A-Za-z\s]+$/.test(address.state)) {
          tempErrors.state = "State can only contain letters and spaces!";
        }
      
        if (!address.country.trim()) {
          tempErrors.country = "Country is required!";
        } else if (!/^[A-Za-z\s]+$/.test(address.country)) {
          tempErrors.country = "Country can only contain letters and spaces!";
        }
      
        if (!address.zipCode.trim()) {
          tempErrors.zipCode = "ZIP Code is required!";
        } else if (!/^\d{5,6}$/.test(address.zipCode)) {
          tempErrors.zipCode = "ZIP Code must be 5 or 6 digits!";
        }
      
        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleCouponModalOpen = () => {
      const fetchCoupons = async () => {
        try {
            setLoading(true);

            const result = await getApplicableCoupons(subtotal);

            if (result) {
              setCoupons(result.coupons);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
      };
      fetchCoupons();
      setIsCouponModalOpen(true);
    };

    const handleCouponModalClose = () => {
      setIsCouponModalOpen(false);
    };

    const handleApplyCoupon = () => {
      const coupon = coupons.find((c) => c.code === couponCode);
        if (coupon) {
          setDiscount(coupon.discountAmount);
        } else {
          toast.error('Invalid coupon code!');
        }
    };

    const handleRemoveCoupon = () => {
      setDiscount(0);
      setCouponCode('');
    };

    const handleCopyCouponCode = (code) => {
      navigator.clipboard.writeText(code);
      setIsCouponModalOpen(false);
    };

    const handlePlaceOrder = async () => {
        if (!validateForm()) {
            toast.error('Enter valid address!');
            return;
        };

        if (!paymentMethod) {
            toast.error('Select a payment method!');
            return;
        }

        if (subtotal > 2000 && paymentMethod === 'COD') {
          toast.error('Cash on delivery is not available for orders above ₹2000');
          return;
        }

        const orderData = {
            shippingAddress: address,
            paymentMethod,
            couponCode,
        };

        try {
          setPlacing(true);

            const response = await placeOrder(orderData);
            if (response) {
              toast.success('Order placed successfully!');
                if (paymentMethod === 'Razorpay' && response.order.razorpayOrderId) {
                  await initiatePayment(response.order._id, response.order.razorpayOrderId, response.order.total);
                  navigate('/order-success');
                } else {
                  navigate('/order-success');
                }
                clearCart();
            }
            
        } catch (error) {
            console.error(error);
        } finally {
          setPlacing(false);
        }
    };
    
  return (
    <div>
      <UserHeader/>
      <nav className="mx-auto w-full mt-4 max-w-[1200px] px-5 mb-5">
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
                    <li onClick={() => navigate('/cart')} className="cursor-pointer text-gray-500">Cart</li>
                    <li>
                        <span className="mx-2 text-gray-500">&gt;</span>
                    </li>
                    <li className="text-gray-500">Checkout</li>
                </ul>
            </nav>
        <section className="checkout-container mx-auto grid max-w-[1200px] grid-cols-1 gap-10 md:grid-cols-2 pb-10">
            {/* Left Section: Address Input */}
            <div className="address-section p-5 border shadow-md">
                <div className="relative">
                    <button
                        type="button"
                        className="absolute top-0 right-0 bg-violet-900 text-white py-2 px-4 rounded"
                        onClick={handleModalOpen}>
                        Select Address
                    </button>
                    <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
                </div>

                {/* Address Form */}
                <form>
                    {Object.keys(address).filter((key) =>
                        key === 'name' || key === 'phone' || key === 'street' || key === 'city' || key === 'state' || key === 'country' || key === 'zipCode'
                    ).map((key) => (
                        <div className='mb-2' key={key}>
                            <label
                                htmlFor={key}
                                className="block py-2 text-sm font-medium text-gray-700 capitalize"
                            >
                                {key}
                            </label>
                            <input
                                type='text'
                                id={key}
                                name={key}
                                value={address[key]}
                                onChange={handleAddressChange}
                                placeholder={`Enter your ${key}`}
                                className="w-full border border-gray-300 p-1 rounded"
                            />
                            {/* <div className='text-red-500'>{errors.{key}}</div> */}
                        </div>
                    ))}
                </form>
            </div>

            {/* Right Section: Payment Method & Order Summary */}
            <div className="payment-summary-section p-5 border shadow-md">
                <div className="payment-method-section mb-8">
                    <h2 className="text-xl font-semibold mb-4">Payment Method</h2>

                    {/* Payment Method Selection */}
                    <div className="flex flex-col gap-4">
                        {['COD', 'Razorpay', 'Wallet'].map((method) => (
                            <div className="flex items-center" key={method}>
                                <input
                                    type="radio"
                                    id={`payment${method}`}
                                    name="paymentMethod"
                                    value={method}
                                    className="mr-2"
                                    onChange={handlePaymentChange}
                                />
                                <label htmlFor={`payment${method}`}>{method}</label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Coupon Section */}
                <div className="coupon-section mb-8 flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Coupon</h2>
                    <button
                        type="button"
                        onClick={handleCouponModalOpen}
                        className="text-violet-900 hover:text-blue-700"
                    >
                        <FaGift size={24} /> {/* Gift icon */}
                    </button>
                </div>

                {/* Coupon Code Input & Apply/Remove Button */}
                <div className="mb-8">
                    <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        placeholder="Enter coupon code"
                        className="border p-2 w-full mb-4"
                    />
                    <button
                        onClick={discount > 0 ? handleRemoveCoupon : handleApplyCoupon}
                        className="w-full bg-violet-900 text-white py-2 rounded"
                    >
                        {discount > 0 ? 'Remove Coupon' : 'Apply Coupon'}
                    </button>
                </div>

                {/* Order Summary */}
                <div className="order-summary-section border-t ">
                    <h2 className="text-xl font-semibold mt-5 mb-4">Order Summary</h2>
                    <div className="flex justify-between mb-4">
                        <p>Subtotal:</p>
                        <p>₹{subtotal}</p>
                    </div>
                    <div className="flex justify-between mb-4">
                        <p>Shipping:</p>
                        <p>₹100</p>
                    </div>
                    {/* Coupon Discount */}
                    {discount > 0 && (
                        <div className="flex justify-between mb-4">
                            <p>Discount:</p>
                            <p>-₹{discount}</p>
                        </div>
                    )}
                    <div className="flex justify-between mb-4">
                        <p>Total:</p>
                        <p>₹{subtotal + 100 - discount}</p>
                    </div>

                    {/* Checkout Button */}
                    <div className="w-full mt-6">
                        <button disabled={placing} onClick={handlePlaceOrder} type="button" className="w-full bg-violet-900 text-white py-2 rounded">
                            { placing ? 'Placing order' : 'Place Order'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal for Selecting Address */}
            {modalOpen && (
                <div className="modal fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
                    <div className="modal-content w-96 bg-white p-5 rounded max-h-[400px] overflow-y-auto">
                        <h3 className="text-lg font-semibold mb-4">Select an Address</h3>
                        {loading ? (
                          // Loading indicator
                          <div className="flex justify-center items-center">
                            <div className="loader border-t-4 border-violet-900 border-solid rounded-full w-8 h-8 animate-spin"></div>
                            <p className="ml-4 text-gray-600">Loading addresses...</p>
                          </div>
                        ) : addresses.length === 0 ? (
                          // No addresses found
                          <p className="text-gray-600 text-center">No addresses found. Please add a new address.</p>
                        ) : (
                          // List of addresses
                          <ul className="space-y-4">
                            {addresses.map((addr) => (
                              <li
                                key={addr._id}
                                className="border p-4 rounded shadow-md"
                              >
                                <div className="flex items-start gap-3">
                                  {/* Radio Button */}
                                  <input
                                    type="radio"
                                    id={`address-${addr._id}`}
                                    name="selectedAddress"
                                    className="mt-1"
                                    onChange={() => handleAddressSelection(addr)}
                                  />
                                  <label htmlFor={`address-${addr._id}`} className="flex flex-col">
                                    {/* Address Details */}
                                    <span className="font-bold">{addr.name}</span>
                                    <span>{addr.phone}</span>
                                    <span>{addr.street}</span>
                                    <span>{addr.city}</span>
                                    <span>{addr.state}, {addr.country}</span>
                                    <span>{addr.zipCode}</span>
                                  </label>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                        <button
                            type="button"
                            className="mt-4 w-1/6 bg-gray-500 text-white py-2 rounded"
                            onClick={() => setModalOpen(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Coupon Modal */}
            {isCouponModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded shadow-md w-96">
                        <div className="flex justify-between mb-4">
                            <h2 className="text-xl font-semibold">Available Coupons</h2>
                            <button
                                onClick={handleCouponModalClose}
                                className="text-gray-600 hover:text-gray-800"
                            >
                                <FaTimes size={20} /> {/* Close icon */}
                            </button>
                        </div>

                        {coupons.length === 0 ? (
                            <p>No available coupons at the moment.</p>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {coupons.map((coupon) => (
                                    <div key={coupon.code} className="flex justify-between items-center my-2">
                                        <span>{coupon.code} - ₹{coupon.discountAmount} off</span>
                                        <button
                                            onClick={() => handleCopyCouponCode(coupon.code)}
                                            className="text-blue-500"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                </div>
            )}
        </section>
      <UserFooter/>
    </div>
  )
}

export default Checkout;
