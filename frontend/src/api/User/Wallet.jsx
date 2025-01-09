import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "http://localhost:9000/api/user/wallet";

const getWallet = async () => {
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
        toast.error(error.response?.data?.message || 'An error occured!');
    }
}

export { getWallet };