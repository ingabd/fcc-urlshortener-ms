require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const fs = require('fs')

const pathToDb = './db.json'

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  const { original_url } = req.body
  
  const db = JSON.parse(fs.readFileSync(pathToDb, 'utf8'))
  
  const lastId = db[db.length - 1].short_url
  const newId = +lastId + 1

  const newItem = {
    original_url,
    short_url: newId
  }

  db.push(newItem)
  fs.writeFileSync(pathToDb, JSON.stringify(db, null, 2))

  res.json(newItem)
})

app.get('/api/shorturl/:short_url', (req, res) => {
  const { short_url } = req.params

  const db = JSON.parse(fs.readFileSync(pathToDb, 'utf8'))

  const result = db.filter(el => {
    return el.short_url == short_url
  })

  res.json(result)
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
