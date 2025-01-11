import axios from "axios";
import { toast } from "react-toastify";

const API_URL = `${import.meta.env.VITE_API_ROOT_URL}/admin/orders`;

const getAllOrders = async () => {
    try {
        const token = localStorage.getItem('adminToken');

        const response = await axios.get(`${API_URL}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        toast.error(error.response?.data?.message || 'An error occured');
    }
};

const updateOrderStatus = async (id, status) => {
    try {
        const token = localStorage.getItem('adminToken');

        const response = await axios.patch(`${API_URL}/${id}`,
            { status },
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
        toast.error(error.response?.data?.message || 'An error occured');
    }
};

const getSalesReport = async (filter = 'weekly', startDate, endDate) => {
    try {
        const token = localStorage.getItem('adminToken');

        const response = await axios.get(
            `${API_URL}/sales`,
            {
                params: {
                    filter, 
                    startDate,
                    endDate,
                }, 
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            },           
        );

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message || 'An error occured!!');
    }
};

const getChartData = async (period) => {
    try {
        const token = localStorage.getItem('adminToken');

        const response = await axios.get(
            `${API_URL}/chart`,
            {
                params: {
                    period,
                },
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
        console.error(error);
    }
};

const getStats = async () => {
    try {
        const token = localStorage.getItem('adminToken');

        const response = await axios.get(`${API_URL}/stats`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        toast.error(error.response?.data?.message || 'An error occured');
        throw error;
    }
}

export { getAllOrders, updateOrderStatus, getSalesReport, getChartData, getStats };