'use strict';

const port = process.argv.MOCK_SERVER_PORT || 8888;

const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const app = express();

app.enable('trust proxy');
app.disable('x-powered-by');
app.disable('etag');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());

const data = require('../data/countries.json');

app.get('/country', function(req, res) {
    const searchStr = (req.query.search || '').toLowerCase();
    const countries = data.reduce((res, item) => {
        const countryName = item.name.toLowerCase();
        const country = { name: item.name, code: item.code };
        return countryName.indexOf(searchStr) === 0 ? res.concat(country) : res;
    }, []);
    res.json(countries);
});

app.post('/selectedCountries', function(req, res) {
    const selected = req.body.isoCodes || [];
    // mistrust the client and possibly check if `selected` is a subset of `data`
    const isSubset = selected.every(code => {
        return data.some(entry => entry.code === code);
    });
    if (!isSubset) {
        res.status(404).json({ error: 'Wrong codes passed' });
    } else
        res.json({success: true});
});

// Error handling
app.use(logErrors);
app.use(errorHandler);
// 404 comes last in the chain
app.use(handleNotFound);

function logErrors(err, req, res, next) {
    console.error(err.stack);
    next(err);
}

function errorHandler(err, req, res) {
    // check err.code
    if (req.xhr) {
        res.status(500).json({ error: `Unhandled server error.` });
    } else {
        res.status(500).send('Error: Unhandled server error');
    }
}

function handleNotFound(req, res, next) {
    console.log(req.url);
    res.status(404).send(`Route not found: '${req.url}'`);
}

app.listen(port, function(err) {
    if (err)
        console.error(err);
    else
        console.log(`Server listening on port ${port}`);
});
