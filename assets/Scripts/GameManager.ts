import { _decorator, AudioClip, Component, director, game, instantiate, Node, Prefab } from 'cc';
import { GameOverUI } from './UI/GameOverUI';
import { AudioMgr } from './AudioMgr';
import { SceneItemManager } from './SceneItemManager';
const { ccclass, property } = _decorator;

/**
 * 游戏管理器，负责全局游戏状态管理
 * - 分数计算
 * - 生命值管理
 * - 游戏暂停/恢复
 * - 游戏结束处理
 */
@ccclass('GameManager')
export class GameManager extends Component {
    // ======================
    // 游戏状态属性
    // ======================
    @property
    bombNumber: number = 0;  // 当前炸弹数量
    @property
    hpNumber: number = 3;    // 当前生命值
    @property
    score: number = 0;       // 当前分数

    // ======================
    // UI节点引用
    // ======================
    @property(Node)
    pauseButton: Node = null;    // 暂停按钮
    @property(Node)
    resumeButton: Node = null;   // 恢复按钮
    @property(GameOverUI)
    gameOverUI: GameOverUI = null; // 游戏结束UI

    // ======================
    // 音频资源
    // ======================
    @property(AudioClip)
    gameMusic: AudioClip = null;     // 游戏背景音乐
    @property(AudioClip)
    buttonAudio: AudioClip = null;   // 按钮点击音效
    @property(AudioClip)
    gameOverAudio: AudioClip = null; // 游戏结束音效

    // ======================
    // 单例模式实现
    // ======================
    private static _instance: GameManager;
    public static getInstance(): GameManager {
        return this._instance;
    }
    protected onLoad(): void {
        GameManager._instance = this;
    }

    // ======================
    // 游戏初始化
    // ======================
    protected start(): void {
        AudioMgr.inst.play(this.gameMusic, 0.3); // 播放背景音乐
    }
    // ======================
    // 游戏状态管理方法
    // ======================
    public AddBomb() {
        this.bombNumber++;
        this.node.emit('onBombChange'); // 通知炸弹数量变化
    }

    public SubHp() {
        this.hpNumber--;
        this.node.emit('onHpChange'); // 通知生命值变化
    }

    public addScore(s: number) {
        this.score += s;
        this.node.emit('onScoreChange'); // 通知分数变化
    }

    // ======================
    // 游戏暂停/恢复控制
    // ======================
    public onPauseButton() {
        AudioMgr.inst.playOneShot(this.buttonAudio, 0.1); // 播放按钮音效
        director.pause(); // 暂停游戏
        this.pauseButton.active = false;
        this.resumeButton.active = true;
    }

    public onResumeButton() {
        AudioMgr.inst.playOneShot(this.buttonAudio, 0.1); // 播放按钮音效
        director.resume(); // 恢复游戏
        this.pauseButton.active = true;
        this.resumeButton.active = false;
    }
    // ======================
    // 游戏结束处理
    // ======================
    public gameOver() {
        // 音频控制
        AudioMgr.inst.stop(); // 停止背景音乐
        AudioMgr.inst.playOneShot(this.gameOverAudio, 1); // 播放游戏结束音效

        // 清理场景中的敌人
        const sceneItemManager = SceneItemManager.getInstance();
        if (sceneItemManager) {
            const enemies = [...sceneItemManager.enemyArray];
            for (let enemy of enemies) {
                if (enemy && enemy.node && enemy.node.isValid) {
                    enemy.node.destroy(); // 销毁敌人节点
                }
            }
        }

        this.onPauseButton(); // 暂停游戏

        // 最高分处理
        let highestScore = localStorage.getItem('HighestScore');
        let highestScoreInt = 0;
        if (highestScore != null) {
            highestScoreInt = parseInt(highestScore, 10);
        }
        if (this.score > highestScoreInt) {
            localStorage.setItem('HighestScore', this.score.toString()); // 保存新最高分
        }

        // 显示游戏结束UI
        this.gameOverUI.showGameOverUI(highestScoreInt, this.score);
    }
    // ======================
    // 游戏重启控制
    // ======================
    public onRestartButtonClick() {
        AudioMgr.inst.playOneShot(this.buttonAudio, 0.1); // 播放按钮音效
        director.loadScene(director.getScene().name); // 重新加载当前场景
        this.onResumeButton(); // 恢复游戏
    }

    // ======================
    // 辅助方法
    // ======================
    public isHaveBomb(): boolean {
        return this.bombNumber > 0; // 检查是否有炸弹
    }
}