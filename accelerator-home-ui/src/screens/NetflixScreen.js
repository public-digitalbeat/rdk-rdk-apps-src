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
import { Lightning, Router, Utils, Language, Registry } from '@lightningjs/sdk'
import SettingsMainItem from '../items/SettingsMainItem'
import { COLORS } from './../colors/Colors'
import { CONFIG } from '../Config/Config'
import AppApi from '../api/AppApi';

/**
 * Class for Netflix screen.
 */
export default class NetflixScreen extends Lightning.Component {

  _onChanged() {
    this.widgets.menu.updateTopPanelText(Language.translate('Settings/ Netflix'));
  }
  static _template() {
    return {
      rect: true,
      color: 0xff000000,
      w: 1920,
      h: 1080,
      Netflix: {
        y: 275,
        x: 200,
        Switch: {
          type: SettingsMainItem,
          Title: {
            x: 10,
            y: 45,
            mountY: 0.5,
            text: {
              text: Language.translate('NFR'),
              textColor: COLORS.titleColor,
              fontFace: CONFIG.language.font,
              fontSize: 25,
            }
          },
          Button: {
            h: 45,
            w: 67,
            x: 1600,
            mountX: 1,
            y: 45,
            mountY: 0.5,
            src: Utils.asset('images/settings/ToggleOffWhite.png'),
          },
        },
        ESN: {
          y: 90,
          type: SettingsMainItem,
          Title: {
            x: 10,
            y: 45,
            mountY: 0.5,
            text: {
              text: Language.translate('ESN: '),
              textColor: COLORS.titleColor,
              fontFace: CONFIG.language.font,
              fontSize: 25,
            },
          },
        },
      },

    }
  }

  /**
   * @param {{ action: String; }} args
   */
  set params(args) {
    if (args.action) {
      this.pressEnter(args.action)
    }
  }

  _unfocus() {
    this._disable()
  }

  pageTransition() {
    return 'left'
  }

  _init() {
    this.appApi = new AppApi()
    this.nfr = this.appApi.getNfr()
    this.esn = this.appApi.getEsn()
    this.appApi.getEsn().then(result => {
      console.log('getESN:', + result);
      this.tag('ESN.Title').text.text = Language.translate('ESN: ') + result
    });
    this._setState('Switch')
  }

  _focus() {
      
    this.appApi.getEsn().then(result => {
      console.log('getESN:', + result);
      this.tag('ESN.Title').text.text = Language.translate('ESN: ') + result
    });
    
    if (this.nfr) {
      this.tag('Switch.Button').src = Utils.asset('images/settings/ToggleOnOrange.png')
    }
    this._setState('Switch')
  }

  _handleBack() {
    Router.navigate('settings')
  }
  _handleMenu() {
    this._handleBack()
  }
  /**
   * Function to be excuted when the Netflix screen is enabled.
   */
  _enable() {
  }

  /**
   * Function to be executed when the Netflix screen is disabled from the screen.
   */
  _disable() {}

  static _states() {
    return [
      class Switch extends this {
        $enter() {
          this.tag('Switch')._focus()
        }
        $exit() {
          this.tag('Switch')._unfocus()
        }
        _handleEnter() {
          this.switch()
        }
        _handleLeft() {
            Router.navigate('settings')
        }
        _handleBack() {
          Router.navigate('settings')       
        }
        _handleMenu() {
          this._handleBack()
        }        
      },
    ]
  }

  /**
   * Function to turn on and off NFR.
   */
  switch() {
    if (this.nfr) {
      this.tag('Switch.Button').src = Utils.asset('images/settings/ToggleOffWhite.png');
      this.nfr = false;
    } else {
      this.tag('Switch.Button').src = Utils.asset('images/settings/ToggleOnOrange.png');
      this.nfr = true;
    }

    this.appApi.setNfr(this.nfr);   
  }

}
