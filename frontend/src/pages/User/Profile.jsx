import React, { useEffect, useState } from 'react'
import UserHeader from '../../components/User/Header'
import UserFooter from '../../components/User/Footer'
import { Link } from 'react-router-dom'
import ProfileSidebar from '../../components/User/ProfileSidebar'
import { changePassword, editUsername, getProfile } from '../../api/User/userAuth'
import { toast } from 'react-toastify'

const Profile = () => {

  const [username, setUsername] = useState('User Name');
  const [email, setEmail] = useState('user@gmail.com');
  const [loading, setLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState("");
  const [updating, setUpdating] = useState(false);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        const result = await getProfile();

        if (result) {
          setUsername(result.user.username);
          setEmail(result.user.email);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, []);

  const validateUsername =  () => {
    if (!newUsername.trim()) {
      setUsernameError("Name is required!");
      return false;
    } else if (/^\s/.test(newUsername)) {
      setUsernameError("Name cannot start with a space!");
      return false;
    } else if (newUsername.trim().length < 4) {
      setUsernameError("Name must be atleast 4 characters long!");
      return false;
    } else if (!/^[A-Za-z\s]+$/.test(newUsername)) {
      setUsernameError("Name can only contain letters and spaces!");
      return false;
    }

    return true;
  };

  const validatePassword = () => {
    const tempErrors = {};

    if (!currentPassword.trim()) {
      tempErrors.currentPassword = "Current Password is required!";
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!newPassword) {
      tempErrors.newPassword = "Password is required";
    } else if (newPassword.length < 6) {
      tempErrors.newPassword = "Password must be atleast 6 characters long";
    } else if (!passwordRegex.test(newPassword)) {
      tempErrors.newPassword = "Password must contain atleast one letter, one number and one special character!";
    }

    if (newPassword !== confirmPassword) {
      tempErrors.confirmPassword = "Passwords does not match!"
    }

    setPasswordError(tempErrors);
    return Object.keys(tempErrors).length === 0;
  }

  const handleChangePassword = async (e) => {

    e.preventDefault();

    if (!validatePassword()) return;

    try {
      setUpdating(true);

      const result = await changePassword({
        oldPassword: currentPassword,
        newPassword: newPassword
      });

      if (result) {
        toast.success("Password changed successfully!");
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsChangeModalOpen(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }

  };

  const handleEditModalOpen = () => {
    setNewUsername(username);
    setIsEditModalOpen(true);
  };

  const handleSaveUsername = async (e) => {
    e.preventDefault();

    if (!validateUsername()) return;

    try {
      setUsernameError("");
      setUpdating(true);

      const result = await editUsername({ username: newUsername.trim() });

      if (result) {
        setUsername(newUsername);
        setIsEditModalOpen(false);
        toast.success('Username updated successfully!');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setUpdating(false);
    }
  };

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

            <li className="text-gray-500">Account</li>
          </ul>
        </nav>

        <section
          className="container mx-auto w-full flex-grow max-w-[1200px] border-b py-5 lg:flex lg:flex-row lg:py-10"
        >
            <ProfileSidebar/>

            { loading ? (
              <div className="flex items-center justify-center h-[200px]">
                <div className="text-center">
                  <div className="loader border-t-4 border-b-4 border-gray-900 h-10 w-10 mx-auto rounded-full animate-spin"></div>
                  <p className="mt-3 text-gray-500">Loading...</p>
                </div>
              </div>
            ) : (

              <div className="flex justify-center items-center mx-20 px-20">
              <div className="w-full max-w-md mx-20 px-20 py-8 bg-white border border-gray-300 rounded shadow-md">
                <h2 className="text-2xl font-bold text-center mb-6">Profile Details</h2>
            
                {/* Profile Details Section */}
                <div className="space-y-4">
                  {/* Username */}
                  <div className="flex items-center gap-2">
                    <p className="text-gray-600">Username:</p>
                    <p className="font-medium text-gray-800">{username}</p>
                  </div>
            
                  {/* Email */}
                  <div className="flex items-center gap-2">
                    <p className="text-gray-600">Email:</p>
                    <p className="font-medium text-gray-800">{email}</p>
                  </div>
                </div>
            
                {/* Buttons Section */}
                <div className="mt-8 space-y-4">
                  {/* Edit Profile Button */}
                  <button
                    onClick={handleEditModalOpen}
                    className="w-full bg-violet-900 text-white py-2 rounded hover:bg-violet-800 transition duration-200"
                  >
                    Edit Username
                  </button>
            
                  {/* Change Password Button */}
                  <button
                    onClick={() => setIsChangeModalOpen(true)}
                    className="w-full bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 transition duration-200"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>
            )}

        </section>

        {/* Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white rounded shadow-md">
              <h2 className="text-xl font-bold text-center mb-4">Edit Username</h2>
              <div>
                <label className="block text-gray-600 font-medium mb-2">New Username</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-violet-900"
                />
                {usernameError && <p className="text-red-500 text-sm mt-2">{usernameError}</p>}
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUsername}
                  disabled={updating}
                  className="px-4 py-2 bg-violet-900 text-white rounded hover:bg-violet-800"
                >
                  { updating ? 'Saving...' : 'Save' }
                </button>
              </div>
            </div>
          </div>
        )}

        {isChangeModalOpen && (
          <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50">
            <div className="w-full max-w-md p-6 bg-white rounded shadow-md">
              <h2 className="text-xl font-bold text-center mb-4">Change Password</h2>
              <div>
                <label className="block text-gray-600 font-medium mb-2">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-violet-900"
                />
                {passwordError.currentPassword && <p className="text-red-500 text-sm mt-2">{passwordError.currentPassword}</p>}
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-violet-900"
                />
                {passwordError.newPassword && <p className="text-red-500 text-sm mt-2">{passwordError.newPassword}</p>}
              </div>
              <div>
                <label className="block text-gray-600 font-medium mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-violet-900"
                />
                {passwordError.confirmPassword && <p className="text-red-500 text-sm mt-2">{passwordError.confirmPassword}</p>}
              </div>
              <div className="mt-6 flex justify-end space-x-2">
                <button
                  onClick={() => setIsChangeModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={updating}
                  className="px-4 py-2 bg-violet-900 text-white rounded hover:bg-violet-800"
                >
                  { updating ? 'Saving...' : 'Save' }
                </button>
              </div>
            </div>
          </div>
        )}

      <UserFooter/>
    </div>
  )
}

export default Profile
