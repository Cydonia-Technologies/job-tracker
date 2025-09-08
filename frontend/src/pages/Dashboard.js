// src/pages/Dashboard.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, signOut } = useAuth();

  const stats = [
    { name: 'Total Jobs Saved', value: '0', change: '+0%' },
    { name: 'Applications Sent', value: '0', change: '+0%' },
    { name: 'Interviews Scheduled', value: '0', change: '+0%' },
    { name: 'Offers Received', value: '0', change: '+0%' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Welcome back, {user?.email}
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/jobs"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                View Jobs
              </Link>
              <button
                onClick={signOut}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((item) => (
              <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          {item.name}
                        </dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">
                            {item.value}
                          </div>
                          <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                            {item.change}
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <button className="relative block w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <div className="text-gray-900 font-medium">Add New Job</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Manually add a job posting
                  </div>
                </button>
                <button className="relative block w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <div className="text-gray-900 font-medium">Upload Resume</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Update your resume for AI analysis
                  </div>
                </button>
                <button className="relative block w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <div className="text-gray-900 font-medium">Install Extension</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Save jobs while browsing
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="text-center py-8">
                <div className="text-gray-500">
                  No recent activity. Start by adding your first job!
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
