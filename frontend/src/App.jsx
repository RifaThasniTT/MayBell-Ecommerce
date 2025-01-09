import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/User/Home';
import UserLogin from './pages/User/Login';
import Signup from './pages/User/Signup';
import OtpVerification from './pages/User/OtpVerification';
import PageNotFound from './pages/NotFound';
import AdminLogin from './pages/Admin/Login';
import Users from './pages/Admin/Users';
import Categories from './pages/Admin/Categories';
import Products from './pages/Admin/Products';
import AdminProtectedRoute from './components/Admin/ProtectedRoute';
import AllProducts from './pages/User/AllProducts';
import SingleProduct from './pages/User/SingleProduct';
import Profile from './pages/User/Profile';
import ForgotPassword from './pages/User/ForgotPassword';
import ResetPassword from './pages/User/ResetPassword';
import UserProtectedRoute from './components/User/ProtectedRoute';
import Address from './pages/User/Address';
import Cart from './pages/User/Cart';
import Checkout from './pages/User/Checkout';
import OrderSuccess from './pages/User/OrderSuccess';
import OrderHistory from './pages/User/OrderHistory';
import OrderDetails from './pages/User/OrderDetails';
import Orders from './pages/Admin/Orders';
import Wishilst from './pages/User/Wishilst';
import Offers from './pages/Admin/Offers';
import Coupons from './pages/Admin/Coupons';
import Wallet from './pages/User/Wallet';
import SalesReport from './pages/Admin/SalesReport';
import Overview from './pages/Admin/Overview';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/login' element={<UserLogin/>} />
        <Route path="/" element={<Home/>} />
        <Route path='/signup' element={<Signup/>} />
        <Route path='/verify-otp' element={<OtpVerification/>} />
        <Route path='/forgot-password' element={<ForgotPassword/>} />
        <Route path='/reset-password' element={<ResetPassword/>} />
        <Route path='/all-products' element={<AllProducts/>} />
        <Route path='/product/:productId' element={<SingleProduct/>} />
        <Route path='/profile' element={<UserProtectedRoute> <Profile/> </UserProtectedRoute>} />
        <Route path='/address' element={<UserProtectedRoute> <Address/> </UserProtectedRoute>} />
        <Route path='/wishlist' element={<UserProtectedRoute> <Wishilst/> </UserProtectedRoute>} />
        <Route path='/cart' element={<UserProtectedRoute> <Cart/> </UserProtectedRoute>} />
        <Route path='/checkout' element={<UserProtectedRoute> <Checkout/> </UserProtectedRoute>} />
        <Route path='/order-success' element={<UserProtectedRoute> <OrderSuccess/> </UserProtectedRoute>} />
        <Route path='/order-history' element={<UserProtectedRoute> <OrderHistory/> </UserProtectedRoute>} />
        <Route path='/order/:orderId' element={<UserProtectedRoute> <OrderDetails/> </UserProtectedRoute>} />
        <Route path='/wallet' element={<UserProtectedRoute> <Wallet/> </UserProtectedRoute>} />

        <Route path='/admin-login' element={<AdminLogin/>} />
        <Route path='/overview' element={<AdminProtectedRoute> <Overview/> </AdminProtectedRoute>} />
        <Route path='/users' element={<AdminProtectedRoute> <Users/> </AdminProtectedRoute>} />
        <Route path='/categories' element={<AdminProtectedRoute> <Categories/> </AdminProtectedRoute>} />
        <Route path='/products' element={<AdminProtectedRoute> <Products/> </AdminProtectedRoute>} />
        <Route path='/orders' element={<AdminProtectedRoute> <Orders/> </AdminProtectedRoute>} />
        <Route path='/offers' element={<AdminProtectedRoute> <Offers/> </AdminProtectedRoute>} />
        <Route path='/coupons' element={<AdminProtectedRoute> <Coupons/> </AdminProtectedRoute>} />
        <Route path='/sales' element={<AdminProtectedRoute> <SalesReport/> </AdminProtectedRoute>} />
        
        <Route path="*" element={<PageNotFound/>} />
        <Route path="/not-found" element={<PageNotFound/>} />

      </Routes>
      <ToastContainer/>
    </Router>
  )
}

export default App
