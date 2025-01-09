import React, { useState } from "react";
import UserHeader from "../../components/User/Header";
import UserFooter from "../../components/User/Footer";
import { googleSignIn, signup } from "../../api/User/userAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../../firebase/firebase";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    let tempErrors = {};

    if (!formData.username.trim()) {
      tempErrors.username = "Name is required!";
    } else if (/^\s/.test(formData.username)) {
      tempErrors.username = "Name cannot start with a space!";
    } else if (formData.username.length < 4) {
      tempErrors.username = "Name must be atleast 4 characters long!";
    } else if (!/^[A-Za-z\s]+$/.test(formData.username)) {
      tempErrors.username = "Name can only contain letters and spaces!";
    }

    if (!formData.email.trim()) {
      tempErrors.email = "Email is required!";
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
    ) {
      tempErrors.email = "Invalid email format!";
    }

    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!formData.password) {
      tempErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      tempErrors.password = "Password must be atleast 6 characters long";
    } else if (!passwordRegex.test(formData.password)) {
      tempErrors.password =
        "Password must contain atleast one letter, one number and one special character!";
    }

    if (formData.password !== confirmPassword) {
      tempErrors.confirmPassword = "Passwords does not match!"
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);

      const response = await signup(formData);

      if (response) {
        toast.success("Sign up successful! Please verify your email.");
        navigate("/verify-otp", { state: { email: formData.email, nextPage: 'Login' } });
      }
    } catch (error) {
      console.error("Signup failed: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
    
      setLoading(true);

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDetails = {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
      }

      const response = await googleSignIn(userDetails);

      if (response) {
        localStorage.setItem('userToken', response?.data?.token);
        navigate('/');
      }
    } catch (error) {
      console.error('google signup error',error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <UserHeader />
      <section className="mx-auto mt-10 w-full flex-grow mb-10 max-w-[1200px] px-5">
        <div className="container mx-auto border px-5 py-5 shadow-sm md:w-1/2">
          <div>
            <p className="text-4xl font-bold">CREATE AN ACCOUNT</p>
            <p>Register for new customer</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col">
            <label htmlFor="name">Name</label>
            <input
              className="mb-3 mt-3 border px-4 py-2"
              type="text"
              id="name"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
            <div className="text-red-600">{errors.username}</div>

            <label className="mt-3" htmlFor="email">
              Email Address
            </label>
            <input
              className="mt-3 border px-4 py-2"
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            <div className="text-red-600">{errors.email}</div>

            <label className="mt-5" htmlFor="password">
              Password
            </label>
            <input
              className="mt-3 border px-4 py-2"
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            <div className="text-red-600">{errors.password}</div>

            <label className="mt-5" htmlFor="confirm-password">
              Confirm password
              </label>
            <input
              className="mt-3 border px-4 py-2"
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <div className="text-red-600">{errors.confirmPassword}</div>

            <button
              type="submit"
              disabled={loading}
              className="my-5 w-full bg-violet-900 py-2 text-white"
            >
              {loading ? "Signing up..." : "SIGN UP"}
            </button>
          </form>

          <p className="text-center text-gray-500">OR SIGN UP WITH</p>

          <div className="my-5 flex gap-2">
            <button onClick={handleGoogleSignIn} className="w-full bg-orange-500 py-2 text-white">
              GOOGLE
            </button>
          </div>

          <p className="text-center">
            Already have an account?{" "}
            <a
              onClick={() => navigate("/login")}
              className="text-violet-900 cursor-pointer"
            >
              Login now
            </a>
          </p>
        </div>
      </section>
      <UserFooter />
    </div>
  );
};

export default Signup;
