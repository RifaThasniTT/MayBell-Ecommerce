import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "http://localhost:9000/api/user/orders";

const placeOrder = async (data) => {
    try {
        const token = localStorage.getItem('userToken');

        const response = await axios.post(
            `${API_URL}`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (response.status === 201) {
            return response.data;
        }
    } catch (error) {
        toast.error(error.response?.data?.message || 'An error occured!');
    }
};

const getOrderHistory = async () => {
    try {
        const token = localStorage.getItem('userToken');

        const response = await axios.get(`${API_URL}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        toast.error(error.response?.data?.message || 'An error occured');
    }
};

const getOrderDetails = async (id) => {
    try {
        const token = localStorage.getItem('userToken');

        const response = await axios.get(`${API_URL}/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        toast.error(error.response?.data?.message || 'An error occured');
        throw error;
    }
};

const cancelOrder = async (id) => {
    try {
        const token = localStorage.getItem('userToken');

        const response = await axios.patch(
            `${API_URL}/${id}`,
            { status: 'Cancelled'}, 
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
        toast.error(error.response?.data?.message || 'An error occured!');
    }
};

const requestReturn = async (id, reason) => {
    try {
        const token = localStorage.getItem('userToken');

        const response = await axios.post(
            `${API_URL}/${id}/request-return`,
            { reason }, 
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
        toast.error(error.response?.data?.message || 'An error occured!');
    }
};

const updatePaymentStatus = async (orderId, razorpayOrderId) => {
    try {
        const token = localStorage.getItem('userToken');

        const response = await axios.patch(
            `${API_URL}/payment`, 
            {
                orderId,
                razorpayOrderId,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }
        );

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        toast.error(error.response?.data?.message || 'An error occured!');
        throw error;
    }
};

const retryPayment = async (orderId) => {
    try {
        const token = localStorage.getItem('userToken');

        const response = await axios.post(
            `${API_URL}/${orderId}/retry`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }
        );

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        toast.error(error.response?.data?.message || 'An error occured!');
        throw error;
    }
}

export { placeOrder, getOrderDetails, getOrderHistory, cancelOrder, requestReturn, updatePaymentStatus, retryPayment };