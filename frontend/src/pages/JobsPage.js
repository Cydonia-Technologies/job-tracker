// src/pages/JobsPage.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const JobsPage = () => {
  const { user, signOut } = useAuth();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Placeholder data - replace with real data later
  const jobs = [
    {
      id: 1,
      title: 'Frontend Developer',
      company: 'Tech Company',
      location: 'Remote',
      status: 'saved',
      dateAdded: '2024-01-15',
      salary: '$80k - $100k'
    }
  ];

  const filteredJobs = jobs.filter(job => {
    const matchesFilter = filter === 'all' || job.status === filter;
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusCounts = {
    all: jobs.length,
    saved: jobs.filter(j => j.status === 'saved').length,
    applied: jobs.filter(j => j.status === 'applied').length,
    interviewing: jobs.filter(j => j.status === 'interviewing').length,
    offered: jobs.filter(j => j.status === 'offered').length,
    rejected: jobs.filter(j => j.status === 'rejected').length
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
              <p className="mt-1 text-sm text-gray-600">
                Track and manage your job applications
              </p>
            </div>
            <div className="flex space-x-4">
              <Link
                to="/dashboard"
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                Dashboard
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
          {/* Filters and Search */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                {/* Status Filter */}
                <div className="flex flex-wrap gap-2">
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <button
                      key={status}
                      onClick={() => setFilter(status)}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        filter === status
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Jobs List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Jobs ({filteredJobs.length})
                </h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
                  Add New Job
                </button>
              </div>

              {/* Empty State */}
              {filteredJobs.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">
                    {jobs.length === 0 
                      ? "No jobs added yet. Start by installing our Chrome extension or adding jobs manually!"
                      : "No jobs match your current filters."
                    }
                  </div>
                  {jobs.length === 0 && (
                    <div className="space-y-2">
                      <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors">
                        Install Chrome Extension
                      </button>
                      <div className="text-sm text-gray-400">
                        Or add jobs manually
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Job Cards */}
              {filteredJobs.length > 0 && (
                <div className="space-y-4">
                  {filteredJobs.map((job) => (
                    <div key={job.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900">{job.title}</h4>
                          <p className="text-gray-600">{job.company}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>{job.location}</span>
                            <span>{job.salary}</span>
                            <span>Added {job.dateAdded}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            job.status === 'saved' ? 'bg-gray-100 text-gray-800' :
                            job.status === 'applied' ? 'bg-blue-100 text-blue-800' :
                            job.status === 'interviewing' ? 'bg-yellow-100 text-yellow-800' :
                            job.status === 'offered' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {job.status}
                          </span>
                          <button className="text-gray-400 hover:text-gray-600">
                            •••
                          </button>
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

export default JobsPage;
