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

import { Lightning, Registry, Router, Utils, Storage } from '@lightningjs/sdk'
import { CONFIG } from '../../Config/Config'
import BluetoothApi from '../../api/BluetoothApi'

export default class BluetoothScreen extends Lightning.Component {
    static _template() {
        return {
            w: 1920,
            h: 1080,
            rect: true,
            color: 0xff000000,
            Bluetooth: {
                x: 960,
                y: 270,
                Title: {
                    x: 0,
                    y: 0,
                    mountX: 0.5,
                    text: {
                        text: "Pairing Your Remote",
                        fontFace: CONFIG.language.font,
                        fontSize: 40,
                        textColor: CONFIG.theme.hex,
                        fontStyle: 'bold'
                    },
                },
                BorderTop: {
                    x: 0, y: 75, w: 1558, h: 3, rect: true, mountX: 0.5,
                },
                Info: {
                    x: 0,
                    y: 135,
                    mountX: 0.5,
                    text: {
                        text: "Please put the remote in pairing mode, scanning will start in a minute.",
                        fontFace: CONFIG.language.font,
                        fontSize: 25,
                    },
                    visible: true
                },
                Timer: {
                    x: 0,
                    y: 200,
                    mountX: 0.5,
                    text: {
                        text: "0:20",
                        fontFace: CONFIG.language.font,
                        fontSize: 80,
                    },
                    visible: true
                },
                Loader: {
                    x: 0,
                    y: 200,
                    mountX: 0.5,
                    w: 110,
                    h: 110,
                    zIndex: 2,
                    src: Utils.asset("images/settings/Loading.gif"),
                    visible: false
                },
                Buttons: {
                    Continue: {
                        x: 0, y: 210, w: 300, mountX: 0.5, h: 60, rect: true, color: 0xFFFFFFFF,
                        Title: {
                            x: 150,
                            y: 30,
                            mount: 0.5,
                            text: {
                                text: "Continue Setup",
                                fontFace: CONFIG.language.font,
                                fontSize: 22,
                                textColor: 0xFF000000,
                                fontStyle: 'bold'
                            },
                        },
                        visible: false
                    },
                },
                BorderBottom: {
                    x: 0, y: 350, w: 1558, h: 3, rect: true, mountX: 0.5,
                },
            }
        }
    }

    _init() {
      this.paired = false
      this.btApi = new BluetoothApi()
      this.btApi.activate().then((res) => {

        this.btApi.registerEvent('onConnectionChange', notification => {
          let btName = notification.name
          console.log(`onConnectionChange name = ${btName} connected = ${notification.connected}`)
          if (btName == 'B12' && notification.connected == true) {
              if (!this.paired){
                  this.paired = true
                  this.widgets.fail.notify({ title: btName, msg: 'CONNECTED' })
                  Router.focusWidget('Fail')
                  if (!Storage.get('setup')) {
                      Router.navigate('splash/language')
                  }
              }
          }
        })
        
        this.btApi.registerEvent('onDiscoveredDevice', () => {
          this.btApi.getDiscoveredDevices().then(result => {
            let discovered = result
            if (discovered.length > 0) {
              this.btApi.pair(discovered[0].deviceID)
            } else {
              console.log('onDiscoveredDevice err')
            }
          })
        })
        
        this.btApi.registerEvent('onPairingChange', () => {
          this.btApi.getPairedDevices().then(() => {
            let pairedDevices = this.btApi.pairedDevices
            if (pairedDevices.length > 0) {
              this.btApi.connect(pairedDevices[0].deviceID, pairedDevices[0].deviceType)
            } else {
              console.log('getPairedDevices err')
            }
          })
        })
      })
      .catch(err => {
        console.log(err)
      })
    }

    _focus() {
      if (this.paired) {
          Router.navigate('splash/language')
      } else {
          this.btApi.startScan()
          this.initTimer()
      }
    }

    pageTransition() {
        return 'left'
    }

    _unfocus() {
        if (this.timeInterval) {
            Registry.clearInterval(this.timeInterval)
        }
        this.tag('Timer').text.text = '0:20'
    }

    getTimeRemaining(endtime) {
        const total = Date.parse(endtime) - Date.parse(new Date())
        const seconds = Math.floor((total / 1000) % 60)
        return { total, seconds }
    }

    initTimer() {
        const endTime = new Date(Date.parse(new Date()) + 20000)
        const timerText = this.tag('Timer')
        this.timeInterval = Registry.setInterval(() => {
            const time = this.getTimeRemaining(endTime)
            if (time.seconds < 10) {              
              timerText.text.text = `0:0${time.seconds}`
            } else {
              timerText.text.text = `0:${time.seconds}`
            }
            if (time.total <= 0) {
                Registry.clearInterval(this.timeInterval)
                Router.navigate('splash/language')
            }
        }, 1000)
    }

    static _states() {
        return [
            class RemotePair extends this{
                $enter() {
                    this.tag('Timer').visible = true
                    this.tag('Info').text.text = 'Please put the remote in pairing mode, scanning will start in a minute.'
                }
                _handleRight() {
                    this._setState('Scanning')
                }
                $exit() {
                    this.tag('Timer').visible = false
                    this.tag('Info').text.text = ''
                }
            },
            class Scanning extends this{
                $enter() {
                    this.tag('Loader').visible = true
                    this.tag('Info').text.text = 'Scanning'
                }
                _handleRight() {
                    this._setState('PairComplete')
                }
                _handleLeft() {
                    this._setState('RemotePair')
                }
                $exit() {
                    this.tag('Loader').visible = false
                    this.tag('Info').text.text = ''
                }
            },
            class PairComplete extends this{
                $enter() {
                    this.tag('Buttons.Continue').visible = true
                    this.tag('Info').text.text = 'Pairing complete'
                }
                _handleLeft() {
                    this._setState('Scanning')
                }
                _handleRight() {
                    Router.navigate('splash/language')
                }
                $exit() {
                    this.tag('Buttons.Continue').visible = false
                    this.tag('Info').text.text = ''
                }
            }
        ]
    }

}