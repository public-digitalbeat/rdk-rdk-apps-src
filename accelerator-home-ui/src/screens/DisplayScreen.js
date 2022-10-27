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
import DisplayItem from '../items/DisplayItem'
import { COLORS } from './../colors/Colors'
import HdmiCec_2Api from './../api/HdmiCec_2Api'
import GenericButton from '../items/GenericButton.js'
import FactoryResetPanel from '../views/FactoryResetPanel.js'
import ThunderJS from 'ThunderJS'

export default class DisplayScreen extends Lightning.Component {
  static _template() {
    return {
      Switch: {
        x: 825,
        y: 310,
        Shadow: {
          alpha: 0,
          x: -15,
          y: 0,
          color: 0x66000000,
          texture: lng.Tools.getShadowRect(205, 60, 50, 10, 20),
        },
        Button: {
          h: 60,
          w: 180,
          src: Utils.asset('images/switch-off-new.png'),
        },
      },
      Name: {
        x: 1050,
        y: 320,
        text: {
          fontFace: 'MS-Regular',
          text: 'HDMI CEC',
          textColor: COLORS.textColor,
          fontSize: 28,
        },
      },
      FactoryReset: {
        x: 825,
        y: 390,
        type: GenericButton,
        data: {
            title: 'Factory Reset',
          },
        focus: 1,
        unfocus: 1,
        x_text: 30,
        y_text: 20,
        text_focus: 1,
        text_unfocus: 1,

      },
      Panel: {
        x: 825,
        y: 490,
        type: FactoryResetPanel,
        alpha: 0,
      }
    }
  }

  toggleBtnAnimationX() {
    const lilLightningAnimation = this.tag('Button').animation({
      duration: 1,
      repeat: 0,
      actions: [
        { p: 'x', v: { 0: 0, 0.5: 0, 1: 0 } }
      ]
    });
    lilLightningAnimation.start();
  }
  toggleBtnAnimationY() {
    const lilLightningAnimation = this.tag('Button').animation({
      duration: 1,
      repeat: 0,
      actions: [
        { p: 'x', v: { 0: 0, 0.5: 0, 1: 0 } }
      ]
    });
    lilLightningAnimation.start();
  }

  _init() {
    console.log("DisplayScreen")
    
    this._hdmicec2 = new HdmiCec_2Api()
    this._hdmicec2.getEnabled()
    this._cec = this._hdmicec2.enablestatus
    if (this._cec) {
      this.tag('Switch.Button').src = Utils.asset('images/switch-on-new.png')
     
    } else {
      this.tag('Switch.Button').src = Utils.asset('images/switch-off-new.png')
      
    }
     this._setState('Switch')
  }
 
  _active() {
    console.log("DisplayScreen active")
    this._hdmicec2.getEnabled()
    this._cec = this._hdmicec2.enablestatus
    if (this._cec) {
      this.tag('Switch.Button').src = Utils.asset('images/switch-on-new.png')
     
    } else {
      this.tag('Switch.Button').src = Utils.asset('images/switch-off-new.png')
      
    }
    this._setState('Switch')
    // this._setState('Button')
  }
  _enable() {
    console.log("DisplayScreen enable")
    this._hdmicec2.getEnabled()
    this._cec = this._hdmicec2.enablestatus
    if (this._cec) {
      this.tag('Switch.Button').src = Utils.asset('images/switch-on-new.png')
     
    } else {
      this.tag('Switch.Button').src = Utils.asset('images/switch-off-new.png')
      
    }
     this._setState('Switch')

  }

  _disable() {
   
  }
  static _states() {
    return [
      class Switch extends this {
        $enter() { }
        $exit() {
          console.log('Switch exit')
          this.tag('Button').patch({
            h: 60,
            w: 180
          })
          this.tag('Shadow').patch({
            smooth: {
              alpha: 0
            }
          });
        }
        _handleDown() {
          this._setState('FactoryButton')

        }
        _handleUp() {
          this._setState('FactoryButton')

        }

        _handleLeft() {
          console.log('handle left display')
          this.tag('Button').patch({
            h: 60,
            w: 180
          })
          this.tag('Shadow').patch({
            smooth: {
              alpha: 0
            }
          });
          this.fireAncestors('$goToSideMenubar', 3)
        }
        _getFocused() {
          
            this.tag('Button').patch({
              h: 70,
              w: 200
            })
            this.tag('Shadow').patch({
              smooth: {
                alpha: 1
              }
            });
          
        }
        _handleEnter() {
         
            this.switch()
        }
      },
      class FactoryButton extends this {
        $enter() { }
        $exit() {
         
        }
        _handleDown() {
          this._setState('Switch')

        }
        _handleUp() {
          this._setState('Switch')

        }

        _handleLeft() {
         
          this.fireAncestors('$goToSideMenubar', 3)
        }
        _getFocused() {
          return this.tag('FactoryReset')
          
        }
        _handleEnter() {
          this._setState('ResetPanel')
        }
      },
      class ResetPanel extends this {
        $enter() { 
          this.tag('Panel').patch({alpha: 1 })
        }
        $exit() {
          this.tag('Panel').patch({alpha: 0 })
         
        }
        
        _getFocused() {
          return this.tag('Panel')
          
        }
        _handleBack() {
          this._setState('FactoryButton')
          this.tag('Panel').patch({alpha: 0 })
        }
        _handleEnter() {
          this._setState('FactoryButton')
          this.tag('Panel').patch({alpha: 0 })
        }
      }
    ]
  }
  switch() {
    if (this._cec) {
      this.tag('Switch.Button').src = Utils.asset('images/switch-off-new.png')
      this._cec = false
      this._hdmicec2.setEnabled(false)
    } else {
      this.tag('Switch.Button').src = Utils.asset('images/switch-on-new.png')
      this._cec = true
      this._hdmicec2.setEnabled(true)
        
    }
  }
  $factoryreset() {
    console.log("call factory reset here " )
    const config = {
      host: '127.0.0.1',
      port: 9998,
      default: 1,
    }
    
    var thunder = ThunderJS(config)
    thunder.call('org.rdk.Warehouse.1', 'lightReset', {})
    
    let params = { 'suppressReboot': false, 'resetType': 'WAREHOUSE' }
    thunder.call('org.rdk.Warehouse.1', 'resetDevice', params)
    
  }

}
