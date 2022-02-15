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
  const { url } = req.body

  const expression = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi

  const regex = new RegExp(expression)
  
  if (!url.match(regex)) {
    res.json({
      error: 'invalid url'
    })
  } 
  
  const db = JSON.parse(fs.readFileSync(pathToDb, 'utf8'))
  
  const lastId = db[db.length - 1].short_url
  const newId = +lastId + 1

  const newItem = {
    original_url: url,
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
    return el.short_url == +short_url
  })

  return res.redirect(result[0].original_url)
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
