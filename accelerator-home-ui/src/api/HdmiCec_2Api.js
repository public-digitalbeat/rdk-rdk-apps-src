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
/**
 * Class for hdmi thunder plugin apis.
 */

export default class HdmiCec_2Api {
  constructor() {
    console.log('HdmiCec_2 constructor')
 
    const config = {
      host: '127.0.0.1',
      port: 9998,
      default: 1,
    }
    this._thunder = ThunderJS(config)
    this.callsign = 'org.rdk.HdmiCec_2'
    this._enabled = false
  }

  /**
   * Function to activate the hdmiplugin
   */
  activate() {
    return new Promise((resolve, reject) => {
     
      this._thunder
        .call('Controller', 'activate', { callsign: this.callsign })
        .then(result => {
          console.log('HdmiCec_2 activated', result)
          
           resolve('HdmiCec_2 activated')
        })
        .catch(err => {
          console.error('Activation failure', err)
          reject('HdmiCec_2 activation failed', err)
        })
    })
  }

  /**
   *
   * @param {string} eventId
   * @param {function} callback
   * Function to register the events for the HdmiCec2 plugin.
   */
  registerEvent(eventId, callback) {
    
  }

  /**
   * Function to deactivate the HdmiCec2 plugin.
   */
  deactivate() {
    this._thunder
    .call('Controller', 'deactivate', { callsign: this.callsign })
    .then(result => {
      console.log('HdmiCec_2 deactivated', result)
      
      resolve('HdmiCec_2 deactivated')
    })
    .catch(err => {
      console.error('deActivation failure', err)
      reject('HdmiCec_2 deactivation failed', err)
    })

    this._thunder = null
  }

 
 

  /**
   * Function returns if enable.
   */
  getEnabled() {
    return new Promise((resolve, reject) => {
      this._thunder
        .call('org.rdk.HdmiCec_2', 'getEnabled')
        .then(result => {
          console.log(JSON.stringify(result))
          this._enabled = result.enabled
          resolve(result.enabled)
        })
        .catch(err => {
          console.error(`Can't getenabled  : ${err}`)
          reject()
        })
    })
  }
 
  get enablestatus() {
    return this._enabled
  }

  getOSDName() {
    return new Promise((resolve, reject) => {
      this._thunder
        .call('org.rdk.HdmiCec_2', 'getOSDName')
        .then(result => {
          console.log(JSON.stringify(result))
          
          resolve(result.name)
        })
        .catch(err => {
          console.error(`Can't getosdname  : ${err}`)
          reject()
        })
    })
  }
  getOTPEnabled() {
    return new Promise((resolve, reject) => {
      this._thunder
        .call('org.rdk.HdmiCec_2', 'getOTPEnabled')
        .then(result => {
          console.log(JSON.stringify(result))
          
          resolve(result.enabled)
        })
        .catch(err => {
          console.error(`Can't getOTPenabled  : ${err}`)
          reject()
        })
    })
  }
  getVendorID() {
    return new Promise((resolve, reject) => {
      this._thunder
        .call('org.rdk.HdmiCec_2', 'getVendorId')
        .then(result => {
          console.log(JSON.stringify(result))
          
          resolve(result.vendorid)
        })
        .catch(err => {
          console.error(`Can't getvendorid  : ${err}`)
          reject()
        })
    })
  }
  performOTP() {
    return new Promise((resolve, reject) => {
      this._thunder
        .call('org.rdk.HdmiCec_2', 'performOTPAction')
        .then(result => {
          console.log('wakeup TV : ' + result.success)
          if (result.success) resolve()
          else reject()
        })
        .catch(err => {
          console.error('Error', err)
          reject()
        })
    })
  }
  setEnabled(cecenabled) {
    return new Promise((resolve, reject) => {
     
      this._thunder
        .call('org.rdk.HdmiCec_2', 'setEnabled', {
          enabled: cecenabled,
        })
        .then(result => {
          console.log('hdmicec_2 setenabled : ' + result.success)
          resolve(result.success)
        })
        .catch(err => {
          console.error('hdmicec_2 setenable failed', err)
          reject()
        })
    })
  }
  setOTPEnabled(otpenabled) {
    return new Promise((resolve, reject) => {
     
      this._thunder
        .call('org.rdk.HdmiCec_2', 'setOTPEnabled', {
          enabled: otpenabled,
        })
        .then(result => {
          console.log('hdmicec_2 OTP enabled : ' + result.success)
          resolve(result.success)
        })
        .catch(err => {
          console.error('hdmicec_2 OTP enable failed', err)
          reject()
        })
    })
  }

  setOSDName(osdname) {
    return new Promise((resolve, reject) => {
     
      this._thunder
        .call('org.rdk.HdmiCec_2', 'setOSDName', {
          name: osdname,
        })
        .then(result => {
          console.log('hdmicec_2 set osdname : ' + result.success)
          resolve(result.success)
        })
        .catch(err => {
          console.error('hdmicec_2 set osdname failed', err)
          reject()
        })
    })
  }

  setVendorId(vid) {
    return new Promise((resolve, reject) => {
     
      this._thunder
        .call('org.rdk.HdmiCec_2', 'setVendorId', {
          vendorid: vid,
        })
        .then(result => {
          console.log('hdmicec_2 set vendorid : ' + result.success)
          resolve(result.success)
        })
        .catch(err => {
          console.error('hdmicec_2 set vendorid failed', err)
          reject()
        })
    })
  }

}