import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "http://localhost:9000/api/admin/coupons";

const fetchCoupons = async () => {
    try {
        const token = localStorage.getItem('adminToken');

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

const createCoupon = async (data) => {
    try {
        const token = localStorage.getItem('adminToken');

        const response = await axios.post(`${API_URL}`, data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.status === 201) {
            return response.data;
        }
    } catch (error) {
        toast.error(error.response?.data?.message || 'An error occured!');
    }
};

const toggleCouponStatus = async (id) => {
    try {
        const token = localStorage.getItem('adminToken');

        const response = await axios.patch(`${API_URL}/${id}`, {}, {
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

export { fetchCoupons, createCoupon, toggleCouponStatus };