import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Play, CheckCircle2 } from 'lucide-react';
import notify from '../../utils/notify';
import courseService from '../../services/courseService';
import MainLayout from '../layout/MainLayout';

const StudentDashboard = () => {
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                        {filteredCourses.length === 0 ? (
                            <div className="bg-white p-16 text-center rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <BookOpen className="text-gray-300" size={32} />
                                </div>
                                <h3 className="text-lg font-medium text-gray-800 mb-2">No Courses Found</h3>
                                <p className="text-gray-500 text-sm">
                                    {filter === 'all' ? 'You are not enrolled in any courses yet.' : 'There are no courses currently in progress.'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                {filteredCourses.map((course) => {
                                    const progress = course.enrollment?.progress || 0;
                                    const isStarted = progress > 0;

                                    return (
                                        <div key={course._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden flex flex-col sm:flex-row h-auto sm:h-[180px]">
                                            {/* Card Media Section */}
                                            <div className="relative w-full sm:w-[220px] h-48 sm:h-full bg-gray-50 shrink-0">
                                                <div
                                                    className="w-full h-full flex items-center justify-center bg-gray-50 bg-cover bg-center relative"
                                                    style={{ backgroundImage: course.bannerImage ? `url(${course.bannerImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                                                >
                                                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md shadow-sm">
                                                        <span className="text-[10px] font-bold text-blue-600 tracking-wider">SKILLS</span>
                                                    </div>


                                                </div>
                                            </div>

                                            {/* Card Content Section */}
                                            <div className="flex-grow flex flex-col p-5">
                                                <div className="flex justify-between items-start mb-2 gap-4">
                                                    <h2 className="text-lg font-semibold text-gray-800 line-clamp-1">
                                                        {course.title}
                                                    </h2>

                                                    {/* Circular Progress SVG or CheckCircle */}
                                                    {progress === 100 ? (
                                                        <CheckCircle2 className="w-10 h-10 text-green-500 shrink-0" />
                                                    ) : (
                                                        <div className="relative w-10 h-10 shrink-0">
                                                            <svg className="w-10 h-10 transform -rotate-90">
                                                                <circle
                                                                    cx="20" cy="20" r="18"
                                                                    fill="none"
                                                                    className="stroke-gray-200"
                                                                    strokeWidth="3"
                                                                />
                                                                <circle
                                                                    cx="20" cy="20" r="18"
                                                                    fill="none"
                                                                    className={progress > 0 ? "stroke-green-500" : "stroke-gray-200"}
                                                                    strokeWidth="3"
                                                                    strokeDasharray={`${2 * Math.PI * 18}`}
                                                                    strokeDashoffset={`${2 * Math.PI * 18 * (1 - progress / 100)}`}
                                                                    strokeLinecap="round"
                                                                    style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                                                                />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>

                                                <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                                                    {course.description || 'No description available'}
                                                </p>

                                                {/* Linear Progress Bar */}
                                                {isStarted && (
                                                    <div className="mb-4 mt-auto">
                                                        <div className="flex justify-between items-center mb-1.5">
                                                            <span className="text-xs font-medium text-gray-500">Progress</span>
                                                            <span className="text-xs font-bold text-gray-700">{progress}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                            <div
                                                                className="bg-green-500 h-1.5 rounded-full transition-all duration-500 ease-out"
                                                                style={{ width: `${progress}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Action Area */}
                                                <div className={isStarted ? "" : "mt-auto"}>
                                                    <button
                                                        onClick={() => navigate(`/student/courses/${course._id}`)}
                                                        className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-200 ${isStarted
                                                            ? progress === 100
                                                                ? 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-100'
                                                                : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-100'
                                                            : 'bg-theme/10 text-theme hover:bg-theme hover:text-white border border-transparent'
                                                            }`}
                                                    >
                                                        {isStarted ? (
                                                            progress === 100 ? (
                                                                <>
                                                                    Completed
                                                                    <CheckCircle2 size={16} />
                                                                </>
                                                            ) : (
                                                                <>
                                                                    Continue Learning
                                                                    <Play size={16} className="fill-current" />
                                                                </>
                                                            )
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
                    <div className="lg:col-span-1">
                        <div className="sticky top-[84px] bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                            <h2 className="text-xl font-bold text-gray-800 mb-6">
                                Skills Report
                            </h2>

                            <div className="bg-gray-50 rounded-xl p-6 relative overflow-hidden group">
                                {/* Simulated content with blur */}
                                <div className="filter blur-[2px] transition-all duration-300 group-hover:blur-sm opacity-60">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="h-2 w-20 bg-gray-300 rounded"></div>
                                        <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="h-2 w-full bg-gray-300 rounded"></div>
                                        <div className="h-2 w-5/6 bg-gray-300 rounded"></div>
                                        <div className="h-2 w-4/6 bg-gray-300 rounded"></div>
                                    </div>
                                </div>

                                {/* Coming Soon Overlay */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-white/40 backdrop-blur-[1px]">
                                    <span className="text-4xl mb-3">🚀</span>
                                    <h3 className="text-lg font-bold text-gray-800 mb-1 tracking-wide">
                                        COMING SOON
                                    </h3>
                                    <p className="text-sm font-medium text-gray-600">
                                        Your skills portfolio is being prepared
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default StudentDashboard;
