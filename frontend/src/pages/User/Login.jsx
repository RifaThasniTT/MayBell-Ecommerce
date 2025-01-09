import React, { useState } from "react";
import UserHeader from "../../components/User/Header";
import UserFooter from "../../components/User/Footer";
import { useNavigate } from "react-router-dom";
import { googleSignIn, login } from "../../api/User/userAuth";
import { toast } from "react-toastify";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../../firebase/firebase";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    let tempErrors = {};

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

      const response = await login(formData);

      if (response) {
        localStorage.setItem("userToken", response.token);
        toast.success("Logged In Successfully!");
        navigate("/");
      }
    } catch (error) {
      console.error("Login failed: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
    
      setLoading(true);

      const result = await signInWithPopup(auth, provider);
      console.log("result:",result)
      const user = result.user;
      console.log("user", user);

      const userDetails = {
        uid: user.uid,
        name: user.displayName,
        email: user.email,
      }
      console.log('user details: ', userDetails);

      const response = await googleSignIn(userDetails);

      if (response) {
        localStorage.setItem('userToken', response?.data?.token)
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
      <section className="mx-auto flex-grow w-full mt-10 mb-10 max-w-[1200px] px-5">
        <div className="container mx-auto border px-5 py-5 shadow-sm md:w-1/2">
          <div>
            <p className="text-4xl font-bold">LOGIN</p>
            <p>Welcome back, customer!</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col">
            <label htmlFor="email">Email Address</label>
            <input
              className="mb-3 mt-3 border px-4 py-2"
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <div className="text-red-600">{errors.email}</div>}

            <label htmlFor="password">Password</label>
            <input
              className="mt-3 border px-4 py-2"
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
            {errors.password && (
              <div className="text-red-600">{errors.password}</div>
            )}

            <div className="mt-4 flex justify-between">
              <a onClick={() => navigate('/forgot-password')} className="cursor-pointer text-violet-900">Forgot password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="my-5 w-full bg-violet-900 py-2 text-white"
            >
              {loading ? "Logging In..." : "LOG IN"}
            </button>
          </form>

          <p className="text-center text-gray-500">OR LOGIN WITH</p>

          <div className="my-5 flex gap-2">
            <button onClick={handleGoogleSignIn} className="w-full bg-orange-500 py-2 text-white">
              GOOGLE
            </button>
          </div>

          <p className="text-center">
            Don't have an account?{" "}
            <a
              onClick={() => navigate("/signup")}
              className="text-violet-900 cursor-pointer"
            >
              Register now
            </a>
          </p>
        </div>
      </section>
      <UserFooter />
    </div>
  );
};

export default Login;
