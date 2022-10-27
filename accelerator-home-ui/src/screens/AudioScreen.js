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
import { COLORS } from './../colors/Colors'
import AppApi from './../api/AppApi'
import AudioOutputScreen from './AudioOutputScreen'
import BButton from './../items/BButton'

import ThunderJS from 'ThunderJS'
const configAS = {
  host: '127.0.0.1',
  port: 9998,
  default: 1,
}
var thunderAS = ThunderJS(configAS)

export default class AudioScreen extends Lightning.Component {
  static _template() {
    return {
      SoundModeInfo: {
        x: 825,
        y: 310,
        text: {
          fontFace: 'MS-Regular',
          text: 'Sound Mode: ',
          textColor: COLORS.textColor,
          fontSize: 34,
        },
      },
      SoundMode: {
        x: 1530,
        y: 300,
        type: BButton,
        data: {
            title: 'Change',
        },
        x_text: 30,
        y_text: 20,
      },
      OutputScreen: {
        x: 1920 - 1920 / 3,
        y: 0,
        w: 1920 / 3,
        h: 1080,
        visible: false,
        type: AudioOutputScreen,
      },
    }
  }

  
  _init() {
    this._setState('SoundMode')
  }
  _active() {
    this.getSoundMode()
    this._setState('SoundMode')
  }
  _enable() {
    this._setState('SoundMode')
  }
  static _states() {
    return [
      class SoundMode extends this {
        $enter() {}
        $exit() {}
        _handleDown() {}
        _handleLeft() {
          this.fireAncestors('$goToSideMenubar', 5)
        }
        _getFocused() {
          return this.tag('SoundMode')
        }
        _handleEnter() {
          this.tag('OutputScreen').visible = true
          this._setState('OutputScreen')
        }
      },
      class OutputScreen extends this {
        $enter() {}
        _getFocused() {
          return this.tag('OutputScreen')
        }
        $pressEnter(option) {
          var soundMode = 'UNDEFINED'
          
          switch (option) {
            case 'Cancel':
              this._setState('SoundMode')
              break;

            case 'STEREO PCM':
              soundMode = 'STEREO'
              break;

            case 'AUTO':
              soundMode = 'AUTO'
              break;

            case 'PASSTHROUGH':
              soundMode = 'PASSTHRU'
              break;
          }
          
          console.log('soundMode = ' + soundMode)
          
          this.setSoundMode(soundMode)
          this.getSoundMode()
          this._setState('SoundMode')
        }
        $exit() {
          this.tag('OutputScreen').visible = false
        }
      },
    ]
  }
  
  getSoundMode() {
    return new Promise((resolve, reject) => {
    thunderAS
    .call('org.rdk.DisplaySettings.1', 'getSoundMode', { "audioPort":"HDMI0"})
    .then(result => {
      console.log('############ get sound mode ############')
      console.log(JSON.stringify(result))
      this.tag('SoundModeInfo').text = 'Sound Mode: ' + result.soundMode
      resolve(result.success)
    })
    .catch(err => {
      console.log('get sound mode:', JSON.stringify(err, 3, null))
      resolve(false)
    })
  })

  }

  setSoundMode(value) {
    console.log('setSoundMode mode = ' + value)
    return new Promise((resolve, reject) => {
    thunderAS
    .call('org.rdk.DisplaySettings.1', 'setSoundMode', { "audioPort":"HDMI0","soundMode":value })
    .then(result => {
      console.log('############ set sound mode ############ ')
      console.log(JSON.stringify(result))
      resolve(result.success)
    })
    .catch(err => {
      console.log('set sound mode', JSON.stringify(err, 3, null))
      resolve(false)
    })
  })

  }
}
