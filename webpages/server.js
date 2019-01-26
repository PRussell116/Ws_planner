const express = require('express');
const app  = express();



// logging
app.use('/', (req, res, next) => { console.log(new Date(), req.method, req.url); next(); });



app.use(express.static(`${__dirname}/webpages`));



//app.post('/upload', upload);
app.listen(8080, (err) => {
  if (err) console.error('error starting server', err);
  else console.log('server started');
});
