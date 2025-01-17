import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { login } from '../../api/Admin/AdminAuth';
import { toast } from 'react-toastify';

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
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
        ) {
          tempErrors.email = "Invalid email format!";
        }
    
        // const passwordRegex =/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
        if (!formData.password) {
          tempErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
          tempErrors.password = "Password must be atleast 6 characters long";
        }
        // } else if (!passwordRegex.test(formData.password)) {
        //   tempErrors.password =
        //     "Password must contain atleast one letter, one number and one special character!";
        // }
    
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
            localStorage.setItem("adminToken", response.token);
            toast.success("Logged In Successfully!");
            navigate("/overview");
          }
        } catch (error) {
          console.error("Login failed: ", error);
        } finally {
          setLoading(false);
        }
    };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <section className="mx-auto flex-grow w-full mt-10 mb-10 max-w-[1200px] px-5">
          <div className="container mx-auto border px-5 py-5 shadow-sm md:w-1/2">

            <h1 className='text-black text-4xl font-bold mt-10 mb-8 text-center'>Admin Login</h1>
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col">
              <label htmlFor="email">Email Address</label>
              <input
                className="mb-3 mt-3 border px-4 py-2"
                type="email"
                id="email"
                name='email'
                value={formData.email}
                onChange={handleChange}
              />
              { errors.email && ( <div className="text-red-600">{errors.email}</div> ) }

              <label htmlFor="password">Password</label>
              <input
                className="mt-3 border px-4 py-2"
                type="password"
                id="password"
                name='password'
                value={formData.password}
                onChange={handleChange}
              />
              {errors.password && (
                <div className="text-red-600">{errors.password}</div>
              )}

            <button type='submit' disabled={loading} className="my-10 mb-18 w-full bg-violet-900 py-2 text-white">
              {loading ? 'Logging In...' : 'LOG IN'}
            </button>
            </form>
          </div>
        </section>
    </div>
  )
}

export default Login
