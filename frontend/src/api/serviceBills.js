const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
    const token = localStorage.getItem('token');
    return token;
};

// Helper function to make authenticated requests
const makeRequest = async (url, options = {}) => {
    const token = getAuthToken();

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
        ...options,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, config);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
};

// Service Bills API
export const serviceBillsAPI = {
    // Get all service bills with optional filters
    getServiceBills: async (params = {}) => {
        const queryParams = new URLSearchParams();

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                queryParams.append(key, value);
            }
        });

        const queryString = queryParams.toString();
        const url = `/service-bills${queryString ? `?${queryString}` : ''}`;

        return makeRequest(url);
    },

    // Get dashboard statistics
    getStats: async () => {
        return makeRequest('/service-bills/stats');
    },

    // Get single service bill
    getServiceBill: async (id) => {
        return makeRequest(`/service-bills/${id}`);
    },

    // Create new service bill
    createServiceBill: async (billData) => {
        return makeRequest('/service-bills', {
            method: 'POST',
            body: JSON.stringify(billData),
        });
    },

    // Update service bill
    updateServiceBill: async (id, updateData) => {
        return makeRequest(`/service-bills/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
    },

    // Delete service bill
    deleteServiceBill: async (id) => {
        return makeRequest(`/service-bills/${id}`, {
            method: 'DELETE',
        });
    },

    // Update bill status
    updateBillStatus: async (id, status) => {
        return makeRequest(`/service-bills/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
    },

    // Update payment mode
    updatePaymentMode: async (id, paymentMode) => {
        return makeRequest(`/service-bills/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ paymentMode }),
        });
    },
};

export default serviceBillsAPI;