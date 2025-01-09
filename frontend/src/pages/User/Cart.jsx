import React, { useEffect, useState } from 'react'
import UserHeader from '../../components/User/Header';
import UserFooter from '../../components/User/Footer';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, removeCartItem, updateCartQuantity } from '../../api/User/Cart';
import { toast } from 'react-toastify';

const Cart = () => {

    const [cart, setCart] = useState({
      items: [],
      subtotal: 0,
      shipping: 100,
      total: 0,
    })
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCart = async () => {
            try {
                setLoading(true);

                const result = await getCart();

                if (result) {
                    setCart(result.cart);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, []);

    const incrementQuantity = async (productId) => {
      try {
        const updatedQuantity = cart.items.find(item => item.product._id === productId).quantity + 1;

        if (updatedQuantity <= 5) {
          const result = await updateCartQuantity(productId, updatedQuantity);

          if (result) {
            setCart(result.cart);
          }
        } else {
          toast.error('You can only add up to 5 units of this product to the cart.');
        }
      } catch (error) {
        console.error(error);
      }
    };

    const decrementQuantity = async (productId) => {
      try {
        const currentQuantity = cart.items.find(item => item.product._id === productId).quantity;

        if (currentQuantity > 1) {
          const updatedQuantity = currentQuantity - 1;
          const result = await updateCartQuantity(productId, updatedQuantity);

          if (result) {
            setCart(result.cart);
          }
        } else {
          toast.error('Quantity must be atleast 1!');
        }
      } catch (error) {
        console.error(error);
      }
    };

    const removeItem = async (productId) => {
      if (window.confirm('Are you sure you want to remove this product from the cart?')) {
        try {
          setLoading(true);
  
          const result = await removeCartItem(productId);
  
          if (result) {
            toast.success('Product removed from cart.');
            setCart(result.cart);
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    };

    const handleCheckout = () => {
        for (let item of cart.items) {
            if (!item.product.isListed) {
                toast.error(`${item.product.name} is no longer available!`);
                return;
            }
            if (item.quantity > item.product.stock) {
                toast.error(`Quantity for ${item.product.name} exceeds available stock!`);
                return;
            }
        }
    
        navigate('/checkout', { state: { subtotal: cart.subtotal } });
    };

  return (
    <div>
            <UserHeader />

            <nav className="mx-auto w-full mt-4 max-w-[1200px] px-5 mb-5">
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
                    <li className="text-gray-500">Cart</li>
                </ul>
            </nav>

            <section className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-3 pb-10 md:grid-cols-3">
                {loading ? (
                    // Loading UI
                    <div className="flex items-center justify-center h-[300px]">
                      <div className="text-center">
                        <div className="loader border-t-4 border-b-4 border-gray-900 h-10 w-10 mx-auto rounded-full animate-spin"></div>
                        <p className="mt-3 text-gray-500">Loading...</p>
                      </div>
                    </div>
                ) : cart.items.length === 0 ? (
                    // Empty Cart UI
                    <div className="col-span-3 flex flex-col items-center justify-center py-20">
                        {/* <img
                            src="/empty-cart.svg" // Replace with the path to your "empty cart" image
                            alt="Empty Cart"
                            className="w-[200px] mb-5"
                        /> */}
                        <p className="text-lg mb-5 font-semibold text-gray-500">Your cart is empty!</p>
                        <Link to="/all-products">
                            <button className="mt-5 bg-violet-900 px-5 py-2 text-white">
                                Shop Now
                            </button>
                        </Link>
                    </div>
                ) : (
                    // Cart Items and Summary
                    <>
                        {/* Cart Table Section */}
                        <div className="col-span-2">
                            <table className="table-fixed w-full">
                                <thead className="h-16 bg-neutral-100">
                                    <tr>
                                        <th>ITEM</th>
                                        <th>PRICE</th>
                                        <th>QUANTITY</th>
                                        <th>TOTAL</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cart.items.map((item) => (
                                        <tr key={item._id} className="h-[100px] border-b">
                                            <td className="align-middle">
                                                <div className="flex">
                                                    <img
                                                        className="w-[90px]"
                                                        src={item?.product?.images[0]}
                                                        alt={`₹{item?.product?.name} image`}
                                                    />
                                                    <div className="ml-3 flex flex-col justify-center">
                                                        <p className="text-l font-bold">{item?.product?.name}</p>
                                                        { !item.product.isListed && <p className='text-sm text-red-500'>(Unavailable)</p>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="mx-auto text-center">₹{item?.product?.discountPrice}</td>
                                            <td className="align-middle">
                                                <div className="flex items-center justify-center">
                                                    <button
                                                        disabled={item.quantity === 1}
                                                        onClick={() => decrementQuantity(item.product._id)}
                                                        className="flex h-8 w-8 cursor-pointer items-center justify-center border duration-50 hover:bg-neutral-100 "
                                                    >
                                                        &minus;
                                                    </button>
                                                    <div className="flex h-8 w-8 cursor-text items-center justify-center border-t border-b active:ring-gray-500">
                                                        {item.quantity}
                                                    </div>
                                                    <button
                                                        onClick={() => incrementQuantity(item.product._id)}
                                                        className="flex h-8 w-8 cursor-pointer items-center justify-center border duration-50 hover:bg-neutral-100 "
                                                    >
                                                        &#43;
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="mx-auto text-center">
                                              ₹{item?.product?.discountPrice * item.quantity}
                                            </td>
                                            <td onClick={() => removeItem(item.product._id)} className="align-middle">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                    className="m-0 h-5 w-5 cursor-pointer"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Order Summary Section */}
                        <div>
                            <div className="mx-2 border py-5 px-4 shadow-md">
                                <p className="font-bold">ORDER SUMMARY</p>

                                <div className="flex justify-between border-b py-5">
                                    <p>Subtotal:</p>
                                    <p>₹{cart.subtotal}</p>
                                </div>

                                <div className="flex justify-between border-b py-5">
                                    <p>Shipping:</p>
                                    <p>₹100</p>
                                </div>

                                <div className="flex justify-between py-5">
                                    <p>Total:</p>
                                    <p>₹{cart.total}</p>
                                </div>

                                <div className="mt-3 mx-auto w-[80%]">
                                    <button 
                                      onClick={handleCheckout}
                                      className="w-full bg-violet-900 py-2 text-white"
                                    >
                                        Proceed to Checkout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </section>

            <UserFooter />
        </div>

  )
}

export default Cart
