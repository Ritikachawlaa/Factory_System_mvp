import React from 'react';

const VideoFeed = () => {
    return (
        <div className="video-container">
            <img
                src="http://localhost:8000/video_feed"
                alt="Live Video Feed"
                className="video-feed"
                onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-secondary)">Video stream offline. Ensure backend is running.</div>';
                }}
            />
        </div>
    );
};

export default VideoFeed;
