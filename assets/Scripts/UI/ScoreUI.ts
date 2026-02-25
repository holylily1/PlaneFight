import { _decorator, Component, LabelComponent } from "cc";
import { GameManager } from "../Mgr/GameManager";
const { ccclass, property } = _decorator;

@ccclass("ScoreUI")
export class ScoreUI extends Component {
  @property(LabelComponent)
  numberLabel: LabelComponent = null;
  start() {
    GameManager.ins().node.on("onScoreChange", this.onScoreChange, this);
  }

  onScoreChange = () => {
    this.numberLabel.string = GameManager.ins().score.toString();
  };
}
