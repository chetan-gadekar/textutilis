import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Chip,
} from '@mui/material';
import notify from '../../utils/notify';
import { Eye } from 'lucide-react';
import courseService from '../../services/courseService';
import MainLayout from '../layout/MainLayout';

const InstructorCourses = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            // Calls the /super-instructor/courses endpoint which returns Owned + Assigned courses
            const response = await courseService.getCourses();
            setCourses(response.data || []);
        } catch (err) {
            notify.error(err.message || 'Failed to fetch courses');
        } finally {
            setLoading(false);
        }
    };

    const handleViewAssignments = (courseId) => {
        navigate('/instructor/assignments');
        // Note: ideally we might want to pre-select this course in the review page, 
        // but the Review page logic relies on its own dropdown state.
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

    return (
        <MainLayout>
            <div className="font-poppins h-full">
                <div className="mb-6">
                    <h1 className="text-3xl font-medium text-gray-800">My Courses</h1>
                    <p className="text-gray-500 mt-1 font-light">View and review assignments for your courses</p>
                </div>

                {/* Legacy error alerts removed in favor of premium toasts */}

                {courses.length === 0 ? (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md shadow-sm">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-blue-700">
                                    You have not been assigned any courses yet.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course) => (
                            <div key={course._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col h-full">
                                <div className="p-6 flex-grow flex flex-col">
                                    <div className="flex justify-between items-start mb-3">
                                        <h2 className="text-xl font-semibold text-gray-800 line-clamp-2">
                                            {course.title}
                                        </h2>
                                        {course.isVisible && (
                                            <span className="ml-2 flex-shrink-0 px-2.5 py-1 inline-flex text-xs font-medium rounded-full bg-green-100 text-green-800 border border-green-200">
                                                Active
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4 flex-grow line-clamp-3">
                                        {course.description || 'No description available'}
                                    </p>
                                </div>
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 mt-auto">
                                    <button
                                        onClick={() => handleViewAssignments(course._id)}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-theme hover:bg-theme-dark rounded-lg transition-colors shadow-sm"
                                    >
                                        <Eye size={18} strokeWidth={2} />
                                        Review Assignments
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default InstructorCourses;
