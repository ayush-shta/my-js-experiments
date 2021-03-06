var $mainWrapper = document.getElementById("main-wrapper");
var $scoreWrapper = document.getElementById("score-wrapper");
var $buttonWrapper = document.getElementById("start-wrapper");

var $startButton = document.getElementById("start");
var $resetButton = document.getElementById("reset");
var $exitButton = document.getElementById("exit");
var $antNumber = document.getElementById("ant-number");

var $score = document.getElementById("score");


var SPEED = 1;
var BOX_SIZE = 45;
var CONTAINER_BORDER = 10;
var CONTAINER_TOP = 0; //adding offset
var CONTAINER_BOTTOM = 600 - BOX_SIZE - CONTAINER_BORDER;
var CONTAINER_LEFT = 0;
var CONTAINER_RIGHT = 1000 - BOX_SIZE - CONTAINER_BORDER;




var game = new Game({
    $startButton: $startButton,
    $resetButton: $resetButton,
    $exitButton: $exitButton,
    $buttonWrapper: $buttonWrapper,
    $antNumber: $antNumber,
    $mainWrapper: $mainWrapper,
    $scoreWrapper: $scoreWrapper,
    $score: $score
});

game.init();


//*****************Game Class Definition************************

function Game(props) {

    var self = this;

    self.$startButton = props.$startButton;
    self.$resetButton = props.$resetButton;
    self.$buttonWrapper = props.$buttonWrapper;
    self.$exitButton = props.$exitButton;
    self.$antNumber = props.$antNumber;
    self.$mainWrapper = props.$mainWrapper;
    self.$scoreWrapper = props.$scoreWrapper;
    self.$score = props.$score;


    self.init = function () {

        //start button
        self.$startButton.onclick = function () {

            self.numberOfBoxes = $antNumber.value || 10; //get number of boxes

            self.container1 = new Container({
                $parent: $mainWrapper,
                $scoreWrapper: self.$scoreWrapper,
                $resetButton: self.$resetButton,
                $score: self.$score,
                numberOfBoxes: self.numberOfBoxes
            });
            self.container1.init();

            self.container1.start();

            self.$buttonWrapper.style.display = "none";
        };

        //reset button
        self.$resetButton.onclick = function () {
            self.container1.reset();
        };

        //exit button
        self.$exitButton.onclick = function () {
            location.reload();
        };

        //add enter key event
        self.$antNumber.addEventListener("keyup", function (event) {
            event.preventDefault();
            if (event.keyCode === 13) {
                self.$startButton.click();
            }
        });

    };

}


//*****************Container Class Definition************************
function Container(props) {

    var self = this;
    self.$parent = props.$parent;
    self.numberOfBoxes = props.numberOfBoxes;
    self.$scoreWrapper = props.$scoreWrapper;
    self.$resetButton = props.$resetButton;
    self.$score = props.$score;

    self.Boxes = [];
    self.score = 0;

    //private function variables
    var addNewContainer;
    var changeStyles;
    var createBoxes;
    var checkBoundingBoxCollision;


    self.init = function () {
        addNewContainer();
        self.$score.innerHTML = self.score;
    };


    self.start = function () {
        changeStyles();
        createBoxes();
        self.interval = setInterval(function () {
            checkBoundingBoxCollision();
            self.Boxes.forEach(function (box) {
                box.checkBoundaryCollision();
            });
        }, 1);
    };

    changeStyles = function () {
        self.$elem.style.display = "block";
        self.$scoreWrapper.style.display = "block";
        self.$resetButton.style.display = "block";
    };

    addNewContainer = function () {
        self.$elem = document.createElement("div");
        self.$elem.className = "container";
        self.$parent.appendChild(self.$elem);

    };


    createBoxes = function () {
        for (var i = 0; i < self.numberOfBoxes; i++) {

            //making Box objects
            self.Boxes[i] = new Box({
                x: getRandom(1, 950),
                y: getRandom(1, 550),
                dx: getRandom(-1, 1),
                dy: getRandom(-1, 1),
                $parent: self.$elem
            });

            self.Boxes[i].init();
        }

        var clickCounter = 0;
        //adding click events
        self.Boxes.forEach(function (box) {

            box.$elem.onmousedown = function () {
                var that = this;
                clickCounter++;

                if (clickCounter === 1) {
                    box.$elem.style.background = "url(\'ant-squashed.png\') no-repeat";
                    //stop the motion
                    box.dx = 0;
                    box.dy = 0;

                    self.Boxes.splice(self.Boxes.indexOf(box), 1);

                    setTimeout(function () {
                        that.remove(); // remove
                        clickCounter = 0;
                    }, 800);

                    self.score += 1;
                    self.$score.innerHTML = self.score;
                }
            }
        })
    };


    self.reset = function () {
        clearInterval(self.interval);
        self.$elem.innerHTML = ''; //delete all child nodes
        self.start();
    };


    checkBoundingBoxCollision = function () {

        self.Boxes.forEach(function (box) {
            self.Boxes.forEach(function (otherBox) {

                if (box === otherBox) {
                    return;
                }

                if ((box.x < otherBox.x + BOX_SIZE) && (box.x + BOX_SIZE > otherBox.x) &&
                    (box.y < otherBox.y + BOX_SIZE) && (BOX_SIZE + box.y > otherBox.y)) {

                    if (box.x < otherBox.x + BOX_SIZE) {
                        box.dx = -1;
                        otherBox.dx = 1;

                        // so that it does not overflow container at right
                        // if (otherBox.x + BOX_SIZE < CONTAINER_RIGHT - BOX_SIZE) {
                        //     box.x = otherBox.x + BOX_SIZE;
                        // }
                    }

                    if (box.x + BOX_SIZE > otherBox.x) {
                        box.dx = 1;
                        otherBox.dx = -1;
                        // otherBox.x = box.x - BOX_SIZE;
                    }

                    if (box.y < otherBox.y + BOX_SIZE) {
                        box.dy = 1;
                        otherBox.dy = -1;

                        // so that it does not overflow container at bottom
                        // if (otherBox.y + BOX_SIZE < CONTAINER_BOTTOM - BOX_SIZE) {
                        //     box.y = otherBox.y + BOX_SIZE;
                        // }
                    }

                    if (BOX_SIZE + box.y > otherBox.y) {
                        box.dy = -1;
                        otherBox.dy = 1;

                        // otherBox.y = box.y - BOX_SIZE/2;
                    }

                }
            })
        });

    };

}


//**************Box Class Definition************************
function Box(props) {

    var self = this;

    self.x = props.x;
    self.y = props.y;
    self.dx = props.dx || 1;
    self.dy = props.dy || 1;

    //private function variables
    var addNewBoxes;
    var plotPosition;
    var updatePosition;


    self.init = function () {
        addNewBoxes();
        plotPosition();
    };


    addNewBoxes = function () {
        self.$parent = props.$parent;
        self.$elem = document.createElement("div");
        self.$elem.style.cursor = "pointer";
        self.$elem.className = "box";
        self.$parent.appendChild(self.$elem);
    };


    plotPosition = function () {
        self.$elem.style.left = self.x + "px";
        self.$elem.style.top = self.y + "px";
    };


    updatePosition = function () {
        self.x = self.x + self.dx * SPEED;
        self.y = self.y + self.dy * SPEED;
    };

    self.checkBoundaryCollision = function () {

        self.leftEdge = self.x;
        self.rightEdge = self.x + BOX_SIZE;
        self.topEgde = self.y;
        self.bottomEdge = self.y + BOX_SIZE;

        if (self.topEgde < CONTAINER_TOP) {
            self.dy = 1;
        }
        if (self.leftEdge < CONTAINER_LEFT) {

            self.dx = 1;
        }
        if (self.rightEdge > CONTAINER_RIGHT) {

            self.dx = -1;
        }
        if (self.bottomEdge > CONTAINER_BOTTOM) {
            self.dy = -1;
        }

        updatePosition();
        plotPosition();

    };

}


//*****************Function Definition*********************
function getRandom(min, max) {
    return Math.random() * (max - min + 1) + min;
}