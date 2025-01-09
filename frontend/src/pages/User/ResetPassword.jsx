import React, { useState } from "react";
import UserHeader from "../../components/User/Header";
import UserFooter from "../../components/User/Footer";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../../api/User/userAuth";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const email = location.state?.email;
  const navigate = useNavigate();

  const validatePasswords = () => {
    let tempErrors = {};

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!newPassword) {
      tempErrors.password = "This field is required";
    } else if (newPassword.length < 6) {
      tempErrors.password = "Password must be atleast 6 characters long";
    } else if (!passwordRegex.test(newPassword)) {
      tempErrors.password = "Password must contain atleast one letter, one number and one special character!";
    }

    if (newPassword !== confirmPassword) {
      tempErrors.confirmPassword = "Passwords does not match!"
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  }

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!validatePasswords()) {
      return;
    }

    try {
      setLoading(true);

      const result = await resetPassword({ email, password: newPassword });
      if (result) {
        toast.success('Password reset successfully!');
        navigate('/login');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <UserHeader />
      <div className="flex justify-center items-center py-5">
        <div className="border my-10 w-full max-w-md p-8 space-y-8 bg-white rounded shadow-md">
          <h2 className="text-2xl font-bold text-center">Reset Password</h2>
          <p className="text-center text-gray-600">
            Enter and confirm your new password below to reset your password.
          </p>

          <form onSubmit={handleResetPassword}>
            {/* New Password Input */}
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-4 py-2 border rounded text-gray-700 focus:outline-none focus:border-violet-900"
            />
            {errors && <div className="text-red-600 mt-2">{errors.password}</div>}

            {/* Confirm Password Input */}
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-4 py-2 mt-4 border rounded text-gray-700 focus:outline-none focus:border-violet-900"
            />

            {errors && <div className="text-red-600 mt-2">{errors.confirmPassword}</div>}

            {/* Reset Password Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-violet-900 text-white py-2 rounded"
            >
              {loading ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>
        </div>
      </div>
      <UserFooter />
    </>
  );
};

export default ResetPassword;