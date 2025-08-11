import React from 'react';
import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main className="pt-16 relative">
                {children}
            </main>
        </div>
    );
};

export default Layout;