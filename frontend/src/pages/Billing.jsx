import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import Layout from "../components/layout/Layout";
import ServiceBillingInterface from "../components/billing/service/ServiceBillingInterface";
import { isServiceBusiness } from "../utils/businessTypeUtils";
import { ArrowLeft, Receipt } from "lucide-react";

const Billing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBackToModules = () => {
    navigate(`/${user?.shop?.username}/modules`);
  };

  const businessType = user?.shop?.business_type;
  const isService = isServiceBusiness(businessType);

  return (
    <Layout>
      {isService ? (
        <div className="max-w-7xl mx-auto p-4">
          <div className="mb-4">
            <Button
              variant="outline"
              onClick={handleBackToModules}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="hidden xs:inline">Back to </span>Modules
            </Button>
          </div>
          <ServiceBillingInterface />
        </div>
      ) : (
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex flex-col sm:flex-row sm:items-center mb-6 gap-4">
            <Button
              variant="outline"
              onClick={handleBackToModules}
              className="w-fit"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="hidden xs:inline">Back to </span>Modules
            </Button>
            <div className="flex items-center">
              <Receipt className="mr-3 h-6 w-6 text-purple-600" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Retail Billing System
              </h1>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6 sm:p-8 text-center">
            <Receipt className="mx-auto h-12 sm:h-16 w-12 sm:w-16 text-purple-600 mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
              Retail Billing System Module
            </h2>
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
              This module will include product-based billing, inventory
              management, and retail POS functionality.
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              Coming soon - This functionality will be implemented in future
              updates.
            </p>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Billing;
