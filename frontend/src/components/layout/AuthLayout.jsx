const AuthLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Saral Vyapar POS</h1>
                    <p className="mt-2 text-sm text-gray-600">Simple. Powerful. Business Management.</p>
                </div>
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;