import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, X } from 'lucide-react';
import { Button } from '../ui/button';
import { categoryAPI } from '../../api/products';
import { useLanguage } from '../../contexts/LanguageContext';

const CategoryManager = ({ isOpen, onClose, onCategoryChange }) => {
    const { t } = useLanguage();
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#3B82F6'
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadCategories();
        }
    }, [isOpen]);

    const loadCategories = async () => {
        setIsLoading(true);
        try {
            const response = await categoryAPI.getCategories();
            setCategories(response.categories || []);
        } catch (error) {
            console.error('Error loading categories:', error);
            alert('Failed to load categories. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddCategory = () => {
        setEditingCategory(null);
        setFormData({ name: '', description: '', color: '#3B82F6' });
        setErrors({});
        setShowForm(true);
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            color: category.color || '#3B82F6'
        });
        setErrors({});
        setShowForm(true);
    };

    const handleDeleteCategory = async (categoryId) => {
        if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
            return;
        }

        try {
            await categoryAPI.deleteCategory(categoryId);
            await loadCategories();
            onCategoryChange?.(); // Notify parent to refresh categories
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Failed to delete category. It may be in use by products.');
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Category name is required';
        } else if (formData.name.length < 2 || formData.name.length > 50) {
            newErrors.name = 'Category name must be 2-50 characters';
        }

        if (formData.description && formData.description.length > 200) {
            newErrors.description = 'Description must be less than 200 characters';
        }

        if (!formData.color.match(/^#[0-9A-F]{6}$/i)) {
            newErrors.color = 'Please select a valid color';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        try {
            const submitData = {
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                color: formData.color
            };

            if (editingCategory) {
                await categoryAPI.updateCategory(editingCategory.id, submitData);
            } else {
                await categoryAPI.createCategory(submitData);
            }

            setShowForm(false);
            setEditingCategory(null);
            await loadCategories();
            onCategoryChange?.(); // Notify parent to refresh categories
        } catch (error) {
            console.error('Error saving category:', error);
            if (error.message.includes('already exists')) {
                setErrors({ name: 'Category name already exists' });
            } else {
                alert('Failed to save category. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingCategory(null);
        setFormData({ name: '', description: '', color: '#3B82F6' });
        setErrors({});
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div className="flex items-center">
                        <Tag className="mr-3 h-6 w-6 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-900">{t('categories.title')}</h2>
                    </div>
                    <Button variant="outline" size="sm" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    {showForm ? (
                        /* Category Form */
                        <div className="mb-6">
                            <h3 className="text-lg font-medium mb-4">
                                {editingCategory ? 'Edit Category' : 'Add New Category'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Category Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Enter category name"
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
                                        placeholder="Enter category description (optional)"
                                    />
                                    {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Color
                                    </label>
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="color"
                                            name="color"
                                            value={formData.color}
                                            onChange={handleChange}
                                            className="h-10 w-16 border border-gray-300 rounded cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            name="color"
                                            value={formData.color}
                                            onChange={handleChange}
                                            className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.color ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            placeholder="#3B82F6"
                                        />
                                    </div>
                                    {errors.color && <p className="text-red-500 text-sm mt-1">{errors.color}</p>}
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <Button type="submit" disabled={isSubmitting} className="flex-1">
                                        {isSubmitting ? 'Saving...' : (editingCategory ? 'Update Category' : 'Add Category')}
                                    </Button>
                                    <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        /* Category List */
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium">Categories</h3>
                                <Button onClick={handleAddCategory}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Category
                                </Button>
                            </div>

                            {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    <span className="ml-2 text-gray-600">Loading categories...</span>
                                </div>
                            ) : categories.length === 0 ? (
                                <div className="text-center py-8">
                                    <Tag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">No categories yet</h4>
                                    <p className="text-gray-500 mb-4">
                                        Create your first category to organize your products.
                                    </p>
                                    <Button onClick={handleAddCategory}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Category
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {categories.map(category => (
                                        <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                            <div className="flex items-center space-x-3">
                                                <div
                                                    className="w-4 h-4 rounded-full border"
                                                    style={{ backgroundColor: category.color }}
                                                ></div>
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{category.name}</h4>
                                                    {category.description && (
                                                        <p className="text-sm text-gray-500">{category.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditCategory(category)}
                                                >
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDeleteCategory(category.id)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryManager;