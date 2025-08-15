import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { categoryAPI } from '../../api/products';
import { useLanguage } from '../../contexts/LanguageContext';

const ProductForm = ({ product, onSubmit, onCancel, isLoading }) => {
    const { t } = useLanguage();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        basePrice: '',
        marginInCurrency: '',
        category: '',
        stock: '',
        sku: ''
    });

    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);

    // Load categories on component mount
    useEffect(() => {
        loadCategories();
    }, []);

    // Populate form when editing
    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                basePrice: product.base_price?.toString() || '',
                marginInCurrency: product.margin_in_currency?.toString() || '',
                category: product.category || '',
                stock: product.stock?.toString() || '',
                sku: product.sku || ''
            });
        }
    }, [product]);

    const loadCategories = async () => {
        setIsLoadingCategories(true);
        try {
            const response = await categoryAPI.getCategories();
            setCategories(response.categories || []);
        } catch (error) {
            console.error('Error loading categories:', error);
        } finally {
            setIsLoadingCategories(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Product name is required';
        } else if (formData.name.length < 2 || formData.name.length > 100) {
            newErrors.name = 'Product name must be 2-100 characters';
        }

        if (!formData.basePrice) {
            newErrors.basePrice = 'Base price is required';
        } else if (isNaN(formData.basePrice) || parseFloat(formData.basePrice) < 0) {
            newErrors.basePrice = 'Base price must be a positive number';
        }

        if (formData.marginInCurrency && (isNaN(formData.marginInCurrency) || parseFloat(formData.marginInCurrency) < 0)) {
            newErrors.marginInCurrency = 'Margin must be a non-negative number';
        }

        if (formData.stock && (isNaN(formData.stock) || parseInt(formData.stock) < 0)) {
            newErrors.stock = 'Stock must be a non-negative integer';
        }

        if (formData.description && formData.description.length > 500) {
            newErrors.description = 'Description must be less than 500 characters';
        }

        if (formData.sku && formData.sku.length > 50) {
            newErrors.sku = 'SKU must be less than 50 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const submitData = {
            name: formData.name.trim(),
            description: formData.description.trim() || undefined,
            basePrice: parseFloat(formData.basePrice),
            marginInCurrency: formData.marginInCurrency ? parseFloat(formData.marginInCurrency) : 0,
            category: formData.category.trim() || undefined,
            stock: formData.stock ? parseInt(formData.stock) : 0,
            sku: formData.sku.trim() || undefined
        };

        onSubmit(submitData);
    };

    const sellingPrice = (parseFloat(formData.basePrice) || 0) + (parseFloat(formData.marginInCurrency) || 0);

    return (
        <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">
                {product ? t('productForm.editTitle') : t('productForm.addTitle')}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('productForm.productName')} *
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder={t('productForm.productNamePlaceholder')}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.description ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="Enter product description"
                    />
                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Base Price (₹) *
                        </label>
                        <input
                            type="number"
                            name="basePrice"
                            value={formData.basePrice}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.basePrice ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="0.00"
                        />
                        {errors.basePrice && <p className="text-red-500 text-sm mt-1">{errors.basePrice}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Profit Margin (₹)
                        </label>
                        <input
                            type="number"
                            name="marginInCurrency"
                            value={formData.marginInCurrency}
                            onChange={handleChange}
                            step="0.01"
                            min="0"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.marginInCurrency ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="0.00"
                        />
                        {errors.marginInCurrency && <p className="text-red-500 text-sm mt-1">{errors.marginInCurrency}</p>}
                    </div>
                </div>

                {sellingPrice > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <p className="text-sm text-green-700">
                            <strong>Selling Price: ₹{sellingPrice.toFixed(2)}</strong>
                        </p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                        </label>
                        <div className="flex space-x-2">
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isLoadingCategories}
                            >
                                <option value="">Select a category</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.name}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="text"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                placeholder="Or type new category"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Select from existing categories or type a new one
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Initial Stock
                        </label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            min="0"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.stock ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="0"
                        />
                        {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        SKU (Stock Keeping Unit)
                    </label>
                    <input
                        type="text"
                        name="sku"
                        value={formData.sku}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.sku ? 'border-red-500' : 'border-gray-300'
                            }`}
                        placeholder="Enter unique SKU"
                    />
                    {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku}</p>}
                </div>

                <div className="flex space-x-3 pt-4">
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1"
                    >
                        {isLoading ? 'Saving...' : (product ? 'Update Product' : 'Add Product')}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;