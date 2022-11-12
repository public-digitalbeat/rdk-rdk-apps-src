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
import BluetoothItem from '../../items/BluetoothItem'
import SettingsMainItem from '../../items/SettingsMainItem'
import BluetoothApi from '../../api/BluetoothApi'
import AppApi from '../../api/AppApi.js'
import BluetoothConfirmation from '../BluetoothConfirmation'
import BtAudioPairingScreen from './BtAudioPairingScreen'
import { COLORS } from '../../colors/Colors'
import { CONFIG } from '../../Config/Config'

/**
 * Class for Bluetooth Audio screen.
 */
export default class BluetoothScreenAudio extends Lightning.Component {

  _onChanged() {
    this.widgets.menu.updateTopPanelText(Language.translate('Settings  Audio Bluetooth'));
  }
  static _template() {
    return {
      rect: true,
      color: 0xff000000,
      w: 1920,
      h: 1080,
      Bluetooth: {
        y: 275,
        x: 200,
        Confirmation: {
          x: 780,
          y: 100,
          type: BluetoothConfirmation,
          visible: false
        },
        PairingScreen: {
          x: 780,
          y: 100,
          type: BtAudioPairingScreen,
          zIndex: 100,
          visible: false
        },
        Searching: {
          visible: false,
          h: 90,
          Title: {
            x: 10,
            y: 45,
            mountY: 0.5,
            text: {
              text: Language.translate('Searching for Devices'),
              textColor: COLORS.titleColor,
              fontFace: CONFIG.language.font,
              fontSize: 25,
            }
          },
          Loader: {
            h: 45,
            w: 45,
            // x: 1600,
            x: 320,
            mountX: 1,
            y: 45,
            mountY: 0.5,
            src: Utils.asset('images/settings/Loading.gif'),
          },
        },
        Networks: {
          PairedNetworks: {
            y: 180,
            List: {
              type: Lightning.components.ListComponent,
              w: 1920 - 300,
              itemSize: 90,
              horizontal: false,
              invertDirection: true,
              roll: true,
              rollMax: 900,
              itemScrollOffset: -6,
            },
          },
          AvailableNetworks: {
            y: 90,
            visible: false,
            List: {
              w: 1920 - 300,
              type: Lightning.components.ListComponent,
              itemSize: 90,
              horizontal: false,
              invertDirection: true,
              roll: true,
              rollMax: 900,
              itemScrollOffset: -6,
            },
          },
          visible: false,
        },
        AddADevice: {
          y: 90,
          type: SettingsMainItem,
          Title: {
            x: 10,
            y: 45,
            mountY: 0.5,
            text: {
              text: Language.translate('Add A Device'),
              textColor: COLORS.titleColor,
              fontFace: CONFIG.language.font,
              fontSize: 25,
            }
          },
          visible: false,
        },
      },

    }
  }

  _init() {
    this._bt = new BluetoothApi()
    this._appApi = new AppApi()
    this._bluetooth = false
    this._activateBluetooth()
    this._pairedNetworks = this.tag('Networks.PairedNetworks')
    this._availableNetworks = this.tag('Networks.AvailableNetworks')

    this.loadingAnimation = this.tag('Searching.Loader').animation({
      duration: 3, repeat: -1, stopMethod: 'immediate', stopDelay: 0.2,
      actions: [{ p: 'rotation', v: { sm: 0, 0: 0, 1: 2 * Math.PI } }]
    })
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

  _firstEnable() {

  }

  _focus() {
    this._setState('AddADevice')
    this._enable()
    if (this._bluetooth) {
      this.tag('Networks').visible = true
      this.tag('AddADevice').visible = true
      this.renderDeviceList()
    }
  }

  _handleBack() {
    Router.navigate('settings/audio')
  }
  
  _handleMenu() {
    this._handleBack()
  }
  /**
   * Function to be excuted when the Bluetooth screen is enabled.
   */
  _enable() {
    if (this._bluetooth) {
      this._bt.startScanAudioOut()
    }
    this.scanTimer = Registry.setInterval(() => {
      if (this._bluetooth) {
        this._bt.startScanAudioOut()
      }
    }, 5000)
  }

  /**
   * Function to be executed when the Bluetooth screen is disabled from the screen.
   */
  _disable() {
    Registry.clearInterval(this.scanTimer)
    this._bt.stopScan()
  }

  /**
   * Function to be executed when add a device is pressed
   */

  showAvailableDevices() {
    this.tag('PairedNetworks').patch({ alpha: 0 });
    this.tag('AddADevice').patch({ alpha: 0 });
    this.tag('Searching').patch({ visible: true });
    this.tag('AvailableNetworks').patch({ visible: true });
  }

  hideAvailableDevices() {
    this.tag('PairedNetworks').patch({ alpha: 1 });
    this.tag('AddADevice').patch({ alpha: 1 });
    this.tag('Searching').patch({ visible: false });
    this.tag('AvailableNetworks').patch({ visible: false });
    this.tag('Confirmation').patch({ visible: false });
  }

  showPairingScreen() {
    this.tag('PairedNetworks').patch({ alpha: 0 });
    this.tag('AddADevice').patch({ alpha: 0 });
    this.tag('Searching').patch({ visible: false });
    this.tag('AvailableNetworks').patch({ visible: false });
    this.tag('Confirmation').patch({ visible: false });
    this.tag('PairingScreen').patch({ visible: true });
    this.fireAncestors('$hideTopPanel');
  }

  hidePairingScreen() {
    this.tag('PairedNetworks').patch({ alpha: 1 });
    this.tag('AddADevice').patch({ alpha: 1 });
    this.tag('Searching').patch({ visible: false });
    this.tag('AvailableNetworks').patch({ visible: false });
    this.tag('Confirmation').patch({ visible: false });
    this.tag('PairingScreen').patch({ visible: false });
    this.fireAncestors('$showTopPanel');
  }

  showConfirmation() {
    this.tag('PairedNetworks').patch({ alpha: 0 });
    this.tag('AddADevice').patch({ alpha: 0 });
    this.tag('Searching').patch({ visible: false });
    this.tag('AvailableNetworks').patch({ visible: false });
    this.tag('PairingScreen').patch({ visible: false });
    this.tag('Confirmation').patch({ visible: true });
    this.fireAncestors('$hideTopPanel');
  }

  hideConfirmation() {
    this.tag('PairedNetworks').patch({ alpha: 1 });
    this.tag('AddADevice').patch({ alpha: 1 });
    this.tag('Searching').patch({ visible: false });
    this.tag('AvailableNetworks').patch({ visible: false });
    this.tag('PairingScreen').patch({ visible: false });
    this.tag('Confirmation').patch({ visible: false });
    this.fireAncestors('$showTopPanel');
  }

  /**
   * Function to render list of Bluetooth devices
   */
  renderDeviceList() {
    this._bt.getPairedDevices().then(result => {
      this._pairedList = result
      this._pairedNetworks.h = this._pairedList.length * 90
      this._pairedNetworks.tag('List').h = this._pairedList.length * 90
      this._pairedNetworks.tag('List').items = this._pairedList.filter((item) => {
        return this._bt.isAudioOutDev(item.deviceType);
      }, this)
      .map((item, index) => {
        item.paired = true
        item.name = item.name + ' (' + item.deviceType + ')' 
        return {
            ref: 'Paired' + index,
            w: 1920 - 300,
            h: 90,
            type: BluetoothItem,
            item: item,
        }
      })
    })
    this._bt.getDiscoveredDevices().then(result => {
      this._discoveredList = result
      this._otherList = this._discoveredList.filter(device => {
        if (!device.paired) {
          result = this._pairedList.map(a => a.deviceID)
          if (result.includes(device.deviceID)) {
            return false
          } else return device
        }
      }, this)
      this._availableNetworks.h = this._otherList.length * 90
      this._availableNetworks.tag('List').h = this._otherList.length * 90
      this._availableNetworks.tag('List').items = this._otherList.filter((item) => {
          return this._bt.isAudioOutDev(item.deviceType);
      }, this).map((item, index) => {
        item.name = item.name + ' (' + item.deviceType + ')'
        return {
          ref: 'Other' + index,
          w: 1920 - 300,
          h: 90,
          type: BluetoothItem,
          item: item,
        }
      })
    })
  }

  pressEnter(option) {
    if (option === 'Cancel') {
      this._setState('AddADevice')
    } else if (option === 'Pair') {
      this._bt.pair(this._availableNetworks.tag('List').element._item.deviceID).then(result => {
        let btName = this._availableNetworks.tag('List').element._item.name
        if (result.success) {
          this.widgets.fail.notify({ title: btName, msg: 'Pairing Succesful' })
          Router.focusWidget('Fail')
        } else {
          this.widgets.fail.notify({ title: btName, msg: 'Pairing Failed' })
          Router.focusWidget('Fail')
        }
        this.hideAvailableDevices()
      })
    } else if (option === 'Connect') {
      this._bt
        .connect(
          this._pairedNetworks.tag('List').element._item.deviceID,
          this._pairedNetworks.tag('List').element._item.deviceType
        )
        .then(result => {
          let btName = this._pairedNetworks.tag('List').element._item.name
          if (!result) {
            console.log(`Connection failed for device name = ${btName}`)
          } else {
            this._bt.setAudioStream(this._pairedNetworks.tag('List').element._item.deviceID)
            .then(result => {
              console.log('result' + JSON.stringify(result))
            })
            this.muteAudioPorts(true)
            console.log(`Connection successful for device name = ${btName}`)
          }
        })
    } else if (option === 'Disconnect') {
      this._bt
        .disconnect(
          this._pairedNetworks.tag('List').element._item.deviceID,
          this._pairedNetworks.tag('List').element._item.deviceType
        )
        .then(result => {
          let btName = this._pairedNetworks.tag('List').element._item.name
          if (!result) {
            console.log(`Failed to Disconnect from device name = ${btName}`)
          } else {
            this.muteAudioPorts(false)
            console.log(`Disconnect from device name = ${btName} successful `)
          }
        })
    } else if (option === 'Unpair') {
      this._bt.unpair(this._pairedNetworks.tag('List').element._item.deviceID).then(result => {
        let btName = this._pairedNetworks.tag('List').element._item.name
        if (result) {
          this.widgets.fail.notify({ title: btName, msg: 'Unpaired' })
          Router.focusWidget('Fail')
        } else {
          this.widgets.fail.notify({ title: btName, msg: 'Unpairing Failed' })
          Router.focusWidget('Fail')
        }
      })
    }
  }

  static _states() {
    return [
      class Confirmation extends this{
        $enter() {
          this.showConfirmation()
        }
        _getFocused() {
          return this.tag('Confirmation')
        }
        $pressOK() {
          this._setState('AddADevice')
          this.hideConfirmation()
        }
      },

      class PairedDevices extends this {
        $enter() {
          this.hideAvailableDevices()
        }
        _getFocused() {
          return this._pairedNetworks.tag('List').element
        }
        _handleDown() {
          this._navigate('MyDevices', 'down')
        }
        _handleUp() {
          this._navigate('MyDevices', 'up')
        }
        _handleEnter() {
          Router.navigate('settings/audio/bluetooth/pairing', { bluetoothItem: this._pairedNetworks.tag('List').element._item })
        }
      },
      class AvailableDevices extends this {
        _getFocused() {
          return this._availableNetworks.tag('List').element
        }
        _handleDown() {
          this._navigate('AvailableDevices', 'down')
        }
        _handleUp() {
          this._navigate('AvailableDevices', 'up')
        }
        _handleEnter() {
          this.pressEnter('Pair')
        }
        _handleBack() {
          this.hideAvailableDevices()
          this._setState('AddADevice')
        }
        _handleMenu() {
          this._handleBack()
        }
      },
      class AddADevice extends this {
        $enter() {
          this.tag('AddADevice')._focus()
          this.hideAvailableDevices()
        }
        _handleUp() {
        }
        _handleDown() {
          if (this._bluetooth) {
            if (this._pairedNetworks.tag('List').length > 0) {
              this._setState('PairedDevices')
            } else if (this._availableNetworks.tag('List').length > 0) {
              this._setState('AvailableDevices')
            }
          }
        }
        $exit() {
          this.tag('AddADevice')._unfocus()
        }
        _handleEnter() {
          if (this._bluetooth) {
            this.showAvailableDevices()
            this._setState('AvailableDevices')
          }
        }
      },
      class PairingScreen extends this {
        $enter() {
          this._disable()
          this._bt.stopScan()
          return this.tag('PairingScreen')
        }
        _getFocused() {
          return this.tag('PairingScreen')
        }
        $exit() {
          this.tag('PairingScreen').visible = false
          this._enable()
        }
      },
    ]
  }

  /**
   * Function to navigate through the lists in the screen.
   * @param {string} listname
   * @param {string} dir
   */
  _navigate(listname, dir) {
    let list
    if (listname === 'MyDevices') list = this._pairedNetworks.tag('List')
    else if (listname === 'AvailableDevices') list = this._availableNetworks.tag('List')
    if (dir === 'down') {
      if (list.index < list.length - 1) list.setNext()
      else if (list.index == list.length - 1) {
        if (listname === 'MyDevices' && this._availableNetworks.tag('List').length > 0) {
        }
      }
    } else if (dir === 'up') {
      if (list.index > 0) list.setPrevious()
      else if (list.index == 0) {
        if (listname === 'AvailableDevices' && this._pairedNetworks.tag('List').length > 0) {
          // this._setState('PairedDevices')
        } else if (listname === 'MyDevices') {
          this._setState('AddADevice')
        }
      }
    }
  }


  /**
   * Function to activate Bluetooth plugin.
   */
  _activateBluetooth() {
    this._bt.activate().then((res) => {
      console.log(res)
      this._bluetooth = true
      this._bt.registerEvent('onDiscoveredDevice', () => {
        this.renderDeviceList()
      })
      this._bt.registerEvent('onPairingRequest', notification => {
        this.respondToPairingRequest(notification.deviceID, 'ACCEPTED')
      })
      this._bt.registerEvent('onConnectionChange', notification => {
        this._bt.startScanAudioOut()
        this.renderDeviceList()
        let btName = notification.name
        console.log(`onConnectionChange name = ${btName} connected = ${notification.connected}`);
        if(this._bt.isAudioOutDev(notification.deviceType)) {
          if (notification.connected) {
            if (this.widgets.fail) {
              this.muteAudioPorts(true)
              this.widgets.fail.notify({ title: btName, msg: 'CONNECTED' })
              Router.focusWidget('Fail')
            }
          } else {
            if (this.widgets.fail) {
              this.muteAudioPorts(false)
              this.widgets.fail.notify({ title: btName, msg: 'DISCONNECTED' })
              Router.focusWidget('Fail')
            }
          }
        }
      })
      this._bt.registerEvent('onDiscoveryCompleted', () => {
        this.tag('Searching.Loader').visible = false
        this.loadingAnimation.stop()
        this.renderDeviceList()
      })
      this._bt.registerEvent('onDiscoveryStarted', () => {
        this.loadingAnimation.start()
        this.tag('Searching.Loader').visible = true
      })
      this._bt.registerEvent('onRequestFailed', notification => {
        //console.log(`onRequestFailed name = ${notification.name} new status = ${notification.newStatus}`)
        this._bt.startScanAudioOut()
        this.renderDeviceList()
        if (this.widgets.fail) {
          this.widgets.fail.notify({ title: notification.name, msg: notification.newStatus })
          Router.focusWidget('Fail')
        }
      })
      this._bt.registerEvent('onConnectionRequest', notification => {
        console.log('onConnectionRequest =>' + JSON.stringify(notification))        
        if(this._bt.isAudioOutDev(notification.deviceType)) {
          console.log(`respond to device, name = ${notification.name}`)
          this.respondToConnectionRequest(notification.deviceID, 'ACCEPTED')
          this._bt.connect(notification.deviceID, notification.deviceType).then(result => {            
            if (!result) {
              this.widgets.fail.notify({ title: notification.name, msg: 'Connection Failed' })
              Router.focusWidget('Fail')
            } else {
              this._bt.setAudioStream(notification.deviceID).then(result => {
                console.log('result' + JSON.stringify(result))
                /*mute other channels??*/
              })
              this.muteAudioPorts(true)
            }
          })
        }
      })
      this._bt.registerEvent('onDeviceLost', notification => {
        console.log('onDeviceLost notification = ' + JSON.stringify(notification))
        if(this._bt.isAudioOutDev(notification.deviceType) && notification.lastConnectedState) {
          this.muteAudioPorts(false)
          this.widgets.fail.notify({ title: notification.name, msg: 'Disconnected' })
          Router.focusWidget('Fail')
        }
      })
      this.initialCheckMuteStatus();     
    })
    .catch(err => {
      console.log(err)
    })

  }
  
  async initialCheckMuteStatus() {    
    var result = await this._bt.getConnectedDevices()
    var connAudioDevList = await result.filter((item) => {
        return this._bt.isAudioOutDev(item.deviceType);
        }, this)
    if (connAudioDevList.length) {
      this.muteAudioPorts(true)
    }
  }

  /**
   * Function to respond to Bluetooth client.
   * @param {number} deviceID
   * @param {string} responseValue
   */
  respondToPairingRequest(deviceID, responseValue) {
    this._bt.respondToEvent(deviceID, 'onPairingRequest', responseValue)
  }
  
  respondToConnectionRequest(deviceID, responseValue) {
    this._bt.respondToEvent(deviceID, 'onConnectionRequest', responseValue)
  }
  
  muteAudioPorts(mute) {
    this._appApi.getConnectedAudioPorts().then(res => {
      console.log('connected ports:' + JSON.stringify(res))
      res.connectedAudioPorts.forEach((port, i) => {
        console.log("Port name = " + res.connectedAudioPorts[i])
        this._appApi.audio_mute(mute, res.connectedAudioPorts[i])
      })
    })
  }
}
