function System(){ // 게임의 전체 진행 담당
  "use strict";

  this.objectList = {tank:{},bullet:{}};
  this.uiObjectList = [];

  this.tankList = [
    Basic,
    Twin,
    Triplet,
    TripleShot,
    QuadTank,
    OctoTank,
    Sniper,
    MachineGun,
    FlankGuard,
    TriAngle,
    Destroyer
  ];

  this.colorList = [
    new RGB(230,176,138),
    new RGB(228,102,233),
    new RGB(148,102,234),
    new RGB(103,144,234),
    new RGB(234,178,102),
    new RGB(231,103,98),
    new RGB(147,234,103),
    new RGB(103,233,233)
  ];

  this.tick = 0;
  this.lastTime = Date.now();

  this.input = {
    isMouseOverUi: false,
    shot: 0,
    moveRotate: null,
    moveVector: new Vector(0,0),
    space: false,
    leftMouse: false,
    w: false,
    a: false,
    s: false,
    d: false,
    k: false,
    changeTank: false,
    target: {
      x:0,
      y:0
    }
  };

  this.drawObject = new DrawObject();

  this.createTankObject = function (id,type){
    let obj = new type();
    this.objectList.tank[id]=obj;
    this.objectList.tank[id].setId(id);
    return obj;
  }

  this.createBulletObject = function (id,type){
    let obj = new basicBullet();
    this.objectList.bullet[id]=obj;
    this.ojbectList.bullet[id].setId(id);
    return obj;
  }

  this.createUiObject = function (type){
    let obj = new type();
    this.uiObjectList.push(obj);
    return obj;
  }

  this.removeObject = function (id,type){
    switch (type){
      case "tank":
        this.objectList.tank[id] = null;
      break;
      case "bullet":
        this.objectList.bullet[id] = null;
      break;
      default:
      break;
    }
  }

  this.controlTank;

  socket.emit('login');

  socket.on('spawn',(data) => {
    this.controlTank = this.createTankObject(data.id,this.tankList[data.type]);
    this.controlTank.setPosition(data.x,data.y);
    this.controlTank.setName(data.name);
  });

  socket.on('objectList', (tankList) => {
    for (let key in tankList){ // 탱크 지정
      if (tankList[key]){
        if (this.objectList.tank[tankList[key].id]){
          let objTank = this.objectList.tank[tankList[key].id];
          objTank.setRadius(tankList[key].radius);
          objTank.setPosition(tankList[key].x,tankList[key].y);
          objTank.setDPosition(tankList[key].dx,tankList[key].dy);
          let tankType = new this.tankList[tankList[key].type]().tankType;
          if (tankType != this.controlTank.tankType)
            objTank.changeTank(this.tankList[tankList[key].type]);
          console.log(tankList[key].isCollision);
          if (tankList[key].isCollision)
            objTank.hit(0.1 * this.tick * 0.05);
          if (objTank.id == this.controlTank.id){

          }
          else{

            objTank.setRotate(tankList[key].rotate);
          }
        }
        else{
          let objTank = this.createTankObject(tankList[key].id,this.tankList[tankList[key].type]);
          objTank.setPosition(tankList[key].x,tankList[key].y);
          objTank.setName(tankList[key].name);
          objTank.setRadius(tankList[key].radius);
          objTank.setRotate(tankList[key].rotate);
        }
      }
    }
  });

  socket.on('objectDead', (type,data) => {
    switch(type){
      case "tank":
        if (this.objectList.tank[data.id]){
          this.objectList.tank[data.id].dead();
        }
      break;
      default:
      break;
    }
  });

  this.showTankLevel = this.createUiObject(Text);

  this.showUpgradeTank = [
    this.createUiObject(Button),
    this.createUiObject(Button),
    this.createUiObject(Button),
    this.createUiObject(Button),
    this.createUiObject(Button),
    this.createUiObject(Button)
  ];

  this.uiSet = function (){
    let whz = this.drawObject.getCanvasSize();


    if (this.controlTank){
      this.showTankLevel.setPosition(whz[0]/2,whz[1]-50 * whz[2],0);
      this.showTankLevel.setText(this.controlTank.name);
      this.showTankLevel.setSize(20);
    }
/*
    this.showUpgradeTank[0].setPosition(43.3*whz[2],62.3*whz[2],122.8*whz[2],141.8*whz[2]);
    this.showUpgradeTank[0].setColor(new RGB(166,248,244));
    //new RGB(145,248,244);
    this.showUpgradeTank[1].setPosition(139.3*whz[2],62.3*whz[2],218.8*whz[2],141.8*whz[2]);
    this.showUpgradeTank[1].setColor(new RGB(181,248,145));
    this.showUpgradeTank[2].setPosition(43.3*whz[2],154.3*whz[2],122.8*whz[2],233.8*whz[2]);
    this.showUpgradeTank[2].setColor(new RGB(248,145,146));
    this.showUpgradeTank[3].setPosition(139.3*whz[2],154.3*whz[2],218.8*whz[2],233.8*whz[2]);
    this.showUpgradeTank[3].setColor(new RGB(248,230,146));
    this.showUpgradeTank[4].setPosition(43.3*whz[2],246.3*whz[2],122.8*whz[2],325.8*whz[2]);
    this.showUpgradeTank[4].setColor(new RGB(145,178,247));
    this.showUpgradeTank[5].setPosition(139.3*whz[2],246.3*whz[2],218.8*whz[2],325.8*whz[2]);
    this.showUpgradeTank[5].setColor(new RGB(181,146,248));*/
  }

  this.loop = function (){
    this.tick = Date.now() - this.lastTime;
    this.lastTime = Date.now();

    if (this.controlTank){
      this.drawObject.cameraSet(this.controlTank);
    }

    this.uiSet();

    for (let key in this.objectList.tank){
      if (this.objectList.tank[key]){
        this.objectList.tank[key].animate(null,this.tick);
      }
    }

    let camera = this.drawObject.getCameraSet();

    if (this.controlTank) {
      this.controlTank.setRotate(Math.atan2(this.input.target.y/camera.z+camera.y-this.controlTank.y-this.controlTank.dy,this.input.target.x/camera.z+camera.x-this.controlTank.x-this.controlTank.dx));

      socket.emit('mousemove',{
        target:{
          x:this.input.target.x/camera.z+camera.x,
          y:this.input.target.y/camera.z+camera.y
        },
        rotate:this.controlTank.rotate
      });
    }

    this.drawObject.backgroundDraw();
    this.drawObject.objectDraw(this.objectList.bullet);
    this.drawObject.objectDraw(this.objectList.tank);
    this.drawObject.uiDraw(this.uiObjectList);

    requestAnimationFrame(this.loop.bind(this));
  }
  this.loop();

  window.onmousemove = function (e){
    let x = e.clientX * window.devicePixelRatio;
    let y = e.clientY * window.devicePixelRatio;

    this.input.target = {x:x,y:y};
    this.input.isMouseOverUi = false;

    for (let i=0;i<this.uiObjectList.length;i++){
      if (this.uiObjectList[i].inMousePoint(x,y)){
        this.input.isMouseOverUi = true;
      }
    }



    if (this.input.isMouseOverUi){
      this.drawObject.setCursor("pointer");
    }
    else{
      this.drawObject.setCursor("default");
    }
  }.bind(this);

  this.setMoveRotate = function (){
    this.input.moveRotate = (this.input.moveVector.mag()>0)?Math.atan2(this.input.moveVector.y,this.input.moveVector.x):null;
  }

  window.onmousedown = function (e){
    switch (e.button){
      case 0: // 좌클릭
      if (!this.input.leftMouse){
        this.input.shot++;
        this.input.leftMouse = true;
      }
      break;
      case 1: // 마우스 휠 클릭
      break;
      case 2: // 우클릭
      break;
      default:
      break;
    }
    socket.emit('input',this.input);
  }.bind(this);

  window.onmouseup = function (e){
    switch (e.button){
      case 0: // 좌클릭
      if (this.input.leftMouse){
        this.input.shot--;
        this.input.leftMouse = false;
      }
      break;
      case 1: // 마우스 휠 클릭
      break;
      case 2: // 우클릭
      break;
      default:
      break;
    }
    socket.emit('input',this.input);
  }.bind(this);

  window.onkeydown = function(e){
    let g = false;
    switch (e.keyCode){
      case 32: // Space키
      if (!this.input.space){
        this.input.shot++;
        g = this.input.space = true;
      }
      break;
      case 38: // 위쪽 방향키
      case 87: // W키
        if (!this.input.w){
          this.input.moveVector.y-=1;
          g = this.input.w=true;
        }
      break;
      case 37: // 왼쪽 방향키
      case 65: // A키
        if (!this.input.a){
          this.input.moveVector.x-=1;
          g = this.input.a=true;
        }
      break;
      case 40: // 아래쪽 방향키
      case 83: // S키
        if (!this.input.s){
          this.input.moveVector.y+=1;
          g = this.input.s=true;
        }
      break;
      case 39: // 오른쪽 방향키
      case 68: // D키
        if (!this.input.d){
          this.input.moveVector.x+=1;
          g = this.input.d=true;
        }
      break;
      case 75: // K키
        //this.input.k = true;
      break;
      case 79: // O키
      break;
      case 220: // \키
        if (!this.input.changeTank){
          g = this.input.changeTank = true;
        }
      break;
      default:
      break;
    }
    this.setMoveRotate();
    if (g) socket.emit('input',this.input);
  }.bind(this);

  window.onkeyup = function (e){
    switch (e.keyCode){
      case 32: // Space키
        if (this.input.space){
          this.input.shot--;
          this.input.space = false;
        }
      break;
      case 38: // 위쪽 방향키
      case 87: // W키
        if (this.input.w){
          this.input.moveVector.y+=1;
          this.input.w=false;
        }
      break;
      case 37: // 왼쪽 방향키
      case 65: // A키
        if (this.input.a){
          this.input.moveVector.x+=1;
          this.input.a=false;
        }
      break;
      case 40: // 아래쪽 방향키
      case 83: // S키
        if (this.input.s){
          this.input.moveVector.y-=1;
          this.input.s=false;
        }
      break;
      case 39: // 오른쪽 방향키
      case 68: // D키
        if (this.input.d){
          this.input.moveVector.x-=1;
          this.input.d=false;
        }
      break;
      case 75: // K키
        //this.input.k = false;
      break;
      case 79: // O키
      break;
      case 220: // \키
        if (this.input.changeTank){
          this.input.changeTank = false;
        }
      break;
      default:
      break;
    }
    this.setMoveRotate();
    socket.emit('input',this.input);
  }.bind(this);
}
