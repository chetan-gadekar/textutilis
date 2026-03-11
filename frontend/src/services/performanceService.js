import api from './api';

const performanceService = {
    // Instructor
    getInstructorPerformance: async (params = {}) => {
        const response = await api.get('/instructor/performance', { params });
        return response.data;
    },
    saveInstructorAssessment: async (studentId, courseId, updateData) => {
        const response = await api.put(`/instructor/performance/${studentId}/${courseId}`, { updateData });
        return response.data;
    },

    // Student
    getMyPerformance: async () => {
        const response = await api.get('/student/performance');
        return response.data;
    },
    saveSelfEvaluation: async (courseId, updateData) => {
        const response = await api.put('/student/performance/self-evaluation', { courseId, updateData });
        return response.data;
    },

    // Super Instructor / Admin
    getAllPerformance: async (params = {}) => {
        const response = await api.get('/super-instructor/performance', { params });
        return response.data;
    },
    superSaveInstructorAssessment: async (studentId, courseId, updateData) => {
        const response = await api.put(`/super-instructor/performance/${studentId}/${courseId}`, { updateData });
        return response.data;
    },
};

export default performanceService;
