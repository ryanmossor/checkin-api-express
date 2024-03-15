const fs = require('fs');
const express = require('express');
const processCheckinQueue = require('./processCheckinQueue');

const app = express();
const port = 3000;

let lists = {
    fullChecklist: [],
    trackedActivities: [],
}

try {
    const data = fs.readFileSync('./lists/lists.json', "utf8");
    const json = JSON.parse(data);

    lists.fullChecklist = json.fullChecklist;
    lists.trackedActivities = json.trackedActivities;
} catch (err) {
    console.log(`Error getting lists: ${err}`);
}

app.use(express.json());

app.get('/', (req, res) => {
    res.send("Hello world\n");
})

app.get('/checkin/lists', (req, res) => {
    res.send(JSON.stringify(lists, null, 4));
})

app.post('/checkin/lists', (req, res) => {
    try {
        fs.writeFileSync('./lists/lists.json', JSON.stringify(req.body));

        lists.fullChecklist = req.body?.fullChecklist;
        lists.trackedActivities = req.body?.trackedActivities;

        res.send(JSON.stringify(lists, null, 4));
    } catch (err) {
        console.log(`Error updating lists: ${err}`);
        res.send(`Error updating lists: ${err}`);
    }
})

app.get('/checkin/date/:date', (req, res) => {
    try {
        const data = fs.readFileSync(`./checkin-results/${req.params.date}.json`, "utf8");
        res.send(data);
    } catch (err) {
        console.log(`Error getting data for ${req.params.date}: ${err}`);
        res.send(`Error getting data for ${req.params.date}: ${err}`);
    }
})

app.get('/checkin/:year/:month', (req, res) => {
    try {
        const dates = fs.readdirSync('./checkin-results/')
            .map(filename => filename.replace(".json", ""))
            .filter(f => f.startsWith(`${req.params.year}-${req.params.month}`))
            .slice(0, req.query.limit);

        if (req.query.reverse) {
            res.send(JSON.stringify({ files: dates.reverse() }, null, 4));
        } else {
            res.send(JSON.stringify({ files: dates }, null, 4));
        }

    } catch (err) {
        console.log(`Error getting check-in results for ${req.params.year}-${req.params.month}: ${err}`);
        res.send(`Error getting check-in results for ${req.params.year}-${req.params.month}: ${err}`);
    }
})

app.post('/checkin/process', async (req, res) => {
    try {
        const errors = [];

        if (req.body.queue) {
            const results = await processCheckinQueue(req.body, lists);
            res.send(`${JSON.stringify(results, null, 4)}\n`);
        } else if (req.query?.dates) {
            const data = [];

            for (const date of req.query.dates.split(',').sort()) {
                try {
                    const contents = fs.readFileSync(`./checkin-results/${date}.json`, 'utf8');
                    data.push(JSON.parse(contents));
                } catch (err) {
                    console.log(`Error retrieving data for ${date}: ${err}`);
                    errors.push(`Error retrieving data for ${date}: ${err}`);
                }
            }

            const queue = { queue: data }

            const results = await processCheckinQueue(queue, lists);
            res.send(`${JSON.stringify(results, null, 4)}\n`);
        } else {
            res.status(400).send();
        }
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
})
