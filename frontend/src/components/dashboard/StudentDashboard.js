import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Play, CheckCircle2 } from 'lucide-react';
import notify from '../../utils/notify';
import courseService from '../../services/courseService';
import MainLayout from '../layout/MainLayout';
import { useAuth } from '../../hooks/useAuth';

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await courseService.getStudentCourses();
            const coursesData = response.data || [];
            const extractedCourses = coursesData.map((enrollment) => ({
                ...enrollment.courseId,
                enrollment: {
                    progress: enrollment.progress,
                    enrolledAt: enrollment.enrolledAt,
                },
            }));
            setCourses(extractedCourses);
            // Removed orphaned setError(null)
        } catch (err) {
            notify.error(err.message || 'Failed to fetch courses');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (event, newFilter) => {
        if (newFilter !== null) {
            setFilter(newFilter);
        }
    };

    const filteredCourses = filter === 'all'
        ? courses
        : courses.filter(course => course.enrollment?.progress > 0 && course.enrollment?.progress < 100);

    if (loading) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center min-h-[50vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme"></div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="container mx-auto px-4 py-6 font-poppins">
                {/* Student Profile Banner */}
                <div className="mb-8 p-6 bg-gradient-to-r from-theme/10 via-theme/5 to-white rounded-2xl border border-theme/10 flex items-center gap-5">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-theme/20 shadow-sm flex-shrink-0">
                        {user?.profilePhoto ? (
                            <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-theme/10 text-theme flex items-center justify-center text-2xl font-bold">
                                {user?.name?.charAt(0).toUpperCase() || 'S'}
                            </div>
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">
                            Welcome back, <span className="text-theme font-medium">{user?.name || 'Student'}</span>!
                        </h2>
                        <p className="text-xs text-gray-500 mt-1 font-light">
                            Ready to continue your learning journey? Explore your courses below.
                        </p>
                    </div>
                </div>

                {/* Header Section */}
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-medium text-gray-800 flex items-center gap-3">
                            <BookOpen className="text-theme" size={32} />
                            My Courses
                        </h1>
                        <p className="text-gray-500 mt-1 font-light">Resume learning and track your progress</p>
                    </div>

                    <div className="flex items-center gap-2 p-1 bg-gray-100/80 rounded-full border border-gray-200">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${filter === 'all'
                                ? 'bg-white text-gray-800 shadow-sm border border-gray-200/50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                                }`}
                        >
                            All Courses
                        </button>
                        <button
                            onClick={() => setFilter('in_progress')}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${filter === 'in_progress'
                                ? 'bg-white text-gray-800 shadow-sm border border-gray-200/50'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                                }`}
                        >
                            In Progress
                        </button>
                    </div>
                </div>

                {/* Legacy error alerts removed in favor of premium toasts */}

                {/* Courses Grid */}
                {filteredCourses.length === 0 ? (
                    <div className="bg-white p-16 text-center rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <BookOpen className="text-gray-300" size={36} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Courses Found</h3>
                        <p className="text-gray-400 text-sm">
                            {filter === 'all' ? 'You are not enrolled in any courses yet.' : 'There are no courses currently in progress.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map((course) => {
                            const progress = course.enrollment?.progress || 0;
                            const isStarted = progress > 0;
                            const isCompleted = progress === 100;

                            return (
                                <div
                                    key={course._id}
                                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col group cursor-pointer"
                                    onClick={() => navigate(`/student/courses/${course._id}`)}
                                >
                                    {/* Card Banner Image */}
                                    <div
                                        className="relative h-44 w-full bg-gray-100 overflow-hidden"
                                        style={{
                                            backgroundImage: course.bannerImage
                                                ? `url(${course.bannerImage})`
                                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                        }}
                                    >
                                        {/* SKILLS badge */}
                                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm">
                                            <span className="text-[10px] font-bold text-blue-600 tracking-wider">SKILLS</span>
                                        </div>

                                        {/* Progress/Completed badge */}
                                        {isCompleted ? (
                                            <div className="absolute top-3 right-3 bg-green-500 text-white px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                                                <CheckCircle2 size={12} />
                                                <span className="text-[10px] font-bold tracking-wide">DONE</span>
                                            </div>
                                        ) : isStarted ? (
                                            <div className="absolute top-3 right-3 bg-orange-500 text-white px-2.5 py-1 rounded-md shadow-sm">
                                                <span className="text-[10px] font-bold tracking-wide">{progress}%</span>
                                            </div>
                                        ) : null}

                                        {/* Hover overlay */}
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                            <div className="bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 text-white text-sm font-semibold">
                                                <Play size={14} className="fill-white" />
                                                {isCompleted ? 'Review' : isStarted ? 'Continue' : 'Start'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="flex flex-col flex-grow p-5">
                                        <h2 className="text-base font-semibold text-gray-800 line-clamp-2 mb-2 group-hover:text-theme transition-colors">
                                            {course.title}
                                        </h2>
                                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed mb-4">
                                            {course.description || 'No description available'}
                                        </p>

                                        {/* Progress Bar */}
                                        <div className="mt-auto">
                                            <div className="flex justify-between items-center mb-1.5">
                                                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Progress</span>
                                                <span className="text-[10px] font-bold text-gray-600">{progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-700 ease-out ${isCompleted ? 'bg-green-500' : 'bg-theme'}`}
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>

                                            {/* Action Button */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigate(`/student/courses/${course._id}`); }}
                                                className={`mt-4 w-full inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 ${
                                                    isCompleted
                                                        ? 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-100'
                                                        : isStarted
                                                        ? 'bg-theme/10 text-theme hover:bg-theme hover:text-white border border-transparent'
                                                        : 'bg-theme text-white hover:bg-theme-dark border border-transparent'
                                                }`}
                                            >
                                                {isCompleted ? (
                                                    <><CheckCircle2 size={15} /> Completed</>
                                                ) : isStarted ? (
                                                    <><Play size={15} className="fill-current" /> Continue Learning</>
                                                ) : (
                                                    'Start Learning'
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default StudentDashboard;
