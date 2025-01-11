import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { addToCart } from '../../api/User/Cart';
import { addToWishlist } from '../../api/User/Wishlist';

const ProductCard = ({ product }) => {
 
  const { name, price, images, description, stock, discountPrice } = product;
  const imageUrl = images && images.length > 0 ? images[0] : 'https://via.placeholder.com/150'; 
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [loading, setLoading] = useState(false);

  const addCart = async () => {
    try {
      const token = localStorage.getItem('userToken');
      if (!token) {
        toast.info('Please log in to add product to your cart.');
        navigate('/login');
        return;
      }

      setAdding(true);

      const result = await addToCart({ productId: product._id, quantity: 1 });

      if (result) {
        toast.success('Product added to cart successfully!');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAdding(false);
    }
  };

  const addWishlist = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('userToken');
      if (!token) {
        toast.info('Please login to add product to your wishlist.');
        navigate('/login');
        return;
      }

      const result = await addToWishlist(token, { productId: product._id });

      if (result) {
        toast.success(result.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col">
      <div className="relative flex">
        <img
          className=""
          src={imageUrl}
          alt={name}
        />

        <div className="absolute flex h-full w-full items-center justify-center gap-3 opacity-0 duration-150 hover:opacity-100">
          <a
            onClick={() => navigate(`/product/${product._id}`)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-amber-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-4 w-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </a>
          <span
            onClick={addWishlist}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-amber-400"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.75 0 01-.704 0l-.003-.001z"
              />
            </svg>
          </span>
        </div>
      </div>

      <div>
        <p className="mt-2">{name}</p>
          <p className="font-medium text-violet-900">
          ₹{discountPrice}
          { discountPrice !== price && (
            <span className="px-2 text-sm text-gray-500 line-through">₹{price}</span>
          )}
        </p>


        <div className="flex items-center">
          {[...Array(5)].map((_, index) => (
            <svg
              key={index}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4 text-yellow-400"
            >
              <path
                fillRule="evenodd"
                d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                clipRule="evenodd"
              />
            </svg>
          ))}
          <p className="text-sm text-gray-400">({stock? stock : "No stock"})</p>
        </div>

        <div>
          <button onClick={addCart} disabled={adding} className="my-5 h-10 w-full bg-violet-900 text-white">
            { adding ? 'Adding to Cart...': 'Add to cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
