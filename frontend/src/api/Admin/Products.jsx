import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "http://localhost:9000/api/admin/products";

const getProducts = async () => {
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
        console.error(error);
        toast.error(error.response?.data?.message || 'An error occured!');
    }
};

const addProduct = async (data) => {
    try {
        const token = localStorage.getItem('adminToken');

        const response = await axios.post(`${API_URL}`, data,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            },
        );

        if (response.status === 201) {
            toast.success('Product added successfully!');
        }

        return response.data;
    } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || 'An error occured!');
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

const editProduct = async (id, data) => {
    try {
        const token = localStorage.getItem('adminToken');

        const response = await axios.patch(`${API_URL}/${id}`, data, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        });
        console.log(response);

        if (response.status === 200) {
            return response.data;
        }
    } catch (error) {
        console.log(error);
        toast.error(error.response?.data?.message || 'An error occured!');
    }
};

export { getProducts, addProduct, toggleList, editProduct }