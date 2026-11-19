import assert from 'node:assert/strict';
import test from 'node:test';
import { createSingleIntervalScheduler } from './singleIntervalScheduler.js';
const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
test('start is idempotent and stop clears the single scheduled loop', async () => {
    let tickCount = 0;
    const scheduler = createSingleIntervalScheduler(async () => {
        tickCount += 1;
    }, 10, (error) => { throw error; });
    const started = scheduler.start();
    const startedAgain = scheduler.start();
    assert.equal(started.running, true);
    assert.equal(startedAgain.startedAt, started.startedAt);
    await delay(35);
    const stopped = await scheduler.stop();
    const countAtStop = tickCount;
    await delay(25);
    assert.equal(stopped.running, false);
    assert.equal(tickCount, countAtStop);
    assert.ok(tickCount >= 2);
});
test('does not overlap asynchronous simulation ticks', async () => {
    let tickCount = 0;
    let finishFirstTick;
    const scheduler = createSingleIntervalScheduler(() => {
        tickCount += 1;
        if (tickCount === 1) {
            return new Promise((resolve) => { finishFirstTick = resolve; });
        }
        return Promise.resolve();
    }, 5, (error) => { throw error; });
    scheduler.start();
    await delay(20);
    assert.equal(tickCount, 1);
    finishFirstTick?.();
    await delay(5);
    await scheduler.stop();
    assert.ok(tickCount <= 2);
});
test('captures tick failures in scheduler status and continues processing', async () => {
    let tickCount = 0;
    const scheduler = createSingleIntervalScheduler(async () => {
        tickCount += 1;
        if (tickCount === 1)
            throw new Error('test tick failure');
    }, 10, () => undefined);
    scheduler.start();
    await delay(2);
    assert.equal(scheduler.getState().lastError, 'test tick failure');
    await delay(15);
    const stopped = await scheduler.stop();
    assert.equal(stopped.running, false);
    assert.ok(tickCount >= 2);
});
