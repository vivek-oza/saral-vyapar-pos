import { useState } from 'react';
import { Edit, Trash2, Package } from 'lucide-react';
import { Button } from '../ui/button';

const ProductCard = ({ product, onEdit, onDelete }) => {
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            setIsDeleting(true);
            try {
                await onDelete(product.id);
            } catch (error) {
                console.error('Error deleting product:', error);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const getStockStatus = (stock) => {
        if (stock === 0) return { text: 'Out of Stock', color: 'text-red-600 bg-red-50' };
        if (stock <= 10) return { text: 'Low Stock', color: 'text-yellow-600 bg-yellow-50' };
        return { text: 'In Stock', color: 'text-green-600 bg-green-50' };
    };

    const stockStatus = getStockStatus(product.stock);

    return (
        <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow p-4">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                    <Package className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{product.name}</h3>
                        {product.sku && (
                            <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                        )}
                    </div>
                </div>
                <div className="flex space-x-1">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(product)}
                        className="h-8 w-8 p-0"
                    >
                        <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            {product.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
            )}

            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Base Price:</span>
                    <span className="font-medium">₹{product.base_price}</span>
                </div>

                {product.margin_in_currency > 0 && (
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Margin:</span>
                        <span className="text-sm">₹{product.margin_in_currency}</span>
                    </div>
                )}

                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Selling Price:</span>
                    <span className="font-semibold text-green-600">₹{product.selling_price}</span>
                </div>

                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Stock:</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${stockStatus.color}`}>
                        {product.stock} - {stockStatus.text}
                    </span>
                </div>

                {product.category && (
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Category:</span>
                        <span className="text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {product.category}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductCard;