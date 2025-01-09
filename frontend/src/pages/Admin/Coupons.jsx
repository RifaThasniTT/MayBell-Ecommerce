import React, { useEffect, useState } from 'react'
import AdminSidebar from '../../components/Admin/Sidebar'
import { createCoupon, fetchCoupons, toggleCouponStatus } from '../../api/Admin/Coupon';
import { toast } from 'react-toastify';

const Coupons = () => {

    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [couponData, setCouponData] = useState({
        code: '',
        discountAmount: '',
        minPurchaseAmount: '',
        endDate: '',
        usagePerUser: '',
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const getCoupons = async () => {
        try {
            setLoading(true);
            const result = await fetchCoupons();

            if (result) {
                setCoupons(result.coupons);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getCoupons();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCouponData((prev) => ({ ...prev, [name]: value }));
    };

    const validate = () => {
        const validationErrors = {};

        if (!couponData.code.trim()) {
            validationErrors.code = 'Coupon code is required!';
        }
        if (!couponData.discountAmount || isNaN(couponData.discountAmount) || couponData.discountAmount <= 0) {
            validationErrors.discountAmount = 'Enter a valid discount amount.';
        }
        if (couponData.minPurchaseAmount && (isNaN(couponData.minPurchaseAmount) || couponData.minPurchaseAmount < 0)) {
            validationErrors.minPurchaseAmount = 'Enter a valid minimum purchase amount.';
        }
        if (!couponData.endDate) {
            validationErrors.endDate = 'End date is required.';
        } else if (new Date(couponData.endDate) <= new Date()) {
            validationErrors.endDate = 'End date must be in the future.';
        }
        if (couponData.usagePerUser && (isNaN(couponData.usagePerUser) || couponData.usagePerUser <= 0)) {
            validationErrors.usagePerUser = 'Enter a valid usage per user (greater than 0).';
        }

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    }

    const handleCreateCouponSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSubmitting(true);

        try {
            const result = await createCoupon(couponData);

            if (result) {
                setCoupons((prevCoupons) => [...prevCoupons, result.coupon]);
                toast.success('New coupon created successfully!');

                setCouponData({
                    code: '',
                    discountAmount: '',
                    minPurchaseAmount: '',
                    endDate: '',
                    usagePerUser: '',
                });
                setErrors({});
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (couponId) => {
        if (window.confirm('Are you sure you want to toggle the status of this coupon?')) {
            try {
                setLoading(true);
                const result = await toggleCouponStatus(couponId);
                
                if (result) {
                    setCoupons((prevCoupons) => 
                            prevCoupons.map((coupon) => 
                            coupon._id === couponId ? { ...coupon, isActive: result.coupon.isActive} : coupon
                        )
                    );
                    toast.success(result.message);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
    };

  return (
    <div>

        <AdminSidebar/>

        <div className="absolute top-14 right-16 w-[1110px]">
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 py-4 px-5 bg-white dark:bg-[#1f2937]">
              <h1 className="text-white text-2xl">Coupon Management</h1>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
                onClick={() => setIsModalOpen(true)}
              >
                Create New Coupon
              </button>
            </div>

            {/* Coupons Table */}
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3">Coupon Code</th>
                  <th className="px-6 py-3">Discount Amount</th>
                  <th className="px-6 py-3">Min Purchase Amount</th>
                  <th className="px-6 py-3">End Date</th>
                  <th className="px-6 py-3">Usage Per User</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {coupons.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      {loading ? 'Loading...' : 'No coupons found.'}
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      key={coupon._id}
                    >
                      <td className="px-6 py-4">{coupon.code}</td>
                      <td className="px-6 py-4">₹{coupon.discountAmount}</td>
                      <td className="px-6 py-4">₹{coupon.minPurchaseAmount}</td>
                      <td className="px-6 py-4">{new Date(coupon.endDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        {coupon.usagePerUser ? coupon.usagePerUser : 'Unlimited'}
                      </td>
                      <td className="px-6 py-4">
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${coupon.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                          onClick={() => handleToggleStatus(coupon._id)}
                          disabled={loading}
                        >
                          {coupon.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {isModalOpen && (
          <div
            id="coupon-modal"
            tabIndex="-1"
            aria-hidden="true"
            className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50"
          >
            <div className="relative p-4 w-full max-w-md max-h-full">
              <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 overflow-y-auto max-h-[80vh]">
                <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Create New Coupon
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    onClick={() => setIsModalOpen(false)}
                  >
                    <svg
                      className="w-3 h-3"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 14"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                      />
                    </svg>
                    <span className="sr-only">Close modal</span>
                  </button>
                </div>
                {/* Modal body */}
                <form
                  className="p-4 md:p-5"
                  onSubmit={handleCreateCouponSubmit}
                >
                  <div className="grid gap-4 mb-4">
                    <div>
                      <label
                        htmlFor="code"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Coupon Code
                      </label>
                      <input
                        type="text"
                        name="code"
                        value={couponData.code}
                        onChange={handleChange}
                        id="code"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Enter coupon code"
                        required
                      />
                      {errors.code && <span className="error text-red-500">{errors.code}</span>}
                    </div>

                    <div>
                      <label
                        htmlFor="discountAmount"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Discount Amount
                      </label>
                      <input
                        type="number"
                        name="discountAmount"
                        value={couponData.discountAmount}
                        onChange={handleChange}
                        id="discountAmount"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Enter discount amount"
                        required
                      />
                      {errors.discountAmount && <span className="error text-red-500">{errors.discountAmount}</span>}
                    </div>

                    <div>
                      <label
                        htmlFor="minPurchaseAmount"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Minimum Purchase Amount
                      </label>
                      <input
                        type="number"
                        name="minPurchaseAmount"
                        value={couponData.minPurchaseAmount}
                        onChange={handleChange}
                        id="minPurchaseAmount"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Enter minimum purchase amount"
                        required
                      />
                      {errors.minPurchaseAmount && <span className="error text-red-500">{errors.minPurchaseAmount}</span>}
                    </div>

                    <div>
                      <label
                        htmlFor="endDate"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        End Date
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={couponData.endDate}
                        onChange={handleChange}
                        id="endDate"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        required
                      />
                      {errors.endDate && <span className="error text-red-500">{errors.endDate}</span>}
                    </div>

                    <div>
                      <label
                        htmlFor="usagePerUser"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Usage Per User
                      </label>
                      <input
                        type="number"
                        name="usagePerUser"
                        value={couponData.usagePerUser}
                        onChange={handleChange}
                        id="usagePerUser"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Enter max usage per user (optional)"
                      />
                      {errors.usagePerUser && <span className="error text-red-500">{errors.usagePerUser}</span>}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn bg-blue-700 text-white hover:bg-blue-800 px-4 py-2 rounded-lg"
                  >
                    Create Coupon
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

      
    </div>
  )
}

export default Coupons
