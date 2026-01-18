/**
 * Wheel module - SVG wheel rendering
 * Renders the circular wheel with per-instrument position markers
 */

const Wheel = (function() {
    const SVG_NS = 'http://www.w3.org/2000/svg';
    let svgElement = null;
    let centerLight = null;
    let centerText = null;
    let positionMarkers = {}; // Keyed by instrument
    let symbolElements = [];

    const CENTER_X = 200;
    const CENTER_Y = 200;
    const WHEEL_RADIUS = 150;
    const MARKER_RADIUS = 4;
    const SYMBOL_SIZE = 22;

    // Current subdivisions per instrument
    let instrumentSubdivisions = { kick: 8, snare: 8, hihat: 8, other: 8 };
    let masterSubdivision = 8;

    // Colors for each instrument
    const COLORS = {
        kick: '#e74c3c',    // Red
        snare: '#3498db',   // Blue
        hihat: '#2ecc71',   // Green
        other: '#9b59b6'    // Purple
    };

    // Instrument circle radii (innermost to outermost)
    const INSTRUMENT_RADII = {
        kick: 55,
        snare: 80,
        hihat: 105,
        other: 130
    };

    // Instrument order (inner to outer)
    const INSTRUMENT_ORDER = ['kick', 'snare', 'hihat', 'other'];

    function init() {
        svgElement = document.getElementById('wheel');
        if (!svgElement) {
            console.error('SVG wheel element not found');
            return;
        }
        render();
    }

    function render(instSubs = null, masterSub = null) {
        if (instSubs) instrumentSubdivisions = instSubs;
        if (masterSub) masterSubdivision = masterSub;

        // Clear existing content
        svgElement.innerHTML = '';
        positionMarkers = {};
        symbolElements = [];

        // Draw outer ring
        const outerRing = createCircle(CENTER_X, CENTER_Y, WHEEL_RADIUS, 'wheel-ring');
        svgElement.appendChild(outerRing);

        // Draw instrument circles with position markers
        INSTRUMENT_ORDER.slice().reverse().forEach(instrument => {
            const radius = INSTRUMENT_RADII[instrument];
            const subdivisions = instrumentSubdivisions[instrument] || 8;

            // Draw the instrument circle
            const circle = createCircle(CENTER_X, CENTER_Y, radius, 'instrument-circle');
            circle.setAttribute('stroke', COLORS[instrument]);
            circle.classList.add(`instrument-circle-${instrument}`);
            svgElement.appendChild(circle);

            // Draw position markers for this instrument
            positionMarkers[instrument] = [];
            for (let i = 0; i < subdivisions; i++) {
                const angle = getAngleForInstrumentPosition(i, subdivisions);
                const pos = getPositionOnCircle(angle, radius);

                const marker = createCircle(pos.x, pos.y, MARKER_RADIUS, 'instrument-marker');
                marker.setAttribute('fill', COLORS[instrument]);
                marker.setAttribute('data-instrument', instrument);
                marker.setAttribute('data-position', i);
                marker.style.opacity = '0.4';

                // Make first position (beat 1) slightly larger
                if (i === 0) {
                    marker.setAttribute('r', MARKER_RADIUS + 1);
                    marker.style.opacity = '0.6';
                }

                positionMarkers[instrument].push(marker);
                svgElement.appendChild(marker);
            }
        });

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

        // Draw beat numbers on outer ring (always 4 beats)
        for (let beat = 0; beat < 4; beat++) {
            const angle = getAngleForInstrumentPosition(beat, 4);
            const pos = getPositionOnCircle(angle, WHEEL_RADIUS);

            // Beat marker on outer ring
            const marker = createCircle(pos.x, pos.y, MARKER_RADIUS + 4, 'position-marker main-beat');
            svgElement.appendChild(marker);

            // Beat label
            const labelPos = getPositionOnCircle(angle, WHEEL_RADIUS + 25);
            const label = document.createElementNS(SVG_NS, 'text');
            label.setAttribute('x', labelPos.x);
            label.setAttribute('y', labelPos.y);
            label.setAttribute('class', 'beat-label');
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('dominant-baseline', 'central');
            label.textContent = beat + 1;
            svgElement.appendChild(label);
        }
    }

    function getAngleForInstrumentPosition(position, subdivisions) {
        // Position 0 is at top (12 o'clock), going clockwise
        const degreesPerPosition = 360 / subdivisions;
        return (-90 + position * degreesPerPosition) * (Math.PI / 180);
    }

    function getAngleForMasterPosition(position) {
        const degreesPerPosition = 360 / masterSubdivision;
        return (-90 + position * degreesPerPosition) * (Math.PI / 180);
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

    function renderSymbols(symbols, instSubs, masterSub) {
        // Update subdivisions if provided
        if (instSubs && masterSub) {
            const needsRerender = JSON.stringify(instSubs) !== JSON.stringify(instrumentSubdivisions) ||
                                  masterSub !== masterSubdivision;
            if (needsRerender) {
                render(instSubs, masterSub);
            }
        }

        // Clear existing symbols
        symbolElements.forEach(el => el.remove());
        symbolElements = [];

        // Place each symbol on its instrument's circle at the correct position
        symbols.forEach(symbol => {
            const instrument = symbol.instrument;
            const instSubdiv = instrumentSubdivisions[instrument] || 8;

            // Use original position for visual placement on instrument circle
            const originalPos = symbol.originalPosition !== undefined ? symbol.originalPosition : symbol.position;
            const angle = getAngleForInstrumentPosition(originalPos, instSubdiv);
            const radius = INSTRUMENT_RADII[instrument] || INSTRUMENT_RADII.other;
            const pos = {
                x: CENTER_X + Math.cos(angle) * radius,
                y: CENTER_Y + Math.sin(angle) * radius
            };

            const element = createSymbol(symbol, pos);
            element.setAttribute('data-position', symbol.position); // Master position for timing
            element.setAttribute('data-original-position', originalPos);
            element.setAttribute('data-instrument', instrument);
            element.setAttribute('data-key', symbol.key);
            symbolElements.push(element);
            svgElement.appendChild(element);
        });
    }

    function getKeyForInstrument(instrument) {
        if (typeof Input !== 'undefined' && Input.getKeyForInstrument) {
            return Input.getKeyForInstrument(instrument);
        }
        const fallback = { kick: 'q', snare: 'w', hihat: 'e', other: 'r' };
        return fallback[instrument];
    }

    function createSymbol(symbol, pos) {
        const group = document.createElementNS(SVG_NS, 'g');
        group.setAttribute('class', 'symbol');
        group.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);

        const color = COLORS[symbol.instrument] || '#999';

        // All instruments use circles - color and letter differentiate them
        const shape = document.createElementNS(SVG_NS, 'circle');
        shape.setAttribute('cx', 0);
        shape.setAttribute('cy', 0);
        shape.setAttribute('r', SYMBOL_SIZE / 2);
        shape.setAttribute('fill', color);

        shape.setAttribute('class', 'symbol-shape');

        // Add key label - use current key mapping
        const currentKey = getKeyForInstrument(symbol.instrument);
        const label = document.createElementNS(SVG_NS, 'text');
        label.setAttribute('x', 0);
        label.setAttribute('y', 0);
        label.setAttribute('dy', '0.35em');
        label.setAttribute('class', 'symbol-label');
        label.setAttribute('text-anchor', 'middle');
        label.textContent = currentKey.toUpperCase();

        group.appendChild(shape);
        group.appendChild(label);

        return group;
    }

    function updateSymbolLabels() {
        // Update all symbol labels with current key mappings
        symbolElements.forEach(el => {
            const instrument = el.getAttribute('data-instrument');
            const label = el.querySelector('.symbol-label');
            if (instrument && label) {
                const currentKey = getKeyForInstrument(instrument);
                label.textContent = currentKey.toUpperCase();
            }
        });
    }

    function pulseCenterLight() {
        if (!centerLight) return;
        centerLight.classList.add('pulse');
        setTimeout(() => {
            centerLight.classList.remove('pulse');
        }, 200);
    }

    function highlightPosition(masterPosition) {
        // Highlight position markers on each instrument circle that corresponds to this master position
        INSTRUMENT_ORDER.forEach(instrument => {
            const instSubdiv = instrumentSubdivisions[instrument];
            const markers = positionMarkers[instrument];
            if (!markers) return;

            // Calculate which instrument position corresponds to this master position
            const instrumentPos = Math.round(masterPosition * instSubdiv / masterSubdivision);

            // Only highlight if it's an exact hit (on the grid)
            const expectedMaster = Math.round(instrumentPos * masterSubdivision / instSubdiv);
            if (expectedMaster === masterPosition && instrumentPos < markers.length) {
                const marker = markers[instrumentPos];
                if (marker) {
                    marker.style.opacity = '1';
                    marker.setAttribute('r', MARKER_RADIUS + 2);
                    setTimeout(() => {
                        marker.style.opacity = instrumentPos === 0 ? '0.6' : '0.4';
                        marker.setAttribute('r', instrumentPos === 0 ? MARKER_RADIUS + 1 : MARKER_RADIUS);
                    }, 150);
                }
            }
        });
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
        // Mark all symbols at this master position as complete
        symbolElements.forEach(el => {
            if (parseInt(el.getAttribute('data-position')) === position) {
                el.classList.add('completed');
            }
        });
    }

    function clearSymbolStates() {
        symbolElements.forEach(el => {
            el.classList.remove('completed', 'hit-success', 'hit-miss');
        });
    }

    function setCenterText(text) {
        if (centerText) {
            centerText.textContent = text;
        }
    }

    function getMasterSubdivision() {
        return masterSubdivision;
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
        getMasterSubdivision,
        updateSymbolLabels,
        COLORS
    };
})();
