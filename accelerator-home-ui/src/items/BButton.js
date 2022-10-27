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

/**
 * Class for customized button
 */
export default class BButton extends Lightning.Component {
  static _template() {
    return {
      Shadow: {
        alpha: 0,
        x: -15,
        y: 0,
        color: 0x66000000,
        texture: lng.Tools.getShadowRect(312, 75, 10, 10, 20),
      },
      Item: {
        rect: true,
        texture: lng.Tools.getRoundRect(312, 81, 24, 2, 0xffffffff, false, 0xffffffff),
        Title: {
          text: {
            fontFace: 'MS-Regular',
            fontSize: 30,
            textColor: 0xffffffff,
          },
        },
      },
    }
  }

  _init() {
    this.tag('Title').patch({ x: this.x_text, y: this.y_text, text: { text: this.data.title } })
  }

  /**
   * Function to change properties of item during focus.
   */
  _focus() {
    this.tag('Title').patch({ alpha: 1, text: { textColor: '0xff141e30', } })
    this.tag('Item').patch({
      zIndex: 0,
      texture: lng.Tools.getRoundRect(312, 81, 24, 2, 0xffffffff, true, 0xffffffff),
    })
    this.tag('Shadow').patch({
      smooth: {
        alpha: 1
      }
    });
  }

  /**
   * Function to change properties of item during unfocus.
   */
  _unfocus() {
    console.log('pk++++ generic button');
    this.tag('Title').patch({ alpha: 1, text: { textColor: 0xffffffff } })
    this.tag('Item').patch({
      zIndex: 0, texture: lng.Tools.getRoundRect(312, 81, 24, 2, 0xffffffff, false, 0xffffffff),
    })
    this.tag('Shadow').patch({
      smooth: {
        alpha: 0
      }
    });
  }
}
