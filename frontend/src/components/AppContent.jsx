// src/components/AppContent.jsx
import React from 'react';

const AppContent = ({ user }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Job Application Tracker
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back, {user?.email}!
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Your Job Tracker Dashboard
              </h2>
              <p className="text-gray-600 mb-6">
                Start tracking your job applications and let AI help optimize your search.
              </p>
              <div className="space-y-4">
                <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
                  Add New Job
                </button>
                <div className="text-sm text-gray-500">
                  Use our Chrome extension to save jobs from Indeed and other sites!
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppContent;
