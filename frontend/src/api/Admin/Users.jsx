import axios from "axios";
import { toast } from "react-toastify";

const API_URL = `${import.meta.env.VITE_API_ROOT_URL}/admin/users`;

const getUsers = async () => {
    try {
        const token = localStorage.getItem('adminToken')
        const response = await axios.get(`${API_URL}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        toast.error(error.response?.data?.message || "An error occured!");
    }
};

const toggleBlock = async (userId) => {
    try {
        const token = localStorage.getItem('adminToken');
        if (!token) console.log("no token found.")
        const response = await axios.patch(`${API_URL}/${userId}/block`,
        {}, 
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        toast.error(error.response?.data?.message || "An error occured");
    }
}

export { getUsers, toggleBlock };