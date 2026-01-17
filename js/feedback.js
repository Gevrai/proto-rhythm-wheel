/**
 * Feedback module - Visual feedback for hits and misses
 * Shows floating text and visual indicators for player performance
 */

const Feedback = (function() {
    let container = null;
    let feedbackId = 0;

    function init() {
        container = document.getElementById('feedback-container');
    }

    function showText(text, type = 'perfect') {
        if (!container) return;

        const element = document.createElement('div');
        element.className = `feedback-text ${type}`;
        element.textContent = text;
        element.id = `feedback-${feedbackId++}`;

        // Random horizontal offset for variety
        const offset = (Math.random() - 0.5) * 60;
        element.style.left = `calc(50% + ${offset}px)`;

        container.appendChild(element);

        // Remove after animation completes
        setTimeout(() => {
            element.remove();
        }, 500);
    }

    function showPerfect() {
        showText('Perfect!', 'perfect');
    }

    function showGood() {
        showText('Good', 'good');
    }

    function showMiss() {
        showText('Miss', 'miss');
    }

    function showWrongKey() {
        showText('Wrong!', 'wrong');
    }

    function showEarly() {
        showText('Early', 'miss');
    }

    function showLate() {
        showText('Late', 'miss');
    }

    // Evaluate hit timing and show appropriate feedback
    function evaluateHit(timingError, tolerance) {
        const absError = Math.abs(timingError);
        const perfectWindow = tolerance * 0.3; // 30% of tolerance is "perfect"
        const goodWindow = tolerance * 0.7; // 70% of tolerance is "good"

        if (absError <= perfectWindow) {
            showPerfect();
            return 'perfect';
        } else if (absError <= goodWindow) {
            showGood();
            return 'good';
        } else if (absError <= tolerance) {
            // Still a hit but show early/late
            if (timingError < 0) {
                showEarly();
            } else {
                showLate();
            }
            return 'ok';
        } else {
            showMiss();
            return 'miss';
        }
    }

    function clear() {
        if (container) {
            container.innerHTML = '';
        }
    }

    return {
        init,
        showText,
        showPerfect,
        showGood,
        showMiss,
        showWrongKey,
        showEarly,
        showLate,
        evaluateHit,
        clear
    };
})();
