import React, { useState, useEffect } from 'react';
import { User, BarChart2, Mail, Shield, Activity, GraduationCap } from 'lucide-react';
import studentService from '../../services/studentService';
import notify from '../../utils/notify';
import MainLayout from '../layout/MainLayout';

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await studentService.getProfile();
      setProfile(response.data);
      // Removed stationary error state
    } catch (err) {
      notify.error(err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme"></div>
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-6 font-poppins">
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-sm text-red-700">Failed to load profile data.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const { student, performance } = profile;
  const totalRating = performance?.totalRating || 0;
  const assignmentRating = performance?.assignmentRating || 0;
  const caseStudyRating = performance?.caseStudyRating || 0;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 font-poppins">
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-medium text-gray-800 flex items-center gap-3">
              <User className="text-theme" size={32} />
              My Profile
            </h1>
            <p className="text-gray-500 mt-1 font-light">Manage your personal information and view performance</p>
          </div>
        </div>

        {/* Legacy error alerts removed in favor of premium toasts */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <User className="text-theme" size={20} />
              Personal Information
            </h2>
            <hr className="mb-6 border-gray-100" />

            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-theme/10 rounded-lg text-theme shrink-0">
                  <User size={18} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Name</p>
                  <p className="text-sm font-semibold text-gray-900">{student?.name || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-theme/10 rounded-lg text-theme shrink-0">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Email</p>
                  <p className="text-sm font-semibold text-gray-900">{student?.email || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-theme/10 rounded-lg text-theme shrink-0">
                  <Shield size={18} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Role</p>
                  <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-md bg-purple-50 text-purple-700 border border-purple-100 uppercase tracking-wide">
                    {student?.role?.replace('_', ' ') || 'N/A'}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-theme/10 rounded-lg text-theme shrink-0">
                  <Activity size={18} />
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Account Status</p>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border ${student?.isActive
                    ? 'bg-green-50 text-green-700 border-green-100'
                    : 'bg-red-50 text-red-700 border-red-100'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${student?.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {student?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Report Card */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
            <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <BarChart2 className="text-theme" size={20} />
              Performance Report
            </h2>
            <p className="text-sm font-medium text-gray-500 mb-4">Based on assignments and case studies (out of 5)</p>
            <hr className="mb-6 border-gray-100" />

            <div className="flex flex-col gap-6">
              {/* Overall Rating */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                    <GraduationCap className="text-gray-400" size={16} />
                    Overall Rating
                  </p>
                  <p className="text-lg font-bold text-theme">{totalRating.toFixed(1)}<span className="text-sm font-medium text-gray-400">/5.0</span></p>
                </div>
                <div className="w-full bg-theme/10 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-theme h-2.5 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(totalRating / 5) * 100}% ` }}
                  ></div>
                </div>
              </div>

              {/* Assignment Rating */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-sm font-medium text-gray-700">Assignment Rating</p>
                  <p className="text-sm font-semibold text-gray-900">{assignmentRating.toFixed(1)}<span className="text-gray-400">/5.0</span></p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(assignmentRating / 5) * 100}% ` }}
                  ></div>
                </div>
                <p className="text-xs font-medium text-gray-500 text-right">
                  Assignments submitted: <span className="font-semibold text-gray-700">{performance?.assignmentCount || 0}</span>
                </p>
              </div>

              {/* Case Study Rating */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex justify-between items-end mb-2">
                  <p className="text-sm font-medium text-gray-700">Case Study Rating</p>
                  <p className="text-sm font-semibold text-gray-900">{caseStudyRating.toFixed(1)}<span className="text-gray-400">/5.0</span></p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${(caseStudyRating / 5) * 100}% ` }}
                  ></div>
                </div>
                <p className="text-xs font-medium text-gray-500 text-right">
                  Case studies completed: <span className="font-semibold text-gray-700">{performance?.caseStudyCount || 0}</span>
                </p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50/50 border border-blue-100 rounded-lg flex items-start gap-3">
              <div className="mt-0.5 text-blue-500 shrink-0">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
              </div>
              <p className="text-xs font-medium text-blue-800 leading-relaxed">
                Note: Performance ratings can only be modified by instructors. You have view-only access to this dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default StudentProfile;
