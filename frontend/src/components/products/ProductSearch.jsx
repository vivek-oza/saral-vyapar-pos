import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Button } from '../ui/button';

const ProductSearch = ({ onSearch, onFilter, categories = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        category: '',
        stock: '',
        sort: 'name'
    });
    const [showFilters, setShowFilters] = useState(false);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, onSearch]);

    // Apply filters when they change
    useEffect(() => {
        onFilter(filters);
    }, [filters, onFilter]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            category: '',
            stock: '',
            sort: 'name'
        });
        setSearchTerm('');
    };

    const hasActiveFilters = filters.category || filters.stock || searchTerm;

    return (
        <div className="bg-white rounded-lg border shadow-sm p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                        type="text"
                        placeholder="Search products by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Filter Toggle */}
                <Button
                    variant="outline"
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center"
                >
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                        <span className="ml-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            !
                        </span>
                    )}
                </Button>

                {/* Clear Filters */}
                {hasActiveFilters && (
                    <Button
                        variant="outline"
                        onClick={clearFilters}
                        className="flex items-center text-red-600 hover:text-red-700"
                    >
                        <X className="mr-2 h-4 w-4" />
                        Clear
                    </Button>
                )}
            </div>

            {/* Filter Options */}
            {showFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Category Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <select
                                value={filters.category}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.name}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Stock Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Stock Status
                            </label>
                            <select
                                value={filters.stock}
                                onChange={(e) => handleFilterChange('stock', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Stock Levels</option>
                                <option value="in-stock">In Stock (>10)</option>
                                <option value="low-stock">Low Stock (1-10)</option>
                                <option value="out-of-stock">Out of Stock (0)</option>
                            </select>
                        </div>

                        {/* Sort Options */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sort By
                            </label>
                            <select
                                value={filters.sort}
                                onChange={(e) => handleFilterChange('sort', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="name">Name (A-Z)</option>
                                <option value="price">Price (Low to High)</option>
                                <option value="stock">Stock (High to Low)</option>
                                <option value="date">Date Added (Newest)</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductSearch;