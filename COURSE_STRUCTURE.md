# Course Structure Flow

## Hierarchy
```
Course
  └── Module (e.g., "Module 1: Introduction")
      └── Topic (e.g., "Topic 1: Overview")
          └── Content (video, PPT, or text)
```

## Detailed Explanation

### 1. Course Level
- **Created by**: Super Instructor
- **Fields**: Title, Description, Instructor, Visibility
- **Purpose**: Top-level container for all course materials

### 2. Module Level
- **Created by**: Super Instructor (within a Course)
- **Fields**: Title, Description, Order
- **Purpose**: Organizes topics into logical sections
- **Example**: "Module 1: Fundamentals", "Module 2: Advanced Concepts"

### 3. Topic Level
- **Created by**: Super Instructor (within a Module)
- **Fields**: Title, Description, Order
- **Purpose**: Groups related content items together
- **Example**: "Topic 1: Introduction to React", "Topic 2: Components"

### 4. Content Level
- **Created by**: Super Instructor (within a Topic)
- **Types**: Video, PPT, or Text
- **Fields**: Title, Description, Content Data, Duration
- **Purpose**: Actual learning materials (videos, presentations, text)

## Example Structure

```
Course: "React.js Complete Guide"
├── Module 1: Getting Started (order: 1)
│   ├── Topic 1: Introduction (order: 1)
│   │   ├── Content: "Welcome Video" (video, order: 1)
│   │   └── Content: "Course Overview" (text, order: 2)
│   └── Topic 2: Setup (order: 2)
│       ├── Content: "Installation Guide" (text, order: 1)
│       └── Content: "Development Environment" (ppt, order: 2)
│
└── Module 2: Core Concepts (order: 2)
    ├── Topic 1: Components (order: 1)
    │   ├── Content: "Component Basics" (video, order: 1)
    │   └── Content: "Component Props" (video, order: 2)
    └── Topic 2: State Management (order: 2)
        └── Content: "State & Props" (video, order: 1)
```

## API Endpoints Flow

### Creating a Course Structure:

1. **Create Course**
   ```
   POST /api/super-instructor/courses
   Body: { title, description }
   ```

2. **Create Module** (within Course)
   ```
   POST /api/super-instructor/courses/:courseId/modules
   Body: { title, description, order }
   ```

3. **Create Topic** (within Module)
   ```
   POST /api/super-instructor/modules/:moduleId/topics
   Body: { title, description, order }
   ```

4. **Create Content** (within Topic)
   ```
   POST /api/super-instructor/topics/:topicId/content
   Body: { contentType: 'video'|'ppt'|'text', contentData, title, description }
   ```

## Student View

Students see the structure as:
```
My Courses
  └── Course Name
      └── Module 1: Title
          └── Topic 1: Title
              └── Content 1 (Video/PPT/Text)
              └── Content 2 (Video/PPT/Text)
          └── Topic 2: Title
              └── Content...
      └── Module 2: Title
          └── ...
```

Progress is tracked at:
- **Content level**: Individual video/PPT/text completion
- **Topic level**: Aggregate of all content in topic
- **Module level**: Aggregate of all topics in module
- **Course level**: Aggregate of all modules in course
