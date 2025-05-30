import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {
    @property
    speed: number = 500;
    protected update(dt: number): void {
        const position = this.node.position;
        this.node.setPosition(position.x, position.y + this.speed * dt, position.z);
        if (position.y > 700) {
            this.node.destroy();
        }
    }
}


