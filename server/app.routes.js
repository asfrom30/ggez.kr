/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';

export default function(app) {

  //FIXME: device valid check, when region is not proper, return json_status..
  app.param('device', function(req, res, next, device){
    req.device = device;
    next();
  });

  //FIXME: region valid check, when region is not proper, return json_status..
  app.param('region', function(req, res, next, region){
    req.region = region;
    next();
  })

  /* Auth API */
  app.use('/api/oauth', require('./core/api/v3/oauth'));
   /* For Auth */
  // app.use('/auth', require('./auth').default);

  /* Insert routes below */
  app.use('/:device/:region/players', require('./core/api/v3/player'));
  app.use('/:device/:region/crawl-datas', require('./core/api/v3/crawl-data'));
  app.use('/:device/:region/tier-datas', require('./core/api/v3/tier-data'));
  app.use('/:device/:region/index-information', require('./core/api/v3/index-information'));
  app.use('/:device/:region/sessions', require('./core/api/v3/sessions'));
  
  // REST Api
  app.use('/api/user', require('./core/api/v3/user'))
  app.use('/api/freeboard', require('./core/api/v3/boards/freeboard'));
  app.use('/api/freeboard', require('./core/api/v3/boards/freeboard-comment')); // freeboard comment


  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.redirect('/#!/index');
    });
}
