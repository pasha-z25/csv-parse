const express = require('express');
const exphbs = require('express-handlebars');
const homeRoute = require('./src/routes/home.js');

const port = process.env.PORT || 3000;
const app = express();
const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: 'hbs',
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', './src/views');

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static('./src'));

app.use('/', homeRoute);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`); // eslint-disable-line
});
