import { _decorator, Component, LabelComponent } from "cc";
import { GameManager } from "../Mgr/GameManager";
const { ccclass, property } = _decorator;

@ccclass("HpUI")
export class HpUI extends Component {
  @property(LabelComponent)
  numberLabel: LabelComponent = null;
  start() {
    GameManager.ins().node.on("onHpChange", this.onHpChange, this);
  }

  onHpChange = () => {
    this.numberLabel.string = GameManager.ins().hpNumber.toString();
  };
}
