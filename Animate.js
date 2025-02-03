const body = document.getElementsByTagName('body')[0];
const shipEl = document.getElementById('ship');
const bulletEl = document.getElementById('bullet');
const alienEl = document.getElementById('alien');
const titleDiv = document.getElementById('title');
const scoreEl = document.getElementById('score');
const shipsEl = document.getElementById('ships');
const otherEl = document.getElementById('other');
const enterScore = document.getElementById('enter-score');
const highScoresEl = document.getElementById('highscores');

bulletEl.classList.add('hidden');
shipEl.classList.add('hidden');
alienEl.classList.add('hidden');
enterScore.classList.add('hidden');

let rightSide = window.innerWidth;
let bottom = window.innerHeight;
let xMid = Math.round(rightSide / 2);
let yMid = Math.round(bottom / 2);

let gameIsStarted = false;
let counter = 0;
let lives = 3;
let score = 0;

const asteroids = {};
let asteroidCount = 0;

class MovingBody {
    constructor(type, element, xpos=0, ypos=0) {
    this.type = type;
    this.element = element;  
    this.xPos = xpos;
    this.yPos = ypos;
    this.xMove = 0;
    this.yMove = 0;
    this.accelerator = 10;
    this.multiplier = 1;
    this.rotation = 0;
    this.rotFactor = 15;
    this.rotMultiplier = 1;
    };
    calcMove() {
        let myRadians = this.rotation * (Math.PI / 180);
        this.xMove = Math.round(Math.sin(myRadians) * this.accelerator);
        this.yMove = Math.round(Math.cos(myRadians) * this.accelerator);
    };
    place() {
        this.element.style.left = `${this.xPos}px`;
        this.element.style.top = `${this.yPos}px`;
    };
    rotate() {
        this.rotation += Math.round(this.rotMultiplier * this.rotFactor); 
        this.element.style.rotate = `${this.rotation}deg`;
    };
};


const keyDown = function(event) {
    counter++;

    if (event.key === 'ArrowRight') {
        ship.rotMultiplier = counter;
        ship.rotFactor = Math.abs(ship.rotFactor);
        ship.rotate();
    } else if (event.key === 'ArrowLeft') {
        ship.rotMultiplier = counter;
        ship.rotFactor = - Math.abs(ship.rotFactor);
        ship.rotate();
    } else if (event.key === 'ArrowUp') {
        ship.multiplier = counter;
        ship.accelerator = 10;
        moveObject(ship);
    } else if (event.key === ' ') {
        fireBullet();
    }

    (gameIsStarted) ? true : startGame();
};

const touchStart = function(event) {
    (gameIsStarted) ? true : startGame();

}


const keyUp = function(event) {
    counter = 0;

    if (event.key === 'ArrowUp') {
        ship.accelerator = 1;
        ship.multiplier = 1000;
        moveObject(ship);
    }
};


const regenerate = function(event) {
    if (event.key === 'r') {
        otherEl.innerText = '';
        ship.element.innerText = '^';
        ship.type = 'ship';
        window.addEventListener('keydown', keyDown); 
        window.addEventListener('keyup', keyUp);
    }
};


const moveObject = function(obj) {
    obj.calcMove();

    let x = 0;

    const animate = function() {
        x++;

        if (x <= (obj.multiplier * obj.accelerator)) {

            obj.xPos += obj.xMove;
            obj.yPos -= obj.yMove;

            obj.place();

            if (obj.type.split('-')[0] === 'asteroid') {
                obj.rotate();
            } else if (obj.type === 'bullet' && asteroidCollision(bullet)) {
                cancelAnimationFrame(animate);
            } else if ((obj.type === 'ship') && asteroidCollision(ship)) {
                hitShip(obj);
            }

            switch (true) {
                case obj.xPos < 0:
                    obj.xPos = rightSide;
                    break;
                case obj.xPos > rightSide:
                    obj.xPos = 0;
                    break;
                case obj.yPos < 0:
                    obj.yPos = bottom;
                    break;
                case obj.yPos > bottom:
                    obj.yPos = 0;
                    break;
            }
            requestAnimationFrame(animate);
        }
    }
    requestAnimationFrame(animate);
};


const hitShip = function(obj) {
    lives--;
    obj.element.innerText = 'X';
    obj.type = 'dead';
    window.removeEventListener('keydown', keyDown);
    window.removeEventListener('keyup', keyUp);
    
    if (lives) {
    
        otherEl.innerText = 'Press \'r\' to regenerate.';
        let shipsLeft = 'ships: ';
        for (i = 0; i < lives; i++) {
            shipsLeft = shipsLeft.concat('^');
        }
        shipsEl.innerText = shipsLeft;
        window.addEventListener('keydown', regenerate);

    } else {

        shipsEl.innerText = 'Game Over';
        otherEl.innerHTML = '<a href=\'\'>Play Again</a>';
        window.removeEventListener('keydown', regenerate);
        
        if (isHighScore(score)) {
            enterScore.classList.remove('hidden');
            window.addEventListener('submit', () => {
                let initials = document.getElementById('initials').value;
                const scoreObj = {
                    score: score,
                    initials: initials,
                }
                addHighScore(scoreObj);
            }); 
        }
    }
};


const fireBullet = function() {
    bullet.rotation = ship.rotation;
    bullet.multiplier = 3;
    bulletEl.classList.remove('hidden');

    bullet.xPos = ship.xPos;
    bullet.yPos = ship.yPos;
    bullet.place();

    moveObject(bullet);
};


const makeAsteroids = function(type='asteroid-large', count=1, xpos, ypos) {
    for (i = 0; i < count; i++) {

        let myXPos = (xpos) ? xpos : randomNumber(rightSide);
        let myYPos = (ypos) ? ypos : randomNumber(bottom);

        let astName = `asteroid${i + asteroidCount}`;

        const roidEl = document.createElement('div');
        roidEl.innerText = 'O';
        roidEl.classList.add(type);
        body.appendChild(roidEl);

        asteroids[astName] = new MovingBody(type, roidEl, myXPos, myYPos);
        asteroids[astName].rotation = randomNumber(360);
        asteroids[astName].rotFactor = 1;
        asteroids[astName].rotMultiplier = 1;
        asteroids[astName].accelerator = 1;
        asteroids[astName].multiplier = 50000;

        if (randomNumber(2)) {
            asteroids[astName].rotFactor = -1;
        }

        moveObject(asteroids[astName]);
    
    }
    asteroidCount += count;
};


const alienShip = function() {


};


const asteroidCollision = function(obj) {
    const objXCenter = obj.xPos + Math.round(obj.element.offsetWidth / 2);
    const objYCenter = obj.yPos + Math.round(obj.element.offsetHeight / 2);
    for (let key of Object.keys(asteroids)) {
        let hitZone = asteroids[key].element.offsetWidth;
        if ((objXCenter > (asteroids[key].xPos + Math.round(hitZone * .25))) && (objXCenter < (asteroids[key].xPos + Math.round(hitZone * .75))) &&
            (objYCenter > (asteroids[key].yPos + Math.round(hitZone * .25))) && (objYCenter < (asteroids[key].yPos + Math.round(hitZone * .75)))) {

            asteroids[key].element.remove();

            bulletEl.classList.add('hidden');
            bullet.xPos = ship.xPos;
            bullet.yPos = ship.yPos;
            bullet.place();

            if (asteroids[key].type === 'asteroid-large') {
                makeAsteroids('asteroid-med', 3, asteroids[key].xPos, asteroids[key].yPos);
                score += 100;
            } else if (asteroids[key].type === 'asteroid-med') {
                makeAsteroids('asteroid-small', 2, asteroids[key].xPos, asteroids[key].yPos);
                score += 1000;
            } else if (asteroids[key].type === 'asteroid-small') {
                score += 3000;
            }
            scoreEl.innerText = `score: ${score}`;
            delete asteroids[key];
            return true;
        }
    }
    return false;
};


const isHighScore = function(score) {
    let highScores = getHighScores() || [];
    if (highScores.length < 6) {
        return true;
    } else {
        for (let item of highScores) {
            if (score > item.score) {
                return true;
            }
        }
        return false;
    }
};


const getHighScores = function() {
    let hsJSON = localStorage.getItem('high_scores');
    let highScores = JSON.parse(hsJSON);
    return highScores;
};


const addHighScore = function(scoreObj) {
    let highScores = getHighScores() || [];
    let position = highScores.findIndex((element) => {return scoreObj.score > element.score});
    position === -1 ? highScores.push(scoreObj) : highScores.splice(position, 0, scoreObj);
    (highScores.length > 6) ? highScores.pop() : true;
    const hsJSON = JSON.stringify(highScores);
    localStorage.setItem('high_scores', hsJSON);
};


const showHighScores = function() {
    let highScores = getHighScores() || [];
    let scoreList = '<br/><h3>HIGH SCORES</h3>';
    highScores.forEach((highScore) => {
        scoreList = scoreList.concat(`<h3>${highScore.score} ${highScore.initials}</h3>`);
    });
    highScoresEl.innerHTML = scoreList;
};


const goDark = function() {
    body.style.backgroundColor = 'black';
    ship.element.classList.remove('hidden');
    titleDiv.remove();
    highScoresEl.remove();
};


const randomNumber = function(range) {
    return Math.floor(Math.random() * range);
};


const startGame = function() {
    gameIsStarted = true;
    goDark();
    ship.place();
    makeAsteroids('asteroid-large', 5);

    let asteroidInterval = setInterval(() => {
        if (asteroidCount < 500) { 
            makeAsteroids('asteroid-large', 2);
        } else { 
            clearInterval(asteroidInterval);
        }
        }, 20000);

    let alienInterval = setInterval(() => {


    }, 100000);
};

// let timer = 0;

// let timeInterval = setInterval(() => {
//     if (timer < 10000) {
//         timer++;
//     } else { 
//         clearInterval(timeInterval);
//     }

// }, 10);

// window.addEventListener('keydown', () => {
//     console.log(timer);
//     timer = 0;
//     console.log(timer);

// });

if (getHighScores()) {
    showHighScores();
};

const ship = new MovingBody('ship', shipEl, xMid, yMid);
const bullet = new MovingBody('bullet', bulletEl, xMid, yMid);

window.addEventListener('keydown', keyDown); 
window.addEventListener('keyup', keyUp);

window.addEventListener('touchstart', touchStart);
