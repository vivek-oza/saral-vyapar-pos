import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { ArrowLeft } from "lucide-react";

const ShopSetupForm = ({ onSubmit, onBack, loading = false }) => {
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        address: "",
        gstNumber: "",
        phone: "",
        businessType: "",
    });
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Shop name is required";
        }

        if (!formData.username.trim()) {
            newErrors.username = "Shop username is required";
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = "Username can only contain letters, numbers, and underscores";
        } else if (formData.username.length < 3 || formData.username.length > 30) {
            newErrors.username = "Username must be between 3 and 30 characters";
        }

        if (!formData.address.trim()) {
            newErrors.address = "Address is required";
        }

        if (formData.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(formData.gstNumber)) {
            newErrors.gstNumber = "Invalid GST number format";
        }

        if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
            newErrors.phone = "Invalid phone number format";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        onSubmit(formData);
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        disabled={loading}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <CardTitle>Shop Setup</CardTitle>
                        <CardDescription>
                            Set up your shop details to get started
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                            Shop Name *
                        </label>
                        <Input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter your shop name"
                            className={errors.name ? "border-destructive" : ""}
                            disabled={loading}
                        />
                        {errors.name && (
                            <p className="text-destructive text-sm">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="username" className="text-sm font-medium">
                            Shop Username *
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
                                /
                            </span>
                            <Input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleInputChange}
                                placeholder="myshop123"
                                className={`pl-6 ${errors.username ? "border-destructive" : ""}`}
                                disabled={loading}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Your shop will be available at: /{formData.username || 'username'}/dashboard
                        </p>
                        {errors.username && (
                            <p className="text-destructive text-sm">{errors.username}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="address" className="text-sm font-medium">
                            Address *
                        </label>
                        <Input
                            type="text"
                            id="address"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            placeholder="Enter your shop address"
                            className={errors.address ? "border-destructive" : ""}
                            disabled={loading}
                        />
                        {errors.address && (
                            <p className="text-destructive text-sm">{errors.address}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="gstNumber" className="text-sm font-medium">
                            GST Number (Optional)
                        </label>
                        <Input
                            type="text"
                            id="gstNumber"
                            name="gstNumber"
                            value={formData.gstNumber}
                            onChange={handleInputChange}
                            placeholder="Enter GST number (if applicable)"
                            className={errors.gstNumber ? "border-destructive" : ""}
                            disabled={loading}
                        />
                        {errors.gstNumber && (
                            <p className="text-destructive text-sm">{errors.gstNumber}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium">
                            Phone Number (Optional)
                        </label>
                        <Input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter phone number"
                            className={errors.phone ? "border-destructive" : ""}
                            disabled={loading}
                        />
                        {errors.phone && (
                            <p className="text-destructive text-sm">{errors.phone}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="businessType" className="text-sm font-medium">
                            Business Type (Optional)
                        </label>
                        <Input
                            type="text"
                            id="businessType"
                            name="businessType"
                            value={formData.businessType}
                            onChange={handleInputChange}
                            placeholder="e.g., Retail, Restaurant, Services"
                            disabled={loading}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Creating Account..." : "Complete Setup"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};

export default ShopSetupForm;