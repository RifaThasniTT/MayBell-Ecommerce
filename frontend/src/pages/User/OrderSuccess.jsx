import React from 'react'
import UserHeader from '../../components/User/Header'
import UserFooter from '../../components/User/Footer'
import { useNavigate } from 'react-router-dom'

const OrderSuccess = () => {

    const navigate = useNavigate();

  return (
    <div>
      <UserHeader/>

      <div className="flex-grow">
        {/* Order success message */}
        <section className="mt-20 px-4">
          <div className="flex flex-col">
            <p className="text-center text-3xl font-bold">
              Your order is placed successfully!
            </p>
            <div className="text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="mx-auto my-3 h-[60px] w-[60px] text-green-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
                />
              </svg>

              <p>
                Thank you!
              </p>
              <p>You can check your order status on your orders list!</p>

              <div className="mt-10">
                <button
                  onClick={() => navigate('/order-history')}
                  className="mx-auto mb-5 bg-amber-400 px-4 py-2"
                >
                  My Orders history
                </button>
                <br/>
                <button
                  onClick={() => navigate('/all-products')}
                  className="mx-auto mb-10 bg-violet-600 px-4 py-2"
                >
                  Back to Shop
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <UserFooter/>
    </div>
  )
}

export default OrderSuccess
