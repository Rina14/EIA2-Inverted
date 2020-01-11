namespace L12_AsteroidsAddition {
  class Gun extends Bar {
    private static size: Vector = new Vector(-15, 6);
    // position: Vector;

    public constructor(_position: Vector) {
      super(_position, Gun.size);
    }

    public draw(_charge: number): void {
      super.draw(_charge, getColorCharge(_charge, 1), "white");
    }
  }

  export class Ship extends Moveable {
    private static acceleration: number = 20;
    private static timeToChargeFully: number = 1;
    private static timeCooling: number = 0.5; // time the laser gun cools down before charge starts
    public gunLeft: Gun = new Gun(new Vector(10, -12));
    public gunRight: Gun = new Gun(new Vector(10, 12));
    public charged: number = 0;
    // private static maxCharge: number = 1;
    // private charge: number = 0;
    private rotation: number = 0;
    private exhaust: boolean = false;
    private charging: boolean = false;

    public constructor(_position: Vector) {
      super(_position);

      this.velocity = new Vector();
      this.hitRadius = 10;
    }

    public charge(_on: boolean): void {
      this.charging = _on;
      if (!_on)
        this.charged = 0;
    }

    public head(_target: Vector): void {
      let difference: Vector = Vector.getDifference(_target, this.position);
      this.rotation = Math.atan2(difference.y, difference.x);
    }

    public thrust(): void {
      let change: Vector = Vector.getPolar(this.rotation, Ship.acceleration);
      this.velocity.add(change);
      // console.log(this.velocity);
      this.exhaust = true;
      Sound.play("thrust");
    }

    public draw(): void {
      crc2.save();
      crc2.translate(this.position.x, this.position.y);
      crc2.rotate(this.rotation);
      crc2.beginPath();
      crc2.moveTo(-5, 10);
      crc2.lineTo(20, 0);
      crc2.lineTo(-5, -10);
      crc2.moveTo(0, 8);
      crc2.lineTo(0, -8);
      crc2.stroke();

      this.gunLeft.draw(this.charged);
      this.gunRight.draw(this.charged);

      if (this.exhaust)
        this.drawExhaust();

      crc2.restore();
      this.exhaust = false;
    }

    public drawExhaust(): void {
      crc2.moveTo(0, 0);
      crc2.lineTo(-7, 5);
      crc2.lineTo(-15, 0);
      crc2.lineTo(-7, -5);
      crc2.closePath();
      crc2.stroke();
    }

    public move(_timeslice: number): void {
      if (this.charging)
        this.charged += _timeslice / Ship.timeToChargeFully;
      this.velocity.scale(0.99);
      super.move(_timeslice);
    }

    public shoot(_target: Vector): void {
      this.charging = false;
      if (this.charged < 0)
        return;
      // console.log("Ship shoots");
      let event: CustomEvent = new CustomEvent(ASTEROID_EVENT.SHIP_SHOOTS, {
        detail: {
          target: _target,
          charge: this.charged,
          rotation: this.rotation,
          pathLaserLeft: this.getLaserPath(this.gunLeft, _target),
          pathLaserRight: this.getLaserPath(this.gunRight, _target)
        }
      });
      this.charge(false);
      this.charged = -Ship.timeCooling / Ship.timeToChargeFully;
      crc2.canvas.dispatchEvent(event);
    }

    public getLaserPath(_gun: Gun, _target: Vector): Function {
      let position: Vector = this.position.copy();
      let rotation: number = this.rotation;
      return () => {
        crc2.save();
        crc2.beginPath();
        crc2.translate(position.x, position.y);
        crc2.rotate(rotation);
        crc2.moveTo(_gun.position.x, _gun.position.y);
        crc2.restore();
        crc2.lineTo(_target.x, _target.y);
      };
    }
  }
}