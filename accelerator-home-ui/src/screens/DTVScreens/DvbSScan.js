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
import { Lightning, Utils, Language, Router } from "@lightningjs/sdk";
import { COLORS } from "../../colors/Colors";
import SettingsMainItem from "../../items/SettingsMainItem";
import { CONFIG } from "../../Config/Config";
import DTVApi from "../../api/DTVApi";
import Satellite from "./InputScreens/Satellite";
import Polarity from "./InputScreens/Polarity";
import FEC from "./InputScreens/FEC";
import Modulation from "./InputScreens/Modulation";
import SearchType from "./InputScreens/Searchtype";
import IntegerInput from "./InputScreens/IntegerInput";

const dtvApi = new DTVApi();
/**
 * Class for DVB Scan screen.
 */
export default class DvbSScan extends Lightning.Component {
  _onChanged() {
    this.tag("Scroller").y = 2; //to reset the position when this route is hit
    this.widgets.menu.updateTopPanelText(
      Language.translate("Settings / Live TV / Scan / DVB-S Scan")
    );
  }

  pageTransition() {
    return "left";
  }

  static _template() {
    return {
      rect: true,
      color: 0xff000000,
      w: 1920,
      h: 1080,
      DvbSScanScreenContents: {
        x: 200,
        y: 275,
        Wrapper: {
          y: -3,
          h: 635,
          w: 1700,
          clipping: true,
          Scroller: {
            y: 2,
            Satellite: {
              type: SettingsMainItem,
              Title: {
                x: 10,
                y: 45,
                mountY: 0.5,
                text: {
                  text: Language.translate("Satellite"),
                  textColor: COLORS.titleColor,
                  fontFace: CONFIG.language.font,
                  fontSize: 25,
                },
              },
              Button: {
                h: 45,
                w: 45,
                x: 1600,
                mountX: 1,
                y: 45,
                mountY: 0.5,
                src: Utils.asset("images/settings/Arrow.png"),
              },
            },
            Frequency: {
              y: 90,
              type: SettingsMainItem,
              Title: {
                x: 10,
                y: 45,
                mountY: 0.5,
                text: {
                  text: Language.translate("Frequency"),
                  textColor: COLORS.titleColor,
                  fontFace: CONFIG.language.font,
                  fontSize: 25,
                },
              },
              Button: {
                h: 45,
                w: 45,
                x: 1600,
                mountX: 1,
                y: 45,
                mountY: 0.5,
                src: Utils.asset("images/settings/Arrow.png"),
              },
            },
            Polarity: {
              y: 180,
              type: SettingsMainItem,
              Title: {
                x: 10,
                y: 45,
                mountY: 0.5,
                text: {
                  text: Language.translate("Polarity"),
                  textColor: COLORS.titleColor,
                  fontFace: CONFIG.language.font,
                  fontSize: 25,
                },
              },
              Button: {
                h: 45,
                w: 45,
                x: 1600,
                mountX: 1,
                y: 45,
                mountY: 0.5,
                src: Utils.asset("images/settings/Arrow.png"),
              },
            },
            SymbolRate: {
              y: 270,
              type: SettingsMainItem,
              Title: {
                x: 10,
                y: 45,
                mountY: 0.5,
                text: {
                  text: Language.translate("Symbol Rate"),
                  textColor: COLORS.titleColor,
                  fontFace: CONFIG.language.font,
                  fontSize: 25,
                },
              },
              Button: {
                h: 45,
                w: 45,
                x: 1600,
                mountX: 1,
                y: 45,
                mountY: 0.5,
                src: Utils.asset("images/settings/Arrow.png"),
              },
            },
            FEC: {
              y: 360,
              type: SettingsMainItem,
              Title: {
                x: 10,
                y: 45,
                mountY: 0.5,
                text: {
                  text: Language.translate("FEC"),
                  textColor: COLORS.titleColor,
                  fontFace: CONFIG.language.font,
                  fontSize: 25,
                },
              },
              Button: {
                h: 45,
                w: 45,
                x: 1600,
                mountX: 1,
                y: 45,
                mountY: 0.5,
                src: Utils.asset("images/settings/Arrow.png"),
              },
            },
            DVBS2: {
              y: 450,
              type: SettingsMainItem,
              Title: {
                x: 10,
                y: 45,
                mountY: 0.5,
                text: {
                  text: Language.translate("DVB-S2"),
                  textColor: COLORS.titleColor,
                  fontFace: CONFIG.language.font,
                  fontSize: 25,
                },
              },
              Button: {
                h: 45,
                w: 67,
                x: 1600,
                mountX: 1,
                y: 45,
                mountY: 0.5,
                src: Utils.asset("images/settings/ToggleOffWhite.png"),
              },
            },
            Modulation: {
              y: 540,
              type: SettingsMainItem,
              Title: {
                x: 10,
                y: 45,
                mountY: 0.5,
                text: {
                  text: Language.translate("Modulation"),
                  textColor: COLORS.titleColor,
                  fontFace: CONFIG.language.font,
                  fontSize: 25,
                },
              },
              Button: {
                h: 45,
                w: 45,
                x: 1600,
                mountX: 1,
                y: 45,
                mountY: 0.5,
                src: Utils.asset("images/settings/Arrow.png"),
              },
            },
            SearchType: {
              y: 630,
              type: SettingsMainItem,
              Title: {
                x: 10,
                y: 45,
                mountY: 0.5,
                text: {
                  text: Language.translate("Search Mode"),
                  textColor: COLORS.titleColor,
                  fontFace: CONFIG.language.font,
                  fontSize: 25,
                },
              },
              Button: {
                h: 45,
                w: 45,
                x: 1600,
                mountX: 1,
                y: 45,
                mountY: 0.5,
                src: Utils.asset("images/settings/Arrow.png"),
              },
            },
            Retune: {
              y: 720,
              type: SettingsMainItem,
              Title: {
                x: 10,
                y: 45,
                mountY: 0.5,
                text: {
                  text: Language.translate("Clear existing service list"),
                  textColor: COLORS.titleColor,
                  fontFace: CONFIG.language.font,
                  fontSize: 25,
                },
              },
              Button: {
                h: 45,
                w: 67,
                x: 1600,
                mountX: 1,
                y: 45,
                mountY: 0.5,
                src: Utils.asset("images/settings/ToggleOffWhite.png"),
              },
            },
          },
        },
        StartScan: {
          zIndex: 3,
          x: 10,
          y: 670,
          h: 50,
          w: 200,
          rect: true,
          color: 0xffffffff,
          Title: {
            x: 100,
            y: 27,
            mount: 0.5,
            text: {
              text: Language.translate("Start Scan"),
              textColor: 0xff000000,
              fontFace: CONFIG.language.font,
              fontSize: 24,
            },
          },
        },
        ErrorNotification: {
          x: 250,
          y: 670,
          h: 50,
          visible: false,
          Content: {
            x: 10,
            y: 25,
            mountY: 0.5,
            text: {
              text: Language.translate("Error!"),
              textColor: CONFIG.theme.hex,
              fontFace: CONFIG.language.font,
              fontSize: 21,
            },
          },
        },
      },
      SelectSatellite: {
        type: Satellite,
        visible: false,
      },
      SelectFrequency: {
        type: IntegerInput,
        visible: false,
      },
      SelectPolarity: {
        type: Polarity,
        visible: false,
      },
      SelectSymbolRate: {
        type: IntegerInput,
        visible: false,
      },
      SelectFEC: {
        type: FEC,
        visible: false,
      },
      SelectModulation: {
        type: Modulation,
        visible: false,
      },
      SelectSearchType: {
        type: SearchType,
        visible: false,
      },
    };
  }

  _init() {
    this._setState("Satellite");
    this.selectedSatellite = {};
    this.selectedFrequency = "";
    this.selectedPolarity = "";
    this.selectedSymbolRate = "";
    this.selectedFEC = "";
    this.selectedDVBS2 = false; //default value is false
    this.selectedModulation = "";
    this.selectedSearchType = "";
    this.selectedRetune = false; //default value is set to false
  }
  consoleLog() {
    //log it everywhere
    console.log(
      "selectedSatellite: ",
      JSON.stringify(this.selectedSatellite),
      " selectedFrequency: ",
      this.selectedFrequency,
      " selectedPolarity: ",
      this.selectedPolarity,
      " selectedSymbolRate: ",
      this.selectedSymbolRate,
      " selectedFEC: ",
      this.selectedFEC,
      " selectedDVBS2: ",
      this.selectedDVBS2,
      " selectedModulation: ",
      this.selectedModulation,
      " selectedSearchType: ",
      this.selectedSearchType,
      " selectedRetune: ",
      this.selectedRetune
    );
  }
  _focus() {
    // console.log("dvbscan screen in focus");
    this._setState("Satellite");
    this.consoleLog();
    // console.log(this.satelliteList);
    // console.log(this.polarityList);
    // console.log(this.fecList);
    // console.log(this.modulationList);
    // console.log(this.searchtypeList);
  }

  _firstActive() {
    ///////////////satellite

    // this.satelliteList = [
    //   {
    //     name: "Satellite 1",
    //     longitude: 282,
    //     lnb: "Universal",
    //   },
    //   {
    //     name: "Satellite 2",
    //     longitude: 282,
    //     lnb: "Universal",
    //   },
    // ]; //clear the satellite list and check the list is not empty before going to select satellite

    this.satelliteList = [];
    dtvApi.satelliteList().then((res) => {
      this.satelliteList = res;
    });

    ///////////////////polarity

    this.polarityList = [];
    dtvApi.polarityList().then((res) => {
      this.polarityList = res;
    });

    ////////////////////FEC

    this.fecList = [];
    dtvApi.fecList().then((res) => {
      this.fecList = res;
    });

    ///////////////////modulation

    this.modulationList = [];
    dtvApi.modulationList().then((res) => {
      this.modulationList = res;
    });

    ///////////////////searchtype

    this.searchtypeList = [];
    dtvApi.searchtypeList().then((res) => {
      this.searchtypeList = res;
    });
  }

  _handleBack() {
    this.resetForm();
    Router.navigate("settings/livetv/scan");
  }
  
  _handleMenu() {
    this._handleBack()
  }

  $getSatelliteList() {
    return this.satelliteList;
  }
  $setSatellite(satellite) {
    this.selectedSatellite = satellite;
    //this.consoleLog();
  }
  $getSelectedSatellite() {
    return this.selectedSatellite;
  }

  $getPolarityList() {
    return this.polarityList;
  }
  $setPolarity(polarity) {
    this.selectedPolarity = polarity;
    //this.consoleLog();
  }
  $getSelectedPolarity() {
    return this.selectedPolarity;
  }

  $getFECList() {
    return this.fecList;
  }
  $setFEC(fec) {
    this.selectedFEC = fec;
    //this.consoleLog();
  }
  $getSelectedFEC() {
    return this.selectedFEC;
  }

  $getModulationList() {
    return this.modulationList;
  }
  $setModulation(modulation) {
    this.selectedModulation = modulation;
    //this.consoleLog();
  }
  $getSelectedModulation() {
    return this.selectedModulation;
  }

  $getSearchTypeList() {
    return this.searchtypeList;
  }
  $setSearchType(searchtype) {
    this.selectedSearchType = searchtype;
    //this.consoleLog();
  }
  $getSelectedSearchType() {
    return this.selectedSearchType;
  }

  setFrequency(frequency) {
    this._setState("Frequency");
    this.selectedFrequency = frequency;
    // console.log(this.selectedFrequency);
    this.tag("Frequency.Title").text.text =
      "Frequency: " +
      (this.selectedFrequency !== ""
        ? this.selectedFrequency
        : "Select a Frequency");
    //this.consoleLog();
  }

  setSymbolRate(symbolrate) {
    this._setState("SymbolRate");
    this.selectedSymbolRate = symbolrate;
    // console.log(this.selectedSymbolRate);
    this.tag("SymbolRate.Title").text.text =
      "Symbol Rate: " +
      (this.selectedSymbolRate !== ""
        ? this.selectedSymbolRate
        : "Select a Symbol Rate");
    //this.consoleLog();
  }

  resetForm() {
    //reset the form variables to initial state on exit from this form
    //satellite*********************
    this.selectedSatellite = {};
    this.tag("Satellite.Title").text.text = "Satellite";
    //******************************
    //satellite*********************
    this.selectedFrequency = "";
    this.tag("Frequency.Title").text.text = "Frequency";
    //******************************
    //polarity*********************
    this.selectedPolarity = "";
    this.tag("Polarity.Title").text.text = "Polarity";
    //******************************
    //satellite*********************
    this.selectedSymbolRate = "";
    this.tag("SymbolRate.Title").text.text = "SymbolRate";
    //******************************
    //fec*********************
    this.selectedFEC = "";
    this.tag("FEC.Title").text.text = "FEC";
    //******************************
    //dvbs2*********************
    this.selectedDVBS2 = false;
    this.tag("DVBS2.Button").src = Utils.asset(
      "images/settings/ToggleOffWhite.png"
    );
    //******************************
    //modulation*********************
    this.selectedModulation = "";
    this.tag("Modulation.Title").text.text = "Modulation";
    //******************************
    //searchtype*********************
    this.selectedSearchType = "";
    this.tag("SearchType.Title").text.text = "Search Mode";
    //******************************
    //retune*********************
    this.selectedRetune = false;
    this.tag("Retune.Button").src = Utils.asset(
      "images/settings/ToggleOffWhite.png"
    );
    //******************************
    //startscan*********************
    this.tag("ErrorNotification").visible = false;
    //******************************
  }

  verifyInputs() {
    let errorString = "";
    if (Object.keys(this.selectedSatellite).length === 0) {
      errorString += "| Satellite ";
    }
    if (this.selectedFrequency === "") {
      errorString += "| Frequency ";
    }
    if (this.selectedPolarity === "") {
      errorString += "| Polarity ";
    }
    if (this.selectedSymbolRate === "") {
      errorString += "| Symbol Rate ";
    }
    if (this.selectedFEC === "") {
      errorString += "| FEC ";
    }
    if (this.selectedModulation === "") {
      errorString += "| Modulation ";
    }
    if (this.selectedSearchType === "") {
      errorString += "| Search Mode ";
    }
    return errorString;
  }

  static _states() {
    return [
      class Satellite extends this {
        $enter() {
          this.tag("Satellite")._focus();
        }
        $exit() {
          this.tag("Satellite")._unfocus();
        }
        _handleDown() {
          this._setState("Frequency");
        }
        _handleEnter() {
          // console.log(this.satelliteList);
          if (this.satelliteList.length > 0) {
            this._setState("Satellite.SelectSatellite");
          } else {
            dtvApi.satelliteList().then((res) => {
              this.satelliteList = res;
            });
          }
        }
        static _states() {
          return [
            class SelectSatellite extends Satellite {
              $enter() {
                this.tag("DvbSScanScreenContents").visible = false;
                this.tag("SelectSatellite").visible = true;
                this.widgets.menu.updateTopPanelText(
                  Language.translate(
                    "Settings / Live TV / Scan / DVB-S Scan / Satellite"
                  )
                );
              }
              $exit() {
                this.tag("SelectSatellite").visible = false;
                this.tag("DvbSScanScreenContents").visible = true;
                this.widgets.menu.updateTopPanelText(
                  Language.translate("Settings / Live TV / Scan / DVB-S Scan")
                );
                this.tag("Satellite.Title").text.text =
                  "Satellite: " +
                  (Object.keys(this.selectedSatellite).length !== 0
                    ? this.selectedSatellite.name
                    : "Select a Satellite"); //format the not selected state(currently will show undefined)
              }
              _getFocused() {
                return this.tag("SelectSatellite");
              }
              _handleBack() {
                this._setState("Satellite");
              }
              _handleMenu() {
                this._handleBack()
              }
            },
          ];
        }
      },
      class Frequency extends this {
        $enter() {
          this.tag("Frequency")._focus();
        }
        $exit() {
          this.tag("Frequency")._unfocus();
        }
        _handleUp() {
          this._setState("Satellite");
        }
        _handleDown() {
          this._setState("Polarity");
        }
        _handleEnter() {
          this.tag("SelectFrequency").patch({
            prevVal: this.selectedFrequency, //previous value is passed to retain the previously entered value
            onHandleDone: this.setFrequency.bind(this),
          }); //pass a function that will be executed when done is clicked on the keyboard
          this._setState("Frequency.SelectFrequency");
        }
        static _states() {
          return [
            class SelectFrequency extends Frequency {
              $enter() {
                this.tag("DvbSScanScreenContents").visible = false;
                this.tag("SelectFrequency").visible = true;
                this.widgets.menu.updateTopPanelText(
                  Language.translate(
                    "Settings / Live TV / Scan / DVB-S Scan / Frequency"
                  )
                );
              }
              $exit() {
                this.tag("SelectFrequency").visible = false;
                this.tag("DvbSScanScreenContents").visible = true;
                this.widgets.menu.updateTopPanelText(
                  Language.translate("Settings / Live TV / Scan / DVB-S Scan")
                );
              }
              _getFocused() {
                return this.tag("SelectFrequency");
              }
              _handleBack() {
                this.setFrequency(this.selectedFrequency);
              }
              _handleMenu() {
                this._handleBack()
              }
            },
          ];
        }
      },
      class Polarity extends this {
        $enter() {
          this.tag("Polarity")._focus();
        }
        $exit() {
          this.tag("Polarity")._unfocus();
        }
        _handleUp() {
          this._setState("Frequency");
        }
        _handleDown() {
          this._setState("SymbolRate");
        }
        _handleEnter() {
          // console.log(this.polarityList); //polarity list will be always available as it is static data
          this._setState("Polarity.SelectPolarity");
        }
        static _states() {
          return [
            class SelectPolarity extends Polarity {
              $enter() {
                this.tag("DvbSScanScreenContents").visible = false;
                this.tag("SelectPolarity").visible = true;
                this.widgets.menu.updateTopPanelText(
                  Language.translate(
                    "Settings / Live TV / Scan / DVB-S Scan / Polarity"
                  )
                );
              }
              $exit() {
                this.tag("SelectPolarity").visible = false;
                this.tag("DvbSScanScreenContents").visible = true;
                this.widgets.menu.updateTopPanelText(
                  Language.translate("Settings / Live TV / Scan / DVB-S Scan")
                );
                this.tag("Polarity.Title").text.text =
                  "Polarity: " +
                  (this.selectedPolarity !== ""
                    ? this.selectedPolarity.charAt(0).toUpperCase() +
                      this.selectedPolarity.slice(1)
                    : "Select a Polarity");
              }
              _getFocused() {
                return this.tag("SelectPolarity");
              }
              _handleBack() {
                this._setState("Polarity");
              }
              _handleMenu() {
                this._handleBack()
              }
            },
          ];
        }
      },
      class SymbolRate extends this {
        $enter() {
          this.tag("SymbolRate")._focus();
        }
        $exit() {
          this.tag("SymbolRate")._unfocus();
        }
        _handleUp() {
          this._setState("Polarity");
        }
        _handleDown() {
          this._setState("FEC");
        }
        _handleEnter() {
          this.tag("SelectSymbolRate").patch({
            prevVal: this.selectedSymbolRate, //previous value is passed to retain the previously entered value
            onHandleDone: this.setSymbolRate.bind(this),
          }); //pass a function that will be executed when done is clicked on the keyboard
          this._setState("SymbolRate.SelectSymbolRate");
        }
        static _states() {
          return [
            class SelectSymbolRate extends SymbolRate {
              $enter() {
                this.tag("DvbSScanScreenContents").visible = false;
                this.tag("SelectSymbolRate").visible = true;
                this.widgets.menu.updateTopPanelText(
                  Language.translate(
                    "Settings / Live TV / Scan / DVB-S Scan / Symbol Rate"
                  )
                );
              }
              $exit() {
                this.tag("SelectSymbolRate").visible = false;
                this.tag("DvbSScanScreenContents").visible = true;
                this.widgets.menu.updateTopPanelText(
                  Language.translate("Settings / Live TV / Scan / DVB-S Scan")
                );
              }
              _getFocused() {
                return this.tag("SelectSymbolRate");
              }
              _handleBack() {
                this.setSymbolRate(this.selectedSymbolRate);
              }
              _handleMenu() {
                this._handleBack()
              }
            },
          ];
        }
      },
      class FEC extends this {
        $enter() {
          this.tag("FEC")._focus();
        }
        $exit() {
          this.tag("FEC")._unfocus();
        }
        _handleUp() {
          this._setState("SymbolRate");
        }
        _handleDown() {
          this._setState("DVBS2");
        }
        _handleEnter() {
          // console.log(this.fecList); //fec list will be always available as it is static data
          this._setState("FEC.SelectFEC");
        }
        static _states() {
          return [
            class SelectFEC extends FEC {
              $enter() {
                this.tag("DvbSScanScreenContents").visible = false;
                this.tag("SelectFEC").visible = true;
                this.widgets.menu.updateTopPanelText(
                  Language.translate(
                    "Settings / Live TV / Scan / DVB-S Scan / FEC"
                  )
                );
              }
              $exit() {
                this.tag("SelectFEC").visible = false;
                this.tag("DvbSScanScreenContents").visible = true;
                this.widgets.menu.updateTopPanelText(
                  Language.translate("Settings / Live TV / Scan / DVB-S Scan")
                );
                this.tag("FEC.Title").text.text =
                  "FEC: " +
                  (this.selectedFEC !== ""
                    ? this.selectedFEC
                        .replace("fec", "")
                        .replace("_", "/")
                        .toUpperCase()
                    : "Select a FEC");
              }
              _getFocused() {
                return this.tag("SelectFEC");
              }
              _handleBack() {
                this._setState("FEC");
              }
              _handleMenu() {
                this._handleBack()
              }
            },
          ];
        }
      },
      class DVBS2 extends this {
        $enter() {
          this.tag("DVBS2")._focus();
        }
        $exit() {
          this.tag("DVBS2")._unfocus();
        }
        _handleUp() {
          this._setState("FEC");
        }
        _handleDown() {
          this._setState("Modulation");
        }
        _handleEnter() {
          if (!this.selectedDVBS2) {
            this.selectedDVBS2 = true;
            this.tag("DVBS2.Button").src = Utils.asset(
              "images/settings/ToggleOnOrange.png"
            );
          } else {
            this.selectedDVBS2 = false;
            this.tag("DVBS2.Button").src = Utils.asset(
              "images/settings/ToggleOffWhite.png"
            );
          }
          // console.log(this.selectedDVBS2);
        }
      },
      class Modulation extends this {
        $enter() {
          this.tag("Modulation")._focus();
        }
        $exit() {
          this.tag("Modulation")._unfocus();
        }
        _handleUp() {
          this._setState("DVBS2");
        }
        _handleDown() {
          this.tag("Scroller").y = -88;
          this._setState("SearchType");
        }
        _handleEnter() {
          // console.log(this.modulationList); //Modulation list will be always available as it is static data
          this._setState("Modulation.SelectModulation");
        }
        static _states() {
          return [
            class SelectModulation extends Modulation {
              $enter() {
                this.tag("DvbSScanScreenContents").visible = false;
                this.tag("SelectModulation").visible = true;
                this.widgets.menu.updateTopPanelText(
                  Language.translate(
                    "Settings / Live TV / Scan / DVB-S Scan / Modulation"
                  )
                );
              }
              $exit() {
                this.tag("SelectModulation").visible = false;
                this.tag("DvbSScanScreenContents").visible = true;
                this.widgets.menu.updateTopPanelText(
                  Language.translate("Settings / Live TV / Scan / DVB-S Scan")
                );
                this.tag("Modulation.Title").text.text =
                  "Modulation: " +
                  (this.selectedModulation !== ""
                    ? this.selectedModulation.toUpperCase()
                    : "Select a Modulation"); //format the not selected state(currently will show undefined)
              }
              _getFocused() {
                return this.tag("SelectModulation");
              }
              _handleBack() {
                this._setState("Modulation");
              }
              _handleMenu() {
                this._handleBack()
              }              
            },
          ];
        }
      },
      class SearchType extends this {
        $enter() {
          this.tag("SearchType")._focus();
        }
        $exit() {
          this.tag("SearchType")._unfocus();
        }
        _handleUp() {
          this.tag("Scroller").y = 2;
          this._setState("Modulation");
        }
        _handleDown() {
          this.tag("Scroller").y = -178;
          this._setState("Retune");
        }
        _handleEnter() {
          // console.log(this.searchtypeList); //Modulation list will be always available as it is static data
          this._setState("SearchType.SelectSearchType");
        }
        static _states() {
          return [
            class SelectSearchType extends SearchType {
              $enter() {
                this.tag("DvbSScanScreenContents").visible = false;
                this.tag("SelectSearchType").visible = true;
                this.widgets.menu.updateTopPanelText(
                  Language.translate(
                    "Settings / Live TV / Scan / DVB-S Scan / Search Mode"
                  )
                );
              }
              $exit() {
                this.tag("SelectSearchType").visible = false;
                this.tag("DvbSScanScreenContents").visible = true;
                this.widgets.menu.updateTopPanelText(
                  Language.translate("Settings / Live TV / Scan / DVB-S Scan")
                );
                // console.log(this.selectedSearchType);
                this.tag("SearchType.Title").text.text =
                  "Search Mode: " +
                  (this.selectedSearchType !== ""
                    ? this.selectedSearchType.charAt(0).toUpperCase() +
                      this.selectedSearchType.slice(1)
                    : "Select a Search Mode"); //format the not selected state(currently will show undefined)
              }
              _getFocused() {
                return this.tag("SelectSearchType");
              }
              _handleBack() {
                this._setState("SearchType");
              }             
              _handleMenu() {
                this._handleBack()
              }
            },
          ];
        }
      },
      class Retune extends this {
        $enter() {
          this.tag("Retune")._focus();
        }
        $exit() {
          this.tag("Retune")._unfocus();
        }
        _handleUp() {
          this.tag("Scroller").y = -88;
          this._setState("SearchType");
        }
        _handleDown() {
          this._setState("StartScan");
        }
        _handleEnter() {
          if (!this.selectedRetune) {
            this.selectedRetune = true;
            this.tag("Retune.Button").src = Utils.asset(
              "images/settings/ToggleOnOrange.png"
            );
          } else {
            this.selectedRetune = false;
            this.tag("Retune.Button").src = Utils.asset(
              "images/settings/ToggleOffWhite.png"
            );
          }
          // console.log(this.selectedRetune);
        }
      },
      class StartScan extends this {
        $enter() {
          this.tag("StartScan").color = CONFIG.theme.hex;
          this.tag("StartScan.Title").text.textColor = 0xffffffff;
        }
        $exit() {
          this.tag("StartScan").color = 0xffffffff;
          this.tag("StartScan.Title").text.textColor = 0xff000000;
        }
        _handleUp() {
          this._setState("Retune");
        }
        _handleEnter() {
          let errorString = this.verifyInputs();
          if (errorString === "") {
            this.tag("ErrorNotification").visible = false;
            let serviceSearchParams = {
              tunertype: "dvbs",
              searchtype: this.selectedSearchType,
              retune: this.selectedRetune,
              usetuningparams: true,
              dvbstuningparams: {
                satellite: this.selectedSatellite.name,
                frequency: parseInt(this.selectedFrequency),
                polarity: this.selectedPolarity,
                symbolrate: parseInt(this.selectedSymbolRate),
                fec: this.selectedFEC,
                modulation: this.selectedModulation,
                dvbs2: this.selectedDVBS2,
              },
            };
            console.log(JSON.stringify(serviceSearchParams));
            dtvApi.startServiceSearch(serviceSearchParams).then((res) => {
              console.log(res);
            });
          } else {
            this.tag(
              "ErrorNotification.Content"
            ).text.text = Language.translate(
              "Please enter the values for the following " + errorString
            );
            this.tag("ErrorNotification").visible = true;
          }
        }
      },
    ];
  }
}
