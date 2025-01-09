import React, { useEffect, useState } from 'react'
import UserHeader from '../../components/User/Header'
import UserFooter from '../../components/User/Footer'
import { useNavigate, useParams } from 'react-router-dom'
import { getListedProducts, getProductDetails } from '../../api/User/Products'
import ProductCard from '../../components/User/ProductCard'
import { addToCart } from '../../api/User/Cart'
import { toast } from 'react-toastify'

const SingleProduct = () => {

    const { productId } = useParams();
    const [product, setProduct] = useState({});
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [adding, setAdding] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [mainProductImage, setMainProductImage] = useState(product.images && product.images[0])
 
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);

                const result = await getProductDetails(productId);
                
                if (result) {
                  const productData = result.product;
                  setProduct(productData);
                  setMainProductImage(productData.images[0]);

                  fetchRelatedProducts(productData.category?._id, productData._id);
                }
                
            } catch (error) {
                console.error(error);
                navigate('/not-found')
            } finally {
                setLoading(false);
            }
        };

        const fetchRelatedProducts = async (categoryId, currentProductId) => {
          try {
            setLoading(true);

            const listedProducts = await getListedProducts({ categories : [categoryId], sort: "", search: "" });

            if (listedProducts) {
              const related = listedProducts.filter(
                (product) => product._id !== currentProductId
              )
              setRelatedProducts(related);
            }
          } catch (error) {
            console.error('Error occured: ', error);
          }
        }

        fetchProduct();
    }, [productId]);

    const addCart = async () => {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) {
          toast.info('Please log in to add products to your cart.');
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
    }

    if (loading) {
        return <div className="flex items-center justify-center h-[600px]">
        <div className="text-center">
          <div className="loader border-t-4 border-b-4 border-gray-900 h-10 w-10 mx-auto rounded-full animate-spin"></div>
          <p className="mt-3 text-gray-500">Loading...</p>
        </div>
      </div>
    }

  return (
    <div>
        <UserHeader/>

        <nav className="mx-auto w-full mt-4 max-w-[1200px] px-5">
          <ul className="flex items-center">
            <li onClick={() => navigate('/')} className="cursor-pointer">
              <a >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-5 w-5"
                >
                  <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                  <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
                </svg>
              </a>
            </li>
            <li>
              <span className="mx-2 text-gray-500">&gt;</span>
            </li>
            <li onClick={() => navigate('/all-products')} className="text-gray-500">Catalog</li>
            <li>
              <span className="mx-2 text-gray-500">&gt;</span>
            </li>
            <li className="text-gray-500">{product.name}</li>
          </ul>
        </nav>

        <section className="container flex-grow mx-auto max-w-[1200px] border-b py-5 lg:grid lg:grid-cols-2 lg:py-10">
      {/* Image Gallery */}
      <div className="container mx-auto px-4">
        {/* Main Product Image */}
        <img
          className="w-full "
          src={mainProductImage}  
          alt={product.name}
        />
        <div className="mt-3 grid grid-cols-4 gap-4">
          {/* Thumbnail Images */}
          {product.images && product.images.map((image, index) => (
            <div key={index}>
              <img
                className="cursor-pointer"
                src={image}
                alt={`Thumbnail ${index + 1}`}
                onClick={() => setMainProductImage(image)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Product Description */}
      <div className="mx-auto px-5 lg:px-5">
        <h2 className="pt-3 text-2xl font-bold lg:pt-0">{product.name}</h2>
        <div className="mt-1">
          <div className="flex items-center">
            {[...Array(4)].map((_, index) => (
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4 text-gray-200"
            >
              <path
                fillRule="evenodd"
                d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                clipRule="evenodd"
              />
            </svg>
            <p className="ml-3 text-sm text-gray-400">(150 reviews)</p>
          </div>
        </div>
        <p className="mt-5 font-bold">
          Availability: <span className="text-green-600">{product.stock > 0 ? 'In stock' : 'Out of Stock'}</span>
        </p>
        <p className="font-bold">
          Brand: <span className="font-normal">{product.brand}</span>
        </p>
        <p className="font-bold">
          Category: <span className="font-normal">{product.category?.name}</span>
        </p>
        
        <p className="mt-4 text-4xl font-bold text-violet-900">
        ₹{product.discountPrice}
        {product.discountPrice !== product.price && (
          <span className="px-2 text-sm text-gray-400 line-through">₹{product.price}</span>
        )}
        </p>
        <p className="pt-5 text-sm leading-5 text-gray-500">
          {product.description}
        </p>

        {/* Quantity Selector
        <div className="mt-6">
          <p className="pb-2 text-xs text-gray-500">Quantity</p>
          <div className="flex w-24 items-center justify-between border-b">
            <button
              className="text-xl font-bold text-gray-600"
              onClick={() => handleQuantityChange('decrease')}
            >
              -
            </button>
            <span className="text-xl font-semibold text-gray-700">{quantity}</span>
            <button
              className="text-xl font-bold text-gray-600"
              onClick={() => handleQuantityChange('increase')}
            >
              +
            </button>
          </div>
        </div> */}

        {/* Add to Cart Button */}
        <div className="mt-6 flex justify-between">
          <button onClick={addCart} disabled={adding} className="px-8 py-2 text-white bg-violet-900">Add to Cart</button>
        </div>
      </div>
    </section>

    {/* <section className="mx-auto mt-10 max-w-[1200px] px-6">
  <h2 className="text-xl font-bold text-gray-700 mb-5">Customer Reviews</h2>
  <div className="space-y-6"> */}
    {/* Review 1 */}
    {/* <div className="p-5 border rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-gray-700">John Doe</p>
        <div className="flex">
          {[...Array(5)].map((_, index) => (
            <svg
              key={index}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5 text-yellow-400"
            >
              <path
                fillRule="evenodd"
                d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                clipRule="evenodd"
              />
            </svg>
          ))}
        </div>
      </div>
      <p className="mt-2 text-gray-600">Amazing product! Totally worth it.</p>
    </div> */}
    {/* Review 2 */}
    {/* <div className="p-5 border rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-gray-700">Jane Smith</p>
        <div className="flex">
          {[...Array(4)].map((_, index) => (
            <svg
              key={index}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5 text-yellow-400"
            >
              <path
                fillRule="evenodd"
                d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                clipRule="evenodd"
              />
            </svg>
          ))}
          {[...Array(1)].map((_, index) => (
            <svg
              key={index}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5 text-gray-200"
            >
              <path
                fillRule="evenodd"
                d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                clipRule="evenodd"
              />
            </svg>
          ))}
        </div>
      </div>
      <p className="mt-2 text-gray-600">Great quality, but delivery was a bit slow.</p>
    </div> */}
    {/* Review 3 */}
    {/* <div className="p-5 border rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-gray-700">Emily Johnson</p>
        <div className="flex">
          {[...Array(3)].map((_, index) => (
            <svg
              key={index}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5 text-yellow-400"
            >
              <path
                fillRule="evenodd"
                d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                clipRule="evenodd"
              />
            </svg>
          ))}
          {[...Array(2)].map((_, index) => (
            <svg
              key={index}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5 text-gray-200"
            >
              <path
                fillRule="evenodd"
                d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c-.635-.544-.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                clipRule="evenodd"
              />
            </svg>
          ))}
        </div>
      </div>
      <p className="mt-2 text-gray-600">Good product, but expected better packaging.</p>
    </div>
  </div>
</section> */}


      <p className="mx-auto mt-10 mb-5 max-w-[1200px] px-5">RELATED PRODUCTS</p>
      <section className="mx-auto grid max-w-[1200px] grid-cols-2 gap-10 px-6 pb-10 lg:grid-cols-5">
      { relatedProducts.length === 0 ? ( <div>No related Products</div> ):
        relatedProducts.map((relatedProduct) => (
          <ProductCard key={relatedProduct._id} product={relatedProduct} />
        ))
      }
      </section>

      <UserFooter />
    </div>
  )
}

export default SingleProduct;
