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

export const WiFiState = {
  UNINSTALLED: 0,
  DISABLED: 1,
  DISCONNECTED: 2,
  PAIRING: 3,
  CONNECTING: 4,
  CONNECTED: 5,
  FAILED: 6,
}

export default class Wifi {
  constructor() {
    this._events = new Map()
  }

  /**
   * Function to activate the wifi plugin.
   */
  activate() {
    return new Promise((resolve, reject) => {
      const config = {
        host: '127.0.0.1',
        port: 9998,
        default: 1,
      }
      this._thunder = ThunderJS(config)
      this.callsign = 'org.rdk.Wifi'
      this._thunder
        .call('Controller', 'activate', { callsign: this.callsign })
        .then(result => {
          console.log('Wifi activated', result)

          this.getCurrentState().then(state => {
            if (state === WiFiState.DISABLED) {
              this.setEnabled(true)
            }
          })
          

          this._thunder.on(this.callsign, 'onWIFIStateChanged', notification => {
            console.log('onWIFIStateChanged: ' + notification.state)
            if (this._events.has('onWIFIStateChanged')) {
              this._events.get('onWIFIStateChanged')(notification)
            }
          })
          this._thunder.on('org.rdk.Network', 'onInterfaceStatusChanged', notification => {
            console.log('###### onInterfaceStatusChanged: ' + 'interface:'+ notification.interface + ' enabled:' + notification.enabled)
            if (this._events.has('onInterfaceStatusChanged')) {
              this._events.get('onInterfaceStatusChanged')(notification)
            }
          })
          this._thunder.on(this.callsign, 'onError', notification => {
            console.log('Error: ' + notification)
            if (this._events.has('onError')) {
              this._events.get('onError')(notification)
            }
          })

          this._thunder.on(this.callsign, 'onAvailableSSIDs', notification => {
            console.log('AvailableSSIDs: ' + JSON.stringify(notification))
            if (notification.moreData === false) {
              this.stopScan()
              notification.ssids = notification.ssids.filter(
                (item, pos) => notification.ssids.findIndex(e => e.ssid === item.ssid) === pos
              )
              if (this._events.has('onAvailableSSIDs')) {
                this._events.get('onAvailableSSIDs')(notification)
              }
            }
          })

          resolve(result)
        })
        .catch(err => {
          console.error(`Wifi activation failed: ${err}`)
          reject(err)
        })
    })
  }

  /**
   *Register events and event listeners.
   * @param {string} eventId
   * @param {function} callback
   *
   */
  registerEvent(eventId, callback) {
    this._events.set(eventId, callback)
  }

  /**
   * Deactivates wifi plugin.
   */
  deactivate() {
    this._events = new Map()
    this._thunder = null
  }

  /**
   * Returns connected SSIDs
   */
  getConnectedSSID() {
    return new Promise((resolve, reject) => {
      this._thunder
        .call(this.callsign, 'getConnectedSSID')
        .then(result => {
          console.log('ConnectedSSID: ' + result.ssid)
          resolve(result)
        })
        .catch(err => {
          console.error(`getConnectedSSID fail: ${err}`)
          reject(err)
        })
    })
  }

  /**
   * Start scanning for available wifi.
   */
  discoverSSIDs() {
    return new Promise((resolve, reject) => {
      this._thunder
        .call(this.callsign, 'startScan', { incremental: false, ssid: '', frequency: '' })
        .then(result => {
          console.log('startScan success')
          resolve(result)
        })
        .catch(err => {
          console.error(`startScan fail: ${err}`)
          reject(err)
        })
    })
  }

  /**
   * Stops scanning for networks.
   */
  stopScan() {
    return new Promise((resolve, reject) => {
      this._thunder
        .call(this.callsign, 'stopScan')
        .then(result => {
          console.log('stopScan success')
          resolve(result)
        })
        .catch(err => {
          console.error(`stopScan fail: ${err}`)
          reject(err)
        })
    })
  }

  /**
   * Function to connect to an SSID
   * @param {object} device
   * @param {string} passphrase
   */
  connect(device, passphrase) {
    return new Promise((resolve, reject) => {
      this.disconnect().then(() => {
        console.log(`connect SSID ${device.ssid}`)
        setTimeout(() => {
        this._thunder
          .call(this.callsign, 'connect', {
            ssid: device.ssid,
            passphrase: passphrase,
            securityMode: device.security,
          })
          .then(result => {
            console.log(`connected SSID ${device.ssid}`)
            //this.saveSSID(device,passphrase)
            resolve(result)
          })
          .catch(err => {
            console.error(`Connection failed: ${err}`)
            reject(err)
          })
        },2000)
      }, reject)
    })
  }

  //use already saved n/w details in wpa_supplicant
  connect_last() {
    return new Promise((resolve, reject) => {
      this.getCurrentState().then(state => {
        if (state === WiFiState.DISCONNECTED) {
          console.log(`connect last SSID `)
          this.isPaired().then(mresult => {
            if (mresult.result == 0) {
              this._thunder
              .call(this.callsign, 'connect', {})
              .then(result => {
                console.log(`reconnected SSID `)
               resolve(result)
              })
              .catch(err => {
                console.error(`Connection failed: ${err}`)
                reject(err)
              })
            }
          }, reject)
        }
      }, reject)
    })
  }

  saveSSID(device, passphrase) {
    return new Promise((resolve, reject) => {
      
        console.log(`save SSID ${device.ssid}`)
        this._thunder
          .call(this.callsign, 'saveSSID', {
            ssid: device.ssid,
            passphrase: passphrase,
            securityMode: device.security,
          })
          .then(result => {
            console.log(`saved SSID ${device.ssid}`)
            resolve(result)
          })
          .catch(err => {
            console.error(`save failed: ${err}`)
            reject(err)
          })
      
    })
  }
  clearSSID() {
    return new Promise((resolve, reject) => {
      
        console.log(`clear SSID ${device.ssid}`)
        this._thunder
          .call(this.callsign, 'clearSSID', {})
          .then(result => {
            console.log(`clear SSID ${device.ssid}`)
            resolve(result)
          })
          .catch(err => {
            console.error(`clear failed: ${err}`)
            reject(err)
          })
      
    })
  }

  isPaired() {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'isPaired', {}).then(
        result => {
          console.log('WiFi ispaired: ' + JSON.stringify(result))
          resolve(result)
        },
        err => {
          console.error(`Can't check paired: ${err}`)
          reject(err)
        }
      )
    })
  }
  /**
   * Function to disconnect from the SSID.
   */
  disconnect() {
    return new Promise((resolve, reject) => {
      this._thunder.call(this.callsign, 'disconnect', {}).then(
        result => {
          console.log('WiFi disconnected: ' + JSON.stringify(result))
          resolve(result)
        },
        err => {
          console.error(`Can't disconnect WiFi: ${err}`)
          reject(err)
        }
      )
    })
  }

  /**
   * Returns current state of the Wi-Fi plugin.
   */
  getCurrentState() {
    return new Promise((resolve, reject) => {
      this._thunder
        .call(this.callsign, 'getCurrentState')
        .then(result => {
          console.log(`WiFi state: ${result.state}`)
          resolve(result.state)
        })
        .catch(err => {
          console.error(`Can't get WiFi state: ${err}`)
          reject(err)
        })
    })
  }

  /**
   * Enables/Disables the Wi-Fi.
   * @param {bool} bool
   */
  setEnabled(bool) {
    return new Promise((resolve, reject) => {
      this._thunder
        .call(this.callsign, 'setEnabled', { enable: bool })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  /**
   * Function to get paired SSID.
   */
  getPaired() {
    return new Promise((resolve, reject) => {
      this._thunder
        .call(this.callsign, 'getPairedSSID', {})
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error(`Can't get paired: ${err}`)
          reject(err)
        })
    })
  }
  getDefaultInterface() {
    return new Promise((resolve, reject) => {
      this._thunder
        .call('org.rdk.Network', 'getDefaultInterface', {})
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          reject(err)
        })
    })
  }
  setInterface(inter, bool) {
    return new Promise((resolve, reject) => {
      this._thunder
        .call('org.rdk.Network', 'setInterfaceEnabled', {
          interface: inter,
          persist: true,
          enabled: bool,
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          reject(err)
        })
    })
  }
  setDefaultInterface(interfaceName, bool) {
    return new Promise((resolve, reject) => {
      this._thunder
        .call('org.rdk.Network', 'setDefaultInterface', {
          interface: interfaceName,
          persist: bool,
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          reject(err)
        })
    })
  }
}
