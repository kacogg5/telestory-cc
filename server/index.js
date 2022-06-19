const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;
const fs = require('fs');
const { endpoint } = require('../src/helpers/endpoint');

// static resources should just be served as they are
app.use(express.static(
    path.resolve(__dirname, '..', 'build'),
    { maxAge: '30d' },
));

app.listen(PORT, (error) => {
  if (error) {
      return console.log('Error during app startup', error);
  }
  console.log("listening on " + PORT + "...");
});

const indexPath  = path.resolve(__dirname, '..', 'build', 'index.html');
app.get('/*', async (req, res, next) => {
  const pathVariables = req.path.split(/[\\/]/g);
  const [, _s, storyId, _p, pageNum] = pathVariables;

  let title;
  let description;
  let cardDescription;
  let cardImage;

  if (_s !== 's' || storyId === undefined || storyId === 'new') {
    // home page
    title = 'Telestory';
    description = 'Make up stories with your friends.';
    cardImage = 'https://d3qdh8xs6uy3k8.cloudfront.net/jKm3hBl5Id-1.png';
  } else if (_p !== 'p' || pageNum === undefined || pageNum === 'new') {
    // view story
    const storyInfo = await fetch(`${endpoint}/get-page-count`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ storyId }),
    });
  
    const pageInfo = await fetch(`${endpoint}/get-page-count`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ storyId }),
    }).then(async (response) => {
      const {
        pageCount,
      } = JSON.parse((await response.json()).body);

      return await fetch(`${endpoint}/get-page-info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storyId, pageNum: pageCount }),
      });
    });

    const {
      storyTitle
    } = JSON.parse((await storyInfo.json()).body);
    const {
      pageText,
      imageUrl,
    } = JSON.parse((await pageInfo.json()).body);
    
    title = storyTitle;
    description = pageText;
    cardImage = imageUrl;
  } else {
    // view story
    const storyInfo = await fetch(`${endpoint}/get-page-count`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ storyId }),
    });
  
    const pageInfo = await fetch(`${endpoint}/get-page-info`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ storyId, pageNum }),
    });

    const {
      storyTitle
    } = JSON.parse((await storyInfo.json()).body);
    const {
      pageText,
      imageUrl,
    } = JSON.parse((await pageInfo.json()).body);
    
    title = storyTitle;
    description = pageText;
    cardImage = imageUrl;
  }

  fs.readFile(indexPath, 'utf8', async (err, htmlData) => {
    if (err) {
      console.error('Error during file reading', err);
      return res.status(404).end()
    }

    // TODO inject meta tags
    htmlData = htmlData
      .replace('__META_OG_TITLE__', title)
      .replace('__META_OG_DESCRIPTION__', description)
      .replace('__META_DESCRIPTION__', description)
      .replace('__META_OG_IMAGE__', cardImage);
    return res.send(htmlData);
  });
});