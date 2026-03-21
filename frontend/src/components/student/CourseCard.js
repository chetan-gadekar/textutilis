import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    LinearProgress,
    Chip,
    alpha,
    useTheme,
} from '@mui/material';
import {
    PlayArrowRounded,
    AccessTimeRounded,
    TrendingUpRounded,
    CheckCircleRounded
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
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '16px',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px -10px rgba(0, 0, 0, 0.15)',
                    borderColor: 'primary.main',
                },
            }}
        >
            {/* Cover Area */}
            <Box
                sx={{
                    height: 140,
                    background: course.bannerImage ? `url(${course.bannerImage})` : bgGradient,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Chip
                        label="Course"
                        size="small"
                        sx={{
                            bgcolor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            backdropFilter: 'blur(4px)',
                            fontWeight: 600,
                            border: '1px solid rgba(255,255,255,0.3)'
                        }}
                    />
                    {isStarted && (
                        <Box
                            sx={{
                                width: 32,
                                height: 32,
                                borderRadius: '50%',
                                bgcolor: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {progress === 100 ? (
                                    <CheckCircleRounded sx={{ color: theme.palette.success.main, fontSize: 32 }} />
                                ) : (
                                    <CircularProgressVariant value={progress} size={24} thickness={5} color={theme.palette.primary.main} />
                                )}
                            </Box>
                        </Box>
                    )}
                </Box>


            </Box>

            <CardContent sx={{ flexGrow: 1, pt: 2, pb: 1, px: 3 }}>
                <Typography
                    variant="h6"
                    component="h3"
                    sx={{
                        color: 'text.secondary',
                        fontWeight: 600,
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 2,
                        minHeight: '3em',
                    }}
                >
                    {title}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mb: 2,
                        display: '-webkit-box',
                        overflow: 'hidden',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 3,
                        minHeight: '0em', // reduced from 4.5em
                        lineHeight: 2.0
                    }}
                >
                    {description || 'No description available for this course.'}
                </Typography>

                {/* Stats Row */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                        <AccessTimeRounded sx={{ fontSize: 16 }} />
                        <Typography variant="caption" fontWeight={500}>12h 30m</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                        <TrendingUpRounded sx={{ fontSize: 16 }} />
                        <Typography variant="caption" fontWeight={500}>Beginner</Typography>
                    </Box>
                </Box>

                {isStarted ? (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                Progress
                            </Typography>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                                {progress}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={progress}
                            sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 3,
                                },
                            }}
                        />
                    </Box>
                ) : (
                    <Box sx={{ height: 21 }} /> // Spacer to match progress height
                )}
            </CardContent>

            <Box sx={{ p: 2, pt: 0 }}>
                <Button
                    fullWidth
                    variant={isStarted ? "outlined" : "contained"}
                    color={progress === 100 ? "success" : "primary"}
                    onClick={() => (isStarted ? onContinue(course._id) : onStart(course._id))}
                    endIcon={progress === 100 ? <CheckCircleRounded /> : <PlayArrowRounded />}
                    sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 600,
                        py: 1,
                        boxShadow: isStarted ? 'none' : '0 4px 12px rgba(33, 150, 243, 0.3)',
                        borderWidth: isStarted ? 2 : 0,
                        '&:hover': {
                            borderWidth: isStarted ? 2 : 0,
                            boxShadow: isStarted ? 'none' : '0 6px 16px rgba(33, 150, 243, 0.4)',
                            transform: 'translateY(-1px)'
                        }
                    }}
                >
                    {isStarted ? (progress === 100 ? 'Completed' : 'Continue Learning') : 'Start Learning'}
                </Button>
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

export default CourseCard;
