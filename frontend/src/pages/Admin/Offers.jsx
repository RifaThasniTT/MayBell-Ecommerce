import React, { useEffect, useState } from 'react'
import AdminSidebar from '../../components/Admin/Sidebar'
import { createOffer, fetchOffers, toggleOfferStatus } from '../../api/Admin/Offer';
import { toast } from 'react-toastify';
import { getCategories } from '../../api/Admin/Categories';
import { getProducts } from '../../api/Admin/Products';

const Offers = () => {

    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [offerData, setOfferData] = useState({
        title: '',
        type: '',
        discountPercentage: '',
        maxDisountAmount: 0,
        minPurchaseAmount: 0,
        endDate: '',
        applicableProducts: [],
        applicableCategories: [],
    });
    const [submitting, setSubmitting] = useState(false);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});

    const getOffers = async () => {
        try {
            setLoading(true);
            const result = await fetchOffers();

            if (result) {
                setOffers(result.offers);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getOffers()
    }, []);

    const handleModalOpen = async () => {
        setIsModalOpen(true);
        try {
            const categoryResult = await getCategories();
            setCategories(categoryResult.categories.filter((category) => category.isListed));

            const productResult = await getProducts();
            setProducts(productResult.products.filter((product) => product.isListed))
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e) => {
        setOfferData({ ...offerData, [e.target.name]: e.target.value });
    };

    const handleProductsChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
        setOfferData({ ...offerData, applicableProducts: selectedOptions });
    };

    const handleCategoriesChange = (e) => {
        const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
        setOfferData({ ...offerData, applicableCategories: selectedOptions });
    };

    const validateOfferForm = () => {
        const errors = {};
      
        if (!offerData.title || offerData.title.trim() === "") {
          errors.title = "Title is required.";
        }
      
        if (!offerData.discountPercentage || offerData.discountPercentage.trim() === "") {
          errors.discount = "Discount percentage is required.";
        } else if (isNaN(offerData.discountPercentage)) {
          errors.discount = "Discount must be a number.";
        } else if (offerData.discountPercentage <= 0 || offerData.discountPercentage > 50) {
          errors.discount = "Discount must be between 0 and 50.";
        }
      
        if (!offerData.endDate) {
          errors.endDate = "End date is required.";
        } else {
          const today = new Date();
          const endDate = new Date(offerData.endDate);
          if (endDate <= today) {
            errors.endDate = "End date must be a future date.";
          }
        }
      
        if (!offerData.type) {
          errors.applicableTo = "Please select the applicable type (Products or Categories).";
        } else if (
          offerData.type === "product" &&
          (!offerData.applicableProducts || offerData.applicableProducts.length === 0)
        ) {
          errors.selectedProducts = "Please select at least one product.";
        } else if (
          offerData.type === "category" &&
          (!offerData.applicableCategories || offerData.applicableCategories.length === 0)
        ) {
          errors.selectedCategories = "Please select at least one category.";
        }
      
        return errors;
    };

    const handleCreateOfferSubmit= async (e) => {
        e.preventDefault();

        const errors = validateOfferForm();

        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            return;
        }
        
        try {
            setSubmitting(true);

            const result = await createOffer(offerData);
            console.log(result);

            if (result) {
                toast.success('Offer created sucessfully!');
                setIsModalOpen(false);
                setOfferData({
                  title: '',
                  type: '',
                  discountPercentage: '',
                  maxDisountAmount: 0,
                  minPurchaseAmount: 0,
                  endDate: '',
                  applicableProducts: [],
                  applicableCategories: [],
                });
                setErrors({});
                getOffers();
            }
            
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleToggleStatus = async (offerId) => {
        if (window.confirm('Are you sure you want to toggle the status of this offer?')) {
            try {
                setLoading(true);
                const result = await toggleOfferStatus(offerId);
                
                if (result) {
                    setOffers((prevOffers) => 
                            prevOffers.map((offer) => 
                            offer._id === offerId ? { ...offer, isActive: result.offer.isActive} : offer
                        )
                    );
                    toast.success(result.message);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
    };

  return (
    <div>

        <AdminSidebar/>

        <div className="absolute top-14 right-16 w-[1110px]">
          <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 py-4 px-5 bg-white dark:bg-[#1f2937]">
              <h1 className="text-white text-2xl">Offer Management</h1>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg"
                onClick={handleModalOpen}
              >
                Create New Offer
              </button>
            </div>

            {/* Offers Table */}
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3 w-50">Title</th>
                  <th className="px-6 py-3">Discount %</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3">Applied To</th>
                  <th className="px-6 py-3">End Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {offers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4">
                      {loading ? 'Loading...' : 'No offers found.'}
                    </td>
                  </tr>
                ) : (
                  offers.map((offer) => (
                    <tr
                      className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                      key={offer._id}
                    >
                      <td className="px-6 py-4 w-50">{offer.title}</td>
                      <td className="px-6 py-4">{offer.discountPercentage}%</td>
                      <td className="px-6 py-4">{offer.type}</td>
                      <td className="px-6 py-4">
                          {offer.type === 'category' ? (
                            <ul>
                              {offer.categoryDetails.map((category) => (
                                <li key={category._id}>{category.name}</li>
                              ))}
                            </ul>
                          ) : (
                            <ul>
                              {offer.productDetails.map((product) => (
                                <li key={product?._id}>
                                  {product?.name}
                                </li>
                              ))}
                            </ul>
                          )}
                      </td>
                      <td className="px-6 py-4">{new Date(offer.endDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        {offer.isActive ? 'Active' : 'Inactive'}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${offer.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                          onClick={() => handleToggleStatus(offer._id)}
                          disabled={loading}
                        >
                          {offer.isActive ? 'Deactivate' : 'Activate'}
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
            id="offer-modal"
            tabIndex="-1"
            aria-hidden="true"
            className="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50"
          >
            <div className="relative p-4 w-full max-w-md max-h-full">
              <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 overflow-y-auto max-h-[80vh]">
                <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Create New Offer
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
                  onSubmit={handleCreateOfferSubmit}
                >
                  <div className="grid gap-4 mb-4">
                    <div>
                      <label
                        htmlFor="title"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Offer Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={offerData.title}
                        onChange={handleChange}
                        id="title"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Type offer title"
                        required
                      />
                      {errors.title && <span className="error text-red-500">{errors.title}</span>}
                    </div>

                    <div>
                      <label
                        htmlFor="type"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Offer Type
                      </label>
                      <select
                        name="type"
                        value={offerData.type}
                        onChange={handleChange}
                        id="type"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        required
                      >
                        <option value="">Select offer type</option>
                        <option value="product">Product</option>
                        <option value="category">Category</option>
                      </select>
                      {errors.applicableTo && <span className="error text-red-500">{errors.applicableTo}</span>}
                    </div>

                    {/* Dropdown for Applicable Products */}
                    {offerData.type === "product" && (
                      <div className="col-span-2">
                        <label
                          htmlFor="applicableProducts"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Applicable Products
                        </label>
                        <select
                          name="applicableProducts"
                          id="applicableProducts"
                          multiple
                          value={offerData.applicableProducts}
                          onChange={handleProductsChange}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        >
                          {products.map((product) => (
                            <option key={product._id} value={product._id}>
                              {product.name}
                            </option>
                          ))}
                        </select>
                        {errors.selectedProducts && <span className="error text-red-500">{errors.selectedProducts}</span>}
                      </div>
                    )}

                    {/* Dropdown for Applicable Categories */}
                    {offerData.type === "category" && (
                      <div className="col-span-2">
                        <label
                          htmlFor="applicableCategories"
                          className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                        >
                          Applicable Categories
                        </label>
                        <select
                          name="applicableCategories"
                          id="applicableCategories"
                          multiple
                          value={offerData.applicableCategories}
                          onChange={handleCategoriesChange}
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        >
                          {categories.map((category) => (
                            <option key={category._id} value={category._id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        {errors.selectedCategories && <span className="error text-red-500">{errors.selectedCategories}</span>}
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="discountPercentage"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        Discount Percentage
                      </label>
                      <input
                        type="number"
                        name="discountPercentage"
                        value={offerData.discountPercentage}
                        onChange={handleChange}
                        id="discountPercentage"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        placeholder="Enter discount percentage"
                      />
                      {errors.discount && <span className="error text-red-500">{errors.discount}</span>}
                    </div>
                
                    <div>
                      <label
                        htmlFor="endDate"
                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                      >
                        End Date
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={offerData.endDate}
                        onChange={handleChange}
                        id="endDate"
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        required
                      />
                      {errors.endDate && <span className="error text-red-500">{errors.endDate}</span>}
                    </div>
                  </div>
                
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn bg-blue-700 text-white hover:bg-blue-800 px-4 py-2 rounded-lg"
                  >
                    Create Offer
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      
      
    </div>
  )
}

export default Offers
