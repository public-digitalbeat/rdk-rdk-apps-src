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
import { Lightning, Utils, Storage } from '@lightningjs/sdk'
import MainView from '../views/MainView.js'
import TopPanel from '../views/TopPanel.js'
import ShutdownPanel from '../views/ShutdownPanel.js'
import AAMPVideoPlayer from '../player/AAMPVideoPlayer.js'
import HomeApi from '../api/HomeApi.js'
import NetworkApi from '../api/NetworkApi'
import WiFiApi from '../api/WifiApi'
import AppApi from './../api/AppApi';
import store from '../redux.js'
import HdmiCec_2Api from './../api/HdmiCec_2Api'
import ThunderJS from 'ThunderJS';

const config = {
  host: '127.0.0.1',
  port: 9998,
  default: 1,
};
var powerState = 'ON';
var audio_mute = false;
var audio_volume = 50;
var appApi = new AppApi();
var last_state = ''

/** Class for home screen UI */
export default class HomeScreen extends Lightning.Component {
  /**
   * Function to render various elements in home screen.
   */
  static _template() {
    return {
      BackgroundImage: {
        w: 1920,
        h: 1080,
        alpha: 6,
      },
      BackgroundColor: {
        w: 1920,
        h: 1080,
        alpha: 0.9,
        rect: true,
        color: 0xff20344D
      },

      TopPanel: {
        type: TopPanel,
      },
      View: {
        x: 80,
        y: 171,
        w: 1994,
        h: 919,
        clipping: true,
        MainView: {
          w: 1994,
          h: 919,
          type: MainView,
        },
      },
      IpAddressBg: {
        rect: true,
        x: 1860,
        y: 1060,
        w: 256,
        h: 30,
        mount: 1,
        color: 0xbb0078ac,
      },
      IpAddress: {
        x: 1828,
        y: 1058,
        mount: 1,
        text: {
          fontFace: 'MS-Regular',
          text: 'IP:NA',
          textColor: 0xffffffff,
          fontSize: 22,
        },
      },
      Player: { type: AAMPVideoPlayer },
      ShutdownPanel: {
        type: ShutdownPanel,
        x: 660,
        y: 385,
        signals: { select: true },
        alpha: 0
      }
    }
  }

  _init() {
    this.homeApi = new HomeApi()
    var appItems = this.homeApi.getAppListInfo()
    var data = this.homeApi.getPartnerAppsInfo()
    var prop_apps = 'applications'
    var prop_displayname = 'displayName'
    var prop_uri = 'uri'
    var prop_apptype = 'applicationType'
    var prop_url = 'url'
    var appdetails = []
    var appdetails_format = []
    var usbApps = 0
    this._hdmicec2 = new HdmiCec_2Api()
    try {
      if (data != null && JSON.parse(data).hasOwnProperty(prop_apps)) {
        appdetails = JSON.parse(data).applications
        for (var i = 0; i < appdetails.length; i++) {
          if (
            appdetails[i].hasOwnProperty(prop_displayname) &&
            appdetails[i].hasOwnProperty(prop_uri) &&
            appdetails[i].hasOwnProperty(prop_apptype)
          ) {
            appdetails_format.push(appdetails[i])
            usbApps++
          }
        }
        for (var i = 0; i < appItems.length; i++) {
          appdetails_format.push(appItems[i])
        }
      } else {
        appdetails_format = appItems
      }
    } catch (e) {
      appdetails_format = appItems
      console.log('Query data is not proper: ' + e)
    }
    this.tag('MainView').appItems = appdetails_format
    this.tag('MainView').metroApps = this.homeApi.getMetroInfo()
    this.tag('MainView').tvShowItems = this.homeApi.getTVShowsInfo()
    this.tag('MainView').settingsItems = this.homeApi.getSettingsInfo()
    this.tag('MainView').rightArrowIcons = this.homeApi.getRightArrowInfo()
    this.tag('MainView').leftArrowIcons = this.homeApi.getLeftArrowInfo()

    this._setState('MainView')
    this.initialLoad = true
    this.networkApi = new NetworkApi()
    
    this.networkApi.activate().then(result => {
      if (result) {
        this.networkApi.registerEvent('onIPAddressStatusChanged', notification => {
          console.log(JSON.stringify(notification))
          
          this.networkApi.getDefaultInterface().then(def_interface =>  {
            console.log('default interface: '+ def_interface)
            //default interface is not available sometimes when this notification gets called
            if (def_interface == '') {
              def_interface = notification.interface
            }
            if (def_interface == notification.interface) {
              if (notification.status == 'ACQUIRED') {
                if (notification.hasOwnProperty('ip4Address')) {
                  this.tag('IpAddress').text.text = 'IP:' + notification.ip4Address;
                }
              }else if (notification.status == 'LOST') {
                
                  this.tag('IpAddress').text.text = 'IP:NA '
              }
            }
            })  
          
        })
        this.networkApi.getIP().then(ip => {
          this.tag('IpAddress').text.text = 'IP:' + ip
        })
      }
    })
    this._hdmicec2.activate().then( result =>{
        this._hdmicec2.setOTPEnabled(true)
    })
    appApi.launchPremiumAppInBG('Netflix')
    Storage.set('launchSuspendedNetflix', true)
    
    var thunder = ThunderJS(config);
	thunder.call('Controller', 'activate', { callsign: 'org.rdk.System' })
	.then(result => {
		console.log('System activated', result);
		thunder.on('org.rdk.System', 'onSystemPowerStateChanged', notification => {
			console.log("onSystemPowerStateChanged event "+notification.powerState);
			if(notification.powerState == "LIGHT_SLEEP")
				powerState = "STANDBY"
			else if (notification.powerState == "DEEP_SLEEP") {
        
        
        powerState = notification.powerState;
        this._hdmicec2.performOTP()
        console.log(" go to deepsleep done: " + currApp);
       }else {
				powerState = notification.powerState;
      }
		});
	});
  }

  _captureKeyRelease(key) {
    if (key.keyCode == 120 || key.keyCode == 217) {
      store.dispatch({ type: 'ACTION_LISTEN_STOP' })
      //app launch code need add here.
      return true
    }
  }

  _captureKey(key) {
    console.log(" _captureKey home screen : " + key.keyCode + " current application : " + Storage.get('applicationType') + " state :" + this._getState() )
   
    if (key.keyCode == 120 || key.keyCode == 217) {
      store.dispatch({ type: 'ACTION_LISTEN_START' })
      return true
    }

    if (key.keyCode == 114 ) {
      //Remote power key and keyboard F3 key used for STANDBY and POWER_ON
      if (powerState == 'ON') {
        last_state = this._getState();
        this._setState('ShutdownPanel')

        return true
      } else  {
        appApi.standby("ON")
        return true
      }

    } else if (key.keyCode == 116) {

      console.log("___________DEEP_SLEEP_______________________F12")
      if (powerState == 'DEEP_SLEEP') {
        
        appApi.standby("ON")
        return true
      } else {
        var currApp= Storage.get('applicationType') 
        console.log(" go to deepsleep : " + currApp);
        if (currApp == 'Netflix' || currApp == 'Amazon' ){
           appApi.suspendPremiumApp(currApp)
        } else if (currApp == 'Cobalt') {
            appApi.suspendCobalt("Cobalt")
         } else if (currApp != "") {
           appApi.deactivateChildApp(Storage.get('applicationType'));
        }
        Storage.set('applicationType', '');
        appApi.setVisibility('ResidentApp', true);
        var thunder = ThunderJS(config);
        thunder.call('org.rdk.RDKShell', 'moveToFront', { client: 'ResidentApp' })
        thunder.call('org.rdk.RDKShell', 'setFocus', { client: 'ResidentApp' })
        appApi.standby("DEEP_SLEEP")
        return true 
      }
    } else if (key.keyCode == 173 ) {

      appApi.getConnectedAudioPorts().then(res => {
        let audio_source = res.connectedAudioPorts[0]
        let value = !audio_mute;
        new AppApi().audio_mute(value, audio_source).then(res => {
          console.log("__________AUDIO_MUTE_______________________F7")
          console.log(JSON.stringify(res, 3, null));

          if (res.success == true) {
            audio_mute = value;
            new AppApi().zorder("moveToFront", "foreground");
            new AppApi().setVisibility("foreground", audio_mute)
          }
          console.log("audio_mute:" + audio_mute);
        })

      });

      return true

    } else if (key.keyCode == 175) {

      audio_mute = false;
      audio_volume += 10;
      if (audio_volume > 100) { audio_volume = 100 }

      let value = "" + audio_volume;
      appApi.setVolumeLevel(value).then(res => {
        console.log("__________AUDIO_VOLUME_________Numberpad key plus")
        console.log(JSON.stringify(res, 3, null));
        console.log("setVolumeLevel:" + audio_volume);
      })
      return true

    } else if (key.keyCode == 174) {

      audio_volume -= 10;
      if (audio_volume < 0) { audio_volume = 0 }
      if (audio_volume > 0) { audio_mute = false }
      let value = "" + audio_volume;

      appApi.setVolumeLevel(value).then(res => {
        console.log("__________AUDIO_VOLUME____________Numberpad key minus")
        console.log(JSON.stringify(res, 3, null));
        console.log("setVolumeLevel:" + audio_volume);
      })
      return true
    }else if ((key.keyCode == 115) || (key.keyCode == 113) || (key.keyCode == 112)) {
      if (powerState != "ON"){
        appApi.standby("ON")
      }
      if(key.keyCode == 113){
        var thunder = ThunderJS(config);
        thunder.call('org.rdk.RDKShell', 'generateKey', {"keys": [{"keyCode": 113,"modifiers": "","delay": 1.0,"callsign": "netflix"}]});          
      }
      return false
    }
   
    return false
  }

  _active() {
    if (this.initialLoad) {
      let home = this
      this._homeAnimation = home.animation({
        duration: 0.5,
        repeat: 0,
        stopMethod: 'immediate',
        actions: [
          { p: 'scale', v: { 0: 5, 1: 1 } },
          { p: 'x', v: { 0: -1920, 1: 0 } },
          { p: 'y', v: { 0: -1080, 1: 0 } },
        ],
      })
      this._homeAnimation.start()
      this.initialLoad = false
    }
  }

  /**
   * Function to start video playback.
   */
  play(url) {
    this.player = this.tag('Player')
    try {
      this.player.load({
        title: 'Parkour event',
        subtitle: 'm3u8',
        url: url,
        drmConfig: null,
      })
      this.hide()
      this._setState('Playing')
    } catch (error) {
      this._setState('MainView')
      console.error('Playback Failed ' + error)
    }
  }

  /**
   * Fireancestor to set the state to main view.
   * @param {index} index index value of main view row.
   */
  $goToMainView(index) {
    this.tag('MainView').index = index
    this._setState('MainView')
  }

  /**
* Fireancestor to set the state to side panel.
* @param {index} index index value of Top panel item.
*/
  $goToTopPanel(index) {
    console.log('go to top panel')
    this.tag('TopPanel').index = index
    this._setState('TopPanel')
  }
  $changeBackgroundImageOnFocus(image) {

    if (image.startsWith('/images')) {
      this.tag('BackgroundImage').patch({
        src: Utils.asset(image),
      });
    } else {
      this.tag('BackgroundImage').patch({ src: image });
    }
  }

  $changeBackgroundImageOnNonFocus(image) {
    this.tag('BackgroundImage').patch({

    })
  }
  /**
   * Fireancestor to set the state to player.
   */
  $goToPlayer(url) {
    this._setState('Player')
    //this.play('https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8')
    this.play(url)
  }

  /**
   * Function to scroll
   */
  $scroll(y) {
    this.tag('MainView').setSmooth('y', y, { duration: 0.5 })
  }

  $standby(value) {
    if (value == 'Back') {
      this._setState(last_state)
    } else {
      if (powerState == 'ON') {
        appApi.standby(value).then(res => {
          if (res.success) {
       }
          this._setState(last_state);
        })
        return true
      }
    }
  }

  /**
   * Function to hide the home UI.
   */
  hide() {
    this.tag('BackgroundImage').patch({ alpha: 0 });
    this.tag('BackgroundColor').patch({ alpha: 0 });
    this.tag('MainView').patch({ alpha: 0 });
    this.tag('TopPanel').patch({ alpha: 0 });
  }

  /**
     * Function to show home UI.
   */
  show() {
    this.tag('BackgroundImage').patch({ alpha: 1 });
    this.tag('BackgroundColor').patch({ alpha: 1 });
    this.tag('MainView').patch({ alpha: 1 });
    this.tag('TopPanel').patch({ alpha: 1 });
  }

  /**
   * Function to define various states needed for home screen.
   */
  static _states() {
    return [
      class TopPanel extends this {
        _getFocused() {
          return this.tag('TopPanel')
        }
       
      },
      class ShutdownPanel extends this {
        $enter() {
          this.tag('ShutdownPanel').setSmooth('alpha', 1)
        }
        $exit() {
          this.tag('ShutdownPanel').setSmooth('alpha', 0)
        }
        _getFocused() {
          return this.tag('ShutdownPanel')
        }
      },
      class MainView extends this {
        _getFocused() {
          return this.tag('MainView')
        }
        
      },
      class Playing extends this {
        _getFocused() {
          return this.tag('Player')
        }

        stopPlayer() {
          this._setState('MainView');
          this.player.stop();
          this.show();
        }

        _handleKey(key) {
          console.log(" handlekey player screen : " + key.keyCode);
          if (key.keyCode == 27 || key.keyCode == 77 ||  key.keyCode == 36 || key.keyCode == 158 || key.keyCode == 112 || key.keyCode == 113 || key.keyCode == 115) {
            this.stopPlayer()
          }  
          appApi.handleHotKey(key)
            
          return false
          
        }
      },
    ]
  }
}
