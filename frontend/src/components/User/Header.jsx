import React, { useEffect, useState } from 'react';
import companyLogo from '../../assets/images/company-logo.svg';
import { useNavigate } from 'react-router-dom';
import { calculateCount } from '../../api/User/userAuth';

const UserHeader = () => {

  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [wishlistQuantity, setWishlistQuantity] = useState(0);

  useEffect(() => {
    const getCounts = async () => {
      const result = await calculateCount();

      if (result) {
        setCartQuantity(result.cartCount || 0);
        setWishlistQuantity(result.wishlistCount || 0);
      }
    }

    getCounts();
  }, [])

  return (
    <>
      {/* Header */}
      <header className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5">
        <a onClick={() => navigate('/')}>
          <img
            className="cursor-pointer sm:h-auto sm:w-auto"
            src={companyLogo}
            alt="company logo"
          />
        </a>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-8 w-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>
        </div>

        <div className="mx-7 flex gap-8">
          <a
            className="cursor-pointer font-light  duration-100 hover:text-yellow-400 hover:underline"
            onClick={() => navigate('/')}
          >
            Home
          </a>
          <a
            className="font-light cursor-pointer duration-100 hover:text-yellow-400 hover:underline"
            onClick={() => navigate('/all-products')}
          >
            Catalog
          </a>
          <a
            className="font-light cursor-pointer duration-100 hover:text-yellow-400 hover:underline"
            
          >
            About Us
          </a>
          <a
            className="font-light cursor-pointer duration-100 hover:text-yellow-400 hover:underline"
            
          >
            Contact Us
          </a>
        </div>
        

        {/* Navigation Icons */}
        <div className="hidden gap-5 md:flex">
          <a href="/wishlist" className="flex cursor-pointer flex-col items-center justify-center relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>

            {wishlistQuantity > 0 && (
              <span className="absolute top-1 right-0 translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-semibold px-1 py-0 rounded-full">
                {wishlistQuantity}
              </span>
            )}

            <p className="text-xs">Wishlist</p>
          </a>


          <a href="/cart" className="flex cursor-pointer flex-col items-center justify-center relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6"
            >
              <path
                fillRule="evenodd"
                d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z"
                clipRule="evenodd"
              />
            </svg>

            {cartQuantity > 0 && (
              <span className="absolute top-1 right-0 translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-semibold px-1 py-0 rounded-full">
                {cartQuantity}
              </span>
            )}

            <p className="text-xs">Cart</p>
          </a>


          <a onClick={() => navigate('/profile')} className="relative flex cursor-pointer flex-col items-center justify-center">
            <span className="absolute bottom-[33px] right-1 flex h-2 w-2">
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
            <p className="text-xs">Profile</p>
          </a>
        </div>
      </header>

      {/* Mobile Burger Menu */}
      {mobileMenuOpen && (
        <section
          className="absolute left-0 right-0 z-50 h-screen w-full bg-white"
        >
          <div className="mx-auto">
            <div className="mx-auto flex w-full justify-center gap-3 py-4">
              <a
                href="/wishlist"
                className="flex cursor-pointer flex-col items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                  />
                </svg>
                <p className="text-xs">Wishlist</p>
              </a>

              <a
                href="/cart"
                className="flex cursor-pointer flex-col items-center justify-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 004.25 22.5h15.5a1.875 1.875 0 001.865-2.071l-1.263-12a1.875 1.875 0 00-1.865-1.679H16.5V6a4.5 4.5 0 10-9 0zM12 3a3 3 0 00-3 3v.75h6V6a3 3 0 00-3-3zm-3 8.25a3 3 0 106 0v-.75a.75.75 0 011.5 0v.75a4.5 4.5 0 11-9 0v-.75a.75.75 0 011.5 0v.75z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-xs">Cart</p>
              </a>

              <a
                onClick={() => navigate('/profile')}
                className="relative flex cursor-pointer flex-col items-center justify-center"
              >
                <span className="absolute bottom-[33px] right-1 flex h-2 w-2">
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
                <p className="text-xs">Profile</p>
              </a>
            </div>
          </div>
        </section>
      )}
{/* 
<nav className="relative bg-violet-900">
      <div
        className={`mx-auto h-12 w-full max-w-[1200px] items-center md:flex`}
      >
 */}

        {/* <div className="mx-7 flex gap-8">
          <a
            className="cursor-pointer font-light text-white duration-100 hover:text-yellow-400 hover:underline"
            onClick={() => navigate('/')}
          >
            Home
          </a>
          <a
            className="font-light text-white duration-100 hover:text-yellow-400 hover:underline"
            onClick={() => navigate('/all-products')}
          >
            Catalog
          </a>
          <a
            className="font-light text-white duration-100 hover:text-yellow-400 hover:underline"
            href="about-us.html"
          >
            About Us
          </a>
          <a
            className="font-light text-white duration-100 hover:text-yellow-400 hover:underline"
            href="contact-us.html"
          >
            Contact Us
          </a>
        </div> */}

        {/* <div className="ml-auto flex gap-4 px-5">
          <a
            className="cursor-pointer font-light text-white duration-100 hover:text-yellow-400 hover:underline"
            onClick={() => navigate('/login')}
          >
            Login
          </a>

          <span className="text-white">&#124;</span>

          <a
            className="cursor-pointer font-light text-white duration-100 hover:text-yellow-400 hover:underline"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </a>
        </div> */}
      {/* </div>
    </nav> */}
    </>
  );
};

export default UserHeader;
