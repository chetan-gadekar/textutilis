# Cloudflare Video Streaming Application

A simple React application for uploading videos to Cloudflare Stream and streaming them on the web.

## Features

- Upload videos to Cloudflare Stream
- View list of uploaded videos
- Stream videos with a built-in video player
- Real-time upload progress
- Video status tracking

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Cloudflare Credentials

Create a `.env` file in the root directory with your Cloudflare credentials:

```env
CLOUDFLARE_ACCOUNT_ID=your_account_id_here
CLOUDFLARE_API_TOKEN=your_api_token_here
PORT=5000
```

#### How to Get Cloudflare Credentials:

1. **Account ID**: 
   - Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Select your account
   - The Account ID is shown in the right sidebar

2. **API Token**:
   - Go to [API Tokens](https://dash.cloudflare.com/profile/api-tokens)
   - Click "Create Token"
   - Use "Edit Cloudflare Stream" template or create custom token with:
     - Permissions: `Stream:Edit`
     - Account Resources: Include your account
   - Copy the generated token

### 3. Run the Application

#### Development Mode (Frontend + Backend):

```bash
npm run dev
```

This will start:
- React frontend on `http://localhost:3000`
- Express backend on `http://localhost:5000`

#### Production Mode:

1. Build the React app:
```bash
npm run build
```

2. Start the server:
```bash
npm run server
```

The application will be available at `http://localhost:5000`

## Usage

1. **Upload Video**: 
   - Navigate to the Upload page
   - Select a video file (max 500MB)
   - Optionally enter a video name
   - Click "Upload Video"
   - Wait for processing (Cloudflare processes videos asynchronously)

2. **View Videos**:
   - Go to "My Videos" page
   - See all uploaded videos
   - Click "Watch Video" on ready videos

3. **Stream Video**:
   - Videos are automatically streamed using HLS
   - The player will show processing status until the video is ready

## API Endpoints

- `POST /api/upload` - Upload a video file
- `GET /api/video/:videoId` - Get video details
- `GET /api/videos` - List all videos

## Notes

- Videos are processed asynchronously by Cloudflare
- Processing time depends on video length and size
- Only videos with status "ready" can be streamed
- Maximum file size: 500MB (configurable in server.js)

## Troubleshooting

- **"Cloudflare credentials not configured"**: Make sure your `.env` file exists and contains valid credentials
- **Upload fails**: Check that your API token has Stream:Edit permissions
- **Video not playing**: Wait for processing to complete (status should be "ready")
- **CORS errors**: Make sure the backend server is running and accessible
