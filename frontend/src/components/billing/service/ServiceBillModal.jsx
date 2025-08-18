import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import { Plus, Trash2, Receipt } from "lucide-react";
import { useAuth } from "../../../contexts/AuthContext";
import { serviceBillsAPI } from "../../../api/serviceBills";

const ServiceBillModal = ({ onBillCreated, trigger }) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer: {
      name: "",
      phone: "",
      address: "",
    },
    serviceItems: [
      {
        date: new Date().toISOString().split("T")[0],
        description: "",
        amount: "",
      },
    ],
    paymentMode: "Pending",
  });
  const [errors, setErrors] = useState({});

  const handleCustomerChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      customer: {
        ...prev.customer,
        [field]: value,
      },
    }));

    if (errors[`customer.${field}`]) {
      setErrors((prev) => ({
        ...prev,
        [`customer.${field}`]: "",
      }));
    }
  };

  const handleServiceItemChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      serviceItems: prev.serviceItems.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));

    if (errors[`serviceItems.${index}.${field}`]) {
      setErrors((prev) => ({
        ...prev,
        [`serviceItems.${index}.${field}`]: "",
      }));
    }
  };

  const addServiceRow = () => {
    setFormData((prev) => ({
      ...prev,
      serviceItems: [
        ...prev.serviceItems,
        {
          date: new Date().toISOString().split("T")[0],
          description: "",
          amount: "",
        },
      ],
    }));
  };

  const removeServiceRow = (index) => {
    if (formData.serviceItems.length > 1) {
      setFormData((prev) => ({
        ...prev,
        serviceItems: prev.serviceItems.filter((_, i) => i !== index),
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.customer.name.trim()) {
      newErrors["customer.name"] = "Client name is required";
    }
    if (!formData.customer.phone.trim()) {
      newErrors["customer.phone"] = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.customer.phone)) {
      newErrors["customer.phone"] = "Invalid phone number format";
    }

    formData.serviceItems.forEach((item, index) => {
      if (!item.description.trim()) {
        newErrors[`serviceItems.${index}.description`] =
          "Service description is required";
      }
      if (!item.amount || isNaN(item.amount) || parseFloat(item.amount) <= 0) {
        newErrors[`serviceItems.${index}.amount`] = "Valid amount is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotal = () => {
    return formData.serviceItems.reduce((total, item) => {
      return total + (parseFloat(item.amount) || 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const billData = {
        ...formData,
        totalAmount: calculateTotal(),
      };

      const response = await serviceBillsAPI.createServiceBill(billData);
      onBillCreated(response.bill);
      setOpen(false);

      // Reset form
      setFormData({
        customer: { name: "", phone: "", address: "" },
        serviceItems: [
          {
            date: new Date().toISOString().split("T")[0],
            description: "",
            amount: "",
          },
        ],
        paymentMode: "Pending",
      });
    } catch (error) {
      console.error("Error creating bill:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      customer: { name: "", phone: "", address: "" },
      serviceItems: [
        {
          date: new Date().toISOString().split("T")[0],
          description: "",
          amount: "",
        },
      ],
      paymentMode: "Pending",
    });
    setErrors({});
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-700">
            <Receipt className="h-5 w-5" />
            Create Service Bill
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Details Section */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-800">
              Customer Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Client Name *
                </label>
                <Input
                  value={formData.customer.name}
                  onChange={(e) => handleCustomerChange("name", e.target.value)}
                  placeholder="Enter client name"
                  className={`border-gray-300 focus:border-gray-500 focus:ring-gray-500 ${
                    errors["customer.name"] ? "border-red-300" : ""
                  }`}
                />
                {errors["customer.name"] && (
                  <p className="text-red-500 text-sm">
                    {errors["customer.name"]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Phone Number *
                </label>
                <Input
                  value={formData.customer.phone}
                  onChange={(e) =>
                    handleCustomerChange("phone", e.target.value)
                  }
                  placeholder="Enter phone number"
                  className={`border-gray-300 focus:border-gray-500 focus:ring-gray-500 ${
                    errors["customer.phone"] ? "border-red-300" : ""
                  }`}
                />
                {errors["customer.phone"] && (
                  <p className="text-red-500 text-sm">
                    {errors["customer.phone"]}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Address (Optional)
              </label>
              <Textarea
                value={formData.customer.address}
                onChange={(e) =>
                  handleCustomerChange("address", e.target.value)
                }
                placeholder="Enter client address"
                rows={2}
                className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
              />
            </div>
          </div>

          {/* Service Rows Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-800">
                Service Details
              </h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addServiceRow}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Row
              </Button>
            </div>

            {formData.serviceItems.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border border-gray-200 rounded-lg bg-gray-25"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={item.date}
                    onChange={(e) =>
                      handleServiceItemChange(index, "date", e.target.value)
                    }
                    className="border-gray-300 focus:border-gray-500 focus:ring-gray-500"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">
                    Service Description *
                  </label>
                  <Input
                    value={item.description}
                    onChange={(e) =>
                      handleServiceItemChange(
                        index,
                        "description",
                        e.target.value
                      )
                    }
                    placeholder="Describe the service provided"
                    className={`border-gray-300 focus:border-gray-500 focus:ring-gray-500 ${
                      errors[`serviceItems.${index}.description`]
                        ? "border-red-300"
                        : ""
                    }`}
                  />
                  {errors[`serviceItems.${index}.description`] && (
                    <p className="text-red-500 text-sm">
                      {errors[`serviceItems.${index}.description`]}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Amount *
                  </label>
                  <div className="flex">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.amount}
                      onChange={(e) =>
                        handleServiceItemChange(index, "amount", e.target.value)
                      }
                      placeholder="0.00"
                      className={`border-gray-300 focus:border-gray-500 focus:ring-gray-500 ${
                        errors[`serviceItems.${index}.amount`]
                          ? "border-red-300"
                          : ""
                      }`}
                    />
                    {formData.serviceItems.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="ml-2"
                        onClick={() => removeServiceRow(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {errors[`serviceItems.${index}.amount`] && (
                    <p className="text-red-500 text-sm">
                      {errors[`serviceItems.${index}.amount`]}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Total Display - Moved below service rows */}
            <div className="flex justify-end pt-2">
              <div className="text-lg font-semibold text-gray-800">
                Total: ₹{calculateTotal().toFixed(2)}
              </div>
            </div>
          </div>

          {/* Total and Actions */}
          <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-4 border-t">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Generating..." : "Generate Bill"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceBillModal;
