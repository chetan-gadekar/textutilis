import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    Chip,
    useTheme,
} from '@mui/material';
import {
    PlayArrowRounded,
    CheckCircleRounded,
    ArrowForwardRounded
} from '@mui/icons-material';

const CourseCard = ({ course, onStart, onContinue }) => {
    const theme = useTheme();
    const { title, description, enrollment } = course;
    const progress = enrollment?.progress || 0;
    const isStarted = progress > 0;

    // Generate a consistent gradient based on course title length or ID to vary visuals
    const gradients = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #2af598 0%, #009efd 100%)',
        'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
        'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
        'linear-gradient(120deg, #f6d365 0%, #fda085 100%)',
    ];

    // Pick a gradient deterministically
    const gradientIndex = (course._id?.charCodeAt(0) || 0) % gradients.length;
    const bgGradient = gradients[gradientIndex];

    return (
        <Card
            elevation={0}
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                borderRadius: '8px',
                border: '1px solid',
                borderColor: '#e0e0e0',
                bgcolor: '#ffffff',
                p: { xs: 2, md: 2 }, // Reduced internal padding
                gap: { xs: 2, md: 2.5 }, // Reduced gap
                alignItems: { xs: 'stretch', md: 'stretch' },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                    borderColor: 'primary.main',
                },
            }}
        >
            {/* Cover Area - Left Side */}
            <Box
                sx={{
                    width: { xs: '100%', md: 220 }, // Reduced width
                    minWidth: { xs: '100%', md: 220 },
                    height: { xs: 150, md: 125 }, // Reduced height
                    background: course.bannerImage ? `url(${course.bannerImage})` : bgGradient,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    borderRadius: '8px',
                    position: 'relative',
                    flexShrink: 0
                }}
            >
            </Box>

            {/* Content Area - Right Side */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: { md: 125 }, // Match image height constraint
                    py: 0,
                }}
            >
                {/* Header Row: Title and Progress Loop */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                    <Box sx={{ pr: 2, flex: 1 }}>
                        <Typography
                            variant="body2"
                            sx={{ color: '#7a7a7a', fontWeight: 400, fontSize: '0.8rem', mb: 0.5 }}
                        >
                            {/* In the mockup, the title seems to be the category, showing course title is appropriate */}
                            {title}
                        </Typography>
                        <Typography
                            variant="subtitle1"
                            component="h3"
                            sx={{
                                color: '#2C333D',
                                fontWeight: 600,
                                fontSize: '1rem', // slightly reduced size for compactness
                                WebkitLineClamp: 2,
                                display: '-webkit-box',
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                lineHeight: 1.3,
                            }}
                        >
                            {description && description.length > 5 ? description : `Lecture: Introduction to ${title}`}
                        </Typography>
                    </Box>

                    {/* Progress Loop - Top Right Corner */}
                    {isStarted ? (
                        <Box sx={{ flexShrink: 0, mt: -0.5, mr: -0.5 }}>
                            {progress === 100 ? (
                                <ThinCheckCircle color={theme.palette.primary.main} size={26} />
                            ) : (
                                <CircularProgressVariant value={progress} size={26} thickness={2.5} color={theme.palette.primary.main} />
                            )}
                        </Box>
                    ) : (
                        <Box sx={{ flexShrink: 0, mt: -0.5, mr: -0.5 }}>
                             <CircularProgressVariant value={0} size={26} thickness={2.5} color="#eaeaea" />
                        </Box>
                    )}
                </Box>

                {/* Footer Row: Progress Text and Action Button */}
                <Box sx={{ 
                    mt: 'auto', 
                    display: 'flex', 
                    flexDirection: { xs: 'column', sm: 'row' }, 
                    justifyContent: 'space-between', 
                    alignItems: { xs: 'stretch', sm: 'flex-end' }, 
                    gap: { xs: 1.5, sm: 0 },
                    pt: 1.5 
                }}>
                    <Typography variant="body2" sx={{ color: '#7a7a7a', fontWeight: 500, fontSize: '0.8rem', mb: { xs: 0, sm: 0.5 }, whiteSpace: 'nowrap' }}>
                        {progress > 0 ? `${progress}% Completed` : '0/17 Modules Completed'}
                    </Typography>

                    <Button
                        variant={!isStarted ? "outlined" : "contained"}
                        color="primary"
                        onClick={() => (isStarted ? onContinue(course._id) : onStart(course._id))}
                        endIcon={progress === 100 ? <ThinCheckCircle color="#ffffff" tickColor={theme.palette.primary.main} size={18} /> : (isStarted ? <ArrowForwardRounded sx={{ fontSize: '18px' }}/> : null)}
                        sx={{
                            borderRadius: '4px',
                            textTransform: 'none',
                            fontWeight: 600,
                            width: { xs: '100%', sm: 200 }, // Ensure it fits the longest button text smoothly
                            whiteSpace: 'nowrap',
                            py: 0.8,
                            fontSize: '0.85rem',
                            boxShadow: 'none',
                            '&:hover': {
                                boxShadow: 'none'
                            }
                        }}
                    >
                        {isStarted ? (progress === 100 ? 'Completed' : 'Continue Learning') : 'Start Learning'}
                    </Button>
                </Box>
            </Box>
        </Card>
    );
};

// Mini Circular Progress for the cover
const CircularProgressVariant = ({ value, size, thickness, color }) => {
    return (
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={(size - thickness) / 2}
                    fill="none"
                    stroke="#eaeaea"
                    strokeWidth={thickness}
                />
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={(size - thickness) / 2}
                    fill="none"
                    stroke={color}
                    strokeWidth={thickness}
                    strokeDasharray={`${2 * Math.PI * ((size - thickness) / 2)}`}
                    strokeDashoffset={`${2 * Math.PI * ((size - thickness) / 2) * (1 - value / 100)}`}
                    strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`}
                />
            </svg>
        </Box>
    )
}

const ThinCheckCircle = ({ color, size, tickColor = "#ffffff" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="12" fill={color} />
        <path d="M7.5 12L10.5 15L16.5 9" stroke={tickColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

export default CourseCard;
