/**
 * If not stated otherwise in this file or this component's LICENSE
 * file the following copyright and licenses apply:
 *
 * Copyright 2020 RDK Management
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
import ThunderJS from 'ThunderJS';
//import AppApi from './AppApi.js';
//var appApi = new AppApi();
/**
 * Class for Xcast thunder plugin apis.
 */

export default class XcastApi {
  constructor() {
    console.log('Xcast constructor');
    this._events = new Map();
  }

  /**
   * Function to activate the Xcast plugin
   */
  activate() {
    return new Promise((resolve, reject) => {
      const config = {
        host: '127.0.0.1',
        port: 9998,
        default: 1,
      };
      this._thunder = ThunderJS(config);
      this.callsign = 'org.rdk.Xcast';
      this._thunder
        .call('Controller', 'activate', { callsign: this.callsign })
        .then(result => {
          console.log(result);
          console.log('Xcast activation success');
          this._thunder
            .call('org.rdk.Xcast', 'setEnabled', {enabled: true})
            .then(result => {
              if (result.success) {
                console.log('Xcast enabled');
                this._thunder.call('org.rdk.RDKShell.1', 'getState', {}).then(result => {
                  console.log(JSON.stringify(result))
                  let state = result.state
                  
                 for (var i = 0; i < state.length; i++) {      
                    if (state[i].callsign == 'Netflix') {
                      let params = { applicationName: 'Netflix', state: 'stopped' };
                      if (state[i].state == 'resumed') {
                        params.state = 'running'
                      } else if (state[i].state == 'suspended') {
                        params.state = 'suspended'
                      } else params.state = 'stopped'
                    
                      //console.log('Notifying back to xcast' + JSON.stringify(params))
                      //appApi.setAppState(params)
                      
                    }
                  }
                })
                this._thunder.on(this.callsign, 'onApplicationLaunchRequest', notification => {
                  console.log('onApplicationLaunchRequest ' + JSON.stringify(notification));
                  if (this._events.has('onApplicationLaunchRequest')) {
                    this._events.get('onApplicationLaunchRequest')(notification);
                  }
                });
                this._thunder.on(this.callsign, 'onApplicationHideRequest', notification => {
                  console.log('onApplicationHideRequest ' + JSON.stringify(notification));
                  if (this._events.has('onApplicationHideRequest')) {
                    this._events.get('onApplicationHideRequest')(notification);
                  }
                });
                this._thunder.on(this.callsign, 'onApplicationResumeRequest', notification => {
                  console.log('onApplicationResumeRequest ' + JSON.stringify(notification));
                  if (this._events.has('onApplicationResumeRequest')) {
                    this._events.get('onApplicationResumeRequest')(notification);
                  }
                });
                this._thunder.on(this.callsign, 'onApplicationStopRequest', notification => {
                  console.log('onApplicationStopRequest ' + JSON.stringify(notification));
                  if (this._events.has('onApplicationStopRequest')) {
                    this._events.get('onApplicationStopRequest')(notification);
                  }
                });
                this._thunder.on(this.callsign, 'onApplicationStateRequest', notification => {
                  console.log('onApplicationStateRequest ' + JSON.stringify(notification));
                  if (this._events.has('onApplicationStateRequest')) {
                    this._events.get('onApplicationStateRequest')(notification);
                  }
                  
                });
                this._thunder.on(this.callsign, 'onActivationChanged', notification => {
                  console.log('onActivationChanged ' + JSON.stringify(notification));
                  if (this._events.has('onActivationChanged')) {
                    this._events.get('onActivationChanged')(notification);
                  }
                });
                resolve(true);
              } else {
                console.log('Xcast enabled failed');
              }
            })
            .catch(err => {
              console.error('Enabling failure', err);
              reject('Xcast enabling failed', err);
            });
        })
        .catch(err => {
          console.error('Activation failure', err);
          reject('Xcast activation failed', err);
        });
    });
  }

  /**
   *
   * @param {string} eventId
   * @param {function} callback
   * Function to register the events for the Xcast plugin.
   */
  registerEvent(eventId, callback) {
    this._events.set(eventId, callback);
  }

  /**
   * Function to deactivate the Xcast plugin.
   */
  deactivate() {
    this._events = new Map();
    this._thunder = null;
  }

  /**
   * Function to notify the state of the app.
   */
  onApplicationStateChanged(params) {
    return new Promise((resolve, reject) => {
      console.log('Notifying back' + JSON.stringify(params))
      this._thunder.call('org.rdk.Xcast', 'onApplicationStateChanged', params).then(result => {
        console.log(JSON.stringify(result));
        resolve(result);
      });
    });
  }

  static supportedApps() {
    var xcastApps = { AmazonInstantVideo: 'Amazon', YouTube: 'Cobalt', YouTubeKids: 'CobaltKids', YouTubeTV: 'CobaltTV', NetflixApp: 'Netflix' };
    return xcastApps;
  }
}
