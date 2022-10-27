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
import ThunderJS from 'ThunderJS'
const config = {
  host: '127.0.0.1',
  port: 9998,
  default: 1,
}
var thunder = ThunderJS(config)

export default class SystemInfoScreen extends Lightning.Component {
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
          text: 'NFR ',
          textColor: COLORS.textColor,
          fontSize: 28,
        },
      },
     ESN: {
        x: 825,
        y: 420,
        text: {
          fontFace: 'MS-Regular',
          text: 'ESN: ',
          textColor: COLORS.textColor,
          fontSize: 28,
        },
      },
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
    console.log("SystemInfoScreen")
    this._appapi = new AppApi()
    this._nfr=this.getnfr()
    this._setState('Switch')
  }
  _active() {
    this._esn = this._appapi.getESN().then(result => {
      console.log('getESN:', result)
      this.tag('ESN').text = 'ESN:' + result
    })
    this._nfr=this.getnfr()
    console.log("SystemInfoScreen active: " + this._nfr)
   
    this._setState('Switch')
  }
  _enable() {
    this._nfr=this.getnfr()
    console.log("SystemInfoScreen enable: " + this._nfr)
   
    this._setState('Switch')
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
          this.fireAncestors('$goToSideMenubar', 4)
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
    ]
  }
  switch() {
    if (this._nfr) {
      this.tag('Switch.Button').src = Utils.asset('images/switch-off-new.png')
      this._nfr = false
           
    } else {
      this.tag('Switch.Button').src = Utils.asset('images/switch-on-new.png')
      this._nfr = true
             
    }
    this.setnfr(this._nfr)
  }

  getnfr() {
    return new Promise((resolve, reject) => {
    thunder
    .call('org.rdk.PersistentStore.1', 'getValue', { "namespace":"netflix","key":"nfr" })
    .then(result => {
      console.log("############ getnfr ############")
      console.log(JSON.stringify(result))
      var isTrueSet = (result.value === 'true');
      this._nfr=isTrueSet
      if (isTrueSet) {
        this.tag('Switch.Button').src = Utils.asset('images/switch-on-new.png')
       
      } else {
        this.tag('Switch.Button').src = Utils.asset('images/switch-off-new.png')
        
      }
      resolve(isTrueSet)
    })
    .catch(err => {
      console.log("get nfr error:", JSON.stringify(err, 3, null))
      resolve(false)
    })
  })

  }

  setnfr(value) {
    return new Promise((resolve, reject) => {
    thunder
    .call('org.rdk.PersistentStore.1', 'setValue', { "namespace":"netflix","key":"nfr","value":value })
    .then(result => {
      console.log("############ setnfr ############ " + value)
      console.log(JSON.stringify(result))
      resolve(result.success)
    })
    .catch(err => {
      console.log("get nfr error:", JSON.stringify(err, 3, null))
      resolve(false)
    })
  })

  }
}
