import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "http://localhost:9000/api/user/wishlist";

const getWishlist = async (token) => {
    try {
        const response = await axios.get(`${API_URL}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        toast.error(error.response?.data?.message || 'An error occured!');
    }
};

const addToWishlist = async (token, data) => {
    try {
        const response = await axios.post(`${API_URL}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        toast.error(error.response?.data?.message || 'An error occured!');
    }
};

const removeWishlistProduct = async (data) => {
    try {
        const token = localStorage.getItem('userToken');
        const response = await axios.patch(`${API_URL}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        toast.error(error.response?.data?.message || 'An error occured!');
    }
}

export { getWishlist, addToWishlist, removeWishlistProduct };