import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    CircularProgress
} from '@mui/material';
import notify from '../../../utils/notify';
import { UserCheck, MessageSquare, BookOpen, ChevronDown } from 'lucide-react';
import performanceService from '../../../services/performanceService';
import MainLayout from '../../layout/MainLayout';

const StudentPerformance = () => {
    const navigate = useNavigate();
    const [performances, setPerformances] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPerformances();
    }, []);

    const fetchPerformances = async () => {
        try {
            setLoading(true);
            const response = await performanceService.getMyPerformance();
            setPerformances(response.data || []);
            if (response.data && response.data.length > 0) {
                setSelectedCourseId(response.data[0].courseId._id);
            }
            // Error handling unified via notify
        } catch (err) {
            notify.error(err.message || 'Failed to fetch performance data');
        } finally {
            setLoading(false);
        }
    };

    const selectedPerformance = performances.find(p => p.courseId._id === selectedCourseId);

    if (loading && performances.length === 0) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center min-h-[50vh]">
                    <CircularProgress />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="font-poppins h-full max-w-7xl mx-auto px-4">
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-medium text-gray-800">My Performance</h1>
                        <p className="text-gray-500 mt-1 font-light">Select a course to view or fill your evaluations</p>
                    </div>

                    {performances.length > 0 && (
                        <div className="relative min-w-[300px]">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                                <BookOpen size={18} />
                            </div>
                            <select
                                value={selectedCourseId}
                                onChange={(e) => setSelectedCourseId(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-theme/20 focus:border-theme transition-all shadow-sm text-sm font-medium text-gray-700 cursor-pointer"
                            >
                                {performances.map(p => (
                                    <option key={p.courseId._id} value={p.courseId._id}>
                                        {p.courseId.title}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                <ChevronDown size={18} className="text-gray-400" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Legacy alerts removed in favor of premium toasts */}

                {performances.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl border border-gray-100 shadow-sm text-center">
                        <h3 className="text-lg font-medium text-gray-800 mb-1">No Performance Data</h3>
                        <p className="text-gray-500">You are not enrolled in any courses yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                        {/* Self Evaluation Card */}
                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl hover:shadow-2xl transition-all group flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <UserCheck size={32} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-3">Self Evaluation</h2>
                            <p className="text-gray-500 mb-8 leading-relaxed">
                                Evaluate your own performance across different criteria for this course. Be honest with your self-assessment.
                            </p>
                            <button
                                onClick={() => navigate(`/student/performance/self-eval/${selectedCourseId}`)}
                                className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                            >
                                Fill Self Evaluation
                            </button>
                        </div>

                        {/* Instructor Assessment Card */}
                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-xl hover:shadow-2xl transition-all group flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <MessageSquare size={32} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800 mb-3">Instructor Assessment</h2>
                            <p className="text-gray-500 mb-8 leading-relaxed">
                                View the detailed breakdown of your performance as evaluated by your instructors.
                            </p>
                            <button
                                onClick={() => navigate(`/student/performance/instructor-eval/${selectedCourseId}`)}
                                className="w-full py-3.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
                            >
                                View Instructor Feedback
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
};

export default StudentPerformance;
