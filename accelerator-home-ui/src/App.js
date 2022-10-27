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
import { Utils, Router, Storage } from '@lightningjs/sdk';
import ThunderJS from 'ThunderJS';
import routes from './api/routes';
import AppApi from '../src/api/AppApi.js';
import XcastApi from '../src/api/XcastApi';
import HdmiCec_2Api from '../src/api/HdmiCec_2Api'

const config = {
  host: '127.0.0.1',
  port: 9998,
  default: 1,
};
var thunder = ThunderJS(config);
var appApi = new AppApi();

export default class App extends Router.App {
  static getFonts() {
    return [{ family: 'MS-Regular', url: Utils.asset('fonts/Montserrat/Montserrat-Regular.ttf') },
    { family: 'MS-Light', url: Utils.asset('fonts/Montserrat/Montserrat-Light.ttf') }];
  }
  _setup() {
    Router.startRouter(routes, this);
    document.onkeydown = e => {
      if (e.keyCode == 8) {
        e.preventDefault();
      }
    };
  }

  _init() {
    let params = { applicationName: 'Netflix', state: 'stopped' };
    appApi.setAppState(params)
    params.applicationName = 'Amazon'
    appApi.setAppState(params)
    params.applicationName = 'Cobalt'
    appApi.setAppState(params)
    Storage.set('applicationType', '');
    
    this.xcastApi = new XcastApi();
    this.xcastApi.activate().then(result => {
      if (result) {
        this.registerXcastListeners()
      }
    })
    this._hdmicec2 = new HdmiCec_2Api()
    var thunder = ThunderJS(config);
    const rdkshellCallsign = 'org.rdk.RDKShell';
    thunder.Controller.activate({ callsign: rdkshellCallsign })
      .then(result => {
        console.log('Successfully activated RDK Shell');
      })
      .catch(err => {
        console.log('Error', err);
      })
      .then(result => {
        thunder.call('org.rdk.RDKShell', 'setFocus', { client: 'ResidentApp' });
      })
      .catch(err => {
        console.log('Error', err);
      })
      .then(result => {
	      thunder.on(rdkshellCallsign, 'onSuspended', notification => {
		      if (notification  && (notification.client == 'Cobalt' || notification.client == 'Amazon' || notification.client == 'Netflix' )) {
			      console.log('onSuspended notification: ' + notification.client );
            //only for netflix branch. remove for trunk
            if ((notification.client == 'Netflix') &&(Storage.get('applicationType') == 'Netflix') ) {
               if( (Storage.get('Cobalt') == 'running') || (Storage.get('Cobalt') == 'resumed')   ||
                  (Storage.get('Amazon') == 'running') || (Storage.get('Amazon') == 'resumed') ||
                  (Storage.get('AmazonKeyCode') == 115 ) || (Storage.get('CobaltKeyCode') == 112 ) ) {
                  console.log('onSuspended notification for Netflix but other App is in front ');
               } else {
                 appApi.setVisibility('ResidentApp', true);
                 Storage.set('applicationType', '');
                 thunder.call('org.rdk.RDKShell', 'moveToFront', { client: 'ResidentApp' }).then(result => {
                  console.log('ResidentApp moveToFront Success');
                });
                thunder.call('org.rdk.RDKShell', 'setFocus', { client: 'ResidentApp' }).then(result => {
                  console.log('ResidentApp setFocus Success');
                });
               }
               Storage.set('AmazonKeyCode', '');
               Storage.set('CobaltKeyCode', '');
            }
            let params = { applicationName: notification.client, state: 'suspended' };
            appApi.setAppState(params)
          }
      })
      //new version rdkshell. special case need to handle exit button from netflix. all other cases, we get onsuspended
      thunder.on(rdkshellCallsign, 'onPluginSuspended', notification => {
            if (notification  && ( notification.client == 'Netflix' )) {
	      console.log('onPluginSuspended notification: ' + notification.client );
              if (Storage.get('Netflix') != 'suspended') {
                if(Storage.get('AmazonPluginKeyCode') == 115 || (Storage.get('CobaltPluginKeyCode') == 112 ) ) {
                  console.log('onPluginSuspended notification for Netflix while other App hot key is pressed ');
                } else {
                  Storage.set('applicationType', '');
                  appApi.setVisibility('ResidentApp', true);
                  thunder.call('org.rdk.RDKShell', 'moveToFront', { client: 'ResidentApp' }).then(result => {
                    console.log('ResidentApp moveToFront Success');
                  });
                  thunder.call('org.rdk.RDKShell', 'setFocus', { client: 'ResidentApp' }).then(result => {
                    Storage.set('applicationType', '');
                    console.log('ResidentApp setFocus Success');
                  });
                }
                Storage.set('AmazonPluginKeyCode', '');
                Storage.set('CobaltPluginKeyCode', '');
                let params = { applicationName: notification.client, state: 'suspended' };
                appApi.setAppState(params)
              }
            }
	 })
      })
      .catch(err => {
        console.log('Error', err);
      })
      .then(result => {
        thunder
          .call(rdkshellCallsign, 'addKeyIntercept', {
            client: 'ResidentApp',
            keyCode: 27,
            modifiers: [],
          })
          .then(result => {
            console.log('addKeyIntercept success');
          })
          .catch(err => {
            console.log('Error', err);
          });
      })
      .catch(err => {
        console.log('Error', err);
      })
      .then(result => {
        thunder
          .call(rdkshellCallsign, 'addKeyIntercept', {
            client: 'ResidentApp',
            keyCode: 112,
            modifiers: [],
          })
          .then(result => {
            console.log('addKeyIntercept success');
          })
          .catch(err => {
            console.log('Error', err);
          });
      })
      .catch(err => {
        console.log('Error', err);
      })
      .then(result => {
        thunder
          .call(rdkshellCallsign, 'addKeyIntercept', {
            client: 'ResidentApp',
            keyCode: 116,
            modifiers: [],
          })
          .then(result => {
            console.log('addKeyIntercept success');
          })
          .catch(err => {
            console.log('Error', err);
          });
      })
      .catch(err => {
        console.log('Error', err);
      })
      .then(result => {
        thunder
          .call(rdkshellCallsign, 'addKeyIntercept', {
            client: 'ResidentApp',
            keyCode: 173,
            modifiers: [],
          })
          .then(result => {
            console.log('addKeyIntercept success');
          })
          .catch(err => {
            console.log('Error', err);
          });
      })
      .catch(err => {
        console.log('Error', err);
      })
      .then(result => {
        thunder
          .call(rdkshellCallsign, 'addKeyIntercept', {
            client: 'ResidentApp',
            keyCode: 175,
            modifiers: [],
          })
          .then(result => {
            console.log('addKeyIntercept success');
          })
          .catch(err => {
            console.log('Error', err);
          });
      })
      .catch(err => {
        console.log('Error', err);
      })
      .then(result => {
        thunder
          .call(rdkshellCallsign, 'addKeyIntercept', {
            client: 'ResidentApp',
            keyCode: 174,
            modifiers: [],
          })
          .then(result => {
            console.log('addKeyIntercept success');
          })
          .catch(err => {
            console.log('Error', err);
          });
      })
      .catch(err => {
        console.log('Error', err);
      })
      .then(result => {
        thunder
          .call(rdkshellCallsign, 'addKeyIntercept', {
            client: 'ResidentApp',
            keyCode: 113,
            modifiers: [],
          })
          .then(result => {
            console.log('addKeyIntercept success');
          })
          .catch(err => {
            console.log('Error', err);
          });
      })
      .catch(err => {
        console.log('Error', err);
      })
	.then(result => {
        thunder
          .call(rdkshellCallsign, 'addKeyIntercept', {
            client: 'ResidentApp',
            keyCode: 142,
            modifiers: [],
          })
          .then(result => {
            console.log('addKeyIntercept success');
          })
          .catch(err => {
            console.log('Error', err);
          });
      })
      .catch(err => {
        console.log('Error', err);
      })
      .then(result => {
        thunder
          .call(rdkshellCallsign, 'addKeyIntercept', {
            client: 'ResidentApp',
            keyCode: 77,
            modifiers: [],
          })
          .then(result => {
            console.log('addKeyIntercept success');
          })
          .catch(err => {
            console.log('Error', err);
          });
      })
      .catch(err => {
        console.log('Error', err);
      })
      .then(result => {
        thunder
          .call(rdkshellCallsign, 'addKeyIntercept', {
            client: 'ResidentApp',
            keyCode: 36,
            modifiers: [],
          })
          .then(result => {
            console.log('addKeyIntercept success');
          })
          .catch(err => {
            console.log('Error', err);
          });
      })
      .catch(err => {
        console.log('Error', err);
      })
     
      .then(result => {
        thunder
          .call(rdkshellCallsign, 'addKeyIntercept', {
            client: 'ResidentApp',
            keyCode: 158,
            modifiers: [],
          })
          .then(result => {
            console.log('addKeyIntercept success');
          })
          .catch(err => {
            console.log('Error', err);
          });
      })
      .catch(err => {
        console.log('Error', err);
      })
      .then(result => {
        thunder
          .call(rdkshellCallsign, 'addKeyIntercept', {
            client: 'ResidentApp',
            keyCode: 115,
            modifiers: [],
          })
          .then(result => {
            console.log('addKeyIntercept success');
          })
          .catch(err => {
            console.log('Error', err);
          });
      })
      .catch(err => {
        console.log('Error', err);
      })
      .then(result => {
        thunder
          .call(rdkshellCallsign, 'addKeyIntercept', {
            client: 'ResidentApp',
            keyCode: 114,
            modifiers: [],
          })
          .then(result => {
            console.log('addKeyIntercept success');
          })
          .catch(err => {
            console.log('Error', err);
          });
      })
      .catch(err => {
        console.log('Error', err);
      });
	  thunder.call('org.rdk.HdcpProfile', 'getHDCPStatus').then(result=>{
		  if (result.HDCPStatus.isConnected == true)
		  {
			let params = { client: 'residentapp' };
			thunder.call(rdkshellCallsign, 'getBounds', params).then(result => {
				  console.log("residentapp bounds: " + result.bounds.w + " " + result.bounds.h );
				  if (result.bounds.w == '720') {
					  let params = { client: 'residentapp', x: 0, y: 0, w: 1920, h: 1080 };
					  console.log("residentapp reset bounds call " );
					  thunder.call(rdkshellCallsign, 'setBounds', params).then(result => {
						  console.log("residentapp reset bounds " );
						  let params = { w: 1920, h: 1080 };
						  thunder.call(rdkshellCallsign, 'setScreenResolution', params).then(result => {
							  console.log("residentapp reset screen resolution " );
							  location.reload(true);
						  })

					  })

				  }

			  })
		  
		  }
	  })
	  thunder.on('org.rdk.HdcpProfile', 'onDisplayConnectionChanged', notification => {
		  if (notification) {
			  console.log("hdmi hotplug. connected:" + notification.HDCPStatus.isConnected);

			  let params = { client: 'residentapp' };
			  thunder.call(rdkshellCallsign, 'getBounds', params).then(result => {
				  console.log("residentapp bounds: " + result.bounds.w + " " + result.bounds.h );
				  if ((result.bounds.w == '720') && (notification.HDCPStatus.isConnected == true)) {
					  let params = { client: 'residentapp', x: 0, y: 0, w: 1920, h: 1080 };
					  console.log("residentapp reset bounds call " );
					  thunder.call(rdkshellCallsign, 'setBounds', params).then(result => {
						  console.log("residentapp reset bounds " );
					  	let params = { w: 1920, h: 1080 };
					  	thunder.call(rdkshellCallsign, 'setScreenResolution', params).then(result => {
						  console.log("residentapp reset screen resolution " );
						  location.reload(true);
						})

					  })

				  }
			  })
				  .catch(err => {
					  console.log('Error', err);
				  })

		  }
	  });

	  
  }

  deactivateChildApp(plugin) {
    var appApi = new AppApi();
    console.log("deactivateChildApp:", plugin);
    switch (plugin) {
      case 'WebApp':
        appApi.deactivateWeb();
        break;
      case 'Cobalt':
      case 'CobaltTV':
      case 'CobaltKids':
        appApi.suspendCobalt(plugin);
        break;
      case 'Lightning':
        appApi.deactivateLightning();
        break;
      case 'Native':
        appApi.killNative();
        break;
      case 'Amazon':
        appApi.suspendPremiumApp('Amazon');
      case 'Netflix':
        appApi.suspendPremiumApp('Netflix');
      default:
        break;
    }
  }

  /**
   * Function to register event listeners for Xcast plugin.
   */
  registerXcastListeners() {
    this.xcastApi.registerEvent('onApplicationLaunchRequest', notification => {
      console.log('Received a launch request ' + JSON.stringify(notification));
      if (this.xcastApps(notification.applicationName)) {
        let applicationName = this.xcastApps(notification.applicationName);
        console.log('Launch ' + this.xcastApps(notification.applicationName));
        if (applicationName == 'Amazon' && Storage.get('applicationType') != 'Amazon') {
          this.deactivateChildApp(Storage.get('applicationType'));
          appApi.launchPremiumApp('Amazon');
          Storage.set('launchSuspendedAmazon', false);
          
        } else if (applicationName == 'Netflix' && Storage.get('applicationType') != 'Netflix') {
            console.log('Dial launch Netflix, pluginUrl = ' + JSON.stringify(notification.parameters["pluginUrl"]));
            this.deactivateChildApp(Storage.get('applicationType'));
            
            if (Storage.get('Netflix') == 'stopped') {
              appApi.configureApplication('Netflix', notification.parameters["pluginUrl"]).then(() => {
                appApi.launchPremiumApp('Netflix'); //Storage.set('applicationType', 'Netflix');
                Storage.set('launchSuspendedNetflix', false);

              }).catch(err => {
                console.log('Error while launching ' + applicationName + ', Err: ' + JSON.stringify(err));
              });
            } else {
              appApi.confRunningApplication('Netflix', notification.parameters["pluginUrl"]);
              appApi.launchPremiumApp('Netflix');
              Storage.set('launchSuspendedNetflix', false);
             
            }
        } else if (applicationName == 'Cobalt' || applicationName == 'CobaltTV' || applicationName == 'CobaltKids') {    
          thunder.call('Controller', 'status@' + applicationName)
          .then(result => {
            let state = result[0].state;
            if (state == 'suspended') {
              appApi.launchCobalt(applicationName);
              appApi.setCobaltDeeplink(applicationName, notification.parameters["url"]);
            } else if (state == 'deactivated') {
              this.deactivateChildApp(Storage.get('applicationType'));
              appApi.dialLaunchCobalt(applicationName, notification.parameters["url"]);
            } else if (state == 'resumed')
              appApi.setCobaltDeeplink(applicationName, notification.parameters["url"]);
          }).catch(e => console.log("dial launch cobalt error: " + e));
          let params = {
            applicationName: notification.applicationName,
            state: 'running'
          };
          appApi.setAppState(params);
          params = {
            applicationName: applicationName,
            state: 'running'
          };
          appApi.setAppState(params);
        }
      }
    });
    this.xcastApi.registerEvent('onApplicationHideRequest', notification => {
      console.log('Received a hide request ' + JSON.stringify(notification));
      if (this.xcastApps(notification.applicationName)) {
        let applicationName = this.xcastApps(notification.applicationName);
        console.log('Hide ' + this.xcastApps(notification.applicationName));
        if (applicationName === 'Amazon' && Storage.get('applicationType') == 'Amazon') {
          appApi.suspendPremiumApp('Amazon');
          let params = { applicationName: notification.applicationName, state: 'suspended' };
          appApi.setAppState(params)
         
        } else if (applicationName === 'Netflix' && Storage.get('applicationType') == 'Netflix') {
          appApi.suspendPremiumApp('Netflix');
          let params = { applicationName: notification.applicationName, state: 'suspended' };
          appApi.setAppState(params)
         
        } else if ((applicationName === 'Cobalt' && Storage.get('applicationType') == 'Cobalt') ||
                   (applicationName === 'CobaltTV' && Storage.get('applicationType') == 'CobaltTV') ||
                   (applicationName === 'CobaltKids' && Storage.get('applicationType') == 'CobaltKids')) {
          appApi.suspendCobalt(applicationName);
          let params = {
            applicationName: notification.applicationName,
            state: 'suspended'
          };
          appApi.setAppState(params);
          params = {
            applicationName: applicationName,
            state: 'suspended'
          };
          appApi.setAppState(params);
        }

        Storage.set('applicationType', '');
        appApi.setVisibility('ResidentApp', true);
        thunder.call('org.rdk.RDKShell', 'moveToFront', { client: 'ResidentApp' }).then(result => {
          console.log('ResidentApp moveToFront Success');
        });
        thunder.call('org.rdk.RDKShell', 'setFocus', { client: 'ResidentApp' }).then(result => {
          Storage.set('applicationType', '');
            console.log('ResidentApp setFocus Success');
          });
      }
    });
    this.xcastApi.registerEvent('onApplicationResumeRequest', notification => {
      console.log('Received a resume request ' + JSON.stringify(notification));
      if (this.xcastApps(notification.applicationName)) {
        let applicationName = this.xcastApps(notification.applicationName);
        console.log('Resume ' + this.xcastApps(notification.applicationName));
        if (applicationName == 'Amazon' && Storage.get('applicationType') != 'Amazon') {
          this.deactivateChildApp(Storage.get('applicationType'));
          appApi.launchPremiumApp('Amazon');
          Storage.set('launchSuspendedAmazon', false);
          
        } else if (applicationName == 'Netflix' && Storage.get('applicationType') != 'Netflix') {
          appApi.deactivateChildApp(Storage.get('applicationType'));
          
          console.log('state of Netflix while dial call for resume: ' + params.state );
          appApi.launchPremiumApp('Netflix');
          Storage.set('launchSuspendedNetflix', false);
            
        } else if ((applicationName == 'Cobalt' && Storage.get('applicationType') != 'Cobalt') ||
                   (applicationName == 'CobaltTV' && Storage.get('applicationType') != 'CobaltTV') ||
                   (applicationName == 'CobaltKids' && Storage.get('applicationType') != 'CobaltKids')) {
          this.deactivateChildApp(Storage.get('applicationType'));
          appApi.launchCobalt(applicationName);
          let params = {
            applicationName: notification.applicationName,
            state: 'running'
          };
          appApi.setAppState(params);
          params = {
            applicationName: applicationName,
            state: 'running'
          };
          appApi.setAppState(params);
        }
      }
    });
    this.xcastApi.registerEvent('onApplicationStopRequest', notification => {
      console.log('Received a stop request ' + JSON.stringify(notification));
      if (this.xcastApps(notification.applicationName)) {
        console.log('Stop ' + this.xcastApps(notification.applicationName));
        let applicationName = this.xcastApps(notification.applicationName);
        if (applicationName === 'Amazon' && Storage.get('applicationType') == 'Amazon') {
          appApi.deactivateNativeApp('Amazon');
          Storage.set('applicationType', '');
          appApi.setVisibility('ResidentApp', true);
          thunder.call('org.rdk.RDKShell', 'moveToFront', { client: 'ResidentApp' }).then(result => {
            console.log('ResidentApp moveToFront Success');
          });
          let params = { applicationName: notification.applicationName, state: 'stopped' };
          appApi.setAppState(params)
          
        } else if (applicationName == 'Netflix' ) {
          appApi.deactivateNativeApp('Netflix');
          if (Storage.get('applicationType') === 'Netflix') {
            Storage.set('applicationType', '');
            appApi.setVisibility('ResidentApp', true);
            thunder.call('org.rdk.RDKShell', 'moveToFront', { client: 'ResidentApp' }).then(result => {
              console.log('ResidentApp moveToFront Success');
            });
          }
          let params = { applicationName: notification.applicationName, state: 'stopped' };
          appApi.setAppState(params)
          
        } else if ((applicationName == 'Cobalt') ||
                   (applicationName == 'CobaltTV' ) ||
                   (applicationName == 'CobaltKids' )) {
          appApi.deactivateCobalt(applicationName);
          Storage.set('applicationType', '');
          appApi.setVisibility('ResidentApp', true);
          thunder.call('org.rdk.RDKShell', 'moveToFront', {
          client: 'ResidentApp'
          }).then(result => {
          console.log('ResidentApp moveToFront Success');
          });
          let params = {
          applicationName: notification.applicationName,
          state: 'stopped'
          };
          appApi.setAppState(params);
          params = {
            applicationName: applicationName,
            state: 'stopped'
          };
          appApi.setAppState(params);

        }
      }
    });
    this.xcastApi.registerEvent('onApplicationStateRequest', notification => {
      console.log('Received a state request ' + JSON.stringify(notification));
      if (this.xcastApps(notification.applicationName)) {
        let appName = this.xcastApps(notification.applicationName);
        let params = { applicationName: notification.applicationName, state: Storage.get(appName) };
        this.xcastApi.onApplicationStateChanged(params)
        
      }
    });
    this.xcastApi.registerEvent('onActivationChanged', notification => {
      console.log('Received activationChange ' + JSON.stringify(notification));
    
    });
  }

  /**
   * Function to get the plugin name for the application name.
   * @param {string} app App instance.
   */
  xcastApps(app) {
    if (Object.keys(XcastApi.supportedApps()).includes(app)) {
      return XcastApi.supportedApps()[app];
    } else return false;
  }


}

