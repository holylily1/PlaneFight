import { _decorator, Component, director, Node, AudioClip } from 'cc';
import { AudioMgr } from './AudioMgr';
const { ccclass, property } = _decorator;

@ccclass('StartUI')
export class StartUI extends Component {
    @property(AudioClip)
    buttonAudio: AudioClip = null;  // 按钮点击音效

    onStartButtonClick() {
        AudioMgr.inst.playOneShot(this.buttonAudio); // 播放按钮音效

        director.loadScene('02-GameScene');
    }
}