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

/**
 * Class for sound mode select.
 */
export default class AudioOutputScreen extends Lightning.Component {
  static _template() {
    return {
      OutputScreen: {
        x: 0,
        y: 0,
        w: 1920 / 3,
        h: 1080,
        rect: true,
        color: 0xff364651,      
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
    }
  }

  _getFocused() {
    var options = []
    options = ['AUTO', 'STEREO PCM', 'PASSTHROUGH', 'Cancel']
    this.tag('List').items = options.map((item, index) => {
      return {
        ref: item,
        w: 1920 / 3,
        h: 65,
        type: SettingsItem,
        item: item,
      }
    })
    
    return this.tag('List').element
  }

  _handleDown() {
    this.tag('List').setNext()
  }

  _handleUp() {
    this.tag('List').setPrevious()
  }

  _handleEnter() {
    this.fireAncestors('$pressEnter', this.tag('List').element.ref)
  }
}
