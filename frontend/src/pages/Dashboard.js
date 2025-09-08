// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch jobs and applications data
      const [jobsResponse, applicationsResponse] = await Promise.all([
        apiService.getJobs({ limit: 5, sort_by: 'created_at', sort_order: 'desc' }),
        apiService.getApplications({ limit: 100 }) // Get all for stats calculation
      ]);

      const jobs = jobsResponse.jobs || [];
      const applications = applicationsResponse || [];

      // Calculate stats
      const totalJobs = jobs.length || 0;
      const appliedCount = applications.filter(app => app.status === 'applied').length;
      const interviewingCount = applications.filter(app => app.status === 'interviewing').length;
      const offeredCount = applications.filter(app => app.status === 'offered').length;

      setStats({
        totalJobs,
        appliedCount,
        interviewingCount,
        offeredCount
      });

      setRecentJobs(jobs.slice(0, 5));
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('Failed to load dashboard data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddJob = () => {
    // For now, show alert. Later we'll add a modal or navigate to add job page
    alert('Add Job functionality will be implemented next!');
  };

  const handleUploadResume = () => {
    alert('Resume upload functionality will be implemented next!');
  };

  const handleInstallExtension = () => {
    alert('Chrome extension will be available soon!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <LoadingSpinner message="Loading dashboard..." />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-red-700">{error}</div>
            <button 
              onClick={fetchDashboardData}
              className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  const statsData = [
    { 
      name: 'Total Jobs Saved', 
      value: stats?.totalJobs || 0, 
      change: '+0%',
      color: 'bg-blue-500'
    },
    { 
      name: 'Applications Sent', 
      value: stats?.appliedCount || 0, 
      change: '+0%',
      color: 'bg-green-500'
    },
    { 
      name: 'Interviews Scheduled', 
      value: stats?.interviewingCount || 0, 
      change: '+0%',
      color: 'bg-yellow-500'
    },
    { 
      name: 'Offers Received', 
      value: stats?.offeredCount || 0, 
      change: '+0%',
      color: 'bg-purple-500'
    },
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
            {statsData.map((item) => (
              <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 ${item.color} rounded-full flex items-center justify-center`}>
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
                <button 
                  onClick={handleAddJob}
                  className="relative block w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <div className="text-gray-900 font-medium">Add New Job</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Manually add a job posting
                  </div>
                </button>
                <button 
                  onClick={handleUploadResume}
                  className="relative block w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <div className="text-gray-900 font-medium">Upload Resume</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Update your resume for AI analysis
                  </div>
                </button>
                <button 
                  onClick={handleInstallExtension}
                  className="relative block w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <div className="text-gray-900 font-medium">Install Extension</div>
                  <div className="text-sm text-gray-500 mt-1">
                    Save jobs while browsing
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Recent Jobs */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Jobs
                </h3>
                <Link 
                  to="/jobs"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View all →
                </Link>
              </div>

              {recentJobs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-500 mb-4">
                    No jobs added yet. Start by adding your first job!
                  </div>
                  <button 
                    onClick={handleAddJob}
                    className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Add Your First Job
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900">{job.title}</h4>
                          <p className="text-gray-600">{job.company}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>{job.location || 'Location not specified'}</span>
                            {job.salary_min && job.salary_max && (
                              <span>${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}</span>
                            )}
                            <span>Added {new Date(job.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            job.application_status === 'saved' ? 'bg-gray-100 text-gray-800' :
                            job.application_status === 'applied' ? 'bg-blue-100 text-blue-800' :
                            job.application_status === 'interviewing' ? 'bg-yellow-100 text-yellow-800' :
                            job.application_status === 'offered' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {job.application_status || 'saved'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
