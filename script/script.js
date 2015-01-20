function Game() {
    var a = this;
    this.board = new Board();
    this.startTime = null;
    this.run = function() {
        a.start();
    };
    this.start = function() {
        a.hideSmiles();
        a.createBoard();
        a.registerMouse();
        a.startTimer();
        a.updateScore();
    };
    this.restart = function() {
        a.board.destroyImgs();
        a.start();
    };
    this.onMouseDown = function(b) {
        var c = getMouseObject(b);
        if (a.board.isCell(c)) if (1 == getMouseButton(b)) a.onLeftClick(c.mRow, c.mCol); else a.onRightClick(c.mRow, c.mCol);
        a.updateScore();
        return false;
    };
    this.onLeftClick = function(b, c) {
        if (a.board.isFlag(b, c)) return;
        if (a.board.isMine(b, c)) {
            a.looseGame(b, c);
            return;
        }
        a.board.flip(b, c);
        if (0 == a.board.downs) a.winGame();
    };
    this.onRightClick = function(b, c) {
        if (a.board.isDown(b, c)) return;
        a.board.changeState(b, c);
        if (a.board.flags == a.board.mines) a.tryWinGame();
    };
    this.tryWinGame = function() {
        if (a.board.testFlags()) a.winGame();
    };
    this.winGame = function() {
        a.showSmiles("happy");
        a.board.showFlags();
        a.endGame();
    };
    this.looseGame = function(b, c) {
        a.showSmiles("sad");
        a.board.showMines(b, c);
        a.endGame();
    };
    this.endGame = function() {
        a.stopTimer();
        a.unregisterMouse();
    };
    this.updateScore = function() {
        document.getElementById("div-mines").innerHTML = String(a.board.mines - a.board.flags);
    };
    this.showSmiles = function(b) {
        var c = document.getElementById("img-smiles");
        c.src = a.board.getImgSrc(b);
        c.style.visibility = "visible";
    };
    this.hideSmiles = function() {
        document.getElementById("img-smiles").style.visibility = "hidden";
    };
    this.startTimer = function() {
        a.startTime = new Date().getTime();
        a.timer();
    };
    this.stopTimer = function() {
        a.startTime = null;
    };
    this.timer = function() {
        if (a.startTime) {
            var b = Math.floor((new Date().getTime() - a.startTime) / 1e3);
            var c = "0" + String(Math.floor(b / 60));
            var d = "0" + String(b % 60);
            document.getElementById("div-time").innerHTML = c.substring(c.length - 2) + ":" + d.substring(d.length - 2);
            setTimeout(a.timer, 1e3);
        }
    };
    this.registerMouse = function() {
        a.board.div.onmousedown = a.onMouseDown;
        a.board.div.onclick = function() {
            return false;
        };
        a.board.div.ondblclick = function() {
            return false;
        };
        a.board.div.oncontextmenu = function() {
            return false;
        };
    };
    this.unregisterMouse = function() {
        a.board.div.onmousedown = null;
    };
    this.createBoard = function() {
        switch (document.getElementById("lb-level").value) {
          case "easy":
            a.board.create(10, 10, 10);
            break;

          case "normal":
            a.board.create(15, 15, 25);
            break;

          case "advanced":
            a.board.create(20, 20, 50);
            break;

          case "hard":
            a.board.create(20, 25, 100);
            break;

          case "expert":
            a.board.create(20, 30, 150);
        }
    };
}

function Board() {
    var a = this;
    this.div = document.getElementById("div-board");
    this.cells = null;
    this.rows = 0;
    this.cols = 0;
    this.mines = 0;
    this.downs = 0;
    this.flags = 0;
    this.imgClass = "cell";
    this.imgWidth = 16;
    this.imgHeight = 16;
    this.imgURL = "./images/";
    this.imgExt = ".png";
    this.create = function(b, c, d) {
        a.cells = null;
        a.rows = b;
        a.cols = c;
        a.mines = d;
        a.downs = a.rows * a.cols - a.mines;
        a.flags = 0;
        a.createCells();
        a.putMines();
        a.createImgs();
    };
    this.createCells = function() {
        a.cells = new Array(a.rows);
        for (var b = 0; b != a.rows; ++b) {
            a.cells[b] = new Array(a.cols);
            for (var c = 0; c != a.cols; ++c) a.cells[b][c] = new Cell();
        }
    };
    this.putMines = function() {
        for (var b = 0; b != a.mines; ++b) a.putRandMine();
    };
    this.putRandMine = function() {
        var b, c;
        do {
            b = rand(a.rows);
            c = rand(a.cols);
        } while (a.isMine(b, c));
        a.putMine(b, c);
        a.roundMine(b, c);
    };
    this.putMine = function(b, c) {
        a.cells[b][c].value = "m";
    };
    this.roundMine = function(b, c) {
        for (var d = Math.max(b - 1, 0); d <= Math.min(b + 1, a.rows - 1); ++d) for (var e = Math.max(c - 1, 0); e <= Math.min(c + 1, a.cols - 1); ++e) if (false == a.isMine(d, e)) ++a.cells[d][e].value;
    };
    this.createImgs = function() {
        for (var b = 0; b != a.rows; ++b) for (var c = 0; c != a.cols; ++c) this.createImg(b, c);
    };
    this.createImg = function(b, c) {
        var d = document.createElement("img");
        d.id = a.getImgId(b, c);
        d.className = a.imgClass;
        d.style.width = String(a.imgWidth) + "px";
        d.style.height = String(a.imgHeight) + "px";
        d.style.top = String(Math.floor((340 - a.imgHeight * a.rows) / 2 + b * (a.imgHeight - 1))) + "px";
        d.style.left = String(Math.floor((510 - a.imgWidth * a.cols) / 2 + c * (a.imgWidth - 1))) + "px";
        d.src = a.getImgSrc("up");
        d.mRow = b;
        d.mCol = c;
        a.div.appendChild(d);
    };
    this.destroyImgs = function() {
        for (var b = 0; b != a.rows; ++b) for (var c = 0; c != a.cols; ++c) a.destroyImg(b, c);
    };
    this.destroyImg = function(b, c) {
        a.div.removeChild(document.getElementById(a.getImgId(b, c)));
    };
    this.flip = function(b, c) {
        if (a.isDown(b, c)) return;
        if (a.isFlag(b, c)) return;
        a.flipCell(b, c);
        if (a.isHole(b, c)) a.roundFlip(b, c);
    };
    this.flipCell = function(b, c) {
        a.getImgElement(b, c).src = a.getImgSrc(a.cells[b][c].value);
        a.cells[b][c].state = "down";
        --a.downs;
    };
    this.roundFlip = function(b, c) {
        var d = c > 0;
        var e = c < a.cols - 1;
        if (b > 0) {
            if (d) a.flip(b - 1, c - 1);
            a.flip(b - 1, c);
            if (e) a.flip(b - 1, c + 1);
        }
        if (d) a.flip(b, c - 1);
        if (e) a.flip(b, c + 1);
        if (b < a.rows - 1) {
            if (d) a.flip(b + 1, c - 1);
            a.flip(b + 1, c);
            if (e) a.flip(b + 1, c + 1);
        }
    };
    this.changeState = function(b, c) {
        var d = a.getNextState(b, c);
        if ("flag" == d && a.flags == a.mines) return;
        if ("flag" == d) ++a.flags;
        if ("question" == d) --a.flags;
        a.getImgElement(b, c).src = a.getImgSrc(d);
        a.cells[b][c].state = d;
    };
    this.getNextState = function(b, c) {
        switch (a.cells[b][c].state) {
          case "up":
            return "flag";

          case "flag":
            return "question";

          case "question":
            return "up";
        }
    };
    this.testFlags = function() {
        for (var b = 0; b != a.rows; ++b) for (var c = 0; c != a.cols; ++c) if (a.isFlag(b, c) && false == a.isMine(b, c)) return false;
        return true;
    };
    this.showMines = function(b, c) {
        for (var d = 0; d != a.rows; ++d) for (var e = 0; e != a.cols; ++e) if (a.isMine(d, e) || a.isFlag(d, e)) a.showMine(d, e, b, c);
    };
    this.showMine = function(b, c, d, e) {
        var f = "mine";
        if (a.isFlag(b, c)) f = a.isMine(b, c) ? "flag" : "cross";
        if (b == d && c == e) f = "boom";
        a.getImgElement(b, c).src = a.getImgSrc(f);
    };
    this.showFlags = function() {
        for (var b = 0; b != a.rows; ++b) for (var c = 0; c != a.cols; ++c) if (a.isMine(b, c) && false == a.isFlag(b, c)) {
            a.getImgElement(b, c).src = a.getImgSrc("flag");
            ++a.flags;
        }
    };
    this.isMine = function(b, c) {
        return "m" == a.cells[b][c].value;
    };
    this.isHole = function(b, c) {
        return 0 == a.cells[b][c].value;
    };
    this.isFlag = function(b, c) {
        return "flag" == a.cells[b][c].state;
    };
    this.isDown = function(b, c) {
        return "down" == a.cells[b][c].state;
    };
    this.isCell = function(b) {
        return b.className == a.imgClass;
    };
    this.getImgElement = function(b, c) {
        return document.getElementById(a.getImgId(b, c));
    };
    this.getImgId = function(b, c) {
        return a.imgClass + String(b * a.cols + c);
    };
    this.getImgSrc = function(b) {
        return a.imgURL + b + a.imgExt;
    };
}

function Cell() {
    this.value = 0;
    this.state = "up";
}

function rand(a) {
    return Math.floor(Math.random() * a);
}

function getMouseObject(a) {
    return a ? a.target : window.event.srcElement;
}

function getMouseButton(a) {
    return a ? a.which : window.event.button;
}

var game = new Game();

game.run();
