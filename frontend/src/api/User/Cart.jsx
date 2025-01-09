import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "http://localhost:9000/api/user/cart";

const getCart = async () => {
    try {
        const token = localStorage.getItem('userToken');

        const response = await axios.get(`${API_URL}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        toast.error(error.response?.data?.message || 'An error occured');
    }
};

const addToCart = async (data) => {
    try {
        const token = localStorage.getItem('userToken');

        const response = await axios.post(`${API_URL}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if ( response.status === 200) {
            return response.data;
        }
    } catch (error) {
        toast.error(error.response?.data?.message || 'An error occured');
    }
};

const updateCartQuantity = async (productId, quantity) => {
    try {
        const token = localStorage.getItem('userToken');

        const response = await axios.patch(
            `${API_URL}`,
            { productId, quantity },
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.error(error);
        
        toast.error(error.response?.data?.message || 'An error occured!');
    }
};

const removeCartItem = async (productId) => {
    try {
        const token = localStorage.getItem('userToken');

        const response = await axios.patch(`${API_URL}/remove`, {
            productId
        },{
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        toast.error(error.response?.data?.message || 'An error occured!');
    }
};

const clearCart = async () => {
    try {
        const token = localStorage.getItem('userToken');

        const response = await axios.patch(
            `${API_URL}/clear`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        toast.error(error.response?.data?.message || 'An error occured');
    }
};

export { addToCart, getCart, updateCartQuantity, removeCartItem, clearCart };