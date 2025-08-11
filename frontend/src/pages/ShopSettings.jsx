import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import Layout from "../components/layout/Layout";
import {
  ArrowLeft,
  Settings,
  Store,
  MapPin,
  FileText,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";

const ShopSettings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBackToModules = () => {
    navigate(`/${user?.shop?.username}/modules`);
  };

  const shopDetails = [
    {
      label: "Shop Name",
      value: user?.shop?.name || "Not set",
      icon: Store,
      color: "text-blue-600",
    },
    {
      label: "Shop Username",
      value: user?.shop?.username || "Not set",
      icon: Settings,
      color: "text-green-600",
    },
    {
      label: "Address",
      value: user?.shop?.address || "Not set",
      icon: MapPin,
      color: "text-red-600",
    },
    {
      label: "GST Number",
      value: user?.shop?.gst_number || "Not set",
      icon: FileText,
      color: "text-purple-600",
    },
    {
      label: "Phone Number",
      value: user?.shop?.phone || "Not set",
      icon: Phone,
      color: "text-orange-600",
    },
    {
      label: "Owner Email",
      value: user?.email || "Not set",
      icon: Mail,
      color: "text-indigo-600",
    },
    {
      label: "Created Date",
      value: user?.shop?.created_at
        ? new Date(user.shop.created_at).toLocaleString()
        : "Not available",
      icon: Calendar,
      color: "text-gray-600",
    },
  ];

  return (
    <Layout>
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
            <Settings className="mr-3 h-6 w-6 text-gray-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Shop Settings
            </h1>
          </div>
        </div>

        {/* Current Shop Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-blue-600" />
              Current Shop Details
            </CardTitle>
            <CardDescription>
              View your shop information and settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {shopDetails.map((detail, index) => {
                const IconComponent = detail.icon;
                return (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-shrink-0">
                      <IconComponent className={`h-5 w-5 ${detail.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {detail.label}
                      </p>
                      <p className="text-sm text-gray-600 break-words">
                        {detail.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-gray-600" />
              Additional Settings
            </CardTitle>
            <CardDescription>
              Features that will be available in future updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                "Edit Shop Information",
                "Business Hours Configuration",
                "Tax Settings & Rates",
                "Currency & Regional Settings",
                "Notification Preferences",
                "User Management & Roles",
                "Backup & Data Export",
                "Theme & Appearance",
                "Integration Settings",
              ].map((feature, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300"
                >
                  <p className="text-sm font-medium text-gray-700">{feature}</p>
                  <p className="text-xs text-gray-500 mt-1">Coming soon</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Settings className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">
                Settings Module Development
              </h3>
              <p className="text-sm text-blue-700 mt-1">
                This module currently displays your shop information. Advanced
                settings like editing shop details, configuring business hours,
                managing users, and customizing preferences will be implemented
                in future updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ShopSettings;
