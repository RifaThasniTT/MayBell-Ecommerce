import React, { useState } from 'react'
import UserHeader from '../../components/User/Header';
import UserFooter from '../../components/User/Footer';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../../api/User/userAuth';

const ForgotPassword = () => {

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("")
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();

        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response = await forgotPassword(email);

            if (response) {
                navigate('/verify-otp', { state: { email: email, nextPage: 'resetPassword' } });
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

  return (
    <>
    <UserHeader/>
    <div className="flex justify-center items-center py-5">
      <div className="border my-10 w-full max-w-md p-8 space-y-8 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">Forgot Password</h2>
        <p className="text-center text-gray-600">
          Enter your email address to receive an OTP for resetting your password.
        </p>

        <form onSubmit={handleSendOtp}>
            {/* Email Input */}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full px-4 py-2 border rounded text-gray-700 focus:outline-none focus:border-violet-900"
            />
            { error && <div className="text-red-600">{error}</div> }

            {/* Send OTP Button */}
            <button
              type='submit'
              disabled={loading}
              className="w-full mt-4 bg-violet-900 text-white py-2 rounded"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
        </form>

        {/* Status Message */}
        {/* {message && (
          <p
            className={`text-center mt-4 ${
              message.includes("OTP has been sent")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        )} */}
      </div>
    </div>
    <UserFooter/>
    </>
  )
}

export default ForgotPassword
