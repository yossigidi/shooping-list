import { useState } from 'react';

function SwipeableItem({ children, onSwipeRight, onSwipeLeft, className, purchased }) {
    const [touchStart, setTouchStart] = useState(null);
    const [touchDelta, setTouchDelta] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);
    const [completing, setCompleting] = useState(null); // 'right' or 'left'
    const THRESHOLD = 80;

    const handleTouchStart = (e) => {
        setTouchStart(e.touches[0].clientX);
        setIsSwiping(true);
    };

    const handleTouchMove = (e) => {
        if (touchStart === null) return;
        const delta = e.touches[0].clientX - touchStart;
        // RTL: negative delta = swiping right visually, positive = swiping left
        setTouchDelta(delta);
    };

    const handleTouchEnd = () => {
        if (Math.abs(touchDelta) > THRESHOLD) {
            // RTL adjustment: negative delta means swiping toward the left side of screen (which is "right" in RTL)
            if (touchDelta < -THRESHOLD) {
                // Swiped left on screen = "right" action in RTL = bought
                setCompleting('right');
                setTimeout(() => {
                    onSwipeRight?.();
                    setCompleting(null);
                    setTouchDelta(0);
                }, 300);
            } else if (touchDelta > THRESHOLD) {
                // Swiped right on screen = "left" action in RTL = postpone
                setCompleting('left');
                setTimeout(() => {
                    onSwipeLeft?.();
                    setCompleting(null);
                    setTouchDelta(0);
                }, 300);
            }
        } else {
            setTouchDelta(0);
        }
        setTouchStart(null);
        setIsSwiping(false);
    };

    const showRightIndicator = touchDelta < -30;
    const showLeftIndicator = touchDelta > 30;
    const rightProgress = Math.min(Math.abs(Math.min(touchDelta, 0)) / THRESHOLD, 1);
    const leftProgress = Math.min(Math.max(touchDelta, 0) / THRESHOLD, 1);

    return (
        <div className={`swipe-container ${className || ''}`}>
            {/* Right swipe background (bought - green) */}
            <div
                className="swipe-bg-right swipe-background"
                style={{ opacity: rightProgress }}
            >
                <div className="swipe-indicator">
                    <span className={`swipe-icon swipe-icon-emoji ${showRightIndicator ? 'visible' : ''}`} style={{ transform: `scale(${0.5 + rightProgress * 0.5})` }}>
                        ✓
                    </span>
                    <span className={`swipe-icon text-sm ${showRightIndicator ? 'visible' : ''}`}>
                        נקנה
                    </span>
                </div>
            </div>
            {/* Left swipe background (delete - red) */}
            <div
                className="swipe-bg-left swipe-background"
                style={{ opacity: leftProgress }}
            >
                <div className="swipe-indicator">
                    <span className={`swipe-icon swipe-icon-emoji ${showLeftIndicator ? 'visible' : ''}`} style={{ transform: `scale(${0.5 + leftProgress * 0.5})` }}>
                        🗑️
                    </span>
                    <span className={`swipe-icon text-sm ${showLeftIndicator ? 'visible' : ''}`}>
                        מחק
                    </span>
                </div>
            </div>
            {/* Content */}
            <div
                className={`swipe-content ${isSwiping ? 'swiping' : ''} ${completing === 'right' ? 'slide-out-right' : ''} ${completing === 'left' ? 'slide-out-left' : ''}`}
                style={{ transform: completing ? undefined : `translateX(${touchDelta}px)` }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {children}
            </div>
        </div>
    );
}

export default SwipeableItem;
