import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Bg')
export class Bg extends Component {
    @property(Node)
    bg01: Node = null!;
    @property(Node)
    bg02: Node = null!;
    @property
    speed: number = 100;

    protected update(dt: number): void {
        let p1 = this.bg01.position;
        let p2 = this.bg02.position;

        this.bg01.setPosition(p1.x, p1.y - this.speed * dt, p1.z);
        this.bg02.setPosition(p2.x, p2.y - this.speed * dt, p2.z);

        if (this.bg01.position.y < -852) {
            this.bg01.setPosition(p2.x, p2.y + 852, p2.z);
        }
        if (this.bg02.position.y < -852) {
            this.bg02.setPosition(p1.x, p1.y + 852, p1.z);
        }
    }
}


