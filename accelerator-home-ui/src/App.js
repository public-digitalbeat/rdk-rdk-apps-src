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
import routes from './routes/routes';
import AppApi from '../src/api/AppApi.js';
import XcastApi from '../src/api/XcastApi';
import { CONFIG, availableLanguages } from './Config/Config';
import Keymap from './Config/Keymap';
import Menu from './views/Menu'
import Failscreen from './screens/FailScreen';
import { keyIntercept } from './keyIntercept/keyIntercept';
import HDMIApi from './api/HDMIApi';
import CompositeApi from './api/CompositeApi';

const config = {
  host: '127.0.0.1',
  port: 9998,
  default: 1,
};
var powerState = 'ON';
var thunder = ThunderJS(config);
var appApi = new AppApi();


export default class App extends Router.App {
  static getFonts() {
    return [{ family: CONFIG.language.font, url: Utils.asset('fonts/' + CONFIG.language.fontSrc) }];
  }
  _setup() {
    Router.startRouter(routes, this);
    document.onkeydown = e => {
      if (e.keyCode == Keymap.Backspace) {
        e.preventDefault();
      }
    };
  }

  static _template() {
    return {
      Pages: {
        // this hosts all the pages
        forceZIndexContext: true
      },
      Widgets: {
        Menu: {
          type: Menu
        },
        Fail: {
          type: Failscreen,
        }
      }
    }
  }

  static language() {
    return {
      file: Utils.asset('language/language-file.json'),
      language: CONFIG.language.id
    }
  }

  _captureKey(key) {
    console.log(key)

    if (/*key.keyCode == Keymap.Escape ||*/ key.keyCode == Keymap.Home || key.keyCode === Keymap.m) {
      if (Storage.get('applicationType') != '') {
        if (Storage.get('applicationType') == 'WebApp' && 
          ((appApi.getWebUrl() == 'http://127.0.0.1:50050/asperitas-iptv/index.html') ||
          (appApi.getWebUrl() == 'http://127.0.0.1:50050/asperitas-dvb/index.html'))) {
          var aspUrl = appApi.getWebUrl();
          appApi.suspendWeb();
          if (aspUrl == 'http://127.0.0.1:50050/asperitas-dvb/index.html') {
            appApi.stopDTV();
          }
        } else {
          this.deactivateChildApp(Storage.get('applicationType'));
        }
        Storage.set('applicationType', '');
        appApi.setVisibility('ResidentApp', true);
        thunder.call('org.rdk.RDKShell', 'moveToFront', {
          client: 'ResidentApp'
        }).then(result => {
          console.log('ResidentApp moveToFront Success');
        });
        thunder
          .call('org.rdk.RDKShell', 'setFocus', {
            client: 'ResidentApp'
          })
          .then(result => {
            console.log('ResidentApp moveToFront Success');
          })
          .catch(err => {
            console.log('Error', err);
          });
      } else {
        if (!Router.isNavigating()) {
          Router.navigate('menu');
        }
      }
      return true

    }else if (key.keyCode == Keymap.YoutubeHotKey && Storage.get('applicationType') != 'Cobalt') {
      Storage.set('CobaltKeyCode', Keymap.YoutubeHotKey);
      Storage.set('CobaltPluginKeyCode', Keymap.YoutubeHotKey);
      this.deactivateChildApp(Storage.get('applicationType'));
      appApi.launchCobalt("Cobalt");
      Storage.set('applicationType', 'Cobalt');
      return true;
    } else if (key.keyCode == Keymap.NetflixHotKey) {
      //TODO:
      /*if(Storage.get('applicationType') != 'Netflix') {
        //LaunchFreshNetflixwith correct IID
      }else{
        //Resume Netflix with correct IID
      }*/
      this.deactivateChildApp(Storage.get('applicationType'));
      appApi.launchPremiumApp('Netflix');
      Storage.set('applicationType', 'Netflix');
      return true;
    } else if (key.keyCode == Keymap.AmazonHotKey && Storage.get('applicationType') != 'Amazon') {
      Storage.set('AmazonKeyCode', Keymap.AmazonHotKey);
      Storage.set('AmazonPluginKeyCode', Keymap.AmazonHotKey);
      this.deactivateChildApp(Storage.get('applicationType'));
      appApi.launchPremiumApp('Amazon');
      Storage.set('applicationType', 'Amazon');
      Storage.set('launchSuspendedAmazon', false);
      return true;
    }

    if (key.keyCode == Keymap.Settings_Shortcut) {
      Router.navigate('settings')
      return true
    }
    if (key.keyCode == Keymap.Guide_Shortcut) {
      Router.navigate('epg')
      return true
    }
    if (key.keyCode == Keymap.Amazon) {
      this.activateChildApp('Amazon')
      return true
    }
    if (key.keyCode == Keymap.Youtube) {
      Storage.set('applicationType', 'Cobalt');
      appApi.launchCobalt('Cobalt', '')
      appApi.setVisibility('ResidentApp', false);
      return true
    }
    if (key.keyCode == Keymap.Netflix) {
      this.activateChildApp('Netflix')
      return true
    }

    if (key.keyCode == Keymap.Power) {
      // Remote power key and keyboard F1 key used for STANDBY and POWER_ON
      if (powerState == 'ON') {
        this.standby('STANDBY');
        return true
      } else if (powerState == 'STANDBY') {
        appApi.standby("ON").then(res => {
          powerState = 'ON';
        })
        return true
      }

    } else if (key.keyCode == 228) {

      console.log("___________DEEP_SLEEP_______________________F12")
      appApi.standby("DEEP_SLEEP").then(res => {
        powerState = 'DEEP_SLEEP'
      })
      return true

    } else if (key.keyCode == Keymap.AudioVolumeMute) {
      if (appApi.activatedForeground) {
        appApi.setVisibility("foreground", true)
        appApi.zorder('foreground')
      } else {
        console.log("___MUTE_____"+ this.audioPort)
            appApi.muteStatus(this.audioPort).then(res1 => {
              console.log("___MUTE_____" + this.audioPort + " " + res1.muted)
            appApi.audio_mute( !res1.muted, this.audioPort)
            })
      }     
      return true

    } else if (key.keyCode == Keymap.AudioVolumeUp) {
      if (appApi.activatedForeground) {
        appApi.setVisibility("foreground", true)
        appApi.zorder('foreground')
      } else {
        console.log("___VOLUP_____"+ this.audioPort)
        appApi.getVolumeLevel(this.audioPort).then(res1 => {
          this.volume = parseInt(res1.volumeLevel);
          if(this.volume < 100) {
            this.volume += 10;
            console.log("___VOLUP_____" + this.audioPort + "   " + this.volume)
            appApi.setVolumeLevel(this.audioPort, this.volume)
          }

        });
      }
      return true

    } else if (key.keyCode == Keymap.AudioVolumeDown) {
      if (appApi.activatedForeground) {
        appApi.setVisibility("foreground", true)
        appApi.zorder('foreground')
      } else {
        console.log("___VOLDOWN_____"+ this.audioPort)
        appApi.getVolumeLevel(this.audioPort).then(res1 => {
          this.volume = parseInt(res1.volumeLevel);
          if(this.volume) {
            this.volume -= 10;
            console.log("___VOLUP_____" + this.audioPort + "   " + this.volume)
            appApi.setVolumeLevel(this.audioPort, this.volume)
          }
        });
      }
      return true
    }
    return false
  }

  _init() {
    appApi.enableDisplaySettings().then(res => {
      this.audioPort = 'HDMI0'
      appApi.getConnectedAudioPorts().then(res1 => {
        console.log("connected ports:" + res1)
        this.audioPort = res1.connectedAudioPorts[0];
      }); 
    })
    appApi.cobaltStateChangeEvent()
    //appApi.launchforeground()
    this.xcastApi = new XcastApi();
    this.xcastApi.activate().then(result => {
      if (result) {
        this.registerXcastListeners()
      }
    })
    this.audioPort = 'HDMI0'
    appApi.getConnectedAudioPorts().then(res => {
      console.log("connected ports:" + res)
      this.audioPort = res.connectedAudioPorts[0];
    }); 
    keyIntercept()
    if (!availableLanguages.includes(localStorage.getItem('Language'))) {
      localStorage.setItem('Language', 'English')
    }
	
    
    thunder.on('Controller.1', 'all', noti => {
      if (noti.data.url && noti.data.url.slice(-5) === "#boot") { // to exit metro apps by pressing back key
        this.deactivateChildApp(Storage.get('applicationType'));
        Storage.set('applicationType', '');
        appApi.setVisibility('ResidentApp', true);
        thunder.call('org.rdk.RDKShell', 'moveToFront', {
          client: 'ResidentApp'
        }).then(result => {
          console.log('ResidentApp moveToFront Success');
        });
        thunder
          .call('org.rdk.RDKShell', 'setFocus', {
            client: 'ResidentApp'
          })
          .then(result => {
            console.log('ResidentApp moveToFront Success');
          })
          .catch(err => {
            console.log('Error', err);
          });
      }
    })

    thunder.on('Controller', 'statechange', notification => {
      console.log(JSON.stringify(notification))
      if (notification && (notification.callsign === 'Cobalt' || notification.callsign === 'Amazon' || notification.callsign === 'LightningApp' || notification.callsign === 'Netflix') && notification.state == 'Deactivation') {

        Storage.set('applicationType', '');
        appApi.setVisibility('ResidentApp', true);
        thunder.call('org.rdk.RDKShell', 'moveToFront', { client: 'ResidentApp' }).then(result => {
          console.log('ResidentApp moveToFront Success' + JSON.stringify(result));
        });
        thunder
          .call('org.rdk.RDKShell', 'setFocus', { client: 'ResidentApp' })
          .then(result => {
            console.log('ResidentApp setFocus Success' + JSON.stringify(result));
          })
          .catch(err => {
            console.log('Error', err);
          });
      }
      if (notification && (notification.callsign === 'org.rdk.HdmiCec_2' && notification.state === 'Activated')) {
        this.advanceScreen = Router.activePage()
        if (typeof this.advanceScreen.performOTPAction === 'function') {
          console.log('otp action')
          this.advanceScreen.performOTPAction()
        }
      }
    });


  }

  activateChildApp(plugin) {
    fetch('http://127.0.0.1:9998/Service/Controller/')
      .then(res => res.json())
      .then(data => {
        data.plugins.forEach(element => {
          if (element.callsign === plugin) {
            Storage.set('applicationType', plugin);
            appApi.launchPremiumApp(plugin);
            appApi.setVisibility('ResidentApp', false);
          }
        });
        console.log('launching app')
      })
      .catch(err => {
        console.log(`${plugin} not available`, err)
      })
  }

  deactivateChildApp(plugin) {
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
        break;
      case 'Netflix':
        appApi.suspendPremiumApp('Netflix')
        break;
      case 'HDMI':
        new HDMIApi().stopHDMIInput()
        break;
      case 'Composite':
        new CompositeApi().stopCompositeInput()
        break;        
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
        if (applicationName == 'Amazon' && Storage.get('applicationType') != 'Amazon') {
          this.deactivateChildApp(Storage.get('applicationType'));
          appApi.launchPremiumApp('Amazon');
          Storage.set('applicationType', 'Amazon');
          appApi.setVisibility('ResidentApp', false);
          let params = { applicationName: notification.applicationName, state: 'running' };
          this.xcastApi.onApplicationStateChanged(params);
        } else if (applicationName == 'Netflix' && Storage.get('applicationType') != 'Netflix') {
          appApi.configureApplication('Netflix', notification.parameters).then((res) => {
            this.deactivateChildApp(Storage.get('applicationType'));
            appApi.launchPremiumApp('Netflix');
            Storage.set('applicationType', 'Netflix');
            appApi.setVisibility('ResidentApp', false);
            if (AppApi.pluginStatus('Netflix')) {
              let params = { applicationName: notification.applicationName, state: 'running' };
              this.xcastApi.onApplicationStateChanged(params);
            }
          }).catch((err) => {
            console.log('Error while launching ' + applicationName + ', Err: ' + JSON.stringify(err));
          });
        } else if (applicationName == 'Cobalt' || applicationName == 'CobaltTV' || applicationName == 'CobaltKids') {
          thunder.call('Controller', 'status@' + applicationName)
          .then(result => {
            appApi.setVisibility('ResidentApp', false);
            Storage.set('applicationType', 'Cobalt');
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
        if (applicationName === 'Amazon' && Storage.get('applicationType') === 'Amazon') {
          appApi.suspendPremiumApp('Amazon');
          let params = { applicationName: notification.applicationName, state: 'stopped' };
          this.xcastApi.onApplicationStateChanged(params);
        } else if (applicationName === 'Netflix' && Storage.get('applicationType') === 'Netflix') {
          appApi.suspendPremiumApp('Netflix');
          let params = { applicationName: notification.applicationName, state: 'stopped' };
          this.xcastApi.onApplicationStateChanged(params);
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
          Storage.set('applicationType', 'Amazon');
          appApi.setVisibility('ResidentApp', false);
          let params = { applicationName: notification.applicationName, state: 'running' };
          this.xcastApi.onApplicationStateChanged(params);
        } else if (applicationName == 'Netflix' && Storage.get('applicationType') != 'Netflix') {
          this.deactivateChildApp(Storage.get('applicationType'));
          appApi.launchPremiumApp('Netflix');
          Storage.set('applicationType', 'Amazon');
          appApi.setVisibility('ResidentApp', false);
          let params = { applicationName: notification.applicationName, state: 'running' };
          this.xcastApi.onApplicationStateChanged(params);
        } else if (applicationName == 'Cobalt' && Storage.get('applicationType') != 'Cobalt') {
          this.deactivateChildApp(Storage.get('applicationType'));
          appApi.launchCobalt('Cobalt');
          Storage.set('applicationType', 'Cobalt');
          appApi.setVisibility('ResidentApp', false);
          let params = { applicationName: notification.applicationName, state: 'running' };
          this.xcastApi.onApplicationStateChanged(params);
        }
      }
    });
    this.xcastApi.registerEvent('onApplicationStopRequest', notification => {
      console.log('Received a stop request ' + JSON.stringify(notification));
      if (this.xcastApps(notification.applicationName)) {
        console.log('Stop ' + this.xcastApps(notification.applicationName));
        let applicationName = this.xcastApps(notification.applicationName);
        if (applicationName === 'Amazon' && Storage.get('applicationType') === 'Amazon') {
          appApi.deactivateNativeApp('Amazon');
          Storage.set('applicationType', '');
          appApi.setVisibility('ResidentApp', true);
          thunder.call('org.rdk.RDKShell', 'moveToFront', { client: 'ResidentApp' }).then(result => {
            console.log('ResidentApp moveToFront Success');
          });
          let params = { applicationName: notification.applicationName, state: 'stopped' };
          this.xcastApi.onApplicationStateChanged(params);
        } else if (applicationName === 'Netflix' && Storage.get('applicationType') === 'Netflix') {
          appApi.deactivateNativeApp('Netflix');
          Storage.set('applicationType', '');
          appApi.setVisibility('ResidentApp', true);
          thunder.call('org.rdk.RDKShell', 'moveToFront', { client: 'ResidentApp' }).then(result => {
            console.log('ResidentApp moveToFront Success');
          });
          let params = { applicationName: notification.applicationName, state: 'stopped' };
          this.xcastApi.onApplicationStateChanged(params);
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
      //console.log('Received a state request ' + JSON.stringify(notification));
      if (this.xcastApps(notification.applicationName)) {
        let applicationName = this.xcastApps(notification.applicationName);
        let params = { applicationName: notification.applicationName, state: 'stopped' };
        appApi.registerEvent('statechange', results => {
          if (results.callsign === applicationName && results.state === 'Activated') {
            params.state = 'running'
          }
          this.xcastApi.onApplicationStateChanged(params);
          console.log('State of ' + this.xcastApps(notification.applicationName))
        })

      }
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


  $mountEventConstructor(fun) {
    this.ListenerConstructor = fun;
    console.log(`MountEventConstructor was initialized`)
    // console.log(`listener constructor was set t0 = ${this.ListenerConstructor}`);
  }

  $registerUsbMount() {
    this.disposableListener = this.ListenerConstructor();
    console.log(`Successfully registered the usb Mount`)
  }

  $deRegisterUsbMount() {
    console.log(`the current usbListener = ${this.disposableListener}`)
    this.disposableListener.dispose();
    console.log(`successfully deregistered usb listener`);
  }


  standby(value) {
    console.log(`standby call`);
    if (value == 'Back') {
    } else {
      if (powerState == 'ON') {
        console.log(`Power state was on trying to set it to standby`);
        appApi.standby(value).then(res => {

          if (res.success) {
            console.log(`successfully set to standby`);
            powerState = 'STANDBY'
            if (Storage.get('applicationType') == 'WebApp' && Storage.get('ipAddress')) {
              Storage.set('applicationType', '');
              // appApi.deactivateWeb();
              appApi.suspendWeb()
              appApi.setVisibility('ResidentApp', true);
            } else if (Storage.get('applicationType') == 'Lightning' && Storage.get('ipAddress')) {
              Storage.set('applicationType', '');
              // appApi.deactivateLightning();
              appApi.suspendLightning()
              appApi.setVisibility('ResidentApp', true);
            } else if (Storage.get('applicationType') == 'Native' && Storage.get('ipAddress')) {
              Storage.set('applicationType', '');
              appApi.killNative();
              appApi.setVisibility('ResidentApp', true);
            } else if (Storage.get('applicationType') == 'Amazon') {
              Storage.set('applicationType', '');
              appApi.suspendPremiumApp('Amazon');
              appApi.setVisibility('ResidentApp', true);
            } else if (Storage.get('applicationType') == 'Netflix') {
              Storage.set('applicationType', '');
              appApi.suspendPremiumApp('Netflix');
              appApi.setVisibility('ResidentApp', true);
            } else if (Storage.get('applicationType') == 'Cobalt') {
              Storage.set('applicationType', '');
              appApi.suspendCobalt("Cobalt");
              appApi.setVisibility('ResidentApp', true);
            } else {
              if ((!Router.isNavigating()) && Router.getActiveHash() === 'player') {
                Router.navigate('menu')
              }
            }

            thunder.call('org.rdk.RDKShell', 'moveToFront', {
              client: 'ResidentApp'
            }).then(result => {
              console.log('ResidentApp moveToFront Success' + JSON.stringify(result));
            }).catch(err => {
              console.log(`error while moving the resident app to front = ${err}`)
            });
            thunder.call('org.rdk.RDKShell', 'setFocus', {
              client: 'ResidentApp'
            }).then(result => {
              console.log('ResidentApp setFocus Success' + JSON.stringify(result));
            }).catch(err => {
              console.log('Error', err);
            });
          }

        })
        return true
      }
    }
  }

  $registerInactivityMonitoringEvents() {
    return new Promise((resolve, reject) => {
      console.log(`registered inactivity listener`);
      appApi.standby('ON').then(res => {
        if (res.success) {
          powerState = 'ON'
        }
      })

      const systemcCallsign = "org.rdk.RDKShell.1";
      thunder.Controller.activate({
        callsign: systemcCallsign
      })
        .then(res => {
          console.log(`activated the rdk shell plugin trying to set the inactivity listener; res = ${JSON.stringify(res)}`);
          thunder.on("org.rdk.RDKShell.1", "onUserInactivity", notification => {
            console.log(`user was inactive`);
            if (powerState === "ON" && Storage.get('applicationType') == '') {
              this.standby("STANDBY");
            }
          }, err => {
            console.error(`error while inactivity monitoring , ${err}`)
          })
          resolve(res)
        }).catch((err) => {
          reject(err)
          console.error(`error while activating the displaysettings plugin; err = ${err}`)
        })

    })

  }

  $resetSleepTimer(t) {
    console.log(`reset sleep timer call ${t}`);
    var arr = t.split(" ");

    function setTimer() {
      console.log('Timer ', arr)
      var temp = arr[1].substring(0, 1);
      if (temp === 'H') {
        let temp1 = parseFloat(arr[0]) * 60;
        appApi.setInactivityInterval(temp1).then(res => {
          Storage.set('TimeoutInterval', t)
          console.log(`successfully set the timer to ${t} hours`)
        }).catch(err => {
          console.error(`error while setting the timer`)
        });
      } else if (temp === 'M') {
        console.log(`minutes`);
        let temp1 = parseFloat(arr[0]);
        appApi.setInactivityInterval(temp1).then(res => {
          Storage.set('TimeoutInterval', t)
          console.log(`successfully set the timer to ${t} minutes`);
        }).catch(err => {
          console.error(`error while setting the timer`)
        });
      }
    }

    if (arr.length < 2) {
      appApi.enabledisableinactivityReporting(false).then(res => {
        if (res.success === true) {
          Storage.set('TimeoutInterval', false)
          console.log(`Disabled inactivity reporting`);
          // this.timerIsOff = true;
        }
      }).catch(err => {
        console.error(`error : unable to set the reset; error = ${err}`)
      });
    } else {
      appApi.enabledisableinactivityReporting(true).then(res => {
        if (res.success === true) {
          console.log(`Enabled inactivity reporting; trying to set the timer to ${t}`);
          // this.timerIsOff = false;
          setTimer();
        }
      }).catch(err => { console.error(`error while enabling inactivity reporting`) });
    }
  }
}
