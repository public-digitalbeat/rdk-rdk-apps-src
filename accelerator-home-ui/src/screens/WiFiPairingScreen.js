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
import { Lightning, Utils } from '@lightningjs/sdk'
import { COLORS } from '../colors/Colors'
import SettingsItem from './../items/SettingsItem'
import WiFiPasswordScreen from './wifipasswordscreen/WiFiPasswordScreen'
import ThunderJS from 'ThunderJS'
const config = {
  host: '127.0.0.1',
  port: 9998,
  default: 1,
}

var thunder = ThunderJS(config)

export default class BluetoothPairingScreen extends Lightning.Component {
  static _template() {
    return {
      PairingScreen: {
        x: 0,
        y: 0,
        w: 1920 / 3,
        h: 1080,
        rect: true,
        color: 0xff364651,
      },
      Title: {
        x: 20,
        y: 100,
        text: { text: '', fontSize: 36, textColor: COLORS.titleColor },
      },
      List: {
        x: 20,
        y: 200,
        type: Lightning.components.ListComponent,
        w: 1920 / 3,
        h: 400,
        itemSize: 65,
        horizontal: false,
        invertDirection: true,
        roll: true,
      },
      Password: {
        type: WiFiPasswordScreen,
        x: 1920 / 3 / 2,
        y: 350,
        mountX: 0.5,
        w: 428,
        h: 56,
        alpha: 0,
      },
    }
  }
  
  set item(item) {
    this.tag('Title').text = item.ssid
    var options = []
    this._item = item
    if (item.connected) {
      options = ['Disconnect', 'Cancel']
    } else {
      options = ['Connect', 'Cancel']
    }

    this.tag('List').items = options.map((item, index) => {
      return {
        ref: item,
        w: 1920 / 3,
        h: 65,
        type: SettingsItem,
        item: item,
      }
    })
    this._setState('Pair')
  }
  getPaired() {
    return new Promise((resolve, reject) => {
      thunder
        .call('org.rdk.Wifi', 'getPairedSSID', {})
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          console.error(`Can't get paired: ${err}`)
          reject(err)
        })
    })
  }
  static _states() {
    return [
      class Password extends this {
        $enter() {
          this.tag('Password').alpha = 1
        }
        _getFocused() {
          return this.tag('Password')
        }
        $password(password) {
          this.fireAncestors('$startConnect', password)
        }
        $exit() {
          this.tag('Password').alpha = 0
        }
        _handleKey(event) {
          if (
            event.keyCode == 27 ||
            event.keyCode == 77 ||
            event.keyCode == 49 ||
            event.keyCode == 158
          ) {
            this._setState('Pair')
          } else return false
        }
      },
      class Pair extends this {
        $enter() { }
        _getFocused() {
          return this.tag('List').element
        }
        _handleDown() {
          this.tag('List').setNext()
        }
        _handleUp() {
          this.tag('List').setPrevious()
        }
        _handleEnter() {
          if (this.tag('List').element.ref == 'Connect' && this._item.security != '0') {
            this.getPaired().then(result => {
              console.log("connect to already paired: "+ result.ssid + " and " + this._item.ssid )
              if (result.ssid == this._item.ssid) {
                this.fireAncestors('$pressEnter', this.tag('List').element.ref)
              }
              else {
                this._setState('Password')
              }
            })
            //this._setState('Password')
          } else {
            this.fireAncestors('$pressEnter', this.tag('List').element.ref)
          }
        }
      },
    ]
  }
}
