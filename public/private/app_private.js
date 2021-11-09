//Client-side socket connection
let socket = io('/private');

window.addEventListener('load', () => {
    let roomName = window.prompt('Name your room: ')
    console.log(roomName);
  
    //send room name to server
    socket.emit('room-name', {room: roomName});
  });

//For game
let chess = [];
let surChess = [];
let cntBlack, cntWhite;
let posX, posY;
let newA, newB;
let fin = 0;
let turn = false;
let returnPara = [];
let interval = 50;

socket.on('connect', () => {
    console.log('Connected');
});

//Listen for data from the server
socket.on('draw-data', (data) => {
    console.log(data);
    gameLogic(data.x, data.y);
});

socket.on('joined', (data) => {
    console.log(data.msg);
  });

//Set up basic app functionality
function setup() {
    let myCanvas = createCanvas(510, 402);
    myCanvas.parent("canvas-container");
    background(231, 231, 174);
    // for (let i = 0; i < 9; i++) {
    //     stroke(83, 167, 255);
    //     strokeWeight(.5);
    //     line(1, 50 * i, 400, 50 * i);
    //     line(50 * i, 0, 50 * i, 400);
    // }

    for (let x = 1; x < 399; x += interval) {
        for (let y = 1; y < 399; y += interval) {
            fill(231, 231, 174);
            stroke(95, 96, 2);
            strokeWeight(1);
            rect(x, y, interval, interval);
        }
    }

    for (let i = 0; i < 8; i++) {
        chess.push(new Array());
        for (let j = 0; j < 8; j++) {
            chess[i].push(new Chess(402 / 8 * i, 402 / 8 * j, i, j, true));
        }
    }
    //print(chess.length);
    chess[3][4].filled = false;
    chess[4][3].filled = false;
    noStroke();
    for (let i = 3; i < 5; i++) {
        for (let j = 3; j < 5; j++)
            chess[i][j].makeChess();
    }
    cntBlack = 2;
    cntWhite = 2;
}

class Chess {
    constructor(x, y, idxX, idxY, filled) {
        this.x = x;
        this.y = y;
        this.filled = filled;
        this.idxX = idxX;
        this.idxY = idxY;
        this.put = false;
        this.surround = false;
    }

    makeChess() {
        if (this.filled == true) fill(255);
        else fill(0);
        ellipse(this.x + 25, this.y + 25, 45);
        this.put = true;
    }
}

function draw() {
    textAlign(LEFT);
    noStroke(0);
    fill(255);
    rect(420, 280, 90, 30, 5);
    fill(0);
    textSize(18);
    text("Black: ", 430, 302);
    text(cntBlack, 490, 302);
    fill(0);
    rect(420, 330, 90, 30, 5);
    fill(255);
    text("White: ", 430, 352);
    text(cntWhite, 490, 352);

    if (turn == true) {
        fill(0);
        rect(420, 22, 90, 40, 7);
        fill(255);
        textSize(21);
        text("WHITE", 430, 50);
    }
    else {
        fill(255);
        rect(420, 22, 90, 40, 7);
        fill(0);
        textSize(21);
        text("BLACK", 430, 50);
    }

    if (cntWhite + cntBlack == 64) {
        if (cntWhite > cntBlack) {
            textAlign(CENTER);
            textSize(60);
            fill(255, 165, 165);
            text("WHITE WIN!!!", 200, 220);
        }
        else {
            textAlign(CENTER);
            textSize(60);
            fill(255, 165, 165);
            text("BLACK WIN!!!!", 200, 220);
        }
    }

}

function mouseClicked() {
    posX = mouseX;
    posY = mouseY;
    let mousePos = {
        x: posX,
        y: posY
    };
    gameLogic(posX, posY);

    socket.emit('data', mousePos);
}

function gameLogic(x, y) {
    posX = x;
    posY = y;

    if (posX < 400 && posY < height) {
        newA = floor(posX / 50);
        newB = floor(posY / 50);

        if (chess[newA][newB].put == false) {
            surChess = checkSur(chess, newA, newB, turn);

            if (surChess.length > 0) {
                returnPara = changeColor(chess, chess[newA][newB], surChess, turn);
                if (turn == true && returnPara[1] != 0) {
                    cntWhite += returnPara[1] + 1;
                    cntBlack -= returnPara[1];
                }
                else if (turn == false && returnPara[1] != 0) {
                    cntWhite -= returnPara[1];
                    cntBlack += returnPara[1] + 1;
                }

                turn = returnPara[0];
            }
        }
    }
}

function checkSur(chess, x, y, turn) {
    var surChess = [];

    for (var i = -1; i < 2; i++) {
        for (var j = -1; j < 2; j++) {
            if (i == 0 && j == 0)
                continue;
            else {
                try {
                    if (chess[x + i][y + j].put == true) {
                        if (turn == false) {
                            if (chess[x + i][y + j].filled == true)
                                surChess.push(chess[x + i][y + j]);
                        }
                        else {
                            if (chess[x + i][y + j].filled == false)
                                surChess.push(chess[x + i][y + j]);
                        }
                    }
                }
                catch (err) {
                    continue;
                }
            }
        }
    }
    //print(surChess[0]);
    return surChess;

}

function changeColor(chess, nowChess, surChess, turn) {
    var posX, posY;
    var relPosX, relPosY;
    var colChangeStack = [];
    var changed = false;
    var cnt = 0;
    nowChess.filled = turn;
    for (var i = 0; i < surChess.length; i++) {
        posX = nowChess.idxX;
        posY = nowChess.idxY;
        relPosX = surChess[i].idxX - nowChess.idxX;
        relPosY = surChess[i].idxY - nowChess.idxY;
        print(posX, " ", posY, " ", relPosX, " ", relPosY);
        //posX += relPosX;
        //posY += relPosY;
        while (0 <= posX && posX < 8 && 0 <= posY && posY < 8) {
            if (chess[posX][posY].put == true) {
                if (chess[posX][posY].filled != nowChess.filled) {
                    colChangeStack.push(chess[posX][posY]);
                }
                else {
                    for (var j = 0; j < colChangeStack.length; j++) {
                        colChangeStack[j].filled = !colChangeStack[j].filled;
                        colChangeStack[j].makeChess();
                    }
                    changed = true;
                    cnt += colChangeStack.length;
                    break;
                }
            }
            if (chess[posX][posY].put == false && colChangeStack.length != 0)
                break;
            posX += relPosX;
            posY += relPosY;
            print(colChangeStack.length);
        }
        colChangeStack = [];
    }

    if (changed == true) {
        nowChess.makeChess();
        turn = !turn;

    }
    return [turn, cnt];
}

function checkFin() {
    var flag = false;
    if (cntWhite + cntBlack == 64) {
        flag = true;
    }
    else {
        for (var i = 0; i < 8; i++) {
            for (var j = 0; j < 8; j++) {
                if (chess[i][j].put == true)
                    continue;
                else {

                }
            }
        }
    }
    if (flag == true) {
        if (cntWhite > cntBlack) {
            textAlign(CENTER);
            textSize(70);
            fill(random(255), random(255), random(255));
            text("White WIN!!!!", 200, 200);
        }
        else {
            textAlign(CENTER);
            textSize(70);
            fill(random(255), random(255), random(255));
            text("Black WIN!!!!", 200, 200);
        }
    }
}