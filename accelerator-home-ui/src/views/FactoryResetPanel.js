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
import ThunderJS from 'ThunderJS'


/** Class for top panel in home UI */
export default class FactoryResetPanel extends Lightning.Component {
  static _template() {
    return {
      
      Border: {
        rect: true,
        w: 610,
        h: 310,
        color: 0xFF000000,
        alpha: 0.5,
        shader: { type: Lightning.shaders.RoundedRectangle, radius: 19 }
      },
      Box: {
        rect: true,
        w: 600,
        h: 300,
        color: 0xFF000055,
        shader: { type: Lightning.shaders.RoundedRectangle, radius: 19 }
      },
      Resetbtn: {
        rect: true,
        x: 150,
        y: 60,
        w: 300,
        h: 80,
        color: 0xFF0000000,
        shader: { type: Lightning.shaders.RoundedRectangle, radius: 19 },
        Txt: {
          x: 60,
          y: 15,
          text: { text: 'Reset', fontSize: 33, fontFace: 'MS-Regular' }
        }
      },
      Cancelbtn: {
        rect: true,
        x: 150,
        y: 170,
        w: 300,
        h: 80,
        color: 0xFF0000000,
        shader: { type: Lightning.shaders.RoundedRectangle, radius: 19 },
        Txt: {
          x: 60,
          y: 15,
          text: { text: 'Cancel', fontSize: 33, fontFace: 'MS-Regular' }
        }
      },
    }
  }



  _init() {
    console.log("Factory Reset panel init..");
    this.tag('Resetbtn').color = '0Xff0000AA'
    this._reset=true
    
  }

  
  _handleUp() {
    this.tag('Resetbtn').color = '0Xff0000AA'
    this.tag('Cancelbtn').color = '0xFF0000000'
    this._reset=true
    

  }

  _handleDown() {
    this.tag('Cancelbtn').color = '0Xff0000AA'
    this.tag('Resetbtn').color = '0xFF0000000'
    this._reset=false
   
  }

  _handleEnter() {
    console.log("Factory Reset handle enter..");
    if (this._reset == true) {
      this.tag('Cancelbtn').alpha = 0
      this.tag('Resetbtn').alpha = 0
      this.fireAncestors('$factoryreset')
      return true
    }
    
    return false
    
  }

  

}
