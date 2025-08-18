import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import { IndianRupee, Clock, TrendingUp, Calendar } from "lucide-react";

const DashboardCards = ({ stats }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Daily Collection Card */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-green-800">
            Today's Collection
          </CardTitle>
          <div className="p-2 bg-green-200 rounded-full">
            <TrendingUp className="h-4 w-4 text-green-700" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-700 mb-1">
            {formatCurrency(stats.dailyCollection)}
          </div>
          <div className="flex items-center text-sm text-green-600">
            <Calendar className="h-3 w-3 mr-1" />
            Total amount collected today
          </div>
        </CardContent>
      </Card>

      {/* Total Pending Card */}
      <Card className="bg-gradient-to-br from-red-50 to-pink-100 border-red-200 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-red-800">
            Pending Payments
          </CardTitle>
          <div className="p-2 bg-red-200 rounded-full">
            <Clock className="h-4 w-4 text-red-700" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-red-700 mb-1">
            {formatCurrency(stats.totalPending)}
          </div>
          <div className="flex items-center text-sm text-red-600">
            <IndianRupee className="h-3 w-3 mr-1" />
            Outstanding amount to collect
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCards;
