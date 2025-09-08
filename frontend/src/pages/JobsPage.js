// src/pages/JobsPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiService from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const JobsPage = () => {
  const { user, signOut } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddJobModal, setShowAddJobModal] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [filter]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        ...(filter !== 'all' && { status: filter }),
        sort_by: 'created_at',
        sort_order: 'desc'
      };

      const response = await apiService.getJobs(params);
      setJobs(response.jobs || []);
    } catch (err) {
      console.error('Jobs fetch error:', err);
      setError('Failed to load jobs. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchTerm === '' || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const statusCounts = {
    all: jobs.length,
    saved: jobs.filter(j => (j.application_status || 'saved') === 'saved').length,
    applied: jobs.filter(j => j.application_status === 'applied').length,
    interviewing: jobs.filter(j => j.application_status === 'interviewing').length,
    offered: jobs.filter(j => j.application_status === 'offered').length,
    rejected: jobs.filter(j => j.application_status === 'rejected').length
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      // Find the job and its application
      const job = jobs.find(j => j.id === jobId);
      if (!job) return;

      if (job.application_id) {
        // Update existing application
        await apiService.updateApplicationStatus(job.application_id, newStatus);
      } else {
        // Create new application
        await apiService.createApplication({
          job_id: jobId,
          status: newStatus
        });
      }

      // Refresh jobs to get updated data
      await fetchJobs();
    } catch (err) {
      console.error('Status update error:', err);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) {
      return;
    }

    try {
      await apiService.deleteJob(jobId);
      await fetchJobs(); // Refresh the list
    } catch (err) {
      console.error('Delete job error:', err);
      alert('Failed to delete job. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">My Jobs</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <LoadingSpinner message="Loading jobs..." />
        </main>
      </div>
    );
  }

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
          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="text-red-700">{error}</div>
              <button 
                onClick={fetchJobs}
                className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          )}

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
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
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
                <button 
                  onClick={() => setShowAddJobModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add New Job
                </button>
              </div>

              {/* Empty State */}
              {filteredJobs.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-gray-500 mb-4">
                    {jobs.length === 0 
                      ? "No jobs added yet. Start by adding your first job!"
                      : "No jobs match your current filters."
                    }
                  </div>
                  {jobs.length === 0 && (
                    <div className="space-y-2">
                      <button 
                        onClick={() => setShowAddJobModal(true)}
                        className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Add Your First Job
                      </button>
                      <div className="text-sm text-gray-400">
                        Chrome extension coming soon!
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Job Cards */}
              {filteredJobs.length > 0 && (
                <div className="space-y-4">
                  {filteredJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDeleteJob}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Add Job Modal */}
      {showAddJobModal && (
        <AddJobModal
          onClose={() => setShowAddJobModal(false)}
          onSave={() => {
            setShowAddJobModal(false);
            fetchJobs();
          }}
        />
      )}
    </div>
  );
};

// Job Card Component
const JobCard = ({ job, onStatusChange, onDelete }) => {
  const [showActions, setShowActions] = useState(false);

  const statusOptions = [
    { value: 'saved', label: 'Saved', color: 'bg-gray-100 text-gray-800' },
    { value: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-800' },
    { value: 'interviewing', label: 'Interviewing', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'offered', label: 'Offered', color: 'bg-green-100 text-green-800' },
    { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
    { value: 'withdrawn', label: 'Withdrawn', color: 'bg-gray-100 text-gray-800' }
  ];

  const currentStatus = job.application_status || 'saved';
  const currentStatusConfig = statusOptions.find(s => s.value === currentStatus);

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-lg font-medium text-gray-900">{job.title}</h4>
              <p className="text-gray-600">{job.company}</p>
            </div>
            {job.url && (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm ml-4"
              >
                View Job →
              </a>
            )}
          </div>
          
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span>{job.location || 'Location not specified'}</span>
            {job.salary_min && job.salary_max && (
              <span>${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}</span>
            )}
            <span>Added {new Date(job.created_at).toLocaleDateString()}</span>
            {job.source && job.source !== 'manual' && (
              <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                {job.source}
              </span>
            )}
          </div>

          {job.tags && job.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {job.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={currentStatus}
              onChange={(e) => onStatusChange(job.id, e.target.value)}
              className={`px-3 py-1 text-xs font-medium rounded-full border-0 cursor-pointer ${currentStatusConfig?.color || 'bg-gray-100 text-gray-800'}`}
            >
              {statusOptions.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              •••
            </button>
            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowActions(false);
                      // Add edit functionality later
                      alert('Edit functionality coming soon!');
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    Edit Job
                  </button>
                  <button
                    onClick={() => {
                      setShowActions(false);
                      onDelete(job.id);
                    }}
                    className="block px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                  >
                    Delete Job
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Add Job Modal Component
const AddJobModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    url: '',
    description: '',
    salary_min: '',
    salary_max: '',
    job_type: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const jobData = {
        ...formData,
        salary_min: formData.salary_min ? parseInt(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseInt(formData.salary_max) : null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        source: 'manual'
      };

      await apiService.createJob(jobData);
      onSave();
    } catch (err) {
      console.error('Create job error:', err);
      setError('Failed to create job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Job</h3>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
              <div className="text-red-700 text-sm">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Job Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Company *</label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Job URL</label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData({...formData, url: e.target.value})}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Min Salary</label>
                <input
                  type="number"
                  value={formData.salary_min}
                  onChange={(e) => setFormData({...formData, salary_min: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Salary</label>
                <input
                  type="number"
                  value={formData.salary_max}
                  onChange={(e) => setFormData({...formData, salary_max: e.target.value})}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                placeholder="javascript, react, remote"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobsPage;
