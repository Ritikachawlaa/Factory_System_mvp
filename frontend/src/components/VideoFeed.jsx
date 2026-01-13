import API_BASE_URL from '../config';

const VideoFeed = ({ modules }) => {
    const [retryCount, setRetryCount] = React.useState(0);
    const [isError, setIsError] = React.useState(false);

    // Force refresh every time modules change or retry is triggered
    const videoSrc = `${API_BASE_URL}/video_feed?modules=${modules || ''}&t=${Date.now()}_${retryCount}`;

    const handleError = () => {
        setIsError(true);
        // Retry after 3 seconds
        setTimeout(() => {
            setIsError(false);
            setRetryCount(c => c + 1);
        }, 3000);
    };

    return (
        <div className="video-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
            {!isError ? (
                <img
                    src={videoSrc}
                    alt="Live Video Feed"
                    className="video-feed"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={handleError}
                />
            ) : (
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-secondary)', background: '#000'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <p>Stream Disconnected</p>
                        <p style={{ fontSize: '0.8em', opacity: 0.7 }}>Reconnecting...</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VideoFeed;
