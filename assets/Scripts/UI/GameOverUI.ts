import { _decorator, Component, director, LabelComponent, Node } from 'cc';
import { GameManager } from '../GameManager';
const { ccclass, property } = _decorator;

@ccclass('GameOverUI')
export class GameOverUI extends Component {
    @property(LabelComponent)
    highestScoreLabel: LabelComponent = null;
    @property(LabelComponent)
    currentScoreLabel: LabelComponent = null;



    showGameOverUI = (highestScoreLabel: number, currentScoreLabel: number) => {
        this.node.active = true;
        this.highestScoreLabel.string = highestScoreLabel.toString();
        this.currentScoreLabel.string = currentScoreLabel.toString();
    }
    // this.numberLabel.string = GameManager.getInstance().bombNumber.toString();

}

