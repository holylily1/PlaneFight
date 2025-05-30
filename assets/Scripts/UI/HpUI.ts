import { _decorator, Component, LabelComponent, Node } from 'cc';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

@ccclass('HpUI')
export class HpUI extends Component {
    @property(LabelComponent)
    numberLabel: LabelComponent = null;
    start() {
        GameManager.getInstance().node.on("onHpChange", this.onHpChange, this)
    }

    onHpChange = () => {
        this.numberLabel.string = GameManager.getInstance().hpNumber.toString();
    }
}


