const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
    };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'An error occurred');
    }
    return response.json();
};

// Product API functions
export const productAPI = {
    // Get all products with optional filters
    getProducts: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const url = `${API_BASE_URL}/products${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        return handleResponse(response);
    },

    // Get single product by ID
    getProduct: async (id) => {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        return handleResponse(response);
    },

    // Create new product
    createProduct: async (productData) => {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(productData)
        });

        return handleResponse(response);
    },

    // Update existing product
    updateProduct: async (id, productData) => {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(productData)
        });

        return handleResponse(response);
    },

    // Delete product
    deleteProduct: async (id) => {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        return handleResponse(response);
    }
};

// Category API functions
export const categoryAPI = {
    // Get all categories
    getCategories: async () => {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        return handleResponse(response);
    },

    // Get single category by ID
    getCategory: async (id) => {
        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        return handleResponse(response);
    },

    // Create new category
    createCategory: async (categoryData) => {
        const response = await fetch(`${API_BASE_URL}/categories`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(categoryData)
        });

        return handleResponse(response);
    },

    // Update existing category
    updateCategory: async (id, categoryData) => {
        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(categoryData)
        });

        return handleResponse(response);
    },

    // Delete category
    deleteCategory: async (id) => {
        const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        return handleResponse(response);
    }
};