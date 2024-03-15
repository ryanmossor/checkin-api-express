const fs = require('fs');

async function processCheckinQueue(checkinQueue, lists) {
    const response = { 
        queue: [],
        results: [],
        processedCount: 0 
    };

    try {
        const start = performance.now();

        while (checkinQueue.queue.length > 0) {
            const queueItem = checkinQueue.queue.shift();

            if (queueItem.formResponse["Feel Well-Rested"] == null) {
                response.queue.push(queueItem);
                continue;
            } 

            const { date: today } = queueItem.checkinFields;

            if (queueItem.getWeight) {
                // const weightJson = await getWeightData(fitbitToken, today);
                // queueItem.formResponse = { ...queueItem.formResponse, ...weightJson };
                console.log("getting weight data...");
            }

            if (Object.keys(queueItem.formResponse).some((item) => lists.trackedActivities.includes(item))) {
                console.log("getting strava activity data...");
                // const activityData = await strava.getActivityData(stravaJson.auth.access_token, today);
                // queueItem.formResponse = strava.convertActivityData(activityData, trackedActivities, queueItem.formResponse);
            }

            fs.writeFileSync(`./checkin-results/${today}.json`, JSON.stringify(queueItem, null, 4));

            const resultsString = lists.fullChecklist
                .map((item) => queueItem.formResponse[item])
                .join(); 

            console.log(`Results string for ${today}: ${resultsString}`);

            response.results.push({
                ...queueItem.checkinFields,
                resultsString
            });

            response.processedCount += 1;
        }

        const end = performance.now();
        console.log(`Processed ${response.processedCount} item(s) in ${((end - start) / 1000).toFixed(2)} seconds.`);
    } catch (err) {
        console.log(`Error processing check-in queue: ${err}`);
    }

    return response;
}

module.exports = processCheckinQueue;
