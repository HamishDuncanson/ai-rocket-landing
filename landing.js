canvas = document.getElementById("myCanvas");
size=Math.min(window.innerWidth,window.innerHeight)
canvas.style.height=size+"px"
canvas.style.width=size+"px"
ctx = canvas.getContext("2d");

window.addEventListener('resize', function(){size=Math.min(window.innerWidth,window.innerHeight);canvas.style.height=size+"px";canvas.style.width=size+"px";}, true);

hh=20
grav=[0,-0.2]
floor=6
iters=3
restitution=0
fric=12.5
defaultstiff=1
defaultmass=1

var keys = {};
window.onkeyup = function(e){keys[e.keyCode] = false}
window.onkeydown = function(e){keys[e.keyCode] = true}

layers=[8,2]
genes=[
  -0.07334814835243728,
  1.0144164103120878,
  -1.7708454974951826,
  -1.0727822527843234,
  0.21478735232465412,
  0,
  -0.16334663681862996,
  -0.2596707813914372,
  -0.6630620228025726,
  -0.18053920541898466,
  -9.890072908687127,
  -0.6568684376166222,
  -0.6795647108342692,
  -0.5394316634112799,
  6.325478670740302,
  -0.6168558244126894,
  -300.975151714393,
  -4.04054889361546,
  300.64517764936886,
  -7.186040739981667,
  -2.13497277492142,
  5.459605747898592,
  -2.727726353276968,
  -1.5292553901828425,
  0.13879178944133216,
  0.5777938744365216
]

function neural(input){
    g=0
    neurons=[]
    for(lay=0;lay<layers.length;lay++){
        neurons.push([])
    }
    for(base=0;base<layers[0];base++){
        neurons[0].push(genes[g]+input[base])
        g++
    }
    for(next=1;next<layers.length;next++){
        neurons[next]=new Array(layers[next]).fill(0)
        for(nex=0;nex<layers[next-1];nex++){
            for(ne=0;ne<layers[next];ne++){
                neurons[next][ne]+=neurons[next-1][nex]*genes[g]
                g++
            }
        }
        for(ne=0;ne<layers[next];ne++){
            neurons[next][ne]+=genes[g]
            g++
        }
    }
    return neurons[neurons.length-1]
}
function distance(a,b){
    return ((a.x-b.x)**2+(a.y-b.y)**2)**0.5
}
function rotate(cx,cy,x,y,angle){
    var radians = (Math.PI / 180) * angle,
        cos = Math.cos(radians),
        sin = Math.sin(radians),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return [nx, ny];
}
function spawn(){
    nodes=[];links=[];particles=[];
    yv=Math.random()*2-1
    xv=Math.random()*4-2
    x=Math.random()*450-225
    y=Math.random()*30-15
    ang=Math.random()*60-30
    cx=300+x-20*xv
    cy=1610/3+y-20*(-8+yv-grav[1]*9.5)
    f=rotate(cx,cy,290+x-xv*20,520+y-20*(-8+yv-grav[1]*9.5),ang)
    addnode(f[0],f[1],defaultmass,xv,-8+yv-grav[1]*20,false)
    f=rotate(cx,cy,310+x-xv*20,520+y-20*(-8+yv-grav[1]*9.5),ang)
    addnode(f[0],f[1],defaultmass,xv,-8+yv-grav[1]*20,false)
    f=rotate(cx,cy,300+x-xv*20,570+y-20*(-8+yv-grav[1]*9.5),ang)
    addnode(f[0],f[1],defaultmass,xv,-8+yv-grav[1]*20,false)
    addlink(0,2,false,defaultstiff)
    addlink(1,2,false,defaultstiff)
    addlink(0,1,false,defaultstiff)
}
function addnode(xx,yy,m,xv,yv,f){
    nodes.push({x:xx,y:yy,lastx:xx-xv,lasty:yy-yv,mass:m,fixed:f})
}
function addparticle(xx,yy,xvv,yvv,t,grav){
    particles.push({x:xx,y:yy,xv:xvv,yv:yvv,life:t,gravity:grav})
}
function addlink(p1,p2,d,stiff,dash){
    if (d==false){
        d=distance(nodes[p1],nodes[p2])
    }
    links.push({a:p1,b:p2,dist:d,stiffness:stiff})
}
function drawparticle(part){
    g=ctx.createRadialGradient(part.x,canvas.height-part.y,0,part.x,canvas.height-part.y,7.5)
    if (nodes.length>0){
        g.addColorStop(0, "rgba(140,195,255,"+Math.min(distance(part,nodes[2])/400,part.life/25)+")");
    }else{
        g.addColorStop(0, "rgba(140,195,255,"+part.life/50+")");
    }
    g.addColorStop(1,  "rgba(140,195,255,0)");
    ctx.fillStyle=g
    ctx.beginPath()
    ctx.arc(part.x,canvas.height-part.y,7.5,0,2*Math.PI)
    ctx.fill()
}
function drawplatform(){
    ctx.strokeStyle="rgba(185,185,255,0.25)"
    ctx.beginPath()
    ctx.lineTo(270,600-hh-2)
    ctx.lineTo(330,600-hh-2)
    ctx.stroke()
}
function drawship(){
    ctx.strokeStyle="rgba(150,150,150,0.75)"
    ctx.lineWidth=2.25
    ctx.beginPath()
    ctx.lineTo((nodes[0].x+nodes[1].x)/2*0.7+nodes[2].x*0.3,canvas.height-((nodes[0].y+nodes[1].y)/2*0.7+nodes[2].y*0.3))
    ctx.lineTo(nodes[0].x,canvas.height-nodes[0].y)
    ctx.lineTo((nodes[0].x+nodes[1].x)/2*0.925+nodes[2].x*0.075,canvas.height-((nodes[0].y+nodes[1].y)/2*0.925+nodes[2].y*0.075))
    ctx.lineTo(nodes[1].x,canvas.height-nodes[1].y)
    ctx.closePath()
    ctx.stroke()
    ctx.lineWidth=7
    ctx.strokeStyle="rgba(205,205,225,1)"
    ctx.beginPath()
    ctx.lineTo((nodes[0].x+nodes[1].x)/2*0.85+nodes[2].x*0.15,canvas.height-((nodes[0].y+nodes[1].y)/2*0.85+nodes[2].y*0.15))
    ctx.lineTo(nodes[2].x,canvas.height-nodes[2].y)
    ctx.stroke()
    ctx.lineWidth=6
}
function render(){
    ctx.clearRect(0,0,canvas.width,canvas.height)
    drawplatform()
    for(i=0;i<particles.length;i++){
        drawparticle(particles[i])
    }
    if (nodes.length>0){
        drawship()
    }
    ctx.fillStyle="rgba(205,205,225,1)"
    if (keycontrol){
        ctx.fillText("'k' to toggle AI",9,20.5)
    }else{
        ctx.fillText("'k' to toggle arrow keys",9,20.5)
    }
}
function destroy(){
    alive=false
    x=(nodes[0].x+nodes[1].x+nodes[2].x)/3
    y=(nodes[0].y+nodes[1].y+nodes[2].y)/3
    nodes=[];
    links=[];
    for (i=0;i<70;i++){
        addparticle(x+Math.random()*70-35,y+Math.random()*70-35,Math.random()*40-20,Math.random()*40-20,Math.random()*50,true)
    }
}
function verlet(){
    for (i=0;i<nodes.length;i++){
        if (nodes[i].fixed==false){
            xv=nodes[i].x-nodes[i].lastx
            yv=nodes[i].y-nodes[i].lasty
            if (nodes[i].y<floor+hh&&Math.abs(nodes[i].x-300)<30){
                 overlap=floor+hh-nodes[i].y
                 if (overlap>2){
                     destroy()
                     return
                 }
                 xv/=fric**overlap
                 nodes[i].y=floor+hh
                 if (yv<0){
                      yv*=-restitution
                 }
            }
            if (nodes[i].y<floor){
                destroy()
                return
            }
            if (nodes[i].x<floor){
                destroy()
                return
            }
            if (nodes[i].x>canvas.width-floor){
                destroy()
                return
            }
            nodes[i].lastx=nodes[i].x
            nodes[i].lasty=nodes[i].y
            nodes[i].x=nodes[i].x+xv+grav[0]
            nodes[i].y=nodes[i].y+yv+grav[1]
        }
    }
}
function solve(link){
    p1=nodes[link.a]
    p2=nodes[link.b]
    if (p1.fixed==false || p2.fixed==false){
        dx=p1.x-p2.x
        dy=p1.y-p2.y
        d=(dx**2 + dy**2)**0.5
        difference = (link.dist - d)/d
        if(p1.fixed==true){
            im1=0
        }else{
            im1 = 1 / p1.mass;
        }
        if(p2.fixed==true){
            im2=0
        }else{
            im2 = 1 / p2.mass;
        }
        scalarp1 = (im1 / (im1 + im2)) * link.stiffness;
        scalarp2 = link.stiffness - scalarp1;

        tx = dx*difference
        ty = dy*difference
        p1.x+=tx*scalarp1
        p1.y+=ty*scalarp1
        p2.x-=tx*scalarp2
        p2.y-=ty*scalarp2
    }

}
function updatepart(i){
    particles[i].life-=1
    particles[i].x+=particles[i].xv
    particles[i].y+=particles[i].yv
    if (particles[i].gravity){
        particles[i].yv-=grav[1]*-5
    }
    if (particles[i].life<2){
        particles.splice(i,1)
    }
}
function update(){
    for(iter=0;iter<iters;iter++){
        for(k=0;k<links.length;k++){
            solve(links[k])
        }
    }
    verlet()
    for(i=particles.length-1;i>-1;i--){
        updatepart(i)
    }
}
function push(nod,power,ang){
    nodes[nod].x+=Math.cos(ang)*power
    nodes[nod].y+=Math.sin(ang)*power
}
function exper(gennn){
        if(alive){
            sense=[nodes[0].x-nodes[0].lastx-grav[0],
                   nodes[0].y-nodes[0].lasty-grav[1],
                   nodes[1].x-nodes[1].lastx-grav[0],
                   nodes[1].y-nodes[1].lasty-grav[1],
                   (nodes[0].y-floor-hh)/600,
                   (nodes[1].y-floor-hh)/600,
                   (nodes[0].x-300)/300,
                   (nodes[1].x-300)/300]
            decide=neural(sense,genes)

            sense=[-nodes[1].x+nodes[1].lastx+grav[0],
                nodes[1].y-nodes[1].lasty-grav[1],
                -nodes[0].x+nodes[0].lastx+grav[0],
                nodes[0].y-nodes[0].lasty-grav[1],
                (nodes[1].y-floor-hh)/600,
                (nodes[0].y-floor-hh)/600,
                (300-nodes[1].x)/300,
                (300-nodes[0].x)/300]
            decide2=neural(sense,genes)
        }
        if (keycontrol){
            decide=[0,0]
            decide2=[0,0]
            if(keys[39]){
                decide[0]=1
                decide2[0]=-1
            }
            if(keys[37]){
                decide[0]=-1
                decide2[0]=1
            }
            if(keys[38]){
                decide[1]=1
                decide2[1]=1
            }
        }
        xpush=Math.max(-1,Math.min((decide[0]-decide2[0])/2,1))
        ypush=Math.max(0,Math.min((decide[1]+decide2[1])/2,1))
        if (alive&&tickcount>=20){
            xpush/=1
            ypush*=3.25
            ang=Math.atan2(nodes[1].y - nodes[0].y, nodes[1].x - nodes[0].x);
            push(0,ypush/10,ang+Math.PI/2)
            push(1,ypush/10,ang+Math.PI/2)
            push(2,ypush/10,ang+Math.PI/2)
            push(2,xpush/10,ang)
            xxv=(nodes[0].x-nodes[0].lastx+nodes[1].x-nodes[1].lastx)/2
            yyv=(nodes[0].y-nodes[0].lasty+nodes[1].y-nodes[1].lasty)/2
            if (ypush>0.05){
                addparticle((3*nodes[0].x+3*nodes[1].x+nodes[2].x)/7,(3*nodes[0].y+3*nodes[1].y+nodes[2].y)/7,xxv+Math.cos(ang-Math.PI/2)*5*ypush*(0.25+Math.random())+Math.random()*2.2-1.1,yyv+Math.sin(ang-Math.PI/2)*5*ypush*(0.25+Math.random())+Math.random()*2.2-1.1,10,false)
                addparticle((3*nodes[0].x+3*nodes[1].x+nodes[2].x)/7,(3*nodes[0].y+3*nodes[1].y+nodes[2].y)/7,xxv+Math.cos(ang-Math.PI/2)*5*ypush*(0.25+Math.random())+Math.random()*2.2-1.1,yyv+Math.sin(ang-Math.PI/2)*5*ypush*(0.25+Math.random())+Math.random()*2.2-1.1,10,false)
            }
            addparticle(nodes[2].x,nodes[2].y,nodes[2].x-nodes[2].lastx+Math.cos(ang+Math.PI)*10*xpush*(0.25+Math.random()),nodes[2].y-nodes[2].lasty+Math.sin(ang+Math.PI)*10*xpush*(0.25+Math.random()),10,false)
        }
}
function game(){
    update()
    render()
    tickcount++;
    exper()
    if(tickcount==320&&keycontrol==false||alive==false&&particles.length==0||reset){
        reset=false
        tickcount=0
        alive=true
        spawn()
    }
    requestAnimationFrame(game)
}
document.onkeypress = function (e) {
    if(e.key=="k"){
        reset=true
        keycontrol=!keycontrol
    }
};
function init(){
    tickcount=0
    keycontrol=false
    reset=false
    ctx.lineJoin = "round"
    ctx.lineCap="round"
    ctx.font = "15px Consolas";
    alive=true
    spawn()
    game()
}
init()