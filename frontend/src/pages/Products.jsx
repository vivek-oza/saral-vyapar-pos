import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from "../components/ui/button";
import Layout from '../components/layout/Layout';
import ProductForm from '../components/products/ProductForm';
import ProductList from '../components/products/ProductList';
import ProductSearch from '../components/products/ProductSearch';
import CategoryManager from '../components/products/CategoryManager';
import { ArrowLeft, Package, Plus, Tag } from "lucide-react";
import { productAPI, categoryAPI } from '../api/products';

const Products = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useLanguage();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [pagination, setPagination] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showCategoryManager, setShowCategoryManager] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        category: '',
        stock: '',
        sort: 'name'
    });
    const [currentPage, setCurrentPage] = useState(1);

    const handleBackToModules = () => {
        navigate(`/${user?.shop?.username}/modules`);
    };

    // Load products with current filters
    const loadProducts = useCallback(async (page = 1) => {
        setIsLoading(true);
        try {
            const params = {
                page,
                limit: 20,
                ...(searchTerm && { search: searchTerm }),
                ...(filters.category && { category: filters.category }),
                ...(filters.stock && { stock: filters.stock }),
                ...(filters.sort && { sort: filters.sort })
            };

            const response = await productAPI.getProducts(params);
            setProducts(response.products || []);
            setPagination(response.pagination || {});
            setCurrentPage(page);
        } catch (error) {
            console.error('Error loading products:', error);
            // You might want to show a toast notification here
        } finally {
            setIsLoading(false);
        }
    }, [searchTerm, filters]);

    // Load categories
    const loadCategories = useCallback(async () => {
        try {
            const response = await categoryAPI.getCategories();
            setCategories(response.categories || []);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }, []);

    // Initial load
    useEffect(() => {
        loadProducts();
        loadCategories();
    }, [loadProducts, loadCategories]);

    // Reload products when filters change
    useEffect(() => {
        setCurrentPage(1);
        loadProducts(1);
    }, [searchTerm, filters, loadProducts]);

    const handleSearch = useCallback((term) => {
        setSearchTerm(term);
    }, []);

    const handleFilter = useCallback((newFilters) => {
        setFilters(newFilters);
    }, []);

    const handlePageChange = (page) => {
        loadProducts(page);
    };

    const handleAddProduct = () => {
        setEditingProduct(null);
        setShowForm(true);
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    const handleDeleteProduct = async (productId) => {
        try {
            await productAPI.deleteProduct(productId);
            loadProducts(currentPage);
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Failed to delete product. Please try again.');
        }
    };

    const handleFormSubmit = async (productData) => {
        setIsSubmitting(true);
        try {
            if (editingProduct) {
                await productAPI.updateProduct(editingProduct.id, productData);
            } else {
                await productAPI.createProduct(productData);
            }

            setShowForm(false);
            setEditingProduct(null);
            loadProducts(currentPage);
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save product. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFormCancel = () => {
        setShowForm(false);
        setEditingProduct(null);
    };

    const handleCategoryChange = () => {
        // Reload categories when they change
        loadCategories();
    };

    return (
        <Layout>
            <div className="max-w-6xl mx-auto p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <Button
                            variant="outline"
                            onClick={handleBackToModules}
                            className="w-fit"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            <span className="hidden xs:inline">{t('products.backToModules')}</span>
                            <span className="xs:hidden">{t('nav.moduleSelection')}</span>
                        </Button>
                        <div className="flex items-center">
                            <Package className="mr-3 h-6 w-6 text-blue-600" />
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t('products.title')}</h1>
                        </div>
                    </div>

                    {!showForm && (
                        <div className="flex space-x-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowCategoryManager(true)}
                                className="w-fit"
                            >
                                <Tag className="mr-2 h-4 w-4" />
                                {t('products.manageCategories')}
                            </Button>
                            <Button onClick={handleAddProduct} className="w-fit">
                                <Plus className="mr-2 h-4 w-4" />
                                {t('products.addProduct')}
                            </Button>
                        </div>
                    )}
                </div>

                {showForm ? (
                    <ProductForm
                        product={editingProduct}
                        onSubmit={handleFormSubmit}
                        onCancel={handleFormCancel}
                        isLoading={isSubmitting}
                    />
                ) : (
                    <>
                        <ProductSearch
                            onSearch={handleSearch}
                            onFilter={handleFilter}
                            categories={categories}
                        />

                        <ProductList
                            products={products}
                            pagination={pagination}
                            onEdit={handleEditProduct}
                            onDelete={handleDeleteProduct}
                            onPageChange={handlePageChange}
                            isLoading={isLoading}
                        />
                    </>
                )}

                {/* Category Manager Modal */}
                <CategoryManager
                    isOpen={showCategoryManager}
                    onClose={() => setShowCategoryManager(false)}
                    onCategoryChange={handleCategoryChange}
                />
            </div>
        </Layout>
    );
}

export default Products