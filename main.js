// only include related key events
const entry_include_list = ['keydown', 'keyup', 'keypress', 'beforeinput', 'input', 'textinput', 'compositionstart', 'compositionupdate', 'compositionend'];

function $(selector) {
    return document.querySelector(selector);
}

function logEventsAndCount() {
    let firstInteractionId;
    const log = $('#event-log');

    const getInteractionNumber = (entry) => {
        // This code is an estimate until proper interactionCount is supported.
        return Math.round((entry.interactionId - firstInteractionId) / 7) + 1;
    }

    new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            // include key related events only
            if (!entry_include_list.includes(entry.name)) continue;

            if (!firstInteractionId && entry.interactionId) {
                firstInteractionId = entry.interactionId;
            }
            const interactionNumber = entry.interactionId ? getInteractionNumber(entry) : '--';
            const tr = document.createElement('tr');
            tr.innerHTML = `
          <td>${interactionNumber}</td>
          <td>${entry.name}</td>
          <td class="value">${entry.duration}</td>
          <td class="value">
            <code>${new Date().toISOString().slice(17, 23)}</code>
          </td>
        `;
            log.prepend(tr);
        }
    }).observe({ type: 'event', durationThreshold: 16 });
}

function initialize() {

    const block16 = () => {
        const blockingStart = performance.now();
        while (performance.now() < blockingStart + 16) {
            // Block...
        }
    }

    const updateHandlerState = () => {
        const shouldEnable = $('#enable16msListener').checked;
        entry_include_list.forEach((type) => {
            if (shouldEnable) {
                addEventListener(type, block16, { passive: true });
            }
            else {
                removeEventListener(type, block16, { passive: true });
            }
        });
    }

    // add config box handler
    $('#enable16msListener').addEventListener('click', updateHandlerState);

    logEventsAndCount();
}

if (
    'PerformanceEventTiming' in self &&
    'interactionId' in PerformanceEventTiming.prototype
) {
    initialize();
} else {
    document.body.classList.add('unsupported');
    alert(
        [
            `Oops, this brower does not fully support the Event Timing API,`,
            `which is required for this demo.`,
        ].join(' ')
    );
}
