'use strict';

const util = require('./librarys');
const utilObj = require('./objectSet');

let bulletId = 0; // 총알 고유 아이디.

exports.bulletSet = function(user,p){ // 유저의 총알 발사
  let bullets = [];
  for (let i=0;i<user.guns.length;i++){
    if (p && p.mouse==="left" || user.guns[i].autoShot){
      if (user.guns[i].shotTime <= 0 && !user.guns[i].isShot && user.guns[i].shotPTime>0){
        user.guns[i].isShot = true;
        user.guns[i].shotTime = (0.6 - 0.04 * user.stats[6]) / user.guns[i].coolTime * 1000 * user.guns[i].shotPTime;
      }
      if (user.guns[i].shotTime <= 0){
        let rotate = user.guns[i].dir.rotate===null?user.rotate+user.guns[i].rotate:user.guns[i].dir.rotate;
        rotate += util.randomRange(-user.guns[i].dir.rotateDistance,user.guns[i].dir.rotateDistance);
        if (user.guns[i].life === -1){
          if (user.guns[i].bulletCount === user.guns[i].bulletLimit) continue;
          user.guns[i].bulletCount++;
        }
        bullets.push({
            type: user.guns[i].bulletType,
            objType: 'bullet',
            id: bulletId++,
            owner: user.id,
            ownerTank: user,
            ownerType: user.type,
            gunId: i,
            x: user.x + Math.cos(user.rotate+user.guns[i].rotate-Math.PI/2) * user.guns[i].pos.x * user.radius + Math.cos(user.rotate+user.guns[i].rotate) * user.guns[i].pos.y * user.radius,
            y: user.y + Math.sin(user.rotate+user.guns[i].rotate-Math.PI/2) * user.guns[i].pos.x * user.radius + Math.sin(user.rotate+user.guns[i].rotate) * user.guns[i].pos.y * user.radius,
            w: 10,
            h: 10,
            rotate: rotate,
            dx: Math.cos(rotate) * 4 * user.guns[i].speed,
            dy: Math.sin(rotate) * 4 * user.guns[i].speed,
            speed: 0.8 * user.guns[i].speed,
            health: (8 + 6 * user.stats[4]) * user.guns[i].health,
            maxHealth: (8 + 6 * user.stats[4]) * user.guns[i].health,
            lastHealth: (8 + 6 * user.stats[4]) * user.guns[i].health,
            damage: (7 + 3 * user.stats[5]) * user.guns[i].damage,
            radius: 0.4 * user.guns[i].radius * user.radius,
            bound:user.guns[i].bulletBound,
            time: 1000 * user.guns[i].life,
            isCollision: false,
            isOwnCol: user.guns[i].isownCol,
            isBorder: user.guns[i].isBorder,
            isAi: user.guns[i].isAi,
            hitTime: Date.now(),
            isDead: false
        });
        user.dx -= Math.cos(user.rotate+user.guns[i].rotate) * 0.1 * user.guns[i].bound;
        user.dy -= Math.sin(user.rotate+user.guns[i].rotate) * 0.1 * user.guns[i].bound;
        user.guns[i].shotTime = (0.6 - 0.04 * user.stats[6]) / user.guns[i].coolTime * 1000;
      }
    }
    else{
      if (user.guns[i].isShot === true && user.guns[i].shotTime <= 0){
        user.guns[i].isShot = false;
      }
    }
    if (user.guns[i].shotTime > 0) user.guns[i].shotTime -= 1000/60;
  }
  return bullets;
}

exports.isDeadBullet = function(obj,bullets){ // 죽었는가?
  obj.isCollision = false;
  if (obj.ownerTank.isDead === true || (obj.ownerTank.type !== obj.ownerType && obj.time < 0)
  || obj.time === 0 || obj.health <= 0){
    if (util.findIndex(bullets,obj.id) > -1){
      if (obj.time < 0 && obj.ownerTank.guns[obj.gunId] && obj.ownerTank.type === obj.ownerType) obj.ownerTank.guns[obj.gunId].bulletCount--;
      bullets.splice(util.findIndex(bullets,obj.id),1);
      return true;
    }
  }
  return false;
}

exports.moveBullet = function(b,mapSize,p,target){ // 총알의 움직임
  switch(b.type){
    case 1:
      b.dx+=Math.cos(b.rotate) * 0.07 * b.speed;
      b.dy+=Math.sin(b.rotate) * 0.07 * b.speed;
      break;
    case 2: // 드론에게는 goTank 와 goEnemy 라는 두가지 상태가 추가됩니다.
      let dir;

      if (p){
        if (p.mouse === "left"){
          dir = Math.atan2(p.target.y-b.y,p.target.x-b.x);
        }
        else if (p.mouse === "right"){
          dir = Math.atan2(b.y-p.target.y,b.x-p.target.x);
        }
        else if (b.ownerTank){
          let dis = Math.sqrt((b.ownerTank.x-b.x)*(b.ownerTank.x-b.x)+(b.ownerTank.y-b.y)*(b.ownerTank.y-b.y));

          if (b.goTank){
            if (dis<60) b.goTank = false;
            else dir = Math.atan2(b.ownerTank.y-b.y,b.ownerTank.x-b.x);
          }
          else if (b.goEnemy !== undefined){
            if (b.goEnemy.isDead) b.goEnemy = undefined;
            else dir = Math.atan2(b.goEnemy.y-b.y,b.goEnemy.x-b.x);
          }
          else if (dis<util.randomRange(139.32,150)){ // 플레이어 주변에 있으면
            dir = Math.atan2(b.ownerTank.y-b.y,b.ownerTank.x-b.x) - Math.PI / 2;
            if (target !== undefined) b.goEnemy = target;
          }
          else{
            b.goTank = true;
          }
        }
        if (dir){
          if (p.mouse !== "" || b.goTank){
            b.dx+=Math.cos(dir) * 0.07 * b.speed;
            b.dy+=Math.sin(dir) * 0.07 * b.speed;
            b.rotate=dir;
          }
          else{
            b.dx+=Math.cos(dir) * 0.02;
            b.dy+=Math.sin(dir) * 0.02;
            b.rotate=Math.atan2(b.dy,b.dx);
          }
        }
      }
      break;
    default:
    break;
  }
  if (b.isBorder){
    if (b.x>mapSize.x+51.6) b.x=mapSize.x+51.6;
    if (b.x<-mapSize.x-51.6) b.x=-mapSize.x-51.6;
    if (b.y>mapSize.y+51.6) b.y=mapSize.y+51.6;
    if (b.y<-mapSize.y-51.6) b.y=-mapSize.y-51.6;
  }
  utilObj.moveObject(b);
}
