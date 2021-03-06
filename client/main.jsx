import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import ReactDOM from "react-dom";

import { render } from 'react-dom';
import AppContainer from '/app/layout/AppContainer'
import { onPageLoad } from 'meteor/server-render';

import { register } from 'register-service-worker'
import { get } from 'lodash';

onPageLoad(function(){
  console.log("Initial onPageLoad() function.  Storing URL parameters in session variables.", window.location.search);
  Session.set('last_reloaded_url', window.location.search)

  const preloadedState = window.__PRELOADED_STATE__;

  let searchParams = new URLSearchParams(get(preloadedState, 'url.path'));
  if(searchParams.get('iss')){
    Session.set('smartOnFhir_iss', searchParams.get('iss'));
  }
  if(searchParams.get('launch')){
    Session.set('smartOnFhir_launch', searchParams.get('launch'));
  }
  if(searchParams.get('code')){
    Session.set('smartOnFhir_code', searchParams.get('code'));
  }
  if(searchParams.get('scope')){
    Session.set('smartOnFhir_scope', searchParams.get('scope'));
  }

  ReactDOM.hydrate(<AppContainer />, document.getElementById('reactTarget'));
});


//  // we register a static file that's put in the /public folder
// register('/service-worker.js', {
//   registrationOptions: { scope: './' },
//   ready (registration) {
//     console.log('Service worker is active.')
//   },
//   registered (registration) {
//     console.log('Service worker has been registered.')
//   },
//   cached (registration) {
//     console.log('Content has been cached for offline use.')
//   },
//   updatefound (registration) {
//     console.log('New content is downloading.')
//   },
//   updated (registration) {
//     console.log('New content is available; please refresh.')
//   },
//   offline () {
//     console.log('No internet connection found. App is running in offline mode.')
//   },
//   error (error) {
//     console.error('Error during service worker registration:', error)
//   }
// });

