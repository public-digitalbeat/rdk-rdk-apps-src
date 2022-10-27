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
import ThunderJS from 'ThunderJS'
import XcastApi from './XcastApi'

import { Lightning, Router, Storage, Utils } from '@lightningjs/sdk'

var activatedWeb = false
var activatedLightning = false
var activatedCobalt = false
var activatedNetflix = false
var activatedAmazon = false
var webUrl = ''
var lightningUrl = ''
var activatedNative = false
var nativeUrl = ''
var cobaltUrl = ''
const config = {
  host: '127.0.0.1',
  port: 9998,
  default: 1,
}
var powerState = 'ON';
var thunder = ThunderJS(config)
/**
 * Class that contains functions which commuicates with thunder API's
 */
export default class AppApi {
  checkForInternet() {
    return new Promise((resolve, reject) => {
      let i = 0
      var poll = () => {
        i++
        this.getIP().then(result => {
          if (result == true) {
            resolve(result)
          } else if (i < 10) poll()
          else resolve(false)
        })
      }
      poll()
    })
  }

  /**
   * Function to launch Html app.
   * @param {String} url url of app.
   */
  getIP() {
    return new Promise((resolve, reject) => {
      const systemcCallsign = 'org.rdk.System'
      thunder.Controller.activate({ callsign: systemcCallsign })
        .then(() => {
          thunder
            .call(systemcCallsign, 'getDeviceInfo', { params: 'estb_ip' })
            .then(result => {
              resolve(result.success)
            })
            .catch(err => {
              resolve(false)
            })
        })
        .catch(err => {})
    })
  }
  getESN() {
    return new Promise((resolve, reject) => {
      const systemcCallsign = 'org.rdk.System'
      thunder.Controller.activate({ callsign: systemcCallsign })
        .then(() => {
          thunder
            .call(systemcCallsign, 'getDeviceInfo', { params: 'esn' })
            .then(result => {
              //console.log('getESN:', result.esn)
              resolve(result.esn)
            })
            .catch(err => {
              resolve(false)
            })
        })
        .catch(err => {})
    })
  }

   /**
   *  Function to get timeZone
   */
  getZone() {
    return new Promise((resolve, reject) => {
      const systemcCallsign = 'org.rdk.System'
      thunder.Controller.activate({ callsign: systemcCallsign })
      .then(() => {
      thunder
        .call(systemcCallsign, 'getTimeZoneDST')
        .then(result => {
          resolve(result.timeZone)
        }).catch(err => { resolve(false) })
        }).catch(err => {})
    })
  }
  /**
   * Function to get resolution of the display screen.
   */
  getResolution() {
    return new Promise((resolve, reject) => {
      const systemcCallsign = 'org.rdk.DisplaySettings'
      thunder.Controller.activate({ callsign: systemcCallsign })
        .then(() => {
          thunder
            .call(systemcCallsign, 'getCurrentResolution', { params: 'HDMI0' })
            .then(result => {
              resolve(result.resolution)
            })
            .catch(err => {
              resolve(false)
            })
        })
        .catch(err => {
          console.log('Display Error', err)
        })
    })
  }

  /**
   * Function to set the display resolution.
   */
  setResolution() {
    return new Promise((resolve, reject) => {
      const systemcCallsign = 'org.rdk.DisplaySettings'
      thunder.Controller.activate({ callsign: systemcCallsign })
        .then(() => {
          thunder
            .call(systemcCallsign, 'setCurrentResolution', {
              videoDisplay: 'HDMI0',
              resolution: '1080p',
              persist: true,
            })
            .then(result => {
              resolve(result.success)
            })
            .catch(err => {
              resolve(false)
            })
        })
        .catch(err => {
          console.log('Display Error', err)
        })
    })
  }

  /**
   * Function to launch Html app.
   * @param {String} url url of app.
   */
  launchWeb(url) {
    const childCallsign = 'HtmlApp'
    if (webUrl != url) {
      thunder
        .call('org.rdk.RDKShell', 'launch', {
          callsign: childCallsign,
          type: childCallsign,
          uri: url,
        })
        .then(() => {
          thunder.call('org.rdk.RDKShell', 'moveToFront', {
            client: childCallsign,
          })
          thunder.call('org.rdk.RDKShell', 'setFocus', {
            client: childCallsign,
          })
        })
        .catch(err => {})
    } else {
      thunder.call('org.rdk.RDKShell', 'moveToFront', {
        client: childCallsign,
      })
      thunder.call('org.rdk.RDKShell', 'setFocus', { client: childCallsign })
      console.log('org.rdk.RDKShell launch ' ,childCallsign)
    }
    webUrl = url
    activatedWeb = true
  }

  /**
   * Function to launch Lightning app.
   * @param {String} url url of app.
   */
  launchLightning(url) {
    const childCallsign = 'LightningApp'
    if (lightningUrl != url) {
      thunder
        .call('org.rdk.RDKShell', 'launch', {
          callsign: childCallsign,
          type: childCallsign,
          uri: url,
        })
        .then(() => {
          thunder.call('org.rdk.RDKShell', 'moveToFront', {
            client: childCallsign,
          })
          thunder.call('org.rdk.RDKShell', 'setFocus', {
            client: childCallsign,
          })
        })
        .catch(err => {})
    } else {
      thunder.call('org.rdk.RDKShell', 'moveToFront', {
        client: childCallsign,
      })
      thunder.call('org.rdk.RDKShell', 'setFocus', { client: childCallsign })
      console.log('org.rdk.RDKShell launch ' ,childCallsign)
    }
    lightningUrl = url
    activatedLightning = true
  }


  /**
   * Function to set Cobalt deeplink.
   * @param {String} callsign name of app.
   * @param {String} deeplink url of app.
   */
  setCobaltDeeplink(callsign, deeplink) {
    let appName = callsign + '.1';
    thunder.call(appName, 'deeplink', {
      "params": deeplink
    }).then(() => {
      console.log('set cobalt deeplink successfully appName= ' + appName + ' url= ' + deeplink);
    }).catch(err => {});
  }

  /**
   * Function to dial launch Cobalt app.
   * @param {String} callsign name of app.
   * @param {String} deeplink url of app.
   */
  dialLaunchCobalt(callsign, deeplink) {
    if ( deeplink.includes("loader=yts") && callsign != "Cobalt" ) {
      this.configureCobaltUrl(callsign, deeplink);
    }
    this.configureCobaltLaunchType(callsign, "launch=dial");

    thunder.call('org.rdk.RDKShell', 'launch', {
      callsign: callsign,
      type: callsign
    }).then(() => {
      this.setCobaltDeeplink(callsign, deeplink);
      thunder.call('org.rdk.RDKShell', 'moveToFront', {
        client: callsign
      });
      thunder.call('org.rdk.RDKShell', 'setFocus', {
        client: callsign
      });
      let params = {
        applicationName: callsign,
        state: 'running'
      };
      this.setAppState(params);
      this.setVisibility('ResidentApp', false);
      console.log('org.rdk.RDKShell launch ', callsign);
    }).catch(err => {});
    activatedCobalt = true;
  }

  /**
   * Function to launch Cobalt app.
   * @param {String} url url of app.
   */
  launchCobalt(callsign) {
    thunder
      .call('org.rdk.RDKShell', 'launch', {
        callsign: callsign,
        type: callsign,
      })
      .then(() => {
        thunder.call('org.rdk.RDKShell', 'moveToFront', {
          client: callsign,
        })
        thunder.call('org.rdk.RDKShell', 'setFocus', { client: callsign })
        let params = { applicationName: callsign, state: 'running' };
        this.setAppState(params);
        this.setVisibility('ResidentApp', false);
        console.log('org.rdk.RDKShell launch ' ,callsign)
      })
      .catch(err => {})
    activatedCobalt = true
  }

  /**
   * Function to resume Netflix/Amazon Prime app.
   */
  resumePremiumApp(childCallsign) {
    // const childCallsign = "Amazon"
    //let lconfig = ""
    //if (childCallsign=='Netflix')
     // lconfig = "querystring:source_type=22"

      thunder.call('org.rdk.RDKShell', 'moveToFront', { client: childCallsign });
      console.log('org.rdk.RDKShell resume moveToFront ' ,childCallsign)
      thunder.call('org.rdk.RDKShell', 'setFocus', { client: childCallsign });
      console.log('org.rdk.RDKShell resume setFocus' ,childCallsign)
  }

  /**
   * Function to launch Netflix/Amazon Prime app.
   */
  launchPremiumApp(childCallsign) {
    // const childCallsign = "Amazon"
    //let lconfig = ""
    //if (childCallsign=='Netflix')
     // lconfig = "querystring:source_type=22"

    thunder
      .call('org.rdk.RDKShell', 'launch', {
      callsign: childCallsign,
      type: childCallsign,
      suspend:false,
      
    })
    .then(() => {
      thunder.call('org.rdk.RDKShell', 'moveToFront', {
        client: childCallsign
      })
      thunder.call('org.rdk.RDKShell', 'setFocus', { client: childCallsign })
      let params = { applicationName: childCallsign, state: 'running' };
      this.setAppState(params);
      this.setVisibility('ResidentApp', false);
      console.log('org.rdk.RDKShell launch ' ,childCallsign)
    })
    .catch(err => {
        console.log('org.rdk.RDKShell launch ' + JSON.stringify(err))
      })
      
    childCallsign === 'Amazon' ? activatedAmazon = true : activatedNetflix = true
  }

  launchPremiumAppInBG(childCallsign) {
    
    thunder
      .call('org.rdk.RDKShell', 'launch', {
      callsign: childCallsign,
      type: childCallsign,
      suspend:true,
      })
    .then(() => {
      childCallsign === 'Amazon' ? activatedAmazon = true : activatedNetflix = true
      
      let params = { applicationName: childCallsign, state: 'suspended' };
      setAppState(params)
    })
    .catch(err => {
        console.log('org.rdk.RDKShell launch BG' + JSON.stringify(err))
      })
    
  }
  /**
   * Function to launch Resident app.
   * @param {String} url url of app.
   */
  launchResident(url) {
    const childCallsign = 'ResidentApp'
    thunder
      .call('org.rdk.RDKShell', 'launch', {
        callsign: childCallsign,
        type: childCallsign,
        uri: url,
      })
      .then(() => {
        thunder.call('org.rdk.RDKShell', 'moveToFront', {
          client: childCallsign,
        })
        thunder.call('org.rdk.RDKShell', 'setFocus', { client: childCallsign })
      })
      .catch(err => {
        console.log('org.rdk.RDKShell launch ' + JSON.stringify(err))
      })
  }

  /**
   * Function to suspend html app.
   */
  suspendWeb() {
    webUrl = ''
    thunder.call('org.rdk.RDKShell', 'suspend', { callsign: 'HtmlApp' })
  }

  /**
   * Function to suspend lightning app.
   */
  suspendLightning() {
    lightningUrl = ''
    thunder.call('org.rdk.RDKShell', 'suspend', { callsign: 'LightningApp' })
  }

  /**
   * Function to suspend cobalt app.
   */
  suspendCobalt(callsign) {
    thunder.call('org.rdk.RDKShell', 'suspend', { callsign: callsign })
  }

  /**
   * Function to suspend Netflix/Amazon Prime app.
   */
  suspendPremiumApp(appName) {
    thunder.call('org.rdk.RDKShell', 'suspend', { callsign: appName })
  }

  /**
   * Function to deactivate html app.
   */
  deactivateWeb() {
    thunder.call('org.rdk.RDKShell', 'destroy', { callsign: 'HtmlApp' })
    activatedWeb = false
    webUrl = ''
    this.stopDTV();
    this.stopIPTV();
  }

  /**
   * Function to deactivate cobalt app.
   */
  deactivateCobalt(callsign) {
    thunder.call('org.rdk.RDKShell', 'destroy', { callsign: callsign })
    activatedCobalt = false
    cobaltUrl = ''
  }

  /**
   * Function to deactivate Netflix/Amazon Prime app.
   */
    deactivateNativeApp(appName) {
      thunder.call('org.rdk.RDKShell', 'destroy', { callsign: appName })
      appName === 'Amazon' ? activatedAmazon = false : activatedNetflix = false
    }

  /**
   * Function to deactivate lightning app.
   */
  deactivateLightning() {
    thunder.call('org.rdk.RDKShell', 'destroy', { callsign: 'LightningApp' })
    activatedLightning = false
    lightningUrl = ''
  }

  /**
   * Function to set visibility to client apps.
   * @param {client} client client app.
   * @param {visible} visible value of visibility.
   */
  setVisibility(client, visible) {
    thunder.call('org.rdk.RDKShell', 'setVisibility', {
      client: client,
      visible: visible,
    })
  }

  /**
   * Function to resume App apps.
   * @param {client} client app.
   */
  appResume(childCallsign) {
    thunder.call(childCallsign, 'state', 'resumed').then(result => {
      console.log('resumed Success of : '+ childCallsign);
    })
    thunder.call('org.rdk.RDKShell', 'moveToFront', { client: childCallsign });
    console.log('org.rdk.RDKShell resume moveToFront ' ,childCallsign)
    thunder.call('org.rdk.RDKShell', 'setFocus', { client: childCallsign });
    console.log('org.rdk.RDKShell resume setFocus' ,childCallsign)
  }
  /**
   * Function to set the configuration of running premium apps.
   * @param {appName} Name of the application
   * @param {config_data} config_data configuration data
   */

  confRunningApplication(appName, config_data) {
    thunder.call(appName, 'systemcommand', {
      command: config_data,
    });
  }

  /**
  /**
   * Function to set the configuration of premium apps.
   * @param {appName} Name of the application
   * @param {config_data} config_data configuration data
   */

  configureApplication(appName, config_data) {
    let plugin = 'Controller';
    let method = 'configuration@'+appName;
    return new Promise((resolve, reject) => {
    thunder.call(plugin, method).then((res) => {
      res.querystring = config_data;
      thunder.call(plugin, method, res).then((resp) => {
        resolve(true);
      }).catch((err) => {
        resolve(true);
      })
    }).catch((err) => {
      reject(err);
    })
  })
  }


  /**
   * Function to config Cobalt url.
   * @param {String} appName.
   * @param {String} url.
   */
   configureCobaltUrl(appName, url) {
    let plugin = 'Controller';
    let method = 'configuration@' + appName;
    return new Promise((resolve, reject) => {
      thunder.call(plugin, method).then(res => {
        res.url = url;
        thunder.call(plugin, method, res).then(resp => {
          console.log('configureCobaltUrl ok ');
          resolve(true);
        }).catch(err => {
          console.log('configureCobaltUrl thunder.call failed');
          resolve(true);
        });
      }).catch(err => {
        console.log('configureCobaltUrl thunder.call failed');
        reject(err);
      });
    });
  }

  /**
   * Function to config Cobalt launchType.
   * @param {String} appName.
   * @param {String} launchType.
   */
  configureCobaltLaunchType(appName, launchType) {
    let plugin = 'Controller';
    let method = 'configuration@' + appName;
    return new Promise((resolve, reject) => {
      thunder.call(plugin, method).then(res => {
        res.launchtype = launchType;
        thunder.call(plugin, method, res).then(resp => {
          console.log('configureCobaltLaunchType ok ');
          resolve(true);
        }).catch(err => {
          console.log('configureCobaltLaunchType thunder.call failed');
          resolve(true);
        });
      }).catch(err => {
        console.log('configureCobaltLaunchType thunder.call failed');
        reject(err);
      });
    });
  }

  /**
   * Function to launch Native app.
   * @param {String} url url of app.
   */
  launchNative(url) {
    const childCallsign = 'testApp'
    if (nativeUrl != url) {
      thunder
        .call('org.rdk.RDKShell', 'launchApplication', {
          client: childCallsign,
          uri: url,
          mimeType: 'application/native'
        })
        .then(() => {
          thunder.call('org.rdk.RDKShell', 'moveToFront', {
            client: childCallsign,
          })
          thunder.call('org.rdk.RDKShell', 'setFocus', {
            client: childCallsign,
          })
        })
        .catch(err => {
          console.log('org.rdk.RDKShell launch ' + JSON.stringify(err))
        })
    } else {
      thunder.call('org.rdk.RDKShell', 'moveToFront', {
        client: childCallsign,
      })
      thunder.call('org.rdk.RDKShell', 'setFocus', { client: childCallsign })
    }
    nativeUrl = url
    activatedNative = true
  }



/**
   * Function to kill native app.
   */
  killNative() {
    thunder.call('org.rdk.RDKShell', 'kill', { callsign: 'testApp' })
    activatedNative = false
    nativeUrl = ''
  }

  static pluginStatus(plugin) {
    switch (plugin) {
      case 'WebApp':
        return activatedWeb
      case 'Cobalt':
        return activatedCobalt
      case 'Lightning':
        return activatedLightning
      case 'Amazon':
        return activatedAmazon
      case 'Netflix':
        return activatedNetflix
    }
  }

    standby(value) {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.System.1', 'setPowerState', { "powerState": value, "standbyReason": "Requested by user" })
        .then(result => {
          console.log("############ standby ##############" + value)
          console.log(JSON.stringify(result, 3, null))
          powerState=value
          resolve(result)
        })
        .catch(err => {
          resolve(false)
        })
    })
  }

    audio_mute(value,audio_source) {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.DisplaySettings.1', 'setMuted', { "audioPort": audio_source, "muted": value })
        .then(result => {
          console.log("############ audio_mute ############## value: " + value +" audio_source: "+audio_source)
          console.log(JSON.stringify(result, 3, null))
          resolve(result)
        })
        .catch(err => {
          console.log("audio mute error:", JSON.stringify(err, 3, null))
          resolve(false)
        })

    })
  }

    setVolumeLevel(value) {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.DisplaySettings.1', 'setVolumeLevel', { "audioPort": "HDMI0", "volumeLevel": value })
        .then(result => {
          console.log("############ setVolumeLevel ############" + value)
          console.log(JSON.stringify(result, 3, null))
          resolve(result)
        })
        .catch(err => {
          console.log("audio mute error:", JSON.stringify(err, 3, null))
          resolve(false)
        })

    })
  }

   getVolumeLevel() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.DisplaySettings.1', 'getVolumeLevel', { "audioPort": "HDMI0" })
        .then(result => {
          console.log("############ getVolumeLevel ############")
          console.log(JSON.stringify(result, 3, null))
          resolve(result)
        })
        .catch(err => {
          console.log("audio mute error:", JSON.stringify(err, 3, null))
          resolve(false)
        })

    })
  }

  async sendAppState(value) {
        const state= await thunder
        .call('org.rdk.RDKShell.1', 'getState', { })
        .then(result => result.state)
        this.state = state
          let params = { applicationName: value, state: 'stopped' };
          for (var i = 0; i < state.length; i++) {      
            if (state[i].callsign == value) {
              
              if (state[i].state == 'resumed') {
                params.state = 'running'
              } else if (state[i].state == 'suspended') {
                params.state = 'suspended'
              }else params.state = 'stopped'
              
            }
          }
          console.log('Notifying back to xcast' + JSON.stringify(params))
          const result = await thunder
          .call('org.rdk.Xcast', 'onApplicationStateChanged', params)
          .then(result => result.success)
         

  }
  setAppState(params) {
    
    console.log('setAppState:' + params.applicationName + ' : ' + params.state)
    Storage.set(params.applicationName, params.state)
    if (params.state == 'running')
      Storage.set('applicationType', params.applicationName)
    
    thunder
          .call('org.rdk.Xcast', 'onApplicationStateChanged', params)
          .then(result => result.success)
  }



  getConnectedAudioPorts() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.DisplaySettings.1', 'getConnectedAudioPorts', {})
        .then(result => {
          console.log("############ getConnectedAudioPorts ############")
          console.log(JSON.stringify(result, 3, null))
          resolve(result)
        })
        .catch(err => {
          console.log("audio mute error:", JSON.stringify(err, 3, null))
          resolve(false)
        })

    })
  }
  stopDTV(){
    return new Promise((resolve, reject) => {
      thunder
        .call('DTV.1', 'Invoke', { command: "Player.stop", json: [0, false]})
        .then(result => {
          console.log("stop DTV")
          console.log(JSON.stringify(result, 3, null))
          resolve(result)
        })
        .catch(err => {
          console.log("DTV stop error", JSON.stringify(err, 3, null))
          resolve(false)
        })

    }) 
  }
stopIPTV(){
    return new Promise((resolve, reject) => {
      thunder
        .call('IPTV.1', 'stop', { })
        .then(result => {
          console.log("stop IPTV")
          console.log(JSON.stringify(result, 3, null))
          resolve(result)
        })
        .catch(err => {
          console.log("IPTV stop error", JSON.stringify(err, 3, null))
          resolve(false)
        })

    }) 
  }

  deactivateChildApp(plugin) {
    console.log("deactivateChildApp:", plugin);
    switch (plugin) {
      case 'WebApp':
        this.deactivateWeb();
        break;
      case 'Cobalt':
      case 'CobaltTV':
      case 'CobaltKids':
        this.suspendCobalt(plugin);
        break;
      case 'Lightning':
        this.deactivateLightning();
        break;
      case 'Native':
        this.killNative();
        break;
      case 'Amazon':
        this.suspendPremiumApp('Amazon');
        break;
      case 'Netflix':
        this.suspendPremiumApp('Netflix');
        break;
      default:
        break;
    }
  }

  handleHotKey(key) {
    console.log('_handleHotKey'+ key.keyCode);
    console.log('application'+ Storage.get('applicationType'));
          
    if ((key.keyCode == 77 || key.keyCode == 36 || key.keyCode == 158) && !key.ctrlKey) {
            //this._hdmicec2.performOTP()
      if (Storage.get('applicationType') == 'WebApp') {
        Storage.set('applicationType', '');
        this.deactivateWeb();          
        this.setVisibility('ResidentApp', true);
      } else if (Storage.get('applicationType') == 'Lightning') {
        Storage.set('applicationType', '');
        this.deactivateLightning();
        this.setVisibility('ResidentApp', true);
      } else if (Storage.get('applicationType') == 'Native') {
        Storage.set('applicationType', '');
        this.killNative();
        this.setVisibility('ResidentApp', true);
      } else if (Storage.get('applicationType') == 'Amazon') {
        this.suspendPremiumApp('Amazon');
        Storage.set('applicationType', '');
        this.setVisibility('ResidentApp', true);
      } else if (Storage.get('applicationType') == 'Netflix') {
        this.suspendPremiumApp('Netflix');
        Storage.set('applicationType', '');
        this.setVisibility('ResidentApp', true);
      } else if (Storage.get('applicationType') == 'Cobalt') {
        this.suspendCobalt("Cobalt");
        Storage.set('applicationType', '');
        this.setVisibility('ResidentApp', true);
      }
      thunder.call('org.rdk.RDKShell', 'moveToFront', { client: 'ResidentApp' }).then(result => {
        console.log('ResidentApp moveToFront Success');
      });
      thunder.call('org.rdk.RDKShell', 'setFocus', { client: 'ResidentApp' }).then(result => {
        Storage.set('applicationType', '');
        console.log('ResidentApp setFocus Success')
      }).catch(err => {
        console.log('Error', err)
      })
      return true
    }else if (key.keyCode == 113 && Storage.get('applicationType') != 'Netflix') {
      this.deactivateChildApp(Storage.get('applicationType'));
     
      if (Storage.get('Netflix') == 'stopped') {
        let urlParam = 'source_type=1';
        if (powerState == 'DEEP_SLEEP') {
          urlParam = 'source_type=19';
        }
        this.configureApplication('Netflix', urlParam).then(() => {
          console.log("configureApplication done");
          this.launchPremiumApp('Netflix');
          Storage.set('launchSuspendedNetflix', false);
          
        }).catch((err) => {
          console.log('Error while configure Netflix, Err: ' + JSON.stringify(err));
        });
      } else {
        console.log('call confRunningApplication');
        if (powerState == 'DEEP_SLEEP') {
          this.confRunningApplication('Netflix', 'source_type=19');
        } else {
          this.confRunningApplication('Netflix', 'source_type=1');
        }
        this.launchPremiumApp('Netflix');
        Storage.set('launchSuspendedNetflix', false);
       
      }
      return true
    }else if (key.keyCode == 115 && Storage.get('applicationType') != 'Amazon') {
      Storage.set('AmazonKeyCode', 115);
      Storage.set('AmazonPluginKeyCode', 115);
      this.deactivateChildApp(Storage.get('applicationType'));
      this.launchPremiumApp('Amazon');
      Storage.set('launchSuspendedAmazon', false);
     
      return true
    } else if (key.keyCode == 112 && Storage.get('applicationType') != 'Cobalt') {
      Storage.set('CobaltKeyCode', 112);
      Storage.set('CobaltPluginKeyCode', 112);
      this.deactivateChildApp(Storage.get('applicationType'));
      this.launchCobalt("Cobalt");
     
      return true
    } else return false
        
  }
}

