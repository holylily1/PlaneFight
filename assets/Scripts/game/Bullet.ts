import { _decorator, Component } from "cc";
import { Tools } from "../Tools";
const { ccclass, property } = _decorator;

@ccclass("Bullet")
export class Bullet extends Component {
  @property
  speed: number = 500;

  // 是否是单发子弹（用于确定行为）
  public isOneShoot: boolean = true;

  protected update(dt: number): void {
    const position = this.node.position;
    this.node.setPosition(position.x, position.y + this.speed * dt, position.z);

    // 检查子弹是否超出屏幕
    if (position.y > 700) {
      // 使用Tools回收子弹
      Tools.ins.putNodeToPool(Bullet, this.node);
    }
  }
}
