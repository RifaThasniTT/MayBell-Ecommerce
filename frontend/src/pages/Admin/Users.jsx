import React, { useEffect, useState } from 'react';
import AdminSidebar from '../../components/Admin/Sidebar';
import { useNavigate } from 'react-router-dom';
import { getUsers, toggleBlock } from '../../api/Admin/Users';

const Users = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]); 
  const [filteredUsers, setFilteredUsers] = useState([]); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const navigate = useNavigate();
  const [blocking, setBlocking] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem('adminToken');
        if (!token) {
          navigate('/admin-login');
          return;
        }

        const result = await getUsers();

        // Ensure result.users is an array or set it to an empty array if undefined
        if (result && Array.isArray(result.users)) {
          setUsers(result.users);
          setFilteredUsers(result.users); // Initialize with all users
        } else {
          setUsers([]);
          setFilteredUsers([]);
        }
      } catch (error) {
        console.log("Error fetching users");
        setUsers([]);
        setFilteredUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  useEffect(() => {
    const filtered = users.filter(user => 
      user.username.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.trim().toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleToggleBlock = async (userId) => {
    if (!window.confirm('Are you sure you want to toggle the status of this user?')) return
    try {
      setBlocking(true);
      const result = await toggleBlock(userId);

      if (result && result.user) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === userId ? { ...user, isBlocked: result.user.isBlocked } : user
          )
        );
        setFilteredUsers((prevFilteredUsers) =>
          prevFilteredUsers.map((user) =>
            user._id === userId ? { ...user, isBlocked: result.user.isBlocked } : user
          )
        );
      }
    } catch (error) {
      console.log("Error toggling user block status", error);
    } finally {
      setBlocking(false);
    }
  };

  return (
    <div>
      <AdminSidebar />
      <div className="absolute top-14 right-16 w-[1110px]">
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 py-4 px-5 bg-white dark:bg-[#1f2937]">
            <h1 className="text-white text-2xl">User Management</h1>
            <label htmlFor="table-search" className="sr-only">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                id="table-search-users"
                className="block p-2 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Search for users"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} // Update search term
              />
            </div>
          </div>
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Created At</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center">Loading...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <th scope="row" className="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                      <div className="ps-3">
                        <div className="text-base font-semibold">{user.username}</div>
                        <div className="font-normal text-gray-500">{user.email}</div>
                      </div>
                    </th>
                    <td className="px-6 py-4">{new Date(user.createdAt).toDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`h-2.5 w-2.5 rounded-full ${user.isBlocked === false ? 'bg-green-500' : 'bg-red-500'} me-2`}></div>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                    <button
                        className={`px-4 py-2 text-sm font-medium text-white rounded-lg shadow transition-all ${
                          user.isBlocked ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                        }`}
                        onClick={() => handleToggleBlock(user._id)}
                      >
                        {blocking ? '...' : (user.isBlocked ? 'Unblock User' : 'Block User')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
