import React, { useState, useEffect } from "react";
import { verifyOtp, resendOtp } from "../../api/User/userAuth";
import { toast } from "react-toastify";
import { useLocation, useNavigate } from "react-router-dom";

const OtpVerification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [resendVisible, setResendVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const location = useLocation();
  const email = location.state?.email;
  const nextPage = location.state?.nextPage;
  const navigate = useNavigate();

  useEffect(() => {
    const countdown = setInterval(() => {
      if (timer > 0) {
        setTimer((prevTime) => prevTime - 1);
      } else {
        setResendVisible(true);
      }
    }, 1000);

    return () => clearInterval(countdown);
  }, [timer]);

  const handleOtpChange = (value, index) => {
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      toast.error("Please enter a 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const response = await verifyOtp(email, enteredOtp);
      if (response) {
        toast.success("OTP Verified Successfully!");
        if (nextPage === 'Login') {
          navigate('/login');
        } else {
          navigate('/reset-password', { state: { email: email } });
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResendLoading(true);
      setResendVisible(false);
      setTimer(60);

      const response = await resendOtp(email);
      if (response) {
        toast.success("OTP Resent Successfully!");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded shadow-md">
        <h2 className="text-2xl font-bold text-center">OTP Verification</h2>
        <p className="text-center text-gray-600">
          Enter the 6-digit code sent to your email.
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex justify-center space-x-2 mt-4"
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleOtpChange(e.target.value, index)}
              className="w-12 h-12 text-center text-xl border rounded focus:outline-none focus:border-violet-900"
            />
          ))}
        </form>

        <div className="mt-6 text-center">
          {resendVisible ? (
            <button
              onClick={handleResendOtp}
              className="text-violet-900 underline"
              disabled={resendLoading}
            >
              {resendLoading ? "Resending OTP..." : "Resend OTP"}
            </button>
          ) : (
            <p className="text-gray-600">Resend OTP in {timer} seconds</p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-4 bg-violet-900 text-white py-2 rounded"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
      </div>
    </div>
  );
};

export default OtpVerification;
