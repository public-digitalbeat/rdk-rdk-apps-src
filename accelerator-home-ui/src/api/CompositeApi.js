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
/**
  * Class for Composite thunder plugin apis.
 */
export default class CompositeApi {
    constructor() {
        const config = {
            host: '127.0.0.1',
            port: 9998,
            default: 1,
        };
        this._thunder = ThunderJS(config);
        this._events = new Map();
        this.callsign = 'org.rdk.CompositeInput.1'
    }

    activate() {
        return new Promise((resolve, reject) => {
            this._thunder
                .call('Controller', 'activate', { callsign: this.callsign })
                .then(result => {
                    console.log('Activated CompositeInput plugin')
                    this._thunder.on(this.callsign, 'onDevicesChanged', notification => {
                        if (this._events.has('onDevicesChanged')) {
                            this._events.get('onDevicesChanged')(notification)
                        }
                    })
                    this._thunder.on(this.callsign, 'onInputStatusChanged', notification => {
                        if (this._events.has('onInputStatusChanged')) {
                            this._events.get('onInputStatusChanged')(notification)
                        }
                    })
                    this._thunder.on(this.callsign, 'onSignalChanged', notification => {
                        if (this._events.has('onSignalChanged')) {
                            this._events.get('onSignalChanged')(notification)
                        }
                    })
                    if (result === null)
                        resolve(true)
                    else
                        resolve(false)
                })
                .catch(err => {
                    console.log('Failed to activate Composite Input plugin', err)
                    reject(false)
                })
        })
    }

    getCompositeInputDevices() {
        return new Promise((resolve, reject) => {
            this._thunder
                .call(this.callsign, 'getCompositeInputDevices')
                .then(result => {
                    resolve(result.devices)
                })
                .catch(err => {
                    resolve([])
                })
        })
    }
/*
    checkStatus(plugin) {
        return new Promise((resolve, reject) => {
            this._thunder.call('Controller.1', 'status@' + plugin)
                .then(res => {
                    console.log(res)
                })
        })
    }

    getWidth() {
        return new Promise((resolve, reject) => {
            this._thunder
                .call('DisplayInfo', 'width')
                .then(result => {
                    resolve(result)
                })
                .catch(err => {
                    resolve('1920')
                })
        })
    }

    getHeight() {
        return new Promise((resolve, reject) => {
            this._thunder
                .call('DisplayInfo', 'height')
                .then(result => {
                    resolve(result)
                })
                .catch(err => {
                    resolve('1080')
                })
        })
    }
*/
    setVideoRectangle(rectDetails) {
        console.log(`Set video rectangle x = ${rectDetails.x}, y = ${rectDetails.y},
            w = ${rectDetails.w}, h = ${rectDetails.h},`)

        return new Promise((resolve, reject) => {
            this._thunder
                .call(this.callsign, 'setVideoRectangle', { x : rectDetails.x, y : rectDetails.y,
                                            w: rectDetails.w, h : rectDetails.h})
                .then(result => {
                    resolve(result.success)
                })
                .catch(err => {
                        reject(err)
                })
        })
        
    }

    startCompositeInput(port) {
        console.log('port id = ' + port)
        return new Promise((resolve, reject) => {
            this._thunder
                .call(this.callsign, 'startCompositeInput', { portId : port})
                .then(result => {
                    resolve(result)
                })
                .catch(err => {
                    reject(err)
                })
        })
    }
    
    stopCompositeInput() {      
        return new Promise((resolve, reject) => {
            this._thunder
                .call(this.callsign, 'stopCompositeInput' )
                .then(result => {
                    resolve(result.success)
                })
                .catch(err => {
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
}
