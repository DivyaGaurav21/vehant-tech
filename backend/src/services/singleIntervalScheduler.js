export function createSingleIntervalScheduler(tick, intervalMs, onError) {
    let timer;
    let inFlight;
    let running = false;
    let startedAt;
    let lastError;
    function executeTick() {
        if (!running || inFlight)
            return;
        inFlight = Promise.resolve()
            .then(tick)
            .then(() => { lastError = undefined; })
            .catch((error) => {
            lastError = error instanceof Error ? error.message : 'Unknown simulation error';
            onError(error);
        })
            .finally(() => { inFlight = undefined; });
    }
    function getState() {
        return {
            running,
            startedAt: startedAt?.toISOString() ?? null,
            lastError: lastError ?? null,
        };
    }
    return {
        start() {
            if (!running) {
                running = true;
                startedAt = new Date();
                lastError = undefined;
                timer = setInterval(executeTick, intervalMs);
                executeTick();
            }
            return getState();
        },
        async stop() {
            running = false;
            if (timer) {
                clearInterval(timer);
                timer = undefined;
            }
            if (inFlight)
                await inFlight;
            return getState();
        },
        getState,
    };
}
