import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/Admin/Sidebar';
import { useNavigate } from 'react-router-dom';
import { addCategory, editCategory, getCategories, toggleList } from '../../api/Admin/Categories';
import { toast } from 'react-toastify';

const Categories = () => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]); // Initialize as an empty array
  const [filteredCategories, setFilteredCategories] = useState([]); // To manage search results
  const [searchTerm, setSearchTerm] = useState(''); // To manage search input
  const navigate = useNavigate();
  const [listing, setListing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryId, setCategoryId] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem('adminToken');
        if (!token) {
          navigate('/admin-login');
          return;
        }

        const result = await getCategories();

        // Ensure result.users is an array or set it to an empty array if undefined
        if (result && Array.isArray(result.categories)) {
          setCategories(result.categories);
          setFilteredCategories(result.categories); // Initialize with all users
        } else {
          setCategories([]);
          setFilteredCategories([]);
        }
      } catch (error) {
        console.log("Error fetching categories");
        setCategories([]);
        setFilteredCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [navigate]);

  useEffect(() => {
    const filtered = categories.filter(category => 
      category.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) 
    );
    setFilteredCategories(filtered);
  }, [searchTerm, categories]);

  const handleToggleList = async (categoryId) => {
    if (!window.confirm('Are you sure you want to toggle the status of this category?')) return
    try {
      setListing(true);
      const result = await toggleList(categoryId);

      if (result && result.category) {
        setCategories((prevCategories) =>
          prevCategories.map((category) =>
            category._id === categoryId ? { ...category, isListed: result.category.isListed } : category
          )
        );
        setFilteredCategories((prevFilteredCategories) =>
          prevFilteredCategories.map((category) =>
            category._id === categoryId ? { ...category, isListed: result.category.isListed } : category
          )
        );
      }
    } catch (error) {
      console.log("Error toggling category status", error);
    } finally {
      setListing(false);
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const toggleEditModal = (category) => {
    setCategoryName(category.name);
    setCategoryDescription(category.description);
    setCategoryId(category._id);
    setIsEditModalOpen(!isEditModalOpen);
  };

  const handleAddCategory = async (e) => {

    e.preventDefault();

    if (!categoryName.trim()) {
        toast.error('Category name is required');
        return;
    } else if (!/^[A-Za-z\s]+$/.test(categoryName)) {
        toast.error("Please enter letters and spaces only!")
        return
    } else if (categoryName.length < 4) {
        toast.error('Category name should be atleast 4 letters long.');
        return;
    } else if (!categoryDescription.trim()) {
        toast.error('Description is required!')
        return;
    } else if (categoryDescription.length < 10) {
        toast.error('Category description should be atleast 10 letters long.');
        return;
    }
     

    const data = {
        name: categoryName.trim(),
        description: categoryDescription.trim(),
        isListed: true,
    }

    try {

        setLoading(true);

        const token = localStorage.getItem('adminToken');
        if (!token) {
          navigate('/admin-login');
          return;
        }

        const { newCategory } = await addCategory(data);

        if (newCategory) {
            setCategories((prevCategories) => [...prevCategories, newCategory]);
            setFilteredCategories((prevFilteredCategories) => [...prevFilteredCategories, newCategory]);
            setCategoryName(""); // Reset category name input
            setCategoryDescription(""); // Reset category description input
            setIsModalOpen(false);
            toast.success("Category added successfully!");
        } else {
            console.log('Failed to add category');
        }

    } catch (error) {
        console.error("Error adding category", error);
    } finally {
        setLoading(false)
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();

    if (!categoryName.trim()) {
        toast.error('Category name is required');
        return;
    } else if (categoryName.length < 4) {
        toast.error('Category name should be atleast 4 letters long.');
        return;
    } else if (!/^[A-Za-z\s]+$/.test(categoryName)) {
        toast.error("Please enter letters and spaces only!")
        return
    } else if (!categoryDescription.trim()) {
        toast.error('Description is required!');
        return;
    } else if (categoryDescription.length < 10) {
        toast.error('Category description should be atleast 10 letters long.');
        return;
    }

    const data = {
        name: categoryName.trim(),
        description: categoryDescription.trim(),
    }

    try {
        setLoading(true);
        
        const result = await editCategory(categoryId, data);
        if (result) {
            setCategories((prevCategories) =>
                prevCategories.map((category) =>
                  category._id === categoryId ? { ...category, ...data } : category
                )
              );
            setFilteredCategories((prevFilteredCategories) =>
                prevFilteredCategories.map((category) =>
                  category._id === categoryId ? { ...category, ...data } : category
                )
              );
            toast.success('Category updated successfully!');
            setIsEditModalOpen(false);
            setCategoryName("");
            setCategoryDescription("");
            setCategoryId(null);
        }
    } catch (error) {
        console.log('Error occured', error);
    } finally {
        setLoading(false)
    }
  }

  return (
    <div>
      <AdminSidebar />
      <div className="absolute top-14 right-16 w-[1110px]">
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 py-4 px-5 bg-white dark:bg-[#1f2937]">
            <h1 className="text-white text-2xl">Category Management</h1>
            <div className="flex items-center space-x-4">
              <label htmlFor="table-search" className="sr-only">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="table-search-categories"
                  className="block p-2 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Search for categories"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)} // Update search term
                />
              </div>
              {/* Add Category Button */}
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                onClick={toggleModal} // Assuming this route handles adding categories
              >
                Add Category
              </button>
            </div>
          </div>
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Description</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center">Loading...</td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center">No categories found.</td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                      <div className="ps-3">
                        <div className="text-base font-semibold">{category.name}</div>
                      </div>
                    </th>
                    <td className="px-6 py-4">{category.description}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`h-2.5 w-2.5 rounded-full ${category.isListed ? 'bg-green-500' : 'bg-red-500'} me-2`}></div>
                        {category.isListed ? 'Listed' : 'Unlisted'}
                      </div>
                    </td>
                    <td className="px-6 py-4 flex items-center space-x-2">
                      {/* Edit Button */}
                      <button
                        className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 rounded-lg"
                        onClick={() => toggleEditModal(category)} // Navigate to edit category page
                      >
                        Edit
                      </button>
                      {/* List/Unlist Button */}
                      <button
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow transition-all ${
                          !category.isListed ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                        }`}
                        disabled={listing}
                        onClick={() => handleToggleList(category._id)}
                      >
                        {listing ? '...' : (category.isListed ? 'Unlist' : 'List')}
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
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50"
          onClick={toggleModal}
        >
          <div
            className="relative p-4 w-full max-w-md max-h-full bg-white rounded-lg shadow dark:bg-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Add New Category
              </h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 rounded-lg p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={toggleModal}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 8.293l5.646-5.647a.5.5 0 0 1 .708.708L10.707 9l5.647 5.646a.5.5 0 0 1-.708.708L10 9.707l-5.646 5.647a.5.5 0 0 1-.708-.708L9.293 9 3.646 3.354a.5.5 0 0 1 .708-.708L10 8.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddCategory}>
              <div className="p-6 space-y-6">
                <div>
                  <label
                    htmlFor="categoryName"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Category Name
                  </label>
                  <input
                    type="text"
                    id="categoryName"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                    className="border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="categoryDescription"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Description
                  </label>
                  <textarea
                    id="categoryDescription"
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    required
                    className="border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end p-6 border-t border-gray-200 rounded-b dark:border-gray-600">
                <button
                  type="button"
                  className="text-gray-500 mr-5 bg-transparent hover:bg-gray-200 rounded-lg px-5 py-2.5 text-sm dark:hover:bg-gray-600 dark:hover:text-white"
                  onClick={toggleModal}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-5 py-2.5 text-sm dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50"
          onClick={() => toggleEditModal(categoryId)} // Pass categoryID to toggleEditModal
        >
          <div
            className="relative p-4 w-full max-w-md max-h-full bg-white rounded-lg shadow dark:bg-gray-700"
            onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
          >
            <div className="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Edit Category
              </h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 rounded-lg p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={() => setIsEditModalOpen(false)}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 8.293l5.646-5.647a.5.5 0 0 1 .708.708L10.707 9l5.647 5.646a.5.5 0 0 1-.708.708L10 9.707l-5.646 5.647a.5.5 0 0 1-.708-.708L9.293 9 3.646 3.354a.5.5 0 0 1 .708-.708L10 8.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditCategory}>
              <div className="p-6 space-y-6">
                <div>
                  <label
                    htmlFor="editCategoryName"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Category Name
                  </label>
                  <input
                    type="text"
                    id="editCategoryName"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    required
                    className="border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="editCategoryDescription"
                    className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    Description
                  </label>
                  <textarea
                    id="editCategoryDescription"
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    className="border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end p-6 border-t border-gray-200 rounded-b dark:border-gray-600">
                <button
                  type="button"
                  className="text-gray-500 bg-transparent hover:bg-gray-200 rounded-lg px-5 py-2.5 text-sm dark:hover:bg-gray-600 dark:hover:text-white"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-5 py-2.5 text-sm dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  Update Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Categories;
