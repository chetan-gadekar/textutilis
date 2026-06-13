import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Shield, Activity, GraduationCap, Camera, 
  Lock, CheckCircle, AlertCircle, BookOpen, UserCheck, 
  MessageSquare, ChevronDown, Check, Edit2, X, RefreshCw 
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { getMe } from '../../store/slices/authSlice';
import studentService from '../../services/studentService';
import uploadService from '../../services/uploadService';
import notify from '../../utils/notify';
import MainLayout from '../layout/MainLayout';

const criteriaList = [
  { key: 'problemIdentification', label: 'Problem Identification' },
  { key: 'potentialSolution', label: 'Potential Solution' },
  { key: 'detailing', label: 'Detailing of how to build solution' },
  { key: 'implementation', label: 'Implementation' },
  { key: 'problemSynthesizing', label: 'Problem Synthesizing' },
  { key: 'punctuality', label: 'Punctuality' },
];

const getCriteriaAverages = (evalData) => {
  if (!evalData) return criteriaList.map(c => ({ ...c, avg: 0 }));
  return criteriaList.map(c => {
    const values = evalData[c.key] || [];
    const sum = values.reduce((a, b) => a + (b || 0), 0);
    const avg = values.length > 0 ? sum / values.length : 0;
    return {
      ...c,
      avg: parseFloat(avg.toFixed(2))
    };
  });
};

const getOverallAverage = (averages) => {
  const sum = averages.reduce((acc, curr) => acc + curr.avg, 0);
  return averages.length > 0 ? (sum / averages.length).toFixed(2) : '0.00';
};

const getNumRows = (evalData) => {
  if (!evalData) return 0;
  return Math.max(
    ...criteriaList.map(c => (evalData[c.key] && evalData[c.key].length) || 0),
    (evalData.topics && evalData.topics.length) || 0,
    0
  );
};

const StudentProfile = () => {
  const dispatch = useDispatch();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');

  // Editable Name State
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [updatingName, setUpdatingName] = useState(false);

  // Change Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await studentService.getProfile();
      setProfile(response.data);
      setNameInput(response.data?.student?.name || '');

      // Set default selected course
      const courses = response.data?.student?.courses || [];
      if (courses.length > 0) {
        setSelectedCourseId(courses[0].id);
      }
    } catch (err) {
      notify.error(err.message || 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      notify.error('Please select an image file');
      return;
    }

    try {
      setUploadingPhoto(true);
      const res = await uploadService.uploadFile(file);
      if (res.success && res.data?.url) {
        const updateRes = await studentService.updateProfile({ profilePhoto: res.data.url });
        if (updateRes.success) {
          notify.success('Profile photo updated successfully!');
          dispatch(getMe());
          setProfile(prev => ({
            ...prev,
            student: {
              ...prev.student,
              profilePhoto: res.data.url
            }
          }));
        }
      } else {
        notify.error('Photo upload failed');
      }
    } catch (err) {
      notify.error(err.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUpdateName = async () => {
    if (!nameInput.trim()) {
      notify.error('Name cannot be empty');
      return;
    }
    try {
      setUpdatingName(true);
      const res = await studentService.updateProfile({ name: nameInput });
      if (res.success) {
        notify.success('Name updated successfully!');
        dispatch(getMe());
        setProfile(prev => ({
          ...prev,
          student: {
            ...prev.student,
            name: nameInput
          }
        }));
        setIsEditingName(false);
      }
    } catch (err) {
      notify.error(err.message || 'Failed to update name');
    } finally {
      setUpdatingName(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword) {
      notify.error('Current password is required');
      return;
    }
    if (newPassword !== confirmPassword) {
      notify.error('New passwords do not match');
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      notify.error('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      return;
    }

    try {
      setUpdatingPassword(true);
      const res = await studentService.updateProfile({
        oldPassword,
        newPassword
      });
      if (res.success) {
        notify.success('Password updated successfully!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordForm(false);
      }
    } catch (err) {
      notify.error(err.message || 'Failed to update password');
    } finally {
      setUpdatingPassword(false);
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
  const enrollments = student?.courses || [];

  // Find performance record for the selected course
  const selectedPerf = performance?.find(p => {
    const cid = p.courseId?._id || p.courseId;
    return cid === selectedCourseId;
  });

  const selfEvalAverages = selectedPerf ? getCriteriaAverages(selectedPerf.selfEvaluation) : [];
  const selfOverall = getOverallAverage(selfEvalAverages);

  const instructorEvalAverages = selectedPerf ? getCriteriaAverages(selectedPerf.instructorAssessment) : [];
  const instructorOverall = getOverallAverage(instructorEvalAverages);

  const hasSelfEvalData = selectedPerf && getNumRows(selectedPerf.selfEvaluation) > 0;
  const hasInstructorEvalData = selectedPerf && getNumRows(selectedPerf.instructorAssessment) > 0;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-6 font-poppins max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-gray-800 flex items-center gap-3">
            <User className="text-theme" size={32} />
            My Profile
          </h1>
          <p className="text-gray-500 mt-1 font-light">Manage your personal information, profile security, and track evaluations</p>
        </div>

        {/* Profile Details & Password Forms Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Personal Information & Avatar Card */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <User className="text-theme" size={20} />
                  Personal Information
                </h2>
                {!isEditingName ? (
                  <button 
                    onClick={() => setIsEditingName(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-theme bg-theme/10 hover:bg-theme/20 rounded-lg font-medium transition-all"
                  >
                    <Edit2 size={13} /> Edit Name
                  </button>
                ) : (
                  <div className="flex gap-1">
                    <button 
                      onClick={handleUpdateName}
                      disabled={updatingName}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-white bg-theme hover:bg-theme-dark rounded-lg font-medium transition-all disabled:opacity-50"
                    >
                      {updatingName ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />} Save
                    </button>
                    <button 
                      onClick={() => {
                        setIsEditingName(false);
                        setNameInput(student?.name || '');
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-all"
                    >
                      <X size={13} /> Cancel
                    </button>
                  </div>
                )}
              </div>
              <hr className="mb-6 border-gray-100" />

              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                {/* Avatar upload on left */}
                <div className="flex flex-col items-center">
                  <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-theme/20 shadow-inner flex-shrink-0">
                    {uploadingPhoto ? (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <RefreshCw size={24} className="text-white animate-spin" />
                      </div>
                    ) : null}
                    {student?.profilePhoto ? (
                      <img src={student.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-theme/10 text-theme flex items-center justify-center text-4xl font-bold">
                        {student?.name?.charAt(0).toUpperCase() || 'S'}
                      </div>
                    )}
                    <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer text-white">
                      <Camera size={20} />
                      <span className="text-[10px] mt-1 font-medium">Upload Photo</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-400 mt-2 font-light">Hover image to upload</p>
                </div>

                {/* Details on right */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 flex-grow w-full">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <User size={13} className="text-gray-400" /> Name
                    </p>
                    {isEditingName ? (
                      <input 
                        type="text" 
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="w-full text-sm font-semibold text-gray-900 border border-gray-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-theme/20 focus:border-theme transition-all"
                      />
                    ) : (
                      <p className="text-sm font-semibold text-gray-900 bg-gray-50/50 px-2.5 py-1.5 rounded-lg border border-transparent">{student?.name || 'N/A'}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Mail size={13} className="text-gray-400" /> Email
                    </p>
                    <p className="text-sm font-semibold text-gray-900 bg-gray-50/50 px-2.5 py-1.5 rounded-lg border border-transparent">{student?.email || 'N/A'}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Shield size={13} className="text-gray-400" /> Role
                    </p>
                    <span className="inline-flex px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 border border-purple-100 uppercase tracking-wide">
                      {student?.role?.replace('_', ' ') || 'N/A'}
                    </span>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Activity size={13} className="text-gray-400" /> Account Status
                    </p>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg border ${student?.isActive
                      ? 'bg-green-50 text-green-700 border-green-100'
                      : 'bg-red-50 text-red-700 border-red-100'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${student?.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {student?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                      <BookOpen size={13} className="text-gray-400" /> Course Name
                    </p>
                    {enrollments.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {enrollments.map(c => (
                          <span key={c.id} className="inline-flex items-center px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 text-xs font-medium">
                            <GraduationCap size={14} className="mr-1 text-blue-500" />
                            {c.title}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm font-semibold text-gray-500 italic px-2.5 py-1.5">Not enrolled in any courses</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Lock className="text-theme" size={20} />
              Security Settings
            </h2>
            <hr className="mb-6 border-gray-100" />

            {!showPasswordForm ? (
              <div className="flex-grow flex flex-col justify-center items-center text-center p-4">
                <div className="p-4 bg-theme/5 rounded-full text-theme mb-4">
                  <Lock size={32} />
                </div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1">Update Password</h3>
                <p className="text-xs text-gray-400 max-w-[200px] mb-4">Keep your account secure by setting a strong password regularly.</p>
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="w-full py-2.5 px-4 bg-theme text-white text-xs font-semibold rounded-xl hover:bg-theme-dark transition-all shadow-md shadow-theme/10"
                >
                  Change Password
                </button>
              </div>
            ) : (
              <form onSubmit={handleUpdatePassword} className="flex flex-col h-full justify-between">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Current Password</label>
                    <input 
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme/20 focus:border-theme transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">New Password</label>
                    <input 
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme/20 focus:border-theme transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Confirm New Password</label>
                    <input 
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-theme/20 focus:border-theme transition-all"
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  <button
                    type="submit"
                    disabled={updatingPassword}
                    className="flex-grow py-2.5 px-4 bg-theme text-white text-xs font-semibold rounded-xl hover:bg-theme-dark transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {updatingPassword && <RefreshCw size={13} className="animate-spin" />}
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setOldPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="py-2.5 px-4 bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Performance & Evaluation Comparison Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-gray-100 pb-5">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <GraduationCap className="text-theme" size={22} />
                Performance Evaluations
              </h2>
              <p className="text-xs text-gray-400 mt-1 font-light">Select a course to compare self evaluation and instructor grades</p>
            </div>

            {enrollments.length > 0 && (
              <div className="relative min-w-[280px] w-full sm:w-auto">
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full pl-3 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-theme/20 focus:border-theme transition-all shadow-sm text-xs font-semibold text-gray-700 cursor-pointer"
                >
                  {enrollments.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                  <ChevronDown size={16} />
                </div>
              </div>
            )}
          </div>

          {enrollments.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="p-4 bg-gray-50 rounded-full text-gray-300 mb-4">
                <GraduationCap size={40} />
              </div>
              <h3 className="text-base font-semibold text-gray-800">No course data found</h3>
              <p className="text-xs text-gray-400 mt-1">Enroll in a course to view evaluation details here.</p>
            </div>
          ) : (
            <div>
              {/* Overall Score Comparison Banner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-blue-50/50 border border-blue-100/60 rounded-xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/10 text-blue-600 rounded-lg">
                      <UserCheck size={24} />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Self Overall Rating</h4>
                      <p className="text-[10px] text-blue-500 font-medium">Average of submitted criteria</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-blue-600">
                      {hasSelfEvalData ? selfOverall : '—'}
                      <span className="text-xs font-semibold text-blue-400">/5.0</span>
                    </p>
                    <span className="inline-flex text-[9px] font-bold text-blue-500 uppercase mt-1">
                      {hasSelfEvalData ? 'Submitted' : 'Not Filled'}
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-xl p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-lg">
                      <MessageSquare size={24} />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Instructor Overall Rating</h4>
                      <p className="text-[10px] text-emerald-500 font-medium">Graded by Course Instructors</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-emerald-600">
                      {hasInstructorEvalData ? instructorOverall : '—'}
                      <span className="text-xs font-semibold text-emerald-400">/5.0</span>
                    </p>
                    <span className="inline-flex text-[9px] font-bold text-emerald-500 uppercase mt-1">
                      {hasInstructorEvalData ? 'Graded' : 'Pending Evaluation'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Criteria Detailed Progress bars comparison */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wider">Evaluation Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {criteriaList.map((criterion, index) => {
                    const selfScore = selfEvalAverages[index]?.avg || 0;
                    const instScore = instructorEvalAverages[index]?.avg || 0;
                    return (
                      <div 
                        key={criterion.key} 
                        className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 hover:bg-white transition-all hover:shadow-sm"
                      >
                        <span className="font-semibold text-gray-700 text-xs block mb-3 leading-snug">{criterion.label}</span>
                        <div className="space-y-3">
                          {/* Self Score */}
                          <div>
                            <div className="flex justify-between items-center text-[10px] mb-1">
                              <span className="text-gray-400 font-medium uppercase tracking-wide">Self Score</span>
                              <span className="font-bold text-blue-600">{hasSelfEvalData ? `${selfScore.toFixed(2)}/5.0` : 'Not submitted'}</span>
                            </div>
                            <div className="w-full bg-blue-100/30 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-blue-500 h-full rounded-full transition-all duration-1000 ease-out" 
                                style={{ width: `${hasSelfEvalData ? (selfScore / 5) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                          {/* Instructor Score */}
                          <div>
                            <div className="flex justify-between items-center text-[10px] mb-1">
                              <span className="text-gray-400 font-medium uppercase tracking-wide">Instructor Score</span>
                              <span className="font-bold text-emerald-600">{hasInstructorEvalData ? `${instScore.toFixed(2)}/5.0` : 'Not graded'}</span>
                            </div>
                            <div className="w-full bg-emerald-100/30 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className="bg-emerald-500 h-full rounded-full transition-all duration-1000 ease-out" 
                                style={{ width: `${hasInstructorEvalData ? (instScore / 5) * 100 : 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* CTAs redirecting to detail evaluation views */}
              <div className="flex flex-col sm:flex-row gap-3 justify-end border-t border-gray-100 pt-5">
                <a
                  href={`/student/performance/self-eval/${selectedCourseId}`}
                  className="px-5 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100/70 border border-blue-200/50 text-xs font-semibold rounded-xl text-center transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <UserCheck size={14} />
                  {hasSelfEvalData ? 'Edit Self Evaluation' : 'Fill Self Evaluation'}
                </a>
                <a
                  href={`/student/performance/instructor-eval/${selectedCourseId}`}
                  className="px-5 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/70 border border-emerald-200/50 text-xs font-semibold rounded-xl text-center transition-all shadow-sm flex items-center justify-center gap-1.5"
                >
                  <MessageSquare size={14} />
                  View Detailed Instructor Feedback
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default StudentProfile;
