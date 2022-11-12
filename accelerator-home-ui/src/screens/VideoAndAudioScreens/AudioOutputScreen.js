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
import AppApi from '../../api/AppApi.js';
import AudioOutputItem from '../../items/AudioOutputItem'
import BluetoothApi from '../../api/BluetoothApi'

/**
 * Class for Resolution Screen.
 */

export default class AudioOutputScreen extends Lightning.Component {
    pageTransition() {
        return 'left'
    }

    _onChanged() {
        this.widgets.menu.updateTopPanelText(Language.translate('Settings / Audio / Output'));
    }
    static _template() {
        return {
            rect: true,
            color: 0xff000000,
            w: 1920,
            h: 1080,
            AudioOutputScreenContents: {
                x: 200,
                y: 275,
                List: {
                    type: Lightning.components.ListComponent,
                    w: 1920 - 300,
                    itemSize: 90,
                    horizontal: false,
                    invertDirection: true,
                    roll: true,
                },
            }
        }
    }

    $resetPrevTickObject(prevTicObject) {
        if (!this.prevTicOb) {
            this.prevTicOb = prevTicObject;

        }
        else {
            this.prevTicOb.tag("Item.Tick").visible = false;

            this.prevTicOb = prevTicObject;

        }
    }

    _init() {
        this.appApi = new AppApi()
        this.btApi = new BluetoothApi()
    }
    
    /*set params(args) {
    }*/

    _focus() {
        this.renderAudioOutputList()
    }

    _firstEnable() {
      this.btApi.checkPluginStatus().then((res) => {
        if(res[0].state !== 'activated') {
          this.btApi.activate().then((res) => {
            console.log(res)
          })
          .catch(err => {
              console.log(err)
          })
        }
      })
    }   
    
    async renderAudioOutputList() {
        const audPorts = await this.appApi.getConnectedAudioPorts()
        var connPorts = audPorts.connectedAudioPorts
        const pairedRes = await this.btApi.getPairedDevices()
        const pairedList = pairedRes.filter((item) => {
            return this.btApi.isAudioOutDev(item.deviceType);
        }, this)
        
        this.tag('AudioOutputScreenContents').h = (connPorts.length + pairedList.length) * 90
        this.tag('AudioOutputScreenContents.List').h = (connPorts.length + pairedList.length) * 90        
        var outputList = []

        for(let i = 0; i < connPorts.length; i++) {
            const muteStatus = await this.appApi.muteStatus(connPorts[i])
            outputList.push(
            {
                  outputAudioType: 'AUDIO_PORT',
                  name: connPorts[i],
                  deviceID: 0,
                  deviceType: 'audioport',
                  isTicked: !muteStatus.muted
            })
        }
        
        pairedList.forEach((device, i) => {
            outputList.push(
                {
                    outputAudioType: 'BT_DEVICE',
                    name: pairedList[i].name,
                    deviceID: pairedList[i].deviceID,
                    deviceType: pairedList[i].deviceType,
                    isTicked: pairedList[i].connected
                }
            )
        })
        this.tag('AudioOutputScreenContents.List').items = outputList.map((item, index) => {
            return {
                ref: 'Option' + index,
                w: 1920 - 300,
                h: 90,
                type: AudioOutputItem,
                item: item,
            }
        })
        this._setState("Options")
    }
    
    $muteOtherAudioOuputs(output) {
      let outputList = this.tag('AudioOutputScreenContents.List').items
      let selected = this.tag('AudioOutputScreenContents.List').element._item.name
      let mute = true

      for (let i = 0; i < outputList.length; i++) {
        mute = !(selected === outputList[i]._item.name)

        if (outputList[i]._item.outputAudioType === 'BT_DEVICE') {
            mute?this.btApi.disconnect(outputList[i]._item.deviceID, 
                outputList[i]._item.deviceType):
                this.btApi.connect(outputList[i]._item.deviceID, outputList[i]._item.deviceType)
        } else if (outputList[i]._item.outputAudioType === 'AUDIO_PORT') {
            this.appApi.audio_mute(mute, outputList[i]._item.name)
        }
      }
      this.fireAncestors("$updateAudioOutput", output)
    }
    

    static _states() {
        return [
            class Options extends this{
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

                }
            }
        ]
    }
}
