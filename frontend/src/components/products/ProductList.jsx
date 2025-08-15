import { useState } from 'react';
import ProductCard from './ProductCard';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { Button } from '../ui/button';

const ProductList = ({ products, pagination, onEdit, onDelete, onPageChange, isLoading }) => {
    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading products...</span>
            </div>
        );
    }

    if (!products || products.length === 0) {
        return (
            <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">
                    Get started by adding your first product to the catalog.
                </p>
            </div>
        );
    }

    const { page, totalPages, total } = pagination || {};
    const startItem = ((page - 1) * (pagination?.limit || 20)) + 1;
    const endItem = Math.min(page * (pagination?.limit || 20), total);

    return (
        <div>
            {/* Results Summary */}
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600">
                    Showing {startItem}-{endItem} of {total} products
                </p>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {products.map(product => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <Button
                            variant="outline"
                            onClick={() => onPageChange(page - 1)}
                            disabled={page <= 1}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onPageChange(page + 1)}
                            disabled={page >= totalPages}
                        >
                            Next
                        </Button>
                    </div>

                    <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Page <span className="font-medium">{page}</span> of{' '}
                                <span className="font-medium">{totalPages}</span>
                            </p>
                        </div>

                        <div>
                            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                <Button
                                    variant="outline"
                                    onClick={() => onPageChange(page - 1)}
                                    disabled={page <= 1}
                                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>

                                {/* Page Numbers */}
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (page <= 3) {
                                        pageNum = i + 1;
                                    } else if (page >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = page - 2 + i;
                                    }

                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={pageNum === page ? "default" : "outline"}
                                            onClick={() => onPageChange(pageNum)}
                                            className="relative inline-flex items-center px-4 py-2 text-sm font-semibold"
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}

                                <Button
                                    variant="outline"
                                    onClick={() => onPageChange(page + 1)}
                                    disabled={page >= totalPages}
                                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductList;