import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "http://localhost:9000/api/user/product";

const getProductDetails = async (productId) => {
    try {
        
        const response = await axios.get(`${API_URL}/${productId}`);
  
        if (response.status === 200) {
          return response.data;
        }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occured!');
      throw error;
    }
};

const getListedProducts = async ({ categories = [], sort = '', search = '' }) => {
    try {
        
        const response = await axios.get(`${API_URL}`, {
          params: { 
            categories: categories.length ? categories.join(',') : "All", 
            sort, 
            search 
          },
        });

        if (response.status === 200) {
            return response.data.products
        }

    } catch (error) {
        toast.error(error.response?.data?.message || 'An error occured!');
    }
};

const getListedCategories = async () => {
    try {
      const response = await axios.get(`http://localhost:9000/api/user/categories`);

      if (response.status === 200) {
        return response.data.categories.filter((category) => category.isListed);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An error occured!');
    }
};

export { getProductDetails, getListedProducts, getListedCategories };