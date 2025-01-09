import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/Admin/Sidebar';
import { addProduct, editProduct, getProducts, toggleList } from '../../api/Admin/Products'  
import { toast } from 'react-toastify'; 
import { getCategories } from '../../api/Admin/Categories';

const Products = () => {
  const [loading, setLoading] = useState(true);  
  const [products, setProducts] = useState([]);  
  const [searchTerm, setSearchTerm] = useState('');  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    brand: "",
    stock: "",
    images: [],
  });
  const [categories, setCategories] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [listing, setListing] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchProducts = async () => {
    try {
        setLoading(true);  
        const result = await getProducts();  
        if (result) {
          setProducts(result.products);  
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchProducts();  
  }, []);  

  useEffect(() => {
    const fetchCategories = async () => {
      const result = await getCategories();
      setCategories(result.categories.filter((category) => category.isListed));
    }

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleImageChange = (e) => {
    const files = e.target.files;
  
    if (files) {
      const selectedFilesArray = Array.from(files);

      if (selectedFilesArray.length + selectedImages.length > 4) {
        toast.error('You can only upload up to 4 images.');
        return;
      }

      setSelectedImages((prevImages) => [
        ...prevImages,
        ...selectedFilesArray,
      ]);

      const previewUrls = selectedFilesArray.map((file) =>
        URL.createObjectURL(file)
      );
      setPreviewImages((prevImages) => [...prevImages, ...previewUrls]);
    }
  };

  const handleEditModalOpen = (product) => {
    setProductData({
      ...product,
      category: product.category._id,
      images: product.images || [],
    });
    setSelectedImages(product.images || []);
    setPreviewImages(product.images || []);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setProductData({
      name: '',
      description: '',
      price: '',
      category: '',
      brand: '',
      stock: '',
      images: [],
    });
    setSelectedImages([]);
    setPreviewImages([]);
    setIsEditModalOpen(false);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  // const removeImage = (index) => {
  //   setSelectedImages((prevImages) => {
  //     const newImages = prevImages.filter((_, i) => i !== index)

  //     setProductData((prevData) => ({
  //       ...prevData, 
  //       images: newImages,
  //     }))

  //     return newImages;
  //   }
  //   );
  //   setPreviewImages((prevImages) => 
  //     prevImages.filter((_, i) => i !== index)
  //   );
  // };

  const removeImage = (index) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
    setPreviewImages(updatedImages);

    setProductData((prevData) => ({
      ...prevData,
      images: updatedImages,
    }))
  };

  const validateForm = () => {
    if (!productData.name.trim()) {
      toast.error('Product name is required!');
      return false;
    }
    if (!productData.description.trim()) {
      toast.error('Product description is required!');
      return false;
    }
    if (productData.price <= 50){
      toast.error("Price should be greater than 50");
      return false;
    }else if(productData.stock < 0) {
      toast.error("Invalid stock");
      return false;
    } 
    if (!productData.brand.trim()) {
      toast.error('Brand name is required!');
      return false;
    }

    return true;
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (validateForm()) {
      if (selectedImages.length < 3 || selectedImages.length > 4) {
        toast.error("You must upload 3-4 images");
        setLoading(false);
        return;
      } 
    }

    const formData = new FormData();
    formData.append("name", productData.name);
    formData.append("description", productData.description);
    formData.append("price", parseInt(productData.price));
    formData.append("category", productData.category);
    formData.append("brand", productData.brand);
    formData.append("stock", parseInt(productData.stock));

    selectedImages.forEach((image) => {
      formData.append("images", image);
    });

    try {
      setLoading(true);

      const token = localStorage.getItem('adminToken');
        if (!token) {
          navigate('/admin-login');
          return;
        }

      const response = await addProduct(formData);
      console.log(response);

      if (response) {
        const newProduct = response?.product
        resetForm();
        toggleModal();
        setProducts((prevProducts) => [...prevProducts, newProduct])
        fetchProducts();
        // setProducts((prevProducts) => [...prevProducts, newProduct])
        
      }
    
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProductSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (validateForm()) {
      if (selectedImages.length < 3 || selectedImages.length > 4) {
        toast.error("You must upload 3-4 images");
        setLoading(false);
        return;
      } 
    }

    try {
      setLoading(true);

      const formData = new FormData();

      Object.keys(productData).forEach((key) => {
        if (key !== "images") {
          formData.append(key, productData[key]);
        }
      });

      selectedImages.forEach((image) => {
        if (typeof image === 'string') {
          formData.append("existingImages", image);
        } else {
          formData.append("newImages", image);
        }
      });

      const result = await editProduct(productData._id, formData);

      if (result) {
        setProducts(products.map((product) => 
          product._id === productData._id ? result.product : product
        ));
        toast.success('Product updated successfully!');
        fetchProducts();
        handleEditModalClose();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleList = async (productId) => {
    if (!window.confirm('Are you sure you want to toggle the status of this product?')) return
    try {
      setListing(true);
      const result = await toggleList(productId);

      if (result && result.product) {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product._id === productId ? { ...product, isListed: result.product.isListed } : product
          )
        );
      }
    } catch (error) {
      console.log("Error toggling product status", error);
    } finally {
      setListing(false);
    }
  };

  const resetForm = () => {
    setProductData({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
      brand: "",
      images: [],
    });
    setSelectedImages([]);
  };

  return (
    <div>
      <AdminSidebar />
      <div className="absolute top-14 right-16 w-[1110px]">
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 py-4 px-5 bg-white dark:bg-[#1f2937]">
            <h1 className="text-white text-2xl">Products</h1>
            {/* <label htmlFor="table-search" className="sr-only">Search</label>
            <div className="relative">
              <input
                type="text"
                id="table-search-users"
                className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Search for products"
                value={searchTerm}  // Bind the input value to searchTerm
                onChange={(e) => setSearchTerm(e.target.value)}  // Update searchTerm when the user types
              />
            </div> */}
            <button onClick={toggleModal} className="btn bg-blue-700 text-white hover:bg-blue-800 px-4 py-2 rounded-lg">
              Add Product
            </button>
          </div>

          {/* Products Table */}
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">Product Details</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Brand</th>
                <th className="px-6 py-3">Price</th>
                <th className="px-6 py-3">Stock</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Edit</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    {loading ? 'Loading...' : 'No products found matching your search.'}
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600" key={product._id}>
                    <td className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                      <img
                        className="w-10 h-10 "
                        src={product?.images[0]}  
                        alt={product?.name}
                      />
                      <div className="ps-3">
                        <div className="text-base font-semibold">
                          <h1>{product.name}</h1>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{product?.category?.name}</td>  
                    <td className="px-6 py-4">{product.brand}</td>
                    <td className="px-6 py-4">₹{product.price}</td>
                    <td className="px-6 py-4">{product.stock}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`h-2.5 w-2.5 rounded-full ${product.isListed ? 'bg-green-500' : 'bg-red-500'} me-2`}></div>
                        {product.isListed ? 'Listed' : 'Unlisted'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                    <button
                        className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-lg"
                        onClick={() => handleEditModalOpen(product)} 
                      >
                        Edit
                      </button>
                    </td>
                    <td className="px-6 py-4">
                    <button
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow transition-all ${
                          !product.isListed ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                        }`}
                        disabled={listing}
                        onClick={() => handleToggleList(product._id)}
                      >
                        {listing ? '...' : (product.isListed ? 'Unlist' : 'List')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
            <div
              id="crud-modal"
              tabIndex="-1"
              aria-hidden="true"
              className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50"
            >
              <div className="relative p-4 w-full max-w-md max-h-full">
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 overflow-y-auto max-h-[80vh]">
                  <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Create New Product
                    </h3>
                    <button
                      type="button"
                      className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                      onClick={() => setIsModalOpen(false)}
                    >
                      <svg
                        className="w-3 h-3"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 14"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                        />
                      </svg>
                      <span className="sr-only">Close modal</span>
                    </button>
                  </div>
                  {/* Modal body */}
                  <form
                    className="p-4 md:p-5"
                    onSubmit={handleAddProductSubmit}
                  >
                    <div className="grid gap-4 mb-4 grid-cols-2">
                      <div className="col-span-2">
                        <label
                          htmlFor="name"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={productData.name}
                          onChange={handleChange}
                          id="name"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="Type product name"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <label
                          htmlFor="description"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Description
                        </label>
                        <textarea
                          name="description"
                          id="description"
                          value={productData.description}
                          onChange={handleChange}
                          rows="3"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="Add a short description"
                          required
                        ></textarea>
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <label
                          htmlFor="price"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Price
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={productData.price}
                          onChange={handleChange}
                          id="price"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="₹2999"
                          required
                        />
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <label
                          htmlFor="stock"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Stock
                        </label>
                        <input
                          type="number"
                          name="stock"
                          id="stock"
                          value={productData.stock}
                          onChange={handleChange}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="Enter stock"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <label
                          htmlFor="category"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Category
                        </label>
                        <select
                          name="category"
                          value={productData.category}
                          onChange={handleChange}
                          id="category"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          required
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label
                          htmlFor="brand"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Brand
                        </label>
                        <input
                          type="text"
                          name="brand"
                          value={productData.brand}
                          onChange={handleChange}
                          id="brand"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="Enter product Brand"
                          required
                        />
                      </div>

                      <hr />

                      <div className="col-span-2">
                        <label
                          htmlFor="images"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Upload Images
                        </label>
                        <input
                          type="file"
                          name="images"
                          id="images"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        />
                        {/* Preview images */}
                        {selectedImages.length >= 5 ? (
                          <h1 className="text-red-300">
                            Only 4 Images Are Allowed
                          </h1>
                        ) : (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {selectedImages.map((image, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={URL.createObjectURL(image)} // Create a preview URL for the image
                                  alt="Preview"
                                  className="w-20 h-20 object-cover rounded-md"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                                >
                                  X
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn bg-blue-700 text-white hover:bg-blue-800 px-4 py-2 rounded-lg"
                    >
                      {loading ? "Adding Product..." : "Add Product"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

      {isEditModalOpen && (
            <div
              id="crud-modal"
              tabIndex="-1"
              aria-hidden="true"
              className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50"
            >
              <div className="relative p-4 w-full max-w-md max-h-full">
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 overflow-y-auto max-h-[80vh]">
                  <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Edit Product
                    </h3>
                    <button
                      type="button"
                      className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                      onClick={handleEditModalClose}
                    >
                      <svg
                        className="w-3 h-3"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 14"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                        />
                      </svg>
                      <span className="sr-only">Close modal</span>
                    </button>
                  </div>
                  {/* Modal body */}
                  <form
                    className="p-4 md:p-5"
                    onSubmit={handleEditProductSubmit}
                  >
                    <div className="grid gap-4 mb-4 grid-cols-2">
                      <div className="col-span-2">
                        <label
                          htmlFor="name"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={productData.name}
                          onChange={handleChange}
                          id="name"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="Type product name"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <label
                          htmlFor="description"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Description
                        </label>
                        <textarea
                          name="description"
                          id="description"
                          value={productData.description}
                          onChange={handleChange}
                          rows="3"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="Add a short description"
                          required
                        ></textarea>
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <label
                          htmlFor="price"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Price
                        </label>
                        <input
                          type="number"
                          name="price"
                          value={productData.price}
                          onChange={handleChange}
                          id="price"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="₹2999"
                          required
                        />
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <label
                          htmlFor="stock"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Stock
                        </label>
                        <input
                          type="number"
                          name="stock"
                          id="stock"
                          value={productData.stock}
                          onChange={handleChange}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="Enter stock"
                          required
                        />
                      </div>

                      <div className="col-span-2">
                        <label
                          htmlFor="category"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Category
                        </label>
                        <select
                          name="category"
                          value={productData.category}
                          onChange={handleChange}
                          id="category"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          required
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <label
                          htmlFor="brand"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Brand
                        </label>
                        <input
                          type="text"
                          name="brand"
                          value={productData.brand}
                          onChange={handleChange}
                          id="brand"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          placeholder="Enter product Brand"
                          required
                        />
                      </div>

                      <hr />

                      <div className="col-span-2">
                        <label
                          htmlFor="images"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Upload Images
                        </label>
                        <input
                          type="file"
                          name="images"
                          id="images"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        />
                        {/* Preview images */}
                          <div className="mt-4 flex flex-wrap gap-2">
                            {previewImages.map((image, index) => (
                              <div key={index} className="relative">
                                <img
                                  src={typeof image === "string" ? image : URL.createObjectURL(image)}
                                  alt="Preview"
                                  className="w-20 h-20 object-cover rounded-md"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
                                >
                                  X
                                </button>
                              </div>
                            ))}
                          </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="btn bg-blue-700 text-white hover:bg-blue-800 px-4 py-2 rounded-lg"
                    >
                      {loading ? "Editing Product..." : "Edit Product"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

    </div>
  );
}

export default Products;
