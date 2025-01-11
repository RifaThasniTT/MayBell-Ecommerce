import axios from "axios";
import { toast } from "react-toastify";

const API_URL = `${import.meta.env.VITE_API_ROOT_URL}/user`;

const signup = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/signup`, userData);

    if (response.status === 201) {
      return response.data;
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "An error occured!");
  }
};

const verifyOtp = async (email, otp) => {
  try {
    const response = await axios.post(`${API_URL}/verify-otp`, {
      email,
      otp,
    });

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "An error occured!");
  }
};

const resendOtp = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/resend-otp`, { email });

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "An error occured!");
  }
};

const login = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/login`, userData);

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    toast.error(error.response?.data?.message || "An error occured!");
  }
};

const googleSignIn = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/google-signin`, userData);

    if (response.status === 201) {
      toast.success('Registered and Logged In Successfully!');
    }

    if (response.status === 200) {
      toast.success('Logged In Successfuly!');
    }

    return response;
  } catch (error) {
    toast.error(error.response?.data?.message || 'An error occured!');
  }
};

const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/forgot-password`, { email });

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'An error occured');
  }
};

const getProfile = async () => {
  try {
    const token = localStorage.getItem('userToken');

    const response = await axios.get(`${API_URL}/profile`, {
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

const editUsername = async (data) => {
  try {
    const token = localStorage.getItem('userToken');

    const response = await axios.patch(`${API_URL}/edit-username`, data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response) {
      return response.data;
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'An error occured');
  }
};

const changePassword = async (data) => {
  try {
    const token = localStorage.getItem('userToken');

    const response = await axios.patch(`${API_URL}/change-password`, data, {
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

const resetPassword = async (data) => {
  try {
    const response = await axios.patch(
      `${API_URL}/reset-password`,
      data
    );

    if (response.status === 200) {
      return response.data;
    }
  } catch (error) {
    toast.error(error.response?.data?.message || 'An error occured!');
  }
};

const calculateCount = async () => {
  try {
    const token = localStorage.getItem('userToken');

    if (token) {
      const response = await axios.get(`${API_URL}/quantity`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        return response.data;
      }
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export { signup, verifyOtp, resendOtp, login, googleSignIn, forgotPassword, getProfile, editUsername, changePassword, resetPassword, calculateCount };
