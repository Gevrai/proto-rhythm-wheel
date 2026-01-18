/**
 * Wheel module - SVG wheel rendering
 * Renders the circular wheel with 8 position markers and symbols
 */

const Wheel = (function() {
    const SVG_NS = 'http://www.w3.org/2000/svg';
    let svgElement = null;
    let centerLight = null;
    let centerText = null;
    let positionMarkers = [];
    let symbolElements = [];

    const CENTER_X = 200;
    const CENTER_Y = 200;
    const WHEEL_RADIUS = 150;
    const MARKER_RADIUS = 8;
    const SYMBOL_SIZE = 30;

    // Colors for each instrument
    const COLORS = {
        kick: '#e74c3c',    // Red
        snare: '#3498db',   // Blue
        hihat: '#2ecc71',   // Green
        other: '#9b59b6'    // Purple
    };

    function init() {
        svgElement = document.getElementById('wheel');
        if (!svgElement) {
            console.error('SVG wheel element not found');
            return;
        }
        render();
    }

    function render() {
        // Clear existing content
        svgElement.innerHTML = '';
        positionMarkers = [];
        symbolElements = [];

        // Draw outer ring
        const outerRing = createCircle(CENTER_X, CENTER_Y, WHEEL_RADIUS, 'wheel-ring');
        svgElement.appendChild(outerRing);

        // Draw inner ring
        const innerRing = createCircle(CENTER_X, CENTER_Y, WHEEL_RADIUS - 40, 'wheel-inner-ring');
        svgElement.appendChild(innerRing);

        // Draw center light
        centerLight = createCircle(CENTER_X, CENTER_Y, 25, 'center-light');
        svgElement.appendChild(centerLight);

        // Draw center BPM text
        centerText = document.createElementNS(SVG_NS, 'text');
        centerText.setAttribute('x', CENTER_X);
        centerText.setAttribute('y', CENTER_Y);
        centerText.setAttribute('dy', '0.35em');
        centerText.setAttribute('class', 'center-text');
        centerText.setAttribute('text-anchor', 'middle');
        centerText.textContent = '80';
        svgElement.appendChild(centerText);

        // Draw 8 position markers around the wheel
        for (let i = 0; i < 8; i++) {
            const angle = getAngleForPosition(i);
            const pos = getPositionOnCircle(angle, WHEEL_RADIUS);

            const marker = createCircle(pos.x, pos.y, MARKER_RADIUS, 'position-marker');
            marker.setAttribute('data-position', i);

            // Main beats (0, 2, 4, 6) are larger
            if (i % 2 === 0) {
                marker.setAttribute('r', MARKER_RADIUS + 2);
                marker.classList.add('main-beat');
            }

            positionMarkers.push(marker);
            svgElement.appendChild(marker);

            // Add beat numbers for main beats
            if (i % 2 === 0) {
                const beatNumber = (i / 2) + 1;
                const labelPos = getPositionOnCircle(angle, WHEEL_RADIUS + 25);
                const label = document.createElementNS(SVG_NS, 'text');
                label.setAttribute('x', labelPos.x);
                label.setAttribute('y', labelPos.y);
                label.setAttribute('class', 'beat-label');
                label.setAttribute('text-anchor', 'middle');
                label.setAttribute('dominant-baseline', 'central');
                label.textContent = beatNumber;
                svgElement.appendChild(label);
            }
        }
    }

    function getAngleForPosition(position) {
        // Position 0 is at top (12 o'clock), going clockwise
        // -90 degrees to start at top, then add position * 45 degrees
        return (-90 + position * 45) * (Math.PI / 180);
    }

    function getPositionOnCircle(angle, radius) {
        return {
            x: CENTER_X + radius * Math.cos(angle),
            y: CENTER_Y + radius * Math.sin(angle)
        };
    }

    function createCircle(cx, cy, r, className) {
        const circle = document.createElementNS(SVG_NS, 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', r);
        circle.setAttribute('class', className);
        return circle;
    }

    function renderSymbols(symbols) {
        // Clear existing symbols
        symbolElements.forEach(el => el.remove());
        symbolElements = [];

        symbols.forEach(symbol => {
            const angle = getAngleForPosition(symbol.position);
            const pos = getPositionOnCircle(angle, WHEEL_RADIUS - 60);
            const element = createSymbol(symbol, pos);
            element.setAttribute('data-position', symbol.position);
            element.setAttribute('data-key', symbol.key);
            symbolElements.push(element);
            svgElement.appendChild(element);
        });
    }

    function createSymbol(symbol, pos) {
        const group = document.createElementNS(SVG_NS, 'g');
        group.setAttribute('class', 'symbol');
        group.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);

        const color = COLORS[symbol.instrument] || '#999';
        let shape;

        switch (symbol.instrument) {
            case 'kick':
                // Circle for kick
                shape = document.createElementNS(SVG_NS, 'circle');
                shape.setAttribute('cx', 0);
                shape.setAttribute('cy', 0);
                shape.setAttribute('r', SYMBOL_SIZE / 2);
                shape.setAttribute('fill', color);
                break;

            case 'snare':
                // Square for snare
                shape = document.createElementNS(SVG_NS, 'rect');
                shape.setAttribute('x', -SYMBOL_SIZE / 2);
                shape.setAttribute('y', -SYMBOL_SIZE / 2);
                shape.setAttribute('width', SYMBOL_SIZE);
                shape.setAttribute('height', SYMBOL_SIZE);
                shape.setAttribute('fill', color);
                break;

            case 'hihat':
                // Triangle for hi-hat
                const halfSize = SYMBOL_SIZE / 2;
                shape = document.createElementNS(SVG_NS, 'polygon');
                shape.setAttribute('points', `0,${-halfSize} ${halfSize},${halfSize} ${-halfSize},${halfSize}`);
                shape.setAttribute('fill', color);
                break;

            case 'other':
                // Diamond for other
                const half = SYMBOL_SIZE / 2;
                shape = document.createElementNS(SVG_NS, 'polygon');
                shape.setAttribute('points', `0,${-half} ${half},0 0,${half} ${-half},0`);
                shape.setAttribute('fill', color);
                break;

            default:
                shape = document.createElementNS(SVG_NS, 'circle');
                shape.setAttribute('cx', 0);
                shape.setAttribute('cy', 0);
                shape.setAttribute('r', SYMBOL_SIZE / 2);
                shape.setAttribute('fill', '#999');
        }

        shape.setAttribute('class', 'symbol-shape');

        // Add key label
        const label = document.createElementNS(SVG_NS, 'text');
        label.setAttribute('x', 0);
        label.setAttribute('y', 0);
        label.setAttribute('dy', '0.35em');
        label.setAttribute('class', 'symbol-label');
        label.setAttribute('text-anchor', 'middle');
        label.textContent = symbol.key.toUpperCase();

        group.appendChild(shape);
        group.appendChild(label);

        return group;
    }

    function pulseCenterLight() {
        if (!centerLight) return;
        centerLight.classList.add('pulse');
        setTimeout(() => {
            centerLight.classList.remove('pulse');
        }, 200);
    }

    function highlightPosition(position, className = 'highlight') {
        const marker = positionMarkers[position];
        if (marker) {
            marker.classList.add(className);
            setTimeout(() => {
                marker.classList.remove(className);
            }, 200);
        }
    }

    function highlightSymbol(position, success) {
        const symbol = symbolElements.find(el =>
            parseInt(el.getAttribute('data-position')) === position
        );

        if (symbol) {
            const className = success ? 'hit-success' : 'hit-miss';
            symbol.classList.add(className);
            setTimeout(() => {
                symbol.classList.remove(className);
            }, 300);
        }
    }

    function markSymbolComplete(position) {
        const symbol = symbolElements.find(el =>
            parseInt(el.getAttribute('data-position')) === position
        );

        if (symbol) {
            symbol.classList.add('completed');
        }
    }

    function clearSymbolStates() {
        symbolElements.forEach(el => {
            el.classList.remove('completed', 'hit-success', 'hit-miss');
        });
    }

    function getCurrentSubdivisionAngle(subdivision) {
        return getAngleForPosition(subdivision);
    }

    function setCenterText(text) {
        if (centerText) {
            centerText.textContent = text;
        }
    }

    return {
        init,
        render,
        renderSymbols,
        pulseCenterLight,
        highlightPosition,
        highlightSymbol,
        markSymbolComplete,
        clearSymbolStates,
        setCenterText,
        getAngleForPosition,
        COLORS
    };
})();
