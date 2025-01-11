import axios from "axios";
import { toast } from "react-toastify";

const API_URL = `${import.meta.env.VITE_API_ROOT_URL}/admin`;

const login = async (adminData) => {
    try {

        const response = await axios.post(`${API_URL}/login`, adminData);

        if (response.status === 200) {
            return response.data;
        }
        
    } catch (error) {
        toast.error(error.response?.data?.message || "An error occured!");
    }
}

export { login };