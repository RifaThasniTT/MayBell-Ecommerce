import React, { useEffect, useState } from 'react'
import UserHeader from '../../components/User/Header'
import { Link, useNavigate } from 'react-router-dom'
import ProfileSidebar from '../../components/User/ProfileSidebar';
import AddressCard from '../../components/User/AddressCard';
import UserFooter from '../../components/User/Footer';
import axios from 'axios';
import { addAddress, deleteAddress, editAddress, getAddresses } from '../../api/User/Address';
import { toast } from 'react-toastify';

const Address = () => {

    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formData, setformData] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
      const fetchAddresses = async () => {
        try {
          setLoading(true);

          const result = await getAddresses();

          if (result) {
            setAddresses(result.addresses);
          }
        } catch (error) {
          console.error(error);
        }finally {
          setLoading(false);
        }
      };

      fetchAddresses();
    }, []);

    const editOpen = (address) => {
      setIsEditModalOpen(true);
      setformData(address);
    }

    const onClose = () => {
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
      setformData({});
      setErrors({});
    };

    const validateForm = () => {
      let tempErrors = {};
    
      if (!formData.name.trim()) {
        tempErrors.name = "Name is required!";
      } else if (/^\s/.test(formData.name)) {
        tempErrors.name = "Name cannot start with a space!";
      } else if (formData.name.length < 3) {
        tempErrors.name = "Name must be at least 3 characters long!";
      } else if (!/^[A-Za-z\s]+$/.test(formData.name)) {
        tempErrors.name = "Name can only contain letters and spaces!";
      }
    
      if (!formData.phone.trim()) {
        tempErrors.phone = "Phone number is required!";
      } else if (!/^\d{10}$/.test(formData.phone)) {
        tempErrors.phone = "Phone number must be exactly 10 digits!";
      }
    
      if (!formData.street.trim()) {
        tempErrors.street = "Street address is required!";
      } else if (formData.street.length < 5) {
        tempErrors.street = "Street address must be at least 5 characters long!";
      }
    
      if (!formData.city.trim()) {
        tempErrors.city = "City is required!";
      } else if (!/^[A-Za-z\s]+$/.test(formData.city)) {
        tempErrors.city = "City can only contain letters and spaces!";
      }
    
      if (!formData.state.trim()) {
        tempErrors.state = "State is required!";
      } else if (!/^[A-Za-z\s]+$/.test(formData.state)) {
        tempErrors.state = "State can only contain letters and spaces!";
      }
    
      if (!formData.country.trim()) {
        tempErrors.country = "Country is required!";
      } else if (!/^[A-Za-z\s]+$/.test(formData.country)) {
        tempErrors.country = "Country can only contain letters and spaces!";
      }
    
      if (!formData.zipCode.trim()) {
        tempErrors.zipCode = "ZIP Code is required!";
      } else if (!/^\d{5,6}$/.test(formData.zipCode)) {
        tempErrors.zipCode = "ZIP Code must be 5 or 6 digits!";
      }
    
      setErrors(tempErrors);
      return Object.keys(tempErrors).length === 0;
    };

    const handleAddSubmit = async (e) => {
      e.preventDefault();

      if (!validateForm()) return;

      try {
        setSubmitting(true);
        
        const result = await addAddress(formData);

        if (result) {
          setAddresses([...addresses, result.address]);
          toast.success('New address added successfully!');
          onClose();
        }
      } catch (error) {
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setformData({ ...formData, [name]: value });
    };

    const handleEditSubmit = async (e) => {
      e.preventDefault();

      if (!validateForm()) return;

      try {

        setSubmitting(true);

        const result = await editAddress(formData._id, formData);

        if (result) {
          setAddresses(addresses.map((address) =>
            address._id === formData._id ? result.address : address 
          ));

          toast.success('Address updated successfully!');
          onClose();
        }
        
      } catch (error) {
        console.error(error);
      } finally {
        setSubmitting(false);
      }
    };

    const handleDelete = async (id) => {
      if (window.confirm('Are you sure you want to delete this address?')) {
        try {
          setSubmitting(true);
          const result = await deleteAddress(id);

          if (result) {
            setAddresses(addresses.filter((address) => address._id !== id));
            toast.success('Address deleted successfully!');
          }
        } catch (error) {
          console.error(error);
        } finally {
          setSubmitting(false);
        }
      }
    }

  return (
    <div>
      <UserHeader/>

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
          <li onClick={() => navigate('/profile')} className="text-gray-500">Account</li>
          <li>
            <span className="mx-2 text-gray-500">&gt;</span>
          </li>  
          <li className="text-gray-500">Address</li>
        </ul>
      </nav>

      <section
        className="container mx-auto w-full flex-grow max-w-[1200px] border-b py-5 lg:flex lg:flex-row lg:py-10"
      >

        <ProfileSidebar/>

        <section className="grid w-full max-w-[1200px] grid-cols-1 gap-5 pt-6 px-6 pb-10 lg:grid-cols-3">
          {loading ? (
            <div className="flex items-center justify-center h-[200px]">
            <div className="text-center">
              <div className="loader border-t-4 border-b-4 border-gray-900 h-10 w-10 mx-auto rounded-full animate-spin"></div>
              <p className="mt-3 text-gray-500">Loading...</p>
            </div>
          </div>
          ) :  (
            addresses.map((address) => (
              <div key={address._id} className="flex flex-col justify-between border border-gray-300 rounded-lg p-6 shadow-md bg-white hover:shadow-lg transition-shadow duration-300">
                {/* Address Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    {address.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    {address.street}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">{address.city}</p>
                  <p className="text-sm text-gray-600 mb-2">{address.state}</p>
                  <p className="text-sm text-gray-600 mb-2">{address.country}</p>
                  <p className="text-sm text-gray-600 mb-2">ZIP: {address.zipCode}</p>
                  <p className="text-sm text-gray-600">Phone: {address.phone}</p>
                </div>

                {/* Action Buttons */}
                <div className="mt-1 flex justify-between items-center">
                  <button
                    onClick={() => editOpen(address)}
                    className="px-4 py-2 text-sm text-white bg-violet-900 rounded-md hover:bg-violet-800 transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    disabled={submitting}
                    onClick={() => handleDelete(address._id)}
                    className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-500 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}

            <div
              className="flex flex-col justify-center items-center border-2 border-dotted border-gray-400 rounded-lg p-6 shadow-md bg-white hover:shadow-lg hover:border-gray-500 transition-all duration-300 cursor-pointer"
            >

              <div onClick={() => setIsAddModalOpen(true)} className="flex justify-center items-center w-12 h-12 rounded-full bg-gray-200">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              
              <p className="mt-4 text-sm font-medium text-gray-600">Add New Address</p>
            </div>
        </section>

      </section>

      { isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-semibold">
                Add Address
              </h3>
              <button
                className="text-gray-500 hover:text-gray-800"
                onClick={onClose}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
                <div className="text-red-600">{errors.name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
                <div className="text-red-600">{errors.phone}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Street
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
                <div className="text-red-600">{errors.street}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
                <div className="text-red-600">{errors.city}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
                <div className="text-red-600">{errors.state}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
                <div className="text-red-600">{errors.country}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
                <div className="text-red-600">{errors.zipCode}</div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded-md text-gray-700 hover:bg-gray-400"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  disabled={submitting}
                  type="submit"
                  className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-500"
                >
                  { submitting ? 'Saving' : 'Save' }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      { isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-semibold">
                Edit Address
              </h3>
              <button
                className="text-gray-500 hover:text-gray-800"
                onClick={onClose}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
                <div className="text-red-600">{errors.name}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
                <div className="text-red-600">{errors.phone}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Street
                </label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
                <div className="text-red-600">{errors.street}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
                <div className="text-red-600">{errors.city}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
                <div className="text-red-600">{errors.state}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
                <div className="text-red-600">{errors.country}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  required
                />
                <div className="text-red-600">{errors.zipCode}</div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded-md text-gray-700 hover:bg-gray-400"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  disabled={submitting}
                  type="submit"
                  className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-500"
                >
                  { submitting ? 'Saving' : 'Save' }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <UserFooter/>

    </div>
  )
}

export default Address
