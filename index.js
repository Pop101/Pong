const fps = 1/60*1000;
const paddleSize = 0.3
const paddleSpeed = 0.01 * $(window).height();

const ballXSpeed = 0.005 * $(window).width();
const ballYSpeed = 0.005 * $(window).height();
const r = $('#right');
const l = $('#left');
const b = $('#ball');

const rscore = $('.sright');
const lscore = $('.sleft');

// update paddle size to fit small displays
r.css({height:paddleSize*$(window).height()})
l.css({height:paddleSize*$(window).height()})

// move paddles to middle
r.css({top:(0.5-0.5*paddleSize)*$(window).height()})
l.css({top:(0.5-0.5*paddleSize)*$(window).height()})

// Define collision detection
function collide(e1, e2){
	let b1 = e1.get(0).getBoundingClientRect()
	let b2 = e2.get(0).getBoundingClientRect()
	return b1.top + b1.height > b2.top
		&& b1.left + b1.width > b2.left
		&& b1.bottom - b1.height < b2.bottom
		&& b1.right - b1.width < b2.right
}
function hitCeiling(e) {
	let b = e.get(0).getBoundingClientRect()
	return b.bottom > $(window).height();
}
function hitFloor(e) {
	let b = e.get(0).getBoundingClientRect()
	return b.y < 0;
}
function hitLeftWall(e) {
	let b = e.get(0).getBoundingClientRect()
	return b.x < 0;
}
function hitRightWall(e) {
	let b = e.get(0).getBoundingClientRect()
	return b.right > $(window).width();
}
function outOfBounds(e) {
	let b = e.get(0).getBoundingClientRect()
	return b.x < 0 || b.y < 0 || b.bottom > $(window).height() || b.right > $(window).width();
}
function announce(s) {
	$('.announcement').text(s)
	$('.announcement').css({color: 'white'})

	setTimeout(function() {
		$('.announcement').css({color: 'rgba(255,255,255,0)'})
	}, 2000);
}

// Ball Moving
var ballXVel = ballXSpeed;
var ballYVel = ballYSpeed;
function ball() {
	var delay = fps;
	
	// Bounce the ball
	if(hitFloor(b)) ballYVel = Math.abs(ballYVel)
	if(hitCeiling(b)) ballYVel = -Math.abs(ballYVel)
	if(collide(b, l)) ballXVel = Math.abs(ballXVel)
	if(collide(b, r)) ballXVel = -Math.abs(ballXVel)
	
	// Score the goals
	if(hitRightWall(b)){
		$('#sleft').text((Number.parseFloat($('#sleft').text()) || 0)+1)
		b.css({left:0.5*$(window).width(),top:0.5*$(window).height()});
		announce('Goal')
		ballXVel = -ballXSpeed
		ballYVel = ballYSpeed
		delay = 600
	}
	if(hitLeftWall(b)){
		$('#sright').text((Number.parseFloat($('#sright').text()) || 0)+1)
		b.css({left:0.5*$(window).width(),top:0.5*$(window).height()});
		announce('Goal')
		ballXVel = ballXSpeed
		ballYVel = ballYSpeed
		delay = 600
	}
	
	// Move the ball
	let pos = b.offset()
	b.css({left:pos.left+ballXVel,top:pos.top+ballYVel});
	
	// Slightly speed it up every tick
	ballXVel *= 1.00007
	ballYVel *= 1.00015
	
	// Repeat
	setTimeout(function() {
		ball()
	}, delay);
}

// Paddle moving 3 different ways
var rIsCpu = false;
var lIsCpu = false;

// Touchscreen handler for moving paddles
l.get(0).addEventListener('touchmove', function(event) {
	if (event.targetTouches.length == 1) {
		var touch = event.targetTouches[0];
		l.css({top:touch.pageY-0.5*l.height()});
	}
}, false);
r.get(0).addEventListener('touchmove', function(event) {
	if (event.targetTouches.length == 1) {
		var touch = event.targetTouches[0];
		r.css({top:touch.pageY-0.5*r.height()});
	}
}, false);

// Utility movement functions
function movePaddle(p, up) {
	if(up && hitCeiling(p)) return;
	if(!up && hitFloor(p)) return;
	let pos = p.offset()
	p.css({top:pos.top + (up ? paddleSpeed : -paddleSpeed)});
}
function cpuPaddle(p, b) {
	let bPos = b.offset()
	let bY = bPos.top + 0.5*b.height();
	let bX = bPos.left + 0.5*b.width();
	
	let pPos = p.offset()
	let pY = pPos.top + 0.5*p.height();
	let pX = pPos.left + 0.5*p.width();
	
	if(Math.abs(pX-bX) > 0.6*$(window).width()) return	
	if(Math.abs(pY-bY) < 0.4*p.height()) return;
	movePaddle(p, pY-bY < 0)
}

// Mouse click turns paddle into CPU paddle
l.get(0).addEventListener('mouseup', function(event) {
	lIsCpu = !lIsCpu
	if(lIsCpu) l.css({'background-color':'blue'})
	else l.css({'background-color':'white'})
})
r.get(0).addEventListener('mouseup', function(event) {
	rIsCpu = !rIsCpu
	if(rIsCpu) r.css({'background-color':'blue'})
	else r.css({'background-color':'white'})
})

// Keyboard listener
var keysDown = [];
onkeydown = onkeyup = function(e) {
	e = e || event; // to deal with IE
	keysDown[e.keyCode] = e.type == 'keydown';
}

// Loop to manage paddle motion
function movePaddles() {
	if(!rIsCpu) {
		if(keysDown[40]) movePaddle(r, true); // up arrow
		if(keysDown[38]) movePaddle(r, false); // down arrow
	} else {
		cpuPaddle(r, b)
	}
	
	if(!lIsCpu) {
		if(keysDown[83]) movePaddle(l, true); // w
		if(keysDown[87]) movePaddle(l, false); // s
	} else {
		cpuPaddle(l, b)
	}
	
	setTimeout(function() {
		movePaddles()
	}, fps);
}

// Start the game by putting the ball in the middle
announce('Start')
movePaddles()

b.css({left:0.5*$(window).width(),top:0.5*$(window).height()});
setTimeout(function() {
	ball()
}, 3*1000);