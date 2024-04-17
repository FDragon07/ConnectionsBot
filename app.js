import express from 'express';
import { config } from './config.js';

export const run = () => {
  const app = express();
  app.set('view engine', 'ejs');

  app.get('/', (req, res) => {
    res.render('pages/index')
  });

  app.listen(config.port, () => {
    console.log(`App listening at port ${config.port}`)
  });
};
