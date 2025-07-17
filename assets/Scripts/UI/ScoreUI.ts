import { _decorator, Component, LabelComponent, Node } from 'cc';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

@ccclass('ScoreUI')
export class ScoreUI extends Component {
    @property(LabelComponent)
    numberLabel: LabelComponent = null;
    score: number = 0;
    start() {
        GameManager.getInstance().node.on("onScoreChange", this.onScoreChange, this)
    }

    onScoreChange = () => {
        this.numberLabel.string = GameManager.getInstance().score.toString();
    }
}


