import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import AES from 'crypto-js/aes';
import SHA256 from 'crypto-js/sha256';
import uuidv4 from 'uuid/v4';

import AWS from 'aws-sdk';
AWS.config.update({
    region: 'us-east-1',
    endpoint: 'https://dynamodb.us-east-1.amazonaws.com'
});

const app = express();

const API_HOST = 'localhost';
const API_PORT = 8000;

app.enable('trust proxy');
app.use(bodyParser.json());
app.use(cors());

app.post('/recommend', (req, res) => {
    let songs = [
        { artist: 'Coldplay', song: 'The Scientist' },
        { artist: 'Radiohead', song: 'OK Computer' },
        { artist: 'Placebo', song: 'Every You Every Me' },
        { artist: 'Radiohead', song: 'Creep' },
        { artist: 'Radiohead', song: 'Karma Police' },
        { artist: 'Radiohead', song: 'Clocks' },
        { artist: 'Coldplay', song: 'Fix You' }
    ];
    res.json(songs);
});

app.post('/register', (req, res) => {
    let docClient = new AWS.DynamoDB.DocumentClient();
    let username = req.body.username;
    let password = SHA256(req.body.password).toString();
    let user = {
        id: uuidv4(),
        username,
        password
    };
    docClient.put({
        TableName: 'users',
        Item: user
    }, (err, data) => {
        if (err) {
            return res.json({
                errors: [{
                    code: 100,
                    message: 'An error occured!'
                }],
                data: null
            });
        }
        res.json({
            errors: [],
            data: user
        });
    });
});

app.post('/login', (req, res) => {
    let docClient = new AWS.DynamoDB.DocumentClient();
    let username = req.body.username;
    let password = SHA256(req.body.password).toString();
    docClient.get({
        TableName : 'users',
        Key: {
            'username': username
        }
    }, (err, data) => {
        if (err) {
            return res.json({
                errors: [{
                    code: 100,
                    message: 'An error occured!'
                }],
                data: null
            });
        }
        if (data.Item && data.Item.password == password) {
            return res.json({
                errors: [],
                data: data.Item
            });
        }
        res.json({
            errors: [{
                code: 404,
                message: 'User does not exist!'
            }],
            data: null
        });
    });
});

app.listen(API_PORT, () => {
    console.log(`API server is now running on http://${API_HOST}:${API_PORT}/`); // eslint-disable-line no-console
});
