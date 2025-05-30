import { _decorator, Component, LabelComponent, Node } from 'cc';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

@ccclass('Bomb')
export class Bomb extends Component {
    @property(LabelComponent)
    numberLabel: LabelComponent = null;

    start() {
        GameManager.getInstance().node.on("onBombChange", this.onBombChange, this)
    }

    onBombChange = () => {
        this.numberLabel.string = GameManager.getInstance().bombNumber.toString();
    }
}

