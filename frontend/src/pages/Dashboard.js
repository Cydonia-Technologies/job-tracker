import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Zap, 
  TrendingUp, 
  Users, 
  Award, 
  Sparkles, 
  Brain, 
  ArrowRight,
  Briefcase,
  Target,
  CheckCircle,
  Lock,
  Star,
  MapPin,
  DollarSign,
  Clock,
  Eye,
  Upload,
  RefreshCw
} from 'lucide-react';

const EnhancedDashboard = () => {
  // Mock data for demonstration
  const user = { email: 'john.doe@example.com' };
  const navigate = (path) => console.log(`Navigate to: ${path}`);
  const signOut = () => console.log('Sign out');
  
  const [jobs, setJobs] = useState([
    {
      id: '1',
      title: 'Frontend Developer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      salary_min: 90000,
      salary_max: 130000,
      url: 'https://example.com/job1',
      created_at: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      title: 'Full Stack Engineer',
      company: 'StartupXYZ',
      location: 'New York, NY',
      salary_min: 100000,
      salary_max: 150000,
      url: 'https://example.com/job2',
      created_at: '2024-01-14T10:00:00Z'
    },
    {
      id: '3',
      title: 'React Developer',
      company: 'BigTech Inc',
      location: 'Seattle, WA',
      salary_min: 120000,
      salary_max: 180000,
      url: 'https://example.com/job3',
      created_at: '2024-01-13T10:00:00Z'
    },
    {
      id: '4',
      title: 'Software Engineer',
      company: 'InnovateLab',
      location: 'Austin, TX',
      salary_min: 85000,
      salary_max: 125000,
      url: 'https://example.com/job4',
      created_at: '2024-01-12T10:00:00Z'
    },
    {
      id: '5',
      title: 'Senior Developer',
      company: 'CloudFirst',
      location: 'Boston, MA',
      salary_min: 130000,
      salary_max: 170000,
      url: 'https://example.com/job5',
      created_at: '2024-01-11T10:00:00Z'
    },
    {
      id: '6',
      title: 'JavaScript Developer',
      company: 'WebSolutions',
      location: 'Remote',
      salary_min: 75000,
      salary_max: 110000,
      url: 'https://example.com/job6',
      created_at: '2024-01-10T10:00:00Z'
    }
  ]);
  
  const [jobMatches, setJobMatches] = useState({
    '1': { match_score: 92, suggestions: { overall_assessment: 'Excellent match! Your React skills align perfectly with their frontend focus.' }},
    '2': { match_score: 85, suggestions: { overall_assessment: 'Strong match with your full-stack experience, slight gap in backend technologies.' }},
    '3': { match_score: 88, suggestions: { overall_assessment: 'Great React experience match, consider highlighting component library experience.' }},
    '4': { match_score: 76, suggestions: { overall_assessment: 'Good foundational match, but could benefit from more algorithm practice.' }},
    '5': { match_score: 82, suggestions: { overall_assessment: 'Strong senior-level match, emphasize leadership experience in application.' }}
  });
  
  const [userProfile, setUserProfile] = useState({
    current_resume_url: 'https://example.com/resume.pdf',
    first_name: 'John',
    last_name: 'Doe'
  });
  
  const [stats, setStats] = useState({
    totalJobs: 6,
    appliedCount: 3,
    interviewingCount: 2,
    offeredCount: 1
  });
  
  const [loading, setLoading] = useState(false);
  const [analyzingJobs, setAnalyzingJobs] = useState(new Set());
  const [error, setError] = useState(null);

  // Freemium limits
  const FREE_JOB_LIMIT = 5;
  const isPremiumUser = false; // TODO: Check user subscription status

  useEffect(() => {
    // Mock data loading - no API calls needed for demo
    setLoading(false);
  }, []);

  const fetchDashboardData = async () => {
    // Mock refresh functionality
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      console.log('Dashboard data refreshed');
    }, 1000);
  };

  const analyzeJobMatches = async (jobsToAnalyze) => {
    for (const job of jobsToAnalyze) {
      if (jobMatches[job.id]) continue;

      setAnalyzingJobs(prev => new Set([...prev, job.id]));
      
      // Mock analysis delay
      setTimeout(() => {
        const mockScore = Math.floor(Math.random() * 40) + 60; // Random score 60-100
        setJobMatches(prev => ({
          ...prev,
          [job.id]: {
            match_score: mockScore,
            suggestions: { overall_assessment: 'AI analysis complete - this is a demo.' }
          }
        }));
        
        setAnalyzingJobs(prev => {
          const newSet = new Set(prev);
          newSet.delete(job.id);
          return newSet;
        });
      }, 2000);
    }
  };

  const getLetterGrade = (score) => {
    if (score >= 97) return 'A+';
    if (score >= 93) return 'A';
    if (score >= 90) return 'A-';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 80) return 'B-';
    if (score >= 77) return 'C+';
    if (score >= 73) return 'C';
    if (score >= 70) return 'C-';
    if (score >= 67) return 'D+';
    if (score >= 65) return 'D';
    return 'F';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const handleUpgradePrompt = () => {
    navigate('/register'); // TODO: Navigate to upgrade page
  };

  const handleUploadResume = () => {
    navigate('/profile'); // TODO: Create profile page or modal
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <DashboardHeader user={user} signOut={signOut} />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your job matches...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <DashboardHeader user={user} signOut={signOut} />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mx-4">
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

  // Sort jobs by match score (highest first), then by creation date
  const sortedJobs = [...jobs].sort((a, b) => {
    const aMatch = jobMatches[a.id]?.match_score || 0;
    const bMatch = jobMatches[b.id]?.match_score || 0;
    if (aMatch !== bMatch) return bMatch - aMatch;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const visibleJobs = isPremiumUser ? sortedJobs : sortedJobs.slice(0, FREE_JOB_LIMIT);
  const hiddenJobsCount = sortedJobs.length - FREE_JOB_LIMIT;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <DashboardHeader user={user} signOut={signOut} />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.email?.split('@')[0]}! 👋
            </h1>
            <p className="text-gray-600">
              Here are your best job matches based on your resume analysis.
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard 
                  title="Total Jobs"
                  value={stats?.totalJobs || 0}
                  icon={Briefcase}
                  color="blue"
                />
                <StatCard 
                  title="Applied"
                  value={stats?.appliedCount || 0}
                  icon={Target}
                  color="green"
                  subtitle="this month"
                />
                <StatCard 
                  title="Interviews"
                  value={stats?.interviewingCount || 0}
                  icon={Users}
                  color="yellow"
                  subtitle="scheduled"
                />
                <StatCard 
                  title="Offers"
                  value={stats?.offeredCount || 0}
                  icon={Award}
                  color="purple"
                  subtitle="received"
                />
              </div>

              {/* Job Matches Section */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                      <Target className="h-6 w-6 text-blue-600 mr-2" />
                      Your Best Job Matches
                    </h2>
                    <p className="text-gray-600 mt-1">
                      AI-powered compatibility scores based on your resume
                    </p>
                  </div>
                  <button
                    onClick={() => analyzeJobMatches(jobs.filter(job => !jobMatches[job.id]))}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    disabled={analyzingJobs.size > 0}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${analyzingJobs.size > 0 ? 'animate-spin' : ''}`} />
                    Analyze Jobs
                  </button>
                </div>

                {!userProfile ? (
                  // No Resume State
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Upload Your Resume to See Job Matches
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Get AI-powered compatibility scores for all your saved jobs
                    </p>
                    <button
                      onClick={handleUploadResume}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                    >
                      Upload Resume
                    </button>
                  </div>
                ) : jobs.length === 0 ? (
                  // No Jobs State
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Jobs Added Yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Start by adding jobs to see AI-powered match scores
                    </p>
                    <button
                      onClick={() => navigate('/jobs')}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-block"
                    >
                      Add Your First Job
                    </button>
                  </div>
                ) : (
                  // Job Cards
                  <div className="space-y-4">
                    {visibleJobs.map((job, index) => (
                      <JobMatchCard
                        key={job.id}
                        job={job}
                        matchData={jobMatches[job.id]}
                        isAnalyzing={analyzingJobs.has(job.id)}
                        rank={index + 1}
                      />
                    ))}

                    {/* Freemium Upgrade CTA */}
                    {!isPremiumUser && hiddenJobsCount > 0 && (
                      <div className="relative">
                        {/* Blurred job cards */}
                        <div className="space-y-4 filter blur-sm pointer-events-none">
                          {sortedJobs.slice(FREE_JOB_LIMIT, FREE_JOB_LIMIT + 2).map((job) => (
                            <JobMatchCard
                              key={`blurred-${job.id}`}
                              job={job}
                              matchData={{ match_score: 75 }} // Fake high score to entice
                              isAnalyzing={false}
                              rank={FREE_JOB_LIMIT + 1}
                            />
                          ))}
                        </div>
                        
                        {/* Upgrade overlay */}
                        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
                          <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
                            <Lock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                              Unlock {hiddenJobsCount} More Job Matches
                            </h3>
                            <p className="text-gray-600 mb-6">
                              See AI compatibility scores for all your jobs plus get personalized optimization tips.
                            </p>
                            <button
                              onClick={handleUpgradePrompt}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 font-medium"
                            >
                              Upgrade to Premium
                            </button>
                            <p className="text-xs text-gray-500 mt-2">Free account • No credit card</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="h-5 w-5 text-gray-600 mr-2" />
                  Today's Goals
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-900">Applications Today</span>
                      <span className="text-xl font-bold text-blue-600">0/3</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-900">Follow-ups Sent</span>
                      <span className="text-xl font-bold text-green-600">0/2</span>
                    </div>
                    <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-purple-900">New Jobs Added</span>
                      <span className="text-xl font-bold text-purple-600">0/5</span>
                    </div>
                    <div className="w-full bg-purple-200 rounded-full h-2 mt-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Resume Preview */}
              {userProfile ? (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 text-blue-600 mr-2" />
                    Your Resume
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <FileText className="h-8 w-8 text-blue-600 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">Current Resume</p>
                          <p className="text-sm text-gray-500">Last updated today</p>
                        </div>
                      </div>
                    </div>
                    {userProfile.current_resume_url && (
                      <a
                        href={userProfile.current_resume_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Resume
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center mb-4">
                    <Upload className="h-6 w-6 mr-2" />
                    <h3 className="text-lg font-bold">Upload Resume</h3>
                  </div>
                  <p className="text-blue-100 mb-4 text-sm">
                    Upload your resume to get AI-powered job match scores and optimization tips.
                  </p>
                  <button
                    onClick={handleUploadResume}
                    className="w-full bg-white text-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-gray-100"
                  >
                    Upload Now
                  </button>
                </div>
              )}

              {/* Premium Features CTA */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
                <div className="flex items-center mb-4">
                  <Brain className="h-6 w-6 mr-2" />
                  <div>
                    <h3 className="text-lg font-bold">Unlock AI Tools</h3>
                    <p className="text-purple-100 text-xs">Transform your job search</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="flex items-center">
                      <Sparkles className="h-3 w-3 mr-2" />
                      <span>Unlimited Job Matches</span>
                    </div>
                    <div className="flex items-center">
                      <Zap className="h-3 w-3 mr-2" />
                      <span>Resume Optimization</span>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="h-3 w-3 mr-2" />
                      <span>Company Research</span>
                    </div>
                    <div className="flex items-center">
                      <Award className="h-3 w-3 mr-2" />
                      <span>Application Tracking</span>
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleUpgradePrompt}
                  className="w-full bg-white text-purple-700 py-2 px-4 rounded-lg font-bold hover:bg-gray-100 flex items-center justify-center group transition-all duration-200 text-sm"
                >
                  <Sparkles className="h-4 w-4 mr-1 group-hover:rotate-12 transition-transform" />
                  Start Free Trial
                  <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <p className="text-center text-purple-200 text-xs mt-2">
                  14-day free trial • Cancel anytime
                </p>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/jobs')}
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
                  >
                    <Briefcase className="h-5 w-5 text-gray-600 mr-3" />
                    <span className="text-gray-900">View All Jobs</span>
                  </button>
                  <button
                    onClick={() => alert('Feature coming soon!')}
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
                  >
                    <Users className="h-5 w-5 text-gray-600 mr-3" />
                    <span className="text-gray-900">Network Contacts</span>
                  </button>
                  <button
                    onClick={() => alert('Feature coming soon!')}
                    className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors w-full text-left"
                  >
                    <TrendingUp className="h-5 w-5 text-gray-600 mr-3" />
                    <span className="text-gray-900">Interview Prep</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Header Component
const DashboardHeader = ({ user, signOut }) => (
  <header className="bg-white shadow-sm border-b">
    <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <FileText className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-xl font-bold text-gray-900">JobTracker</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => console.log('Navigate to /jobs')}
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            All Jobs
          </button>
          <span className="text-gray-400">|</span>
          <span className="text-gray-600 text-sm">{user?.email}</span>
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
);

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    purple: 'bg-purple-100 text-purple-600'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

// Job Match Card Component
const JobMatchCard = ({ job, matchData, isAnalyzing, rank }) => {
  const getLetterGrade = (score) => {
    if (score >= 97) return 'A+';
    if (score >= 93) return 'A';
    if (score >= 90) return 'A-';
    if (score >= 87) return 'B+';
    if (score >= 83) return 'B';
    if (score >= 80) return 'B-';
    if (score >= 77) return 'C+';
    if (score >= 73) return 'C';
    if (score >= 70) return 'C-';
    if (score >= 67) return 'D+';
    if (score >= 65) return 'D';
    return 'F';
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200 bg-white">
      <div className="flex items-start justify-between">
        {/* Left side - Job info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-start">
              <div className="text-lg font-semibold text-gray-500 mr-3 mt-1">
                {getRankIcon(rank)}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                <p className="text-gray-600 font-medium">{job.company}</p>
              </div>
            </div>
            {job.url && (
              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Job →
              </a>
            )}
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
            {job.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{job.location}</span>
              </div>
            )}
            {job.salary_min && job.salary_max && (
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                <span>${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{new Date(job.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Match analysis preview */}
          {matchData?.suggestions && (
            <div className="bg-gray-50 rounded-lg p-3 mt-3">
              <p className="text-sm text-gray-700 font-medium mb-2">Key Insights:</p>
              <div className="text-sm text-gray-600">
                {matchData.suggestions.overall_assessment || 'Analysis complete - view details for more insights.'}
              </div>
            </div>
          )}
        </div>

        {/* Right side - Match score */}
        <div className="ml-6 text-center">
          {isAnalyzing ? (
            <div className="w-20 h-20 rounded-full border-4 border-gray-200 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            </div>
          ) : matchData ? (
            <div className={`w-20 h-20 rounded-full flex flex-col items-center justify-center ${getScoreBg(matchData.match_score)}`}>
              <div className={`text-lg font-bold ${getScoreColor(matchData.match_score)}`}>
                {getLetterGrade(matchData.match_score)}
              </div>
              <div className={`text-xs font-medium ${getScoreColor(matchData.match_score)}`}>
                {matchData.match_score}%
              </div>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400">
              <Zap className="h-6 w-6" />
            </div>
          )}
          
          <div className="mt-2">
            <div className="text-xs text-gray-500">
              {isAnalyzing ? 'Analyzing...' : matchData ? 'Match Score' : 'Not analyzed'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
