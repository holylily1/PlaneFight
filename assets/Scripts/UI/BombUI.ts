import { _decorator, Component, LabelComponent } from "cc";
import { GameManager } from "../Mgr/GameManager";
const { ccclass, property } = _decorator;

@ccclass("Bomb")
export class Bomb extends Component {
  @property(LabelComponent)
  numberLabel: LabelComponent = null;

  start() {
    GameManager.ins().node.on("onBombChange", this.onBombChange, this);
  }

  onBombChange = () => {
    this.numberLabel.string = GameManager.ins().bombNumber.toString();
  };
}
