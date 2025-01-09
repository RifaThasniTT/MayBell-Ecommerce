import React, { useEffect, useState } from 'react'
import UserHeader from '../../components/User/Header'
import UserFooter from '../../components/User/Footer'
import { Link, useNavigate } from 'react-router-dom'
import ProfileSidebar from '../../components/User/ProfileSidebar'
import { getWishlist, removeWishlistProduct } from '../../api/User/Wishlist'
import { addToCart } from '../../api/User/Cart'
import { toast } from 'react-toastify'

const Wishilst = () => {

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('userToken');

      const result = await getWishlist(token);
      
      if (result) {
        setProducts(result.wishlist);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeProduct = async (id, isSilent = false) => {
    try {
      setLoading(true);

      const result = await removeWishlistProduct( { productId: id });

      if (result) {
        setProducts((prevProducts) => prevProducts.filter((product) => product._id !== id));

        if (!isSilent) {
          toast.success('Product removed from wishlist successfully!');
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const addCart = async (productId, isListed, stock) => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        toast.info('Please log in to add products to your cart.');
        navigate('/login');
        return;
      }

      // if (isListed === false) {
      //   toast.error('This product is currently unavailable.');
      //   return;
      // }

      // if (stock <= 0) {
      //   toast.error('This product is currently out of stock.');
      //   return;
      // }

      setLoading(true);

      const result = await addToCart({ productId , quantity: 1 });

      if (result) {
        toast.success('Product added to cart successfully!');
        await removeProduct(productId, true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>

      <UserHeader/>

      {/* Breadcrumbs */}
      <nav className="mx-auto w-full mt-4 max-w-[1200px] px-5">
          <ul className="flex items-center">
            <li className="cursor-pointer">
              <Link to="/">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                  <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
                </svg>
              </Link>
            </li>

            <li>
              <span className="mx-2 text-gray-500">&gt;</span>
            </li>

            <li onClick={() => navigate('/profile')} className="cursor-pointer text-gray-500">Account</li>

            <li>
              <span className="mx-2 text-gray-500">&gt;</span>
            </li>

            <li className="cursor-pointer text-gray-500">Wishlist</li>
          </ul>
      </nav>
      {/* Breadcrumbs */}

      <section
        className="container mx-auto w-full flex-grow max-w-[1200px] border-b py-5 lg:flex lg:flex-row lg:py-10"
      >

        <ProfileSidebar/>

        {loading ? (
          <div className="flex items-center justify-center h-[200px]">
            <div className="text-center">
              <div className="loader border-t-4 border-b-4 border-gray-900 h-10 w-10 mx-auto rounded-full animate-spin"></div>
              <p className="mt-3 text-gray-500">Loading...</p>
            </div>
          </div>
        ) : (
          <section className="hidden w-full max-w-[1200px] grid-cols-1 gap-2 px-5 pb-1 md:grid">
            { products.length > 0 ? (
              products.map((product) => (
                <div
                  key={product._id}
                  className="flex w-full h-32 flex-row items-center justify-between border py-0 px-4"
                >
                  <div className="flex w-full items-center gap-2">
                    <img
                      width="100px"
                      className="object-cover"
                      src={product.images[0]}
                      alt={`${product.name} image`}
                    />
                    <div className="flex flex-col justify-center">
                      <p className="text-xl font-bold">{product.name}</p>
                      <p className="text-gray-500">
                        Availability:{' '}
                        <span className={`font-medium ${product?.availabilityClass}`}>
                          { !product.isListed ? 'Unavailable' : ( product.stock === 0 ? 'Out of stock' : "In stock")}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex w-3/5 items-center justify-between flex-row">
                    <p className="mt-1 text-xl font-bold text-violet-900">
                      ₹{product.price}
                    </p>
                    <div className="mt-1 flex items-center">
                      <button onClick={() => addCart(product._id, product.isListed, product.stock)} className="w-full px-2 bg-amber-400 py-2 lg:px-5">
                        Add to cart
                      </button>
                      <i onClick={() => removeProduct(product._id, false)} className="ml-5 cursor-pointer">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-6 w-6"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </i>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 py-10">
                {/* <img
                  src="https://via.placeholder.com/150" // Replace with a themed placeholder image
                  alt="Empty wishlist"
                  className="w-36 h-36 object-contain"
                /> */}
                <h2 className="text-2xl font-bold text-gray-700">Your Wishlist is Empty</h2>
                <p className="text-gray-500">
                  Looks like you haven't added anything to your wishlist yet.
                </p>
                <button
                  onClick={() => navigate('/all-products')} 
                  className="mt-4 px-4 py-2 bg-violet-900 text-white font-medium rounded hover:bg-violet-800"
                >
                  Explore Products
                </button>
              </div>
            )}
          </section>
        )}

      </section>

      <UserFooter/>
      
    </div>
  )
}

export default Wishilst
