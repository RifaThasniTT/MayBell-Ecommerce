import axios from "axios";
import { toast } from "react-toastify";

const API_URL = `${import.meta.env.VITE_API_ROOT_URL}/admin/categories`;

const getCategories = async () => {
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
        toast.error(error.response?.data?.message || 'An error occured');
    }
};

const addCategory = async (data) => {
    try {
        const token = localStorage.getItem('adminToken');

        const response = await axios.post(`${API_URL}`, 
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        if (response.status === 201) {
            return response.data;
        }
    } catch (error) {
        toast.error(error.response?.data?.message || "An error occured");
    }
};

const toggleList = async (id) => {
    try {
        const token = localStorage.getItem('adminToken');

        const response = await axios.patch(`${API_URL}/${id}/list`, 
            {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        toast.error(error.response?.data?.message || "An error occured");
    }
};

const editCategory = async (id, data) => {
    try {
        const token = localStorage.getItem('adminToken');

        const response = await axios.patch(`${API_URL}/${id}`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            },
        );

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        toast.error(error.response?.data?.message || "An error occured");
    }
}

export { getCategories, addCategory, toggleList, editCategory }