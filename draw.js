function DrawObject(){ // 그리기 담당
  this.canvas = document.getElementById("canvas");
  this.ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  this.uiCanvas = document.createElement("canvas");
  this.uiCtx = ui_canvas.getContext("2d");

  this.camera = {
    x:0,
    y:0,
    z:3
  };

  this.resize = function (){
    this.canvas.width=this.ui_canvas.width=window.innerWidth * window.devicePixelRatio;
    this.canvas.height=this.ui_canvas.height=window.innerHeight * window.devicePixelRatio;
  }

  this.cameraSet = function (){
    if (this.canvas.width<this.canvas.height/9*16) this.camera.z=this.canvas.height/900*1.78; // 화면 크기에 따른 줌값 조정
    else this.camera.z=this.canvas.width/1600*1.78; // *1.78 은 1레벨 탱크의 시야

  }

  this.backgroundDraw = function (){
    this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
    this.uiCtx.clearRect(0,0,this.canvas.width,this.canvas.height);

    this.ctx.beginPath(); // 격자 그리기
    for (let i=-this.camera.x % 20 * this.camera.z;i<=this.canvas.width;i+=12.9 * this.camera.z){
        this.ctx.moveTo(i,0);
        this.ctx.lineTo(i,this.canvas.height);
    }
    for (let i=-this.camera.y % 20 * this.camera.z;i<=this.canvas.height;i+=12.9 * this.camera.z){
        this.ctx.moveTo(0,i);
        this.ctx.lineTo(this.canvas.width,i);
    }
    this.ctx.strokeStyle = "black";
    this.ctx.globalAlpha = 0.5;
    this.ctx.lineWidth = 0.1;
    this.ctx.stroke();
  }

  this.objectDraw = function (obj){

  }
  this.uiDraw = function (ui){

  }

  window.onresize=this.resize;
  this.resize();

  window.onbeforeunload=function(){
    return "정말 나가실 건가요?";
  }
}

function RGB(r,g,b){
  this.r= r;
  this.g= g;
  this.b= b;
  this.setRGB = function(r,g,b){
    this.r=r;
    this.g=g;
    this.b=b;
  }
  this.getRGB = function(){
    return "rgb(" + this.r + "," + this.g + "," + this.b + ")";
  }
  this.getDarkRGB = function(){
    return "rgb(" + this.r*0.74 + "," + this.g*0.74 + "," + this.b*0.74 + ")";
  }
  this.getLightRGB = function(){

  }
  this.getRedRGB = function(){

  }
}
