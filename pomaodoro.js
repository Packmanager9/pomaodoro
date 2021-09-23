
window.addEventListener('DOMContentLoaded', (event) => {

    let pomaoimg = new Image()
    pomaoimg.src = 'rcpomaolp.png'

    const squaretable = {} // this section of code is an optimization for use of the hypotenuse function on Line and LineOP objects
    for(let t = 0;t<10000000;t++){
        squaretable[`${t}`] = Math.sqrt(t)
        if(t > 999){
            t+=9
        }
    }
    let canvas
    let canvas_context
    let keysPressed = {}
    let FLEX_engine
    let TIP_engine = {}
    let XS_engine
    let YS_engine
    TIP_engine.x = 350
    TIP_engine.y = 350
    class Point {
        constructor(x, y) {
            this.x = x
            this.y = y
            this.radius = 0
        }
        pointDistance(point) {
            return (new LineOP(this, point, "transparent", 0)).hypotenuse()
        }
    }

    class Vector{ // vector math and physics if you prefer this over vector components on circles
        constructor(object = (new Point(0,0)), xmom = 0, ymom = 0){
            this.xmom = xmom
            this.ymom = ymom
            this.object = object
        }
        isToward(point){
            let link = new LineOP(this.object, point)
            let dis1 = link.sqrDis()
            let dummy = new Point(this.object.x+this.xmom, this.object.y+this.ymom)
            let link2 = new LineOP(dummy, point)
            let dis2 = link2.sqrDis()
            if(dis2 < dis1){
                return true
            }else{
                return false
            }
        }
        rotate(angleGoal){
            let link = new Line(this.xmom, this.ymom, 0,0)
            let length = link.hypotenuse()
            let x = (length * Math.cos(angleGoal))
            let y = (length * Math.sin(angleGoal))
            this.xmom = x
            this.ymom = y
        }
        magnitude(){
            return (new Line(this.xmom, this.ymom, 0,0)).hypotenuse()
        }
        normalize(size = 1){
            let magnitude = this.magnitude()
            this.xmom/=magnitude
            this.ymom/=magnitude
            this.xmom*=size
            this.ymom*=size
        }
        multiply(vect){
            let point = new Point(0,0)
            let end = new Point(this.xmom+vect.xmom, this.ymom+vect.ymom)
            return point.pointDistance(end)
        }
        add(vect){
            return new Vector(this.object, this.xmom+vect.xmom, this.ymom+vect.ymom)
        }
        subtract(vect){
            return new Vector(this.object, this.xmom-vect.xmom, this.ymom-vect.ymom)
        }
        divide(vect){
            return new Vector(this.object, this.xmom/vect.xmom, this.ymom/vect.ymom) //be careful with this, I don't think this is right
        }
        draw(){
            let dummy = new Point(this.object.x+this.xmom, this.object.y+this.ymom)
            let link = new LineOP(this.object, dummy, "#FFFFFF", 1)
            link.draw()
        }
    }
    class Line {
        constructor(x, y, x2, y2, color, width) {
            this.x1 = x
            this.y1 = y
            this.x2 = x2
            this.y2 = y2
            this.color = color
            this.width = width
        }
        angle() {
            return Math.atan2(this.y1 - this.y2, this.x1 - this.x2)
        }
        squareDistance() {
            let xdif = this.x1 - this.x2
            let ydif = this.y1 - this.y2
            let squareDistance = (xdif * xdif) + (ydif * ydif)
            return squareDistance
        }
        hypotenuse() {
            let xdif = this.x1 - this.x2
            let ydif = this.y1 - this.y2
            let hypotenuse = (xdif * xdif) + (ydif * ydif)
            if(hypotenuse < 10000000-1){
                if(hypotenuse > 1000){
                    return squaretable[`${Math.round(10*Math.round((hypotenuse*.1)))}`]
                }else{
                return squaretable[`${Math.round(hypotenuse)}`]
                }
            }else{
                return Math.sqrt(hypotenuse)
            }
        }
        draw() {
            let linewidthstorage = canvas_context.lineWidth
            canvas_context.strokeStyle = this.color
            canvas_context.lineWidth = this.width
            canvas_context.beginPath()
            canvas_context.moveTo(this.x1, this.y1)
            canvas_context.lineTo(this.x2, this.y2)
            canvas_context.stroke()
            canvas_context.lineWidth = linewidthstorage
        }
    }
    class LineOP {
        constructor(object, target, color, width) {
            this.object = object
            this.target = target
            this.color = color
            this.width = width
        }
        squareDistance() {
            let xdif = this.object.x - this.target.x
            let ydif = this.object.y - this.target.y
            let squareDistance = (xdif * xdif) + (ydif * ydif)
            return squareDistance
        }
        hypotenuse() {
            let xdif = this.object.x - this.target.x
            let ydif = this.object.y - this.target.y
            let hypotenuse = (xdif * xdif) + (ydif * ydif)
            if(hypotenuse < 10000000-1){
                if(hypotenuse > 1000){
                    return squaretable[`${Math.round(10*Math.round((hypotenuse*.1)))}`]
                }else{
                return squaretable[`${Math.round(hypotenuse)}`]
                }
            }else{
                return Math.sqrt(hypotenuse)
            }
        }
        angle() {
            return Math.atan2(this.object.y - this.target.y, this.object.x - this.target.x)
        }
        draw() {
            let linewidthstorage = canvas_context.lineWidth
            canvas_context.strokeStyle = this.color
            canvas_context.lineWidth = this.width
            canvas_context.beginPath()
            canvas_context.moveTo(this.object.x, this.object.y)
            canvas_context.lineTo(this.target.x, this.target.y)
            canvas_context.stroke()
            canvas_context.lineWidth = linewidthstorage
        }
    }
    class Triangle {
        constructor(x, y, color, length, fill = 0, strokeWidth = 0, leg1Ratio = 1, leg2Ratio = 1, heightRatio = 1) {
            this.x = x
            this.y = y
            this.color = color
            this.length = length
            this.x1 = this.x + this.length * leg1Ratio
            this.x2 = this.x - this.length * leg2Ratio
            this.tip = this.y - this.length * heightRatio
            this.accept1 = (this.y - this.tip) / (this.x1 - this.x)
            this.accept2 = (this.y - this.tip) / (this.x2 - this.x)
            this.fill = fill
            this.stroke = strokeWidth
        }
        draw() {
            canvas_context.strokeStyle = this.color
            canvas_context.stokeWidth = this.stroke
            canvas_context.beginPath()
            canvas_context.moveTo(this.x, this.y)
            canvas_context.lineTo(this.x1, this.y)
            canvas_context.lineTo(this.x, this.tip)
            canvas_context.lineTo(this.x2, this.y)
            canvas_context.lineTo(this.x, this.y)
            if (this.fill == 1) {
                canvas_context.fill()
            }
            canvas_context.stroke()
            canvas_context.closePath()
        }
        isPointInside(point) {
            if (point.x <= this.x1) {
                if (point.y >= this.tip) {
                    if (point.y <= this.y) {
                        if (point.x >= this.x2) {
                            this.accept1 = (this.y - this.tip) / (this.x1 - this.x)
                            this.accept2 = (this.y - this.tip) / (this.x2 - this.x)
                            this.basey = point.y - this.tip
                            this.basex = point.x - this.x
                            if (this.basex == 0) {
                                return true
                            }
                            this.slope = this.basey / this.basex
                            if (this.slope >= this.accept1) {
                                return true
                            } else if (this.slope <= this.accept2) {
                                return true
                            }
                        }
                    }
                }
            }
            return false
        }
    }
    class Rectangle {
        constructor(x, y, width, height, color, fill = 1, stroke = 0, strokeWidth = 1) {
            this.x = x
            this.y = y
            this.height = height
            this.width = width
            this.color = color
            this.xmom = 0
            this.ymom = 0
            this.stroke = stroke
            this.strokeWidth = strokeWidth
            this.fill = fill
        }
        draw() {
            canvas_context.fillStyle = this.color
            canvas_context.fillRect(this.x, this.y, this.width, this.height)
        }
        move() {
            this.x += this.xmom
            this.y += this.ymom
        }
        isPointInside(point) {
            if (point.x >= this.x) {
                if (point.y >= this.y) {
                    if (point.x <= this.x + this.width) {
                        if (point.y <= this.y + this.height) {
                            return true
                        }
                    }
                }
            }
            return false
        }
        doesPerimeterTouch(point) {
            if (point.x + point.radius >= this.x) {
                if (point.y + point.radius >= this.y) {
                    if (point.x - point.radius <= this.x + this.width) {
                        if (point.y - point.radius <= this.y + this.height) {
                            return true
                        }
                    }
                }
            }
            return false
        }
    }
    class Circle {
        constructor(x, y, radius, color, xmom = 0, ymom = 0, friction = 1, reflect = 0, strokeWidth = 0, strokeColor = "transparent") {
            this.x = x
            this.y = y
            this.radius = radius
            this.color = color
            this.xmom = xmom
            this.ymom = ymom
            this.sxmom = xmom
            this.symom = ymom
            this.friction = friction
            this.reflect = reflect
            this.strokeWidth = strokeWidth
            this.strokeColor = strokeColor
        }
        smove(){
            
        }
        draw() {
            canvas_context.lineWidth = this.strokeWidth
            canvas_context.strokeStyle = this.color
            canvas_context.beginPath();
            if (this.radius > 0) {
                canvas_context.arc(this.x, this.y, this.radius, 0, (Math.PI * 2), true)
                canvas_context.fillStyle = this.color
                canvas_context.fill()
                canvas_context.stroke();
            } else {
                console.log("The circle is below a radius of 0, and has not been drawn. The circle is:", this)
            }
        }
        move() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x += this.xmom
            this.y += this.ymom
        }
        unmove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x -= this.xmom
            this.y -= this.ymom
        }
        frictiveMove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x += this.xmom
            this.y += this.ymom
            this.xmom *= this.friction
            this.ymom *= this.friction
        }
        frictiveunMove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.xmom /= this.friction
            this.ymom /= this.friction
            this.x -= this.xmom
            this.y -= this.ymom
        }
        isPointInside(point) {
            this.areaY = point.y - this.y
            this.areaX = point.x - this.x
            if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= (this.radius * this.radius)) {
                return true
            }
            return false
        }
        doesPerimeterTouch(point) {
            this.areaY = point.y - this.y
            this.areaX = point.x - this.x
            if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= ((this.radius + point.radius) * (this.radius + point.radius))) {
                return true
            }
            return false
        }
    } 
    class CircleRing {
        constructor(x, y, radius, color, xmom = 0, ymom = 0, friction = 1, reflect = 0, strokeWidth = 0, strokeColor = "transparent") {
            this.x = x
            this.y = y
            this.radius = radius
            this.color = color
            this.xmom = xmom
            this.ymom = ymom
            this.friction = friction
            this.reflect = reflect
            this.strokeWidth = 10
            this.strokeColor = strokeColor
        }
        draw() {
            canvas_context.lineWidth = this.strokeWidth
            canvas_context.strokeStyle = this.color
            canvas_context.beginPath();
            if (this.radius > 0) {
                canvas_context.arc(this.x, this.y, this.radius, 0, (Math.PI * 2), true)
                canvas_context.fillStyle = this.color
                canvas_context.fill()
                canvas_context.stroke();
            } else {
                console.log("The circle is below a radius of 0, and has not been drawn. The circle is:", this)
            }
        }
        move() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x += this.xmom
            this.y += this.ymom
        }
        unmove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x -= this.xmom
            this.y -= this.ymom
        }
        frictiveMove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.x += this.xmom
            this.y += this.ymom
            this.xmom *= this.friction
            this.ymom *= this.friction
        }
        frictiveunMove() {
            if (this.reflect == 1) {
                if (this.x + this.radius > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y + this.radius > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.x - this.radius < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.y - this.radius < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.xmom /= this.friction
            this.ymom /= this.friction
            this.x -= this.xmom
            this.y -= this.ymom
        }
        isPointInside(point) {
            this.areaY = point.y - this.y
            this.areaX = point.x - this.x
            if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= (this.radius * this.radius)) {
                return true
            }
            return false
        }
        doesPerimeterTouch(point) {
            this.areaY = point.y - this.y
            this.areaX = point.x - this.x
            if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= ((this.radius + point.radius) * (this.radius + point.radius))) {
                return true
            }
            return false
        }
    } class Polygon {
        constructor(x, y, size, color, sides = 3, xmom = 0, ymom = 0, angle = 0, reflect = 0) {
            if (sides < 2) {
                sides = 2
            }
            this.reflect = reflect
            this.xmom = xmom
            this.ymom = ymom
            this.body = new Circle(x, y, size - (size * .293), "transparent")
            this.nodes = []
            this.angle = angle
            this.size = size
            this.color = color
            this.angleIncrement = (Math.PI * 2) / sides
            this.sides = sides
            for (let t = 0; t < sides; t++) {
                let node = new Circle(this.body.x + (this.size * (Math.cos(this.angle))), this.body.y + (this.size * (Math.sin(this.angle))), 0, "transparent")
                this.nodes.push(node)
                this.angle += this.angleIncrement
            }
        }
        isPointInside(point) { // rough approximation
            this.body.radius = this.size - (this.size * .293)
            if (this.sides <= 2) {
                return false
            }
            this.areaY = point.y - this.body.y
            this.areaX = point.x - this.body.x
            if (((this.areaX * this.areaX) + (this.areaY * this.areaY)) <= (this.body.radius * this.body.radius)) {
                return true
            }
            return false
        }
        move() {
            if (this.reflect == 1) {
                if (this.body.x > canvas.width) {
                    if (this.xmom > 0) {
                        this.xmom *= -1
                    }
                }
                if (this.body.y > canvas.height) {
                    if (this.ymom > 0) {
                        this.ymom *= -1
                    }
                }
                if (this.body.x < 0) {
                    if (this.xmom < 0) {
                        this.xmom *= -1
                    }
                }
                if (this.body.y < 0) {
                    if (this.ymom < 0) {
                        this.ymom *= -1
                    }
                }
            }
            this.body.x += this.xmom
            this.body.y += this.ymom
        }
        draw() {
            this.nodes = []
            this.angleIncrement = (Math.PI * 2) / this.sides
            this.body.radius = this.size - (this.size * .293)
            for (let t = 0; t < this.sides; t++) {
                let node = new Circle(this.body.x + (this.size * (Math.cos(this.angle))), this.body.y + (this.size * (Math.sin(this.angle))), 0, "transparent")
                this.nodes.push(node)
                this.angle += this.angleIncrement
            }
            canvas_context.strokeStyle = this.color
            canvas_context.fillStyle = this.color
            canvas_context.lineWidth = 0
            canvas_context.beginPath()
            canvas_context.moveTo(this.nodes[0].x, this.nodes[0].y)
            for (let t = 1; t < this.nodes.length; t++) {
                canvas_context.lineTo(this.nodes[t].x, this.nodes[t].y)
            }
            canvas_context.lineTo(this.nodes[0].x, this.nodes[0].y)
            canvas_context.fill()
            canvas_context.stroke()
            canvas_context.closePath()
        }
    }
    class Shape {
        constructor(shapes) {
            this.shapes = shapes
        }
        draw() {
            for (let t = 0; t < this.shapes.length; t++) {
                this.shapes[t].draw()
            }
        }
        isPointInside(point) {
            for (let t = 0; t < this.shapes.length; t++) {
                if (this.shapes[t].isPointInside(point)) {
                    return true
                }
            }
            return false
        }
        doesPerimeterTouch(point) {
            for (let t = 0; t < this.shapes.length; t++) {
                if (this.shapes[t].doesPerimeterTouch(point)) {
                    return true
                }
            }
            return false
        }
        innerShape(point) {
            for (let t = 0; t < this.shapes.length; t++) {
                if (this.shapes[t].doesPerimeterTouch(point)) {
                    return this.shapes[t]
                }
            }
            return false
        }
        isInsideOf(box) {
            for (let t = 0; t < this.shapes.length; t++) {
                if (box.isPointInside(this.shapes[t])) {
                    return true
                }
            }
            return false
        }
        adjustByFromDisplacement(x,y) {
            for (let t = 0; t < this.shapes.length; t++) {
                if(typeof this.shapes[t].fromRatio == "number"){
                    this.shapes[t].x+=x*this.shapes[t].fromRatio
                    this.shapes[t].y+=y*this.shapes[t].fromRatio
                }
            }
        }
        adjustByToDisplacement(x,y) {
            for (let t = 0; t < this.shapes.length; t++) {
                if(typeof this.shapes[t].toRatio == "number"){
                    this.shapes[t].x+=x*this.shapes[t].toRatio
                    this.shapes[t].y+=y*this.shapes[t].toRatio
                }
            }
        }
        mixIn(arr){
            for(let t = 0;t<arr.length;t++){
                for(let k = 0;k<arr[t].shapes.length;k++){
                    this.shapes.push(arr[t].shapes[k])
                }
            }
        }
        push(object) {
            this.shapes.push(object)
        }
    }

    class Spring {
        constructor(x, y, radius, color, body = 0, length = 1, gravity = 0, width = 1) {
            if (body == 0) {
                this.body = new Circle(x, y, radius, color)
                this.anchor = new Circle(x, y, radius, color)
                this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", width)
                this.length = length
            } else {
                this.body = body
                this.anchor = new Circle(x, y, radius, color)
                this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", width)
                this.length = length
            }
            this.gravity = gravity
            this.width = width
        }
        balance() {
            this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", this.width)
            if (this.beam.hypotenuse() < this.length) {
                this.body.xmom += (this.body.x - this.anchor.x) / this.length
                this.body.ymom += (this.body.y - this.anchor.y) / this.length
                this.anchor.xmom -= (this.body.x - this.anchor.x) / this.length
                this.anchor.ymom -= (this.body.y - this.anchor.y) / this.length
            } else {
                this.body.xmom -= (this.body.x - this.anchor.x) / this.length
                this.body.ymom -= (this.body.y - this.anchor.y) / this.length
                this.anchor.xmom += (this.body.x - this.anchor.x) / this.length
                this.anchor.ymom += (this.body.y - this.anchor.y) / this.length
            }
            let xmomentumaverage = (this.body.xmom + this.anchor.xmom) / 2
            let ymomentumaverage = (this.body.ymom + this.anchor.ymom) / 2
            this.body.xmom = (this.body.xmom + xmomentumaverage) / 2
            this.body.ymom = (this.body.ymom + ymomentumaverage) / 2
            this.anchor.xmom = (this.anchor.xmom + xmomentumaverage) / 2
            this.anchor.ymom = (this.anchor.ymom + ymomentumaverage) / 2
        }
        draw() {
            this.beam = new Line(this.body.x, this.body.y, this.anchor.x, this.anchor.y, "yellow", this.width)
            this.beam.draw()
            this.body.draw()
            this.anchor.draw()
        }
        move() {
            this.anchor.ymom += this.gravity
            this.anchor.move()
        }

    }  
    class SpringOP {
        constructor(body, anchor, length, width = 3, color = body.color) {
            this.body = body
            this.anchor = anchor
            this.beam = new LineOP(body, anchor, color, width)
            this.length = length
        }
        balance() {
            if (this.beam.hypotenuse() < this.length) {
                this.body.xmom += ((this.body.x - this.anchor.x) / this.length) 
                this.body.ymom += ((this.body.y - this.anchor.y) / this.length) 
                this.anchor.xmom -= ((this.body.x - this.anchor.x) / this.length) 
                this.anchor.ymom -= ((this.body.y - this.anchor.y) / this.length) 
            } else if (this.beam.hypotenuse() > this.length) {
                this.body.xmom -= (this.body.x - this.anchor.x) / (this.length)
                this.body.ymom -= (this.body.y - this.anchor.y) / (this.length)
                this.anchor.xmom += (this.body.x - this.anchor.x) / (this.length)
                this.anchor.ymom += (this.body.y - this.anchor.y) / (this.length)
            }

            let xmomentumaverage = (this.body.xmom + this.anchor.xmom) / 2
            let ymomentumaverage = (this.body.ymom + this.anchor.ymom) / 2
            this.body.xmom = (this.body.xmom + xmomentumaverage) / 2
            this.body.ymom = (this.body.ymom + ymomentumaverage) / 2
            this.anchor.xmom = (this.anchor.xmom + xmomentumaverage) / 2
            this.anchor.ymom = (this.anchor.ymom + ymomentumaverage) / 2
        }
        draw() {
            this.beam.draw()
        }
        move() {
            //movement of SpringOP objects should be handled separate from their linkage, to allow for many connections, balance here with this object, move nodes independently
        }
    }

    class Color {
        constructor(baseColor, red = -1, green = -1, blue = -1, alpha = 1) {
            this.hue = baseColor
            if (red != -1 && green != -1 && blue != -1) {
                this.r = red
                this.g = green
                this.b = blue
                if (alpha != 1) {
                    if (alpha < 1) {
                        this.alpha = alpha
                    } else {
                        this.alpha = alpha / 255
                        if (this.alpha > 1) {
                            this.alpha = 1
                        }
                    }
                }
                if (this.r > 255) {
                    this.r = 255
                }
                if (this.g > 255) {
                    this.g = 255
                }
                if (this.b > 255) {
                    this.b = 255
                }
                if (this.r < 0) {
                    this.r = 0
                }
                if (this.g < 0) {
                    this.g = 0
                }
                if (this.b < 0) {
                    this.b = 0
                }
            } else {
                this.r = 0
                this.g = 0
                this.b = 0
            }
        }
        normalize() {
            if (this.r > 255) {
                this.r = 255
            }
            if (this.g > 255) {
                this.g = 255
            }
            if (this.b > 255) {
                this.b = 255
            }
            if (this.r < 0) {
                this.r = 0
            }
            if (this.g < 0) {
                this.g = 0
            }
            if (this.b < 0) {
                this.b = 0
            }
        }
        randomLight() {
            var letters = '0123456789ABCDEF';
            var hash = '#';
            for (var i = 0; i < 6; i++) {
                hash += letters[(Math.floor(Math.random() * 12) + 4)];
            }
            var color = new Color(hash, 55 + Math.random() * 200, 55 + Math.random() * 200, 55 + Math.random() * 200)
            return color;
        }
        randomDark() {
            var letters = '0123456789ABCDEF';
            var hash = '#';
            for (var i = 0; i < 6; i++) {
                hash += letters[(Math.floor(Math.random() * 12))];
            }
            var color = new Color(hash, Math.random() * 200, Math.random() * 200, Math.random() * 200)
            return color;
        }
        random() {
            var letters = '0123456789ABCDEF';
            var hash = '#';
            for (var i = 0; i < 6; i++) {
                hash += letters[(Math.floor(Math.random() * 16))];
            }
            var color = new Color(hash, Math.random() * 255, Math.random() * 255, Math.random() * 255)
            return color;
        }
    }
    class Softbody { //buggy, spins in place
        constructor(x, y, radius, color, size, members = 10, memberLength = 5, force = 10, gravity = 0) {
            this.springs = []
            this.pin = new Circle(x, y, radius, color)
            this.points = []
            this.flop = 0
            let angle = 0
            this.size = size 
            let line = new Line((Math.cos(angle)*size), (Math.sin(angle)*size), (Math.cos(angle+ ((Math.PI*2)/members))*size), (Math.sin(angle+ ((Math.PI*2)/members))*size) )
            let distance = line.hypotenuse()
            for(let t =0;t<members;t++){
                let circ = new Circle(x+(Math.cos(angle)*size), y+(Math.sin(angle)*size), radius, color)
                circ.reflect = 1
                circ.bigbody = new Circle(x+(Math.cos(angle)*size), y+(Math.sin(angle)*size), distance, color)
                circ.draw()
                circ.touch = []
                this.points.push(circ)
                angle += ((Math.PI*2)/members)
            }

            for(let t =0;t<this.points.length;t++){
                for(let k =0;k<this.points.length;k++){
                    if(t!=k){
                        if(this.points[k].bigbody.doesPerimeterTouch(this.points[t])){
                        if(!this.points[k].touch.includes(t) && !this.points[t].touch.includes(k)){
                                let spring = new SpringOP(this.points[k], this.points[t], (size*Math.PI)/members, 2, color)
                                this.points[k].touch.push(t)
                                this.points[t].touch.push(k)
                                this.springs.push(spring)
                                spring.beam.draw()
                            }
                        }
                    }
                }
            }

            console.log(this)

            // this.spring = new Spring(x, y, radius, color, this.pin, memberLength, gravity)
            // this.springs.push(this.spring)
            // for (let k = 0; k < members; k++) {
            //     this.spring = new Spring(x, y, radius, color, this.spring.anchor, memberLength, gravity)
            //     if (k < members - 1) {
            //         this.springs.push(this.spring)
            //     } else {
            //         this.spring.anchor = this.pin
            //         this.springs.push(this.spring)
            //     }
            // }
            this.forceConstant = force
            this.centroid = new Circle(0, 0, 10, "red")
        }
        circularize() {
            this.xpoint = 0
            this.ypoint = 0
            for (let s = 0; s < this.springs.length; s++) {
                this.xpoint += (this.springs[s].anchor.x / this.springs.length)
                this.ypoint += (this.springs[s].anchor.y / this.springs.length)
            }
            this.centroid.x = this.xpoint
            this.centroid.y = this.ypoint
            this.angle = 0
            this.angleIncrement = (Math.PI * 2) / this.springs.length
            for (let t = 0; t < this.points.length; t++) {
                this.points[t].x = this.centroid.x + (Math.cos(this.angle) * this.forceConstant)
                this.points[t].y = this.centroid.y + (Math.sin(this.angle) * this.forceConstant)
                this.angle += this.angleIncrement 
            }
        }
        balance() {
            this.xpoint = 0
            this.ypoint = 0
            for (let s = 0; s < this.points.length; s++) {
                this.xpoint += (this.points[s].x / this.points.length)
                this.ypoint += (this.points[s].y / this.points.length)
            }
            this.centroid.x = this.xpoint
            this.centroid.y = this.ypoint
            // this.centroid.x += TIP_engine.x / this.points.length
            // this.centroid.y += TIP_engine.y / this.points.length
            for (let s = 0; s < this.points.length; s++) {
                this.link = new LineOP(this.points[s], this.centroid, 0, "transparent")
                if (this.link.hypotenuse() != 0) {

                    if(this.size < this.link.hypotenuse()){
                        this.points[s].xmom -= (Math.cos(this.link.angle())*(this.link.hypotenuse())) * this.forceConstant*.1
                        this.points[s].ymom -= (Math.sin(this.link.angle())*(this.link.hypotenuse())) * this.forceConstant*.1
                    }else{
                        this.points[s].xmom += (Math.cos(this.link.angle())*(this.link.hypotenuse())) * this.forceConstant*.1
                        this.points[s].ymom += (Math.sin(this.link.angle())*(this.link.hypotenuse())) * this.forceConstant*.1
                    }

                    // this.points[s].xmom += (((this.points[s].x - this.centroid.x) / (this.link.hypotenuse()))) * this.forceConstant
                    // this.points[s].ymom += (((this.points[s].y - this.centroid.y) / (this.link.hypotenuse()))) * this.forceConstant
                }
            }
            if(this.flop%2 == 0){
                for (let s =  0; s < this.springs.length; s++) {
                    this.springs[s].balance()
                }
            }else{
                for (let s = this.springs.length-1;s>=0; s--) {
                    this.springs[s].balance()
                }
            }
            for (let s = 0; s < this.points.length; s++) {
                this.points[s].move()
                this.points[s].draw()
            }
            for (let s =  0; s < this.springs.length; s++) {
                this.springs[s].draw()
            }
            this.centroid.draw()
        }
    }
    class Observer {
        constructor(x, y, radius, color, range = 100, rays = 10, angle = (Math.PI * .125)) {
            this.body = new Circle(x, y, radius, color)
            this.color = color
            this.ray = []
            this.rayrange = range
            this.globalangle = Math.PI
            this.gapangle = angle
            this.currentangle = 0
            this.obstacles = []
            this.raymake = rays
        }
        beam() {
            this.currentangle = this.gapangle / 2
            for (let k = 0; k < this.raymake; k++) {
                this.currentangle += (this.gapangle / Math.ceil(this.raymake / 2))
                let ray = new Circle(this.body.x, this.body.y, 1, "white", (((Math.cos(this.globalangle + this.currentangle)))), (((Math.sin(this.globalangle + this.currentangle)))))
                ray.collided = 0
                ray.lifespan = this.rayrange - 1
                this.ray.push(ray)
            }
            for (let f = 0; f < this.rayrange; f++) {
                for (let t = 0; t < this.ray.length; t++) {
                    if (this.ray[t].collided < 1) {
                        this.ray[t].move()
                        for (let q = 0; q < this.obstacles.length; q++) {
                            if (this.obstacles[q].isPointInside(this.ray[t])) {
                                this.ray[t].collided = 1
                            }
                        }
                    }
                }
            }
        }
        draw() {
            this.beam()
            this.body.draw()
            canvas_context.lineWidth = 1
            canvas_context.fillStyle = this.color
            canvas_context.strokeStyle = this.color
            canvas_context.beginPath()
            canvas_context.moveTo(this.body.x, this.body.y)
            for (let y = 0; y < this.ray.length; y++) {
                canvas_context.lineTo(this.ray[y].x, this.ray[y].y)
                canvas_context.lineTo(this.body.x, this.body.y)
            }
            canvas_context.stroke()
            canvas_context.fill()
            this.ray = []
        }
    }
    function setUp(canvas_pass, style = "#0077AA") {
        canvas = canvas_pass
        canvas_context = canvas.getContext('2d');
        canvas.style.background = style
        window.setInterval(function () {
            main()
        }, 17)
        document.addEventListener('keydown', (event) => {
            keysPressed[event.key] = true;
        });
        document.addEventListener('keyup', (event) => {
            delete keysPressed[event.key];
        });
        window.addEventListener('pointerdown', e => {
            FLEX_engine = canvas.getBoundingClientRect();
            XS_engine = e.clientX - FLEX_engine.left;
            YS_engine = e.clientY - FLEX_engine.top;
            TIP_engine.x = XS_engine
            TIP_engine.y = YS_engine
            TIP_engine.body = TIP_engine
            // example usage: if(object.isPointInside(TIP_engine)){ take action }
        });
        window.addEventListener('pointermove', continued_stimuli);

        window.addEventListener('pointerup', e => {
            // window.removeEventListener("pointermove", continued_stimuli);
        })
        function continued_stimuli(e) {
            FLEX_engine = canvas.getBoundingClientRect();
            XS_engine = e.clientX - FLEX_engine.left;
            YS_engine = e.clientY - FLEX_engine.top;
            TIP_engine.x = XS_engine
            TIP_engine.y = YS_engine
            TIP_engine.body = TIP_engine
        }
    }
//     function gamepad_control(object, speed = 1) { // basic control for objects using the controler
// //         console.log(gamepadAPI.axesStatus[1]*gamepadAPI.axesStatus[0]) //debugging
//         if (typeof object.body != 'undefined') {
//             if(typeof (gamepadAPI.axesStatus[1]) != 'undefined'){
//                 if(typeof (gamepadAPI.axesStatus[0]) != 'undefined'){
//                 object.body.x += (gamepadAPI.axesStatus[0] * speed)
//                 object.body.y += (gamepadAPI.axesStatus[1] * speed)
//                 }
//             }
//         } else if (typeof object != 'undefined') {
//             if(typeof (gamepadAPI.axesStatus[1]) != 'undefined'){
//                 if(typeof (gamepadAPI.axesStatus[0]) != 'undefined'){
//                 object.x += (gamepadAPI.axesStatus[0] * speed)
//                 object.y += (gamepadAPI.axesStatus[1] * speed)
//                 }
//             }
//         }
//     }
    function control(object, speed = 1) { // basic control for objects
        if (typeof object.body != 'undefined') {
            if (keysPressed['w']) {
                object.body.y -= speed
            }
            if (keysPressed['d']) {
                object.body.x += speed
            }
            if (keysPressed['s']) {
                object.body.y += speed
            }
            if (keysPressed['a']) {
                object.body.x -= speed
            }
        } else if (typeof object != 'undefined') {
            if (keysPressed['w']) {
                object.y -= speed
            }
            if (keysPressed['d']) {
                object.x += speed
            }
            if (keysPressed['s']) {
                object.y += speed
            }
            if (keysPressed['a']) {
                object.x -= speed
            }
        }
    }
    function getRandomLightColor() { // random color that will be visible on  black background
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[(Math.floor(Math.random() * 12) + 4)];
        }
        return color;
    }
    function getRandomColor() { // random color
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[(Math.floor(Math.random() * 16) + 0)];
        }
        return color;
    }
    function getRandomDarkColor() {// color that will be visible on a black background
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[(Math.floor(Math.random() * 12))];
        }
        return color;
    }
    function castBetween(from, to, granularity = 10, radius = 1) { //creates a sort of beam hitbox between two points, with a granularity (number of members over distance), with a radius defined as well
            let limit = granularity
            let shape_array = []
            for (let t = 0; t < limit; t++) {
                let circ = new Circle((from.x * (t / limit)) + (to.x * ((limit - t) / limit)), (from.y * (t / limit)) + (to.y * ((limit - t) / limit)), radius, "red")
                circ.toRatio = t/limit
                circ.fromRatio = (limit-t)/limit
                shape_array.push(circ)
            }
            return (new Shape(shape_array))
    }

    let setup_canvas = document.getElementById('canvas') //getting canvas from document

    setUp(setup_canvas) // setting up canvas refrences, starting timer. 

    // object instantiation and creation happens here 



    class Pomao {
        constructor() {
            this.touchout = 0
            this.wingcheck = 0
            this.cutscene = 0
            this.grounded = 0
            this.wingthing = 0
            this.eggmake = 0
            this.rooted = {}
            this.rootedframe = 0
            this.dry = 0
            this.tongueray = []
            this.tonguebox = new Shape(this.tongueray)
            this.pausetimer = 10
            this.paused = 10
            this.fired = 0
            this.blocked = 0
            this.bonked = 0
            this.blush = 0
            this.high = 0
            this.tripping = 0
            this.eggtimer = 10
            this.egglock = 0
            this.body = new Circle(140, 667, 32, "transparent")
            if(cheats.megamao == 1){
                this.body.radius = 64
            }
            this.tongue = new Circle(this.body.x, this.body.y, 6, "blue")
            if(cheats.megamao == 1){
                this.tongue.radius = 12
            }
            
            this.tonguex = 0
            this.tonguey = 0
            this.tonguexmom = 0
            this.tongueymom = 0
            this.runner = 0
            this.jumping = 1
            this.hng = 0
            this.dir = 1
            this.timeloop = 0
            this.timeloops = 0  //?
            this.timeloopx = 0
            this.thrown = []
            this.pounding = 0
            this.eggs = [this.body]
            this.disabled = 0
            this.hits = 9
            this.flap = 0
            this.flapstep = 0
            // this.health = new Health(this)
            this.rattled = 0

            this.positron = new Circle(this.body.x, this.body.y, 3, "gray", 1)
            this.electron = new Circle(this.body.x, this.body.y, 3, "gray", -1)
            this.positron2 = new Circle(this.body.x, this.body.y, 3, "gray", 0, 1)
            this.electron2 = new Circle(this.body.x, this.body.y, 3, "gray", 0, -1)
            this.pomarray = [
                {
                    "angle": -3.0900024820325203,
                    "length": 842.6071008397848
                },
                {
                    "angle": -3.0392171780123785,
                    "length": 711.7980972863734
                },
                {
                    "angle": -2.9864134810096097,
                    "length": 636.9785562444595
                },
                {
                    "angle": -2.9358334225802794,
                    "length": 614.3520057488349
                },
                {
                    "angle": -2.8844451529222184,
                    "length": 661.7218921853346
                },
                {
                    "angle": -2.8336751272063228,
                    "length": 993.7168833971955
                },
                {
                    "angle": -2.781301952481093,
                    "length": 1171.4495818282012
                },
                {
                    "angle": -2.731095455469834,
                    "length": 1441.9872287680628
                },
                {
                    "angle": -2.6797528311626158,
                    "length": 1631.6425505639054
                },
                {
                    "angle": -2.6271034825260573,
                    "length": 1841.0023240997107
                },
                {
                    "angle": -2.5769097656370232,
                    "length": 2002.0044637157116
                },
                {
                    "angle": -2.524802808994127,
                    "length": 2171.362869620556
                },
                {
                    "angle": -2.473706724279335,
                    "length": 2343.954666495556
                },
                {
                    "angle": -2.4200094355232338,
                    "length": 2526.117456066946
                },
                {
                    "angle": -2.36909261256157,
                    "length": 2668.253155088518
                },
                {
                    "angle": -2.31631566609945,
                    "length": 2778.2611177922226
                },
                {
                    "angle": -2.2614019791774393,
                    "length": 2936.737915082136
                },
                {
                    "angle": -2.2112901476824587,
                    "length": 3021.4888102246914
                },
                {
                    "angle": -2.160696037505721,
                    "length": 3107.1283526516636
                },
                {
                    "angle": -2.1104069021476524,
                    "length": 3245.3653981210664
                },
                {
                    "angle": -2.0602508494318093,
                    "length": 3209.3904193306807
                },
                {
                    "angle": -2.0064523875657216,
                    "length": 3041.689826641232
                },
                {
                    "angle": -1.955659478691034,
                    "length": 2910.189504919166
                },
                {
                    "angle": -1.9022140109425818,
                    "length": 2796.0286274697282
                },
                {
                    "angle": -1.8470044583786287,
                    "length": 2700.8645311929286
                },
                {
                    "angle": -1.79331531448391,
                    "length": 2627.990608844906
                },
                {
                    "angle": -1.7362238559220897,
                    "length": 2569.683492243348
                },
                {
                    "angle": -1.6823471532460736,
                    "length": 2531.368870256061
                },
                {
                    "angle": -1.618229745463697,
                    "length": 2505.6332707550027
                },
                {
                    "angle": -1.5499713958590675,
                    "length": 2501.084507908905
                },
                {
                    "angle": -1.4966669683011042,
                    "length": 2513.788389649475
                },
                {
                    "angle": -1.444887999344592,
                    "length": 2540.0549191213795
                },
                {
                    "angle": -1.3903586618258141,
                    "length": 2583.1942120195017
                },
                {
                    "angle": -1.340339972981263,
                    "length": 2637.621975956077
                },
                {
                    "angle": -1.28722802932911,
                    "length": 2712.316461799259
                },
                {
                    "angle": -1.2355562128285356,
                    "length": 2803.4395905282
                },
                {
                    "angle": -1.181284679948892,
                    "length": 2921.2431168533512
                },
                {
                    "angle": -1.1300671666688695,
                    "length": 3056.1852464224794
                },
                {
                    "angle": -1.0786317869981805,
                    "length": 3218.70028978592
                },
                {
                    "angle": -1.0271344756720624,
                    "length": 3228.1530473507155
                },
                {
                    "angle": -0.9740760045706093,
                    "length": 3132.988634953639
                },
                {
                    "angle": -0.9217978898763471,
                    "length": 3071.676886415633
                },
                {
                    "angle": -0.8657554822466478,
                    "length": 3009.26870731487
                },
                {
                    "angle": -0.8152188751019344,
                    "length": 2926.933507591617
                },
                {
                    "angle": -0.7624007527783836,
                    "length": 2849.3900081778556
                },
                {
                    "angle": -0.7086215199670778,
                    "length": 2692.846094577413
                },
                {
                    "angle": -0.6549065072027261,
                    "length": 2533.532179980364
                },
                {
                    "angle": -0.603289571976316,
                    "length": 2419.3242835105775
                },
                {
                    "angle": -0.5518998082866706,
                    "length": 2313.2561390686897
                },
                {
                    "angle": -0.5010306587602077,
                    "length": 2180.405643081758
                },
                {
                    "angle": -0.4501810182395141,
                    "length": 2063.9012632955128
                },
                {
                    "angle": -0.393223942660539,
                    "length": 1894.057948321235
                },
                {
                    "angle": -0.33879755972622005,
                    "length": 1756.8387373877922
                },
                {
                    "angle": -0.28869600296870723,
                    "length": 1668.381536392044
                },
                {
                    "angle": -0.2377141567864178,
                    "length": 1573.9203915882972
                },
                {
                    "angle": -0.18445250405077204,
                    "length": 1423.3618544031197
                },
                {
                    "angle": -0.13444414619250972,
                    "length": 1294.5140864540008
                },
                {
                    "angle": -0.0839432369934708,
                    "length": 1187.9510239721421
                },
                {
                    "angle": -0.03093684961144852,
                    "length": 1074.767495660868
                },
                {
                    "angle": 0.022023985571814616,
                    "length": 963.5506732130889
                },
                {
                    "angle": 0.07503083858795291,
                    "length": 890.34369653475
                },
                {
                    "angle": 0.12865429706753992,
                    "length": 810.3864279534318
                },
                {
                    "angle": 0.17973656145765743,
                    "length": 755.1160594393732
                },
                {
                    "angle": 0.23127406347510263,
                    "length": 706.94122585078
                },
                {
                    "angle": 0.282109425590053,
                    "length": 671.5463459445746
                },
                {
                    "angle": 0.3338382610056162,
                    "length": 635.1143539692857
                },
                {
                    "angle": 0.38778931978909664,
                    "length": 601.306914901943
                },
                {
                    "angle": 0.44025044466941005,
                    "length": 583.8736032343586
                },
                {
                    "angle": 0.4941993434605133,
                    "length": 575.8158338285284
                },
                {
                    "angle": 0.5491581447539602,
                    "length": 563.3610157729709
                },
                {
                    "angle": 0.6046067533442996,
                    "length": 554.2780565882567
                },
                {
                    "angle": 0.6562025769033171,
                    "length": 556.7619833970675
                },
                {
                    "angle": 0.7085511821153687,
                    "length": 556.7115173508646
                },
                {
                    "angle": 0.7639297288018813,
                    "length": 566.6059825589182
                },
                {
                    "angle": 0.8170516076819963,
                    "length": 576.0560390353785
                },
                {
                    "angle": 0.8708792558546752,
                    "length": 593.1579815126606
                },
                {
                    "angle": 0.9253850900369438,
                    "length": 618.207773323229
                },
                {
                    "angle": 0.9785656386631345,
                    "length": 635.6227161027491
                },
                {
                    "angle": 1.031645311377938,
                    "length": 675.6658563186647
                },
                {
                    "angle": 1.0873874355152848,
                    "length": 723.2475410915213
                },
                {
                    "angle": 1.1387523975385965,
                    "length": 762.91072909371
                },
                {
                    "angle": 1.1890435271751802,
                    "length": 799.6826050973614
                },
                {
                    "angle": 1.2409448483243457,
                    "length": 821.7677111030207
                },
                {
                    "angle": 1.2933807230491594,
                    "length": 835.0376960850554
                },
                {
                    "angle": 1.3454974980362069,
                    "length": 841.7030881048413
                },
                {
                    "angle": 1.3992788365438618,
                    "length": 917.3733254219987
                },
                {
                    "angle": 1.4506687212318976,
                    "length": 1827.7876862705598
                },
                {
                    "angle": 1.5039984926214207,
                    "length": 2004.2965968454519
                },
                {
                    "angle": 1.5556885136391267,
                    "length": 2028.7688527883292
                },
                {
                    "angle": 1.6063967944478499,
                    "length": 2088.4230398226646
                },
                {
                    "angle": 1.6584500544374525,
                    "length": 2031.9323431791418
                },
                {
                    "angle": 1.7094435084179394,
                    "length": 1791.264011037434
                },
                {
                    "angle": 1.7609272816479649,
                    "length": 1331.2000438310206
                },
                {
                    "angle": 1.8127226104517642,
                    "length": 1161.2795546806447
                },
                {
                    "angle": 1.8627704219273011,
                    "length": 1216.3950152421603
                },
                {
                    "angle": 1.913414757519883,
                    "length": 2333.5566812457546
                },
                {
                    "angle": 1.963660139081041,
                    "length": 2362.4716713573434
                },
                {
                    "angle": 2.014253081958968,
                    "length": 2274.605719452098
                },
                {
                    "angle": 2.065026221426755,
                    "length": 2088.9737368466012
                },
                {
                    "angle": 2.1164139421161234,
                    "length": 1797.9861213304102
                },
                {
                    "angle": 2.1717729019930436,
                    "length": 1514.4161449863022
                },
                {
                    "angle": 2.223224086210891,
                    "length": 1549.813527673672
                },
                {
                    "angle": 2.274319798803,
                    "length": 1573.7614479542972
                },
                {
                    "angle": 2.3254452924597784,
                    "length": 1625.7696896546583
                },
                {
                    "angle": 2.376947145839857,
                    "length": 1696.1245593978674
                },
                {
                    "angle": 2.428165777144579,
                    "length": 1733.7370209885994
                },
                {
                    "angle": 2.481553838496098,
                    "length": 1778.1765819765278
                },
                {
                    "angle": 2.5324049771051538,
                    "length": 1783.7179315710673
                },
                {
                    "angle": 2.5828162552763403,
                    "length": 1807.7397730972734
                },
                {
                    "angle": 2.6376626729809476,
                    "length": 1782.9235605481663
                },
                {
                    "angle": 2.688396767607974,
                    "length": 1726.678378630022
                },
                {
                    "angle": 2.743257458565758,
                    "length": 1657.4363720776164
                },
                {
                    "angle": 2.7940877541480247,
                    "length": 1592.794274246844
                },
                {
                    "angle": 2.8449544469718453,
                    "length": 1539.617986006895
                },
                {
                    "angle": 2.8951938875276824,
                    "length": 1476.3267997934017
                },
                {
                    "angle": 2.94757483429578,
                    "length": 1366.8568774082814
                },
                {
                    "angle": 2.9985409918048065,
                    "length": 1246.621762840834
                },
                {
                    "angle": 3.0494937955340284,
                    "length": 1123.6036556435865
                },
                {
                    "angle": 3.100608769042309,
                    "length": 1017.625220196438
                }
            ]
            this.pomarrayleft = [
                {
                    "angle": -3.127411769756162,
                    "length": 1078.2106881571235
                },
                {
                    "angle": -3.0771016485706926,
                    "length": 1137.362238745729
                },
                {
                    "angle": -3.026025692309955,
                    "length": 1236.4692576027592
                },
                {
                    "angle": -2.9754242903904986,
                    "length": 1390.5597063995083
                },
                {
                    "angle": -2.923605611542274,
                    "length": 1512.8581265616813
                },
                {
                    "angle": -2.8732902188991405,
                    "length": 1637.7391706992057
                },
                {
                    "angle": -2.8226734806080565,
                    "length": 1761.2957837963477
                },
                {
                    "angle": -2.7708868709479977,
                    "length": 1863.2112421990023
                },
                {
                    "angle": -2.7190537864313664,
                    "length": 2004.2293023061939
                },
                {
                    "angle": -2.6688362534694883,
                    "length": 2154.1270884157275
                },
                {
                    "angle": -2.6182969207826745,
                    "length": 2287.240950775158
                },
                {
                    "angle": -2.5675385296700437,
                    "length": 2440.4244592238683
                },
                {
                    "angle": -2.516987080578789,
                    "length": 2577.3083098317147
                },
                {
                    "angle": -2.466835229165751,
                    "length": 2671.640319931612
                },
                {
                    "angle": -2.415678887684283,
                    "length": 2778.954873027804
                },
                {
                    "angle": -2.3654655703689027,
                    "length": 2914.4357440520544
                },
                {
                    "angle": -2.312812617132903,
                    "length": 2940.448842909478
                },
                {
                    "angle": -2.262306403983799,
                    "length": 3011.5182513953187
                },
                {
                    "angle": -2.21168074641381,
                    "length": 3077.1848588085268
                },
                {
                    "angle": -2.1605035485316977,
                    "length": 3156.406195073214
                },
                {
                    "angle": -2.1101385928879868,
                    "length": 3230.438608694123
                },
                {
                    "angle": -2.0596951740595646,
                    "length": 3156.3784642696846
                },
                {
                    "angle": -2.008998479258629,
                    "length": 3014.160182523774
                },
                {
                    "angle": -1.9581116359601003,
                    "length": 2910.4413125038263
                },
                {
                    "angle": -1.907822248088823,
                    "length": 2814.4010550380335
                },
                {
                    "angle": -1.8572280340723162,
                    "length": 2724.0925406814204
                },
                {
                    "angle": -1.8046854953486573,
                    "length": 2661.0140480520204
                },
                {
                    "angle": -1.7522570600900247,
                    "length": 2618.7597769380664
                },
                {
                    "angle": -1.702185575801875,
                    "length": 2595.269969892688
                },
                {
                    "angle": -1.6502688764323794,
                    "length": 2606.5227611828595
                },
                {
                    "angle": -1.5979333040637673,
                    "length": 2597.257766733237
                },
                {
                    "angle": -1.547077178021175,
                    "length": 2596.806259322213
                },
                {
                    "angle": -1.4954779319774714,
                    "length": 2592.3833317042445
                },
                {
                    "angle": -1.4428715653422803,
                    "length": 2576.587096083269
                },
                {
                    "angle": -1.3922770487755614,
                    "length": 2592.056842212798
                },
                {
                    "angle": -1.3418484838705775,
                    "length": 2682.9204552555457
                },
                {
                    "angle": -1.2900902256443207,
                    "length": 2787.5166116142645
                },
                {
                    "angle": -1.2391826596302224,
                    "length": 2878.710231921694
                },
                {
                    "angle": -1.1882561308123871,
                    "length": 3008.4931312371045
                },
                {
                    "angle": -1.137647077924563,
                    "length": 3143.019115247822
                },
                {
                    "angle": -1.0871186861169617,
                    "length": 3303.775696873723
                },
                {
                    "angle": -1.0354736129359698,
                    "length": 3341.7923977852333
                },
                {
                    "angle": -0.98500579958961,
                    "length": 3194.8506556631182
                },
                {
                    "angle": -0.9344768144997845,
                    "length": 3010.9234768354945
                },
                {
                    "angle": -0.8835306545737108,
                    "length": 2942.187966518468
                },
                {
                    "angle": -0.8326929557933133,
                    "length": 2869.0562328100787
                },
                {
                    "angle": -0.7806171545948313,
                    "length": 2715.5039824939013
                },
                {
                    "angle": -0.7290408995220169,
                    "length": 2523.4058318818134
                },
                {
                    "angle": -0.678893382358401,
                    "length": 2373.5357673991384
                },
                {
                    "angle": -0.6275005156285277,
                    "length": 2207.333249735879
                },
                {
                    "angle": -0.5761336665583278,
                    "length": 2086.4210784077877
                },
                {
                    "angle": -0.5259071524748967,
                    "length": 1961.487106382905
                },
                {
                    "angle": -0.4756503922103153,
                    "length": 1816.173159093887
                },
                {
                    "angle": -0.4237145655085014,
                    "length": 1520.767570226235
                },
                {
                    "angle": -0.37367143586804413,
                    "length": 1259.4550411224482
                },
                {
                    "angle": -0.3228855600430013,
                    "length": 1080.5778367042803
                },
                {
                    "angle": -0.27274562968208443,
                    "length": 790.2736423838796
                },
                {
                    "angle": -0.2223266367011554,
                    "length": 626.0660562157864
                },
                {
                    "angle": -0.16678195444069532,
                    "length": 602.081382322358
                },
                {
                    "angle": -0.11463031287666091,
                    "length": 629.0569596934365
                },
                {
                    "angle": -0.06393412603678986,
                    "length": 742.2322680235375
                },
                {
                    "angle": -0.012316321942961833,
                    "length": 866.3297502994683
                },
                {
                    "angle": 0.037998607719853694,
                    "length": 989.9905408323539
                },
                {
                    "angle": 0.08961308750587366,
                    "length": 1119.049391626162
                },
                {
                    "angle": 0.14003339012531266,
                    "length": 1261.3028378702002
                },
                {
                    "angle": 0.19230789361857067,
                    "length": 1354.3175487744884
                },
                {
                    "angle": 0.2426860313199931,
                    "length": 1477.1166109669866
                },
                {
                    "angle": 0.29413406725269176,
                    "length": 1561.757445623938
                },
                {
                    "angle": 0.3461167379944047,
                    "length": 1635.2928684855142
                },
                {
                    "angle": 0.39686473189681215,
                    "length": 1710.2917607021518
                },
                {
                    "angle": 0.4489510974719858,
                    "length": 1762.7953168845852
                },
                {
                    "angle": 0.4997050871048781,
                    "length": 1816.0090387452074
                },
                {
                    "angle": 0.5502655464261379,
                    "length": 1847.9508946466522
                },
                {
                    "angle": 0.6018256113592149,
                    "length": 1846.175576635651
                },
                {
                    "angle": 0.6530985904099822,
                    "length": 1838.9436341953697
                },
                {
                    "angle": 0.7052430300619456,
                    "length": 1787.5393160725507
                },
                {
                    "angle": 0.755838722802763,
                    "length": 1731.150548986232
                },
                {
                    "angle": 0.8067134610556763,
                    "length": 1674.9303730190295
                },
                {
                    "angle": 0.8585169800022312,
                    "length": 1614.154766007705
                },
                {
                    "angle": 0.9098218547361074,
                    "length": 1592.1713387132186
                },
                {
                    "angle": 0.9610343863595476,
                    "length": 1656.606947503169
                },
                {
                    "angle": 1.0112517273086032,
                    "length": 1775.2894670951791
                },
                {
                    "angle": 1.0618212063041776,
                    "length": 1989.0179855609458
                },
                {
                    "angle": 1.1156849594624938,
                    "length": 2177.1928731322405
                },
                {
                    "angle": 1.1663399723699939,
                    "length": 2287.4840961790323
                },
                {
                    "angle": 1.2171561963039412,
                    "length": 2336.2514293289423
                },
                {
                    "angle": 1.269015616272444,
                    "length": 2283.0395341634867
                },
                {
                    "angle": 1.3191350047433268,
                    "length": 1984.21725959779
                },
                {
                    "angle": 1.3697494104368375,
                    "length": 1602.3777513981331
                },
                {
                    "angle": 1.4203838141409748,
                    "length": 1625.0718342650362
                },
                {
                    "angle": 1.4705347134049662,
                    "length": 1759.384577236211
                },
                {
                    "angle": 1.5214125243908168,
                    "length": 1870.866188548811
                },
                {
                    "angle": 1.5719649782657066,
                    "length": 1888.7193907047185
                },
                {
                    "angle": 1.6220326109467527,
                    "length": 1879.5488488102128
                },
                {
                    "angle": 1.6729343817691562,
                    "length": 1787.640785990996
                },
                {
                    "angle": 1.7239336401201633,
                    "length": 1673.7574330568896
                },
                {
                    "angle": 1.7748055420949795,
                    "length": 1262.9886059475248
                },
                {
                    "angle": 1.825907036654489,
                    "length": 1022.7421966195834
                },
                {
                    "angle": 1.8775152777933413,
                    "length": 876.2208143568714
                },
                {
                    "angle": 1.9307537790615477,
                    "length": 760.9355929017183
                },
                {
                    "angle": 1.9810647146032265,
                    "length": 705.4544661141117
                },
                {
                    "angle": 2.031527997422867,
                    "length": 675.8722517276765
                },
                {
                    "angle": 2.0822937216484987,
                    "length": 660.7327858901699
                },
                {
                    "angle": 2.137146431081851,
                    "length": 654.3281609202386
                },
                {
                    "angle": 2.189216866334204,
                    "length": 641.1418626928935
                },
                {
                    "angle": 2.23928039844635,
                    "length": 621.0045892382623
                },
                {
                    "angle": 2.298285787312431,
                    "length": 589.6307377934572
                },
                {
                    "angle": 2.3487216987116533,
                    "length": 577.2089324999251
                },
                {
                    "angle": 2.4024167760178923,
                    "length": 569.482211899769
                },
                {
                    "angle": 2.455083479386079,
                    "length": 564.1930066061323
                },
                {
                    "angle": 2.5051476974914655,
                    "length": 565.628050510888
                },
                {
                    "angle": 2.5559545982763705,
                    "length": 572.1457435513148
                },
                {
                    "angle": 2.6060134755709217,
                    "length": 585.3972298885346
                },
                {
                    "angle": 2.6574292201604655,
                    "length": 591.4749930525431
                },
                {
                    "angle": 2.70937294873381,
                    "length": 596.2067954922677
                },
                {
                    "angle": 2.761785973825037,
                    "length": 609.0131305575487
                },
                {
                    "angle": 2.81425298063536,
                    "length": 639.1954037929536
                },
                {
                    "angle": 2.864409950846538,
                    "length": 678.0836799335666
                },
                {
                    "angle": 2.915929902352013,
                    "length": 699.534228346427
                },
                {
                    "angle": 2.968969251151705,
                    "length": 745.4786960005877
                },
                {
                    "angle": 3.0204698923751563,
                    "length": 816.3948018170195
                },
                {
                    "angle": 3.0711543030881443,
                    "length": 886.9942358779954
                },
                {
                    "angle": 3.121601802791772,
                    "length": 997.231482725183
                }
            ]


            for (let t = 0; t < 10; t++) {
                let pomarray2 = []
                for (let t = 0; t < this.pomarray.length - 1; t++) {
                    let obj = {}
                    obj.angle = (this.pomarray[t].angle + this.pomarray[t + 1].angle) * .5
                    obj.length = (this.pomarray[t].length + this.pomarray[t + 1].length) * .5
                    pomarray2.push(this.pomarray[t])
                    pomarray2.push(obj)
                }
                this.pomarray = [...pomarray2]
            }

            for (let t = 0; t < 10; t++) {
                let pomarray2 = []
                for (let t = 0; t < this.pomarrayleft.length - 1; t++) {
                    let obj = {}
                    obj.angle = (this.pomarrayleft[t].angle + this.pomarrayleft[t + 1].angle) * .5
                    obj.length = (this.pomarrayleft[t].length + this.pomarrayleft[t + 1].length) * .5
                    pomarray2.push(this.pomarrayleft[t])
                    pomarray2.push(obj)
                }
                this.pomarrayleft = [...pomarray2]
            }



            this.angleincrement = (Math.PI * 2) / this.pomarray.length
            this.angleincrementleft = (Math.PI * 2) / this.pomarrayleft.length


            let zero = Math.PI
            this.angleincrement = (Math.PI * 2) / this.pomarray.length


            for (let t = 0; t < this.pomarray.length; t++) {
                this.pomarray[t].angle = zero
                this.pomarray[t].length = Math.sqrt(this.pomarray[t].length)
                zero += this.angleincrement
            }

            zero = Math.PI
            this.angleincrementleft = (Math.PI * 2) / this.pomarrayleft.length


            for (let t = 0; t < this.pomarrayleft.length; t++) {
                this.pomarrayleft[t].angle = zero
                this.pomarrayleft[t].length = Math.sqrt(this.pomarrayleft[t].length)
                zero += this.angleincrementleft
            }

            this.angleincrement = 1 / this.angleincrement
            this.angleincrementleft = 1 / this.angleincrementleft


        }
        checkInsidePomao(point) {
            let link = new LineOP(this.body, point) // line between objects
            let angle = link.angle() + Math.PI // angle adjusted
            let dis = link.hypotenuse()  // get distance (could be a square check, rather than a function distance)
            if (this.dir == 1) {
                let t = Math.floor((angle) * this.angleincrement) // calculate the index of the angle 
                t %= this.pomarray.length - 1 // get the index without a loop
                if (dis < ((this.pomarray[t].length + this.pomarray[t + 1].length) * .5) * ((this.body.radius) * .02)) { // normalized to character size
                    return true // collision
                }
            } else { // same as above but for the other direction (this.dir = -1)
                let t = Math.floor((angle) * this.angleincrementleft)
                t %= this.pomarrayleft.length - 1
                if (dis < ((this.pomarrayleft[t].length + this.pomarrayleft[t + 1].length) * .5) * ((this.body.radius) * .02)) {
                    return true
                }
            }
            return false
        }
        checkRepelPomao(point) {
            let link = new LineOP(this.body, point) // line between objects
            let angle = link.angle() + Math.PI // angle adjusted
            let dis = link.hypotenuse() - point.radius // get distance (could be a square check, rather than a function distance)
            if (this.dir == 1) {
                let t = Math.floor((angle) * this.angleincrement) // calculate the index of the angle 
                t %= this.pomarray.length - 1 // get the index without a loop
                if (dis < ((this.pomarray[t].length + this.pomarray[t + 1].length) * .5) * ((this.body.radius) * .02)) { // normalized to character size
                    return  ((this.pomarrayleft[t].length + this.pomarrayleft[t + 1].length) * .5) * ((this.body.radius) * .02) // collision
                }
            } else { // same as above but for the other direction (this.dir = -1)
                let t = Math.floor((angle) * this.angleincrementleft)
                t %= this.pomarrayleft.length - 1
                if (dis < ((this.pomarrayleft[t].length + this.pomarrayleft[t + 1].length) * .5) * ((this.body.radius) * .02)) {
                    return  ((this.pomarrayleft[t].length + this.pomarrayleft[t + 1].length) * .5) * ((this.body.radius) * .02)
                }
            }
            return false
        }
        tonguecast() {

            this.tongueray = []
            if (!this.body.doesPerimeterTouch(this.tongue)) {
                for (let t = 0; t < 30; t++) {
                    const ray = new Circle(this.body.x + (this.tonguex - (this.tonguex * .033333 * t)), (-(Math.sin(this.timeloop) * 1.5)) + this.body.y + (this.tonguey - (this.tonguey * .033333 * t)), 1.5, "red")
                    if (keysPressed['q']) {
                        ray.draw()
                    }
                    this.tongueray.push(ray)
                }

            }

            this.tonguebox = new Shape(this.tongueray)
        }
        tongueFix() {

        }
        gravity() {

            this.flapstep++
            if (this.flapstep % 3 == 0) {

                this.flap++
                this.flap %= 3
            }

            if (this.tripping > 0) {

                for (let t = 0; t < 3; t++) {

                    this.positron.xmom -= (this.positron.x - this.electron.x) / 1000
                    this.electron.xmom += (this.positron.x - this.electron.x) / 1000
                    this.positron.ymom -= (this.positron.y - this.electron.y) / 1000
                    this.electron.ymom += (this.positron.y - this.electron.y) / 1000

                    this.positron.xmom -= (this.positron.x - this.body.x) / 1000
                    this.electron.xmom -= (this.electron.x - this.body.x) / 1000
                    this.positron.ymom -= (this.positron.y - this.body.y) / 1000
                    this.electron.ymom -= (this.electron.y - this.body.y) / 1000
                    this.electron.color = getRandomLightColortp()
                    this.positron.color = getRandomLightColortp()
                    this.electron.move()
                    this.electron.draw()
                    this.positron.move()
                    this.positron.draw()
                }

                for (let t = 0; t < 3; t++) {

                    this.positron2.xmom -= (this.positron2.x - this.electron2.x) / 1000
                    this.electron2.xmom += (this.positron2.x - this.electron2.x) / 1000
                    this.positron2.ymom -= (this.positron2.y - this.electron2.y) / 1000
                    this.electron2.ymom += (this.positron2.y - this.electron2.y) / 1000

                    this.positron2.xmom -= (this.positron2.x - this.body.x) / 1000
                    this.electron2.xmom -= (this.electron2.x - this.body.x) / 1000
                    this.positron2.ymom -= (this.positron2.y - this.body.y) / 1000
                    this.electron2.ymom -= (this.electron2.y - this.body.y) / 1000

                    this.electron2.color = getRandomLightColortp()
                    this.positron2.color = getRandomLightColortp()
                    this.electron2.move()
                    this.electron2.draw()
                    this.positron2.move()
                    this.positron2.draw()
                }


            }
            // ////////console.log(this.electron, this.positron)


            this.wet = 0

            if(!keysPressed['s']){
            // for(let t = 0;t<floors.length;t++){
            //     if(floors[t].doesPerimeterTouch(this.tongue)){
            //         this.touchout = 1
            //     }
            //     for(let k = 0;k<this.tonguebox.shapes.length;k++){
            //         if(floors[t].doesPerimeterTouch(this.tonguebox.shapes[k])){
            //             this.touchout = 1
            //         }
            //     }
            //     if(this.body.x+33 > floors[t].x){
            //         if(this.body.x-33 < floors[t].x + floors[t].width){
            //             if(this.body.y+33 >= floors[t].y){
            //                 if(this.body.y+33 <= floors[t].y+floors[t].height){
            //                     canvas_context.translate(0, (this.body.y -( floors[t].y-33)))
            //                     this.body.y = floors[t].y-33
            //                      this.wet = 1
            //                 }
            //             }
            //         }
            //     }
            // }

        }

            if(this.wet == 1){
                // this.body.y = 680
                if(!keysPressed['s']){

                    this.body.ymom = 0
                    this.body.symom = 0
                    this.body.sxmom = 0
                    this.grounded = 1
                    this.wet = 0
                }
            }

            if (this.grounded == 1) {
                if (this.body.ymom > 0) {
                    // if (!keysPressed['s'] || (gamepadAPI.axesStatus[1] > .5)) {
                    //     if (this.body.ymom > 0) {
                    //         this.body.ymomstorage = this.body.ymom + this.body.symom
                    //     }
                    //     this.body.ymom = 0
                    // } else {
                    //     // this.body.ymom += 11.1  //literally what is this
                    // }
                }
                if (this.jumping == 0) {
                    this.timeloopx = 0
                }
                if (this.pounding > 0) {
                    this.pounding--
                }
                this.jumping = 0
                this.hng = 0

            } else if (this.grounded == 2) {
                this.runner = 0
                if (this.body.ymom > 0) {
                    // if (!keysPressed['s'] || (gamepadAPI.axesStatus[1] > .5)) {
                    //     if (this.body.ymom > 0) {
                    //         this.body.ymomstorage = this.body.ymom + this.body.symom
                    //     }
                    //     this.body.ymom = 0
                    // } else {
                    //     this.body.ymom += 11.1
                    // }
                } // this will never trigger
                this.jumping = 2
                // this.body.ymom += .1
                if (this.rootedframe <= 0) {
                    this.rooted = {}
                }
                this.rootedframe--
                this.grounded = 0
            } else {
                // if(this.jumping == 0){
                this.jumping = 1
                // }
                // this.body.ymom += .1
                if (this.rootedframe <= 0) {
                    this.rooted = {}
                }
                this.rootedframe--

            }
            this.grounded = 0

            if (this.touchout == 1 ) {
                this.touchout = 0
                    if (this.tongueymom < 0) {
                        if (Math.abs(this.tonguey) > 1) {
                            this.body.symom += this.tongueymom * 1.1
                        }
                        if (Math.abs(this.tonguex) > 15) {
                            if (this.dir == -1) {
                                this.body.sxmom -= Math.abs(this.tonguexmom * 3)
                            } else {
                                this.body.sxmom += Math.abs(this.tonguexmom * 3)
                            }
                        }
                    } else {
                        if (Math.abs(this.tonguey) > 1) {
                            this.body.symom -= this.tongueymom * 1.1
                        }
                        if (Math.abs(this.tonguex) > 15) {
                            if (this.dir == -1) {
                                this.body.sxmom -= Math.abs(this.tonguexmom * 3)
                            } else {
                                this.body.sxmom += Math.abs(this.tonguexmom * 3)
                            }
                        }
                    }
                    if (this.body.ymom > 0) {
                        this.body.ymomstorage = this.body.ymom + this.body.symom
                    }
                    this.body.ymom = 0
                    this.body.xmom *= .975
                    this.grounded = 2  


                    // while(this.tongue.y > 680){
                    //     // this.body.smove()
                    //     // this.tongue.y+=this.body.symom
                    //     this.tongue.y-=.001
                    //     this.body.y-=.001
                    // }
            }

            // }
            if (this.wingcheck == 1) {
                if (this.tongueymom < 0) {
                    if (Math.abs(this.tonguey) > 1) {
                        this.body.symom += this.tongueymom * 1.1
                    }
                    if (Math.abs(this.tonguex) > 15) {
                        if (this.dir == -1) {
                            this.body.sxmom -= Math.abs(this.tonguexmom * 3)
                        } else {
                            this.body.sxmom += Math.abs(this.tonguexmom * 3)
                        }
                    }
                    this.tongueymom *= .49
                    this.tonguexmom *= .49
                } else {
                    if (Math.abs(this.tonguey) > 1) {
                        this.body.symom -= this.tongueymom * 1.1
                    }
                    if (Math.abs(this.tonguex) > 15) {
                        if (this.dir == -1) {
                            this.body.sxmom -= Math.abs(this.tonguexmom * 3)
                        } else {
                            this.body.sxmom += Math.abs(this.tonguexmom * 3)
                        }
                    }
                    this.tongueymom *= .49
                    this.tonguexmom *= .49

                }
            }
            this.footspot = new Circle(this.body.x, this.body.y + (this.body.radius - .01), 3, "red")
    

            for (let t = 1; t < this.eggs.length; t++) {
                if (this.eggs[t].marked == 0) {
                    this.eggs[t].steery()
                }
            }

            // if (keysPressed['s'] || (gamepadAPI.axesStatus[1] > .5)) {
            // } else {
            //     this.tongueFix()
            // }
            this.wingcheck = 0

        }
        draw() {
            if(cheats.ruthless == 1){
                this.eggs.push(this.body)
            }
            this.eggmake--
            if (this.eggmake > 0) {
                if (this.eggmake % 10 == 0) {
                    if (this.eggs.length < 16) {
                        const seepx = new Seed(this.eggs[this.eggs.length - 1])
                        this.eggs.push(seepx)
                    }
                }
            }
            this.high--
            this.tripping--
            if (this.body.ymom + this.body.symom < 0) {
                this.pounding = 0
            }
            if (this.rattled > 0) {
                this.rattled--
            } else if (this.rattled < 0) {
                this.rattled++
            }
            if (Math.abs(this.rattled < 3)) {
                this.rattled = 0
            }
            this.blush--
            this.timeloop += .05
            this.timeloops += .01
            this.bodyxtight = new Circle(this.body.x, this.body.y, 9, "red")
            this.bodytight = new Circle(this.body.x, this.body.y, 21, "yellow")
            this.bodyloose = new Circle(this.body.x, this.body.y, 25, "yellow")

            this.blocked = 0
            this.bonked = 0
            if (this.rattled == 50) {
                this.rattled += 40.5
            }
            if (this.rattled == 50.5) {
                this.rattled += 35.51
            }
            if (this.cutscene <= 0) {
                // this.control()
            }
            
            if(cheats.warpspeed == 1){
                for(let t = 0;t<3;t++){
                // this.control()
                }
            }
            if (this.blocked == 0) {

                this.body.move()
                this.body.smove()
            } else {
                this.body.ymove()
            }
            this.gravity()
            this.tonguex += this.tonguexmom
            this.tonguey += this.tongueymom
            this.tonguex -= this.body.sxmom * .05
            this.tonguey -= this.body.symom * .05


            if (this.tongue.x > this.body.x) {
                this.tonguexmom -= .5
            }
            if (this.tongue.x < this.body.x) {
                this.tonguexmom += .5
            }
            if(cheats.megamao == 1){
            if (this.tongue.x > this.body.x) {
                this.tonguexmom -= .5
            }
            if (this.tongue.x < this.body.x) {
                this.tonguexmom += .5
            }

            if (this.tongue.y > this.body.y && ((!keysPressed['l'] && !keysPressed['j']) || this.tongue.y > this.body.y + 5)) {
                this.tongueymom -= .5
            }
            if (this.tongue.y < this.body.y && ((!keysPressed['l'] && !keysPressed['j']) || this.tongue.y < this.body.y - 5)) {
                this.tongueymom += .5
            }
            }
            if (this.tongue.y > this.body.y && ((!keysPressed['l'] && !keysPressed['j']) || this.tongue.y > this.body.y + 5)) {
                this.tongueymom -= .5
            }
            if (this.tongue.y < this.body.y && ((!keysPressed['l'] && !keysPressed['j']) || this.tongue.y < this.body.y - 5)) {
                this.tongueymom += .5
            }
            this.fired--
            if (this.bodytight.isPointInside(this.tongue)) {
                if (this.fired <= 0) {
                    this.tonguexmom *= 0
                    this.tongueymom *= 0
                    this.tonguex *= .9
                    this.tonguey *= .9
                }
            } else {
                this.tonguexmom *= .91
                this.tongueymom *= .91
            }
            this.tongue = new Circle(this.body.x + this.tonguex, this.body.y + this.tonguey, 5, "blue")
            this.tongued1 = new Circle(this.body.x + this.tonguex + (this.rattled / 3), this.body.y + this.tonguey, 5, "#0000FF77")
            this.tongued2 = new Circle(this.body.x + this.tonguex - (this.rattled / 3), this.body.y + this.tonguey, 5, "#0000FF77")
            this.tonguecast()

            if (this.tongue.y > this.body.y - 14) {
                this.diry = -1
            } else {
                this.diry = 0
            }



            if (this.tongue.x > this.body.x + 14) {
                this.dir = 1
            }
            if (this.tongue.x < this.body.x - 14) {
                this.dir = -1
            }

            this.height = 64 + (Math.sin(this.timeloop) * (3 + this.pounding))
            this.width = 64 + (Math.sin(this.timeloopx) * 1)
            if (this.jumping == 1) {
                if (this.body.ymom < 0) {
                    this.height = 68 + this.pounding + Math.round((Math.min(Math.abs(this.body.ymom), 15) + Math.abs(Math.min(this.hng, .217)) + Math.abs(this.body.symom)) * 1.9)
                } else {
                    this.height = 68 + this.pounding
                }
            }
            if (this.jumping == 1) {
                if (this.body.ymom < 0) {
                    this.width = 60 - (this.pounding + ((Math.min(Math.abs(this.body.ymom), 15) + Math.abs(Math.min(this.hng, .217)) + Math.abs(this.body.symom)) * 1.5))
                } else {
                    this.width = 60 - this.pounding
                }
                // this.width  = 60-this.pounding
            }


            if(cheats.megamao == 1){
                this.height = 128 + (Math.sin(this.timeloop) * (6 + this.pounding))
                this.width = 128 + (Math.sin(this.timeloopx) * 1)

            if (this.jumping == 1) {
                if (this.body.ymom < 0) {
                    this.height = 136 + this.pounding + Math.round((Math.min(Math.abs(this.body.ymom), 15)  + Math.abs(Math.min(this.hng, .217)) + Math.abs(this.body.symom)) * 1.9)
                } else {
                    this.height = 136 + this.pounding
                }
            }
            if (this.jumping == 1) {
                if (this.body.ymom < 0) {
                    this.width = 120 - (this.pounding + ((Math.min(Math.abs(this.body.ymom), 15) + Math.abs(Math.min(this.hng, .217)) + Math.abs(this.body.symom)) * 1.5))
                } else {
                    this.width = 120 - this.pounding
                }
            }
            }

            if (Math.abs(this.rattled < 3)) {
                this.rattled = 0
            }

            //canvas_context.clearRect(-1000000,680,canvas.width*1000000, canvas.height)
            for (let t = 0; t < this.eggs.length; t++) {
                this.eggs[t].draw()
            }

            for (let t = 0; t < this.thrown.length; t++) {
                this.thrown[t].draw()
            }



            this.tongue.draw()

            this.link = new Line(this.body.x, 3 + this.body.y - (Math.sin(this.timeloop) * 1), this.tongue.x, this.tongue.y, "blue", 3) // radius 3 // this.tongue.radius*1.1

            this.link.draw()

            // console.log(this.link)


            if (!keysPressed['q']) {

                if (this.diry == -1) {
                    hot--
                    for (let t = 0; t < this.thrown.length; t++) {
                        if (this.body.doesPerimeterTouch(this.thrown[t]) && this.thrown[t].timer < 5) {
                            hot = 20
                            this.thrown[t].timer = 6
                        }
                    }
                    if (this.tonguex > 14 && this.tonguey > 25) {
                        if (this.blush <= 1) {
                            canvas_context.drawImage(pomaodownpaint, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height)
                        } else {
                            canvas_context.drawImage(pomaodownpaintb, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height)
                        }
                    } else if (this.tonguex < -14 && this.tonguey > 25) {
                        if (this.blush <= 1) {
                            canvas_context.drawImage(pomaodownpaintl, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height)
                        } else {
                            canvas_context.drawImage(pomaodownpaintlb, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height)
                        }
                    } else if (hot <= 0) {

                        if (this.blush <= 1) {

                            if (this.disabled == 0) {
                                if (this.dir == 1) {
                                    // if (this.hng != 0 && this.pounding < 10 && (keysPressed['w'] || gamepadAPI.axesStatus[1] < -.5 || gamepadAPI.buttonsStatus.includes('A'))) {
                                    //     canvas_context.drawImage(pomaof, (pomaof.width / 3 * this.flap), 0, pomaof.width / 3, pomaof.height, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height)
                                    // } else {
                                        canvas_context.drawImage(pomaoimg, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height + (Math.sin(this.timeloop) * 1.5))
                                    // }
                                } else {
                                    // if (this.hng != 0 && this.pounding < 10 && (keysPressed['w'] || gamepadAPI.axesStatus[1] < -.5 || gamepadAPI.buttonsStatus.includes('A'))) {
                                    //     canvas_context.drawImage(pomaofl, (pomaofl.width / 3 * this.flap), 0, pomaofl.width / 3, pomaofl.height, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height)
                                    // } else {
                                    //     canvas_context.drawImage(pomaoimgl, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height)
                                    // }
                                }
                            } else {
                                if (this.dir == 1) {
                                    // if (this.hng != 0 && this.pounding < 10 && (keysPressed['w'] || gamepadAPI.axesStatus[1] < -.5 || gamepadAPI.buttonsStatus.includes('A'))) {
                                    //     canvas_context.drawImage(pomaofh, (pomaofh.width / 3 * this.flap), 0, pomaofh.width / 3, pomaofh.height, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height)
                                    // } else {
                                    //     canvas_context.drawImage(pomaoimgh, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height)
                                    // }
                                } else {
                                    // if (this.hng != 0 && this.pounding < 10 && (keysPressed['w'] || gamepadAPI.axesStatus[1] < -.5 || gamepadAPI.buttonsStatus.includes('A'))) {
                                    //     canvas_context.drawImage(pomaoflh, (pomaoflh.width / 3 * this.flap), 0, pomaoflh.width / 3, pomaoflh.height, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height)
                                    // } else {
                                    //     canvas_context.drawImage(pomaoimglh, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height)
                                    // }
                                }
                            }
                        } else {
                            if (this.disabled == 0) {
                                if (this.dir == 1) {
                                    // if (this.hng != 0 && this.pounding < 10 && (keysPressed['w'] || gamepadAPI.axesStatus[1] < -.5 || gamepadAPI.buttonsStatus.includes('A'))) {
                                    //     canvas_context.drawImage(pomaofb, (pomaofb.width / 3 * this.flap), 0, pomaofb.width / 3, pomaofb.height, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height)
                                    // } else {
                                    //     canvas_context.drawImage(pomaoimgb, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height)
                                    // }
                                } else {
                                    // if (this.hng != 0 && this.pounding < 10 && (keysPressed['w'] || gamepadAPI.axesStatus[1] < -.5 || gamepadAPI.buttonsStatus.includes('A'))) {
                                    //     canvas_context.drawImage(pomaoflb, (pomaoflb.width / 3 * this.flap), 0, pomaoflb.width / 3, pomaoflb.height, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height)
                                    // } else {
                                    //     canvas_context.drawImage(pomaoimgbl, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height)
                                    // }
                                }
                            } else {

                                if (this.dir == 1) {
                                    // if (this.hng != 0 && this.pounding < 10 && (keysPressed['w'] || gamepadAPI.axesStatus[1] < -.5 || gamepadAPI.buttonsStatus.includes('A'))) {
                                    //     canvas_context.drawImage(pomaofbh, (pomaofbh.width / 3 * this.flap), 0, pomaofbh.width / 3, pomaofbh.height, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height)
                                    // } else {
                                    //     canvas_context.drawImage(pomaoimglhb, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height)
                                    // }
                                } else {
                                    // if (this.hng != 0 && this.pounding < 10 && (keysPressed['w'] || gamepadAPI.axesStatus[1] < -.5 || gamepadAPI.buttonsStatus.includes('A'))) {
                                    //     canvas_context.drawImage(pomaoflbh, (pomaoflbh.width / 3 * this.flap), 0, pomaoflbh.width / 3, pomaoflbh.height, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height)
                                    // } else {
                                    //     canvas_context.drawImage(pomaoimghb, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height)
                                    // }
                                }
                            }
                        }
                    } else {

                        if (this.blush <= 1) {
                            if (this.dir == 1) {

                                if (this.hng !== 0) {
                                    canvas_context.drawImage(pomaospitf, (pomaospitf.width / 3 * this.flap), 0, pomaospitf.width / 3, pomaospitf.height, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height)

                                } else {

                                    canvas_context.drawImage(pomaospit, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height)
                                }
                            } else {

                                if (this.hng !== 0) {
                                    canvas_context.drawImage(pomaospitfl, (pomaospitfl.width / 3 * this.flap), 0, pomaospitfl.width / 3, pomaospitfl.height, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height)
                                } else {
                                    canvas_context.drawImage(pomaospitl, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height)

                                }
                            }
                        } else {
                            if (this.dir == 1) {

                                if (this.hng !== 0) {
                                    canvas_context.drawImage(pomaospitfb, (pomaospitfb.width / 3 * this.flap), 0, pomaospitfb.width / 3, pomaospitfb.height, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height)

                                } else {

                                    canvas_context.drawImage(pomaospitb, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height)
                                }
                            } else {

                                if (this.hng !== 0) {
                                    canvas_context.drawImage(pomaospitflb, (pomaospitflb.width / 3 * this.flap), 0, pomaospitflb.width / 3, pomaospitflb.height, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height)
                                } else {
                                    canvas_context.drawImage(pomaospitlb, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height)

                                }
                            }

                        }
                    }
                } else {
                    if (this.blush <= 1) {

                        if (this.dir == 1) {
                            canvas_context.drawImage(pomaoimgup, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height)
                        } else {
                            canvas_context.drawImage(pomaoimglup, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height)
                        }

                    } else {

                        if (this.dir == 1) {
                            canvas_context.drawImage(pomaoimgupb, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height)
                        } else {
                            canvas_context.drawImage(pomaoimglupb, this.body.x - (this.width / 2), this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5), this.width, this.height)
                        }
                    }
                }

                // canvas_context.drawImage(dealwithit, (this.body.x - (this.width / 2))+10, (this.body.y - (this.height / 2) - (Math.sin(this.timeloop) * 1.5))-20, this.width, this.height)


                this.body.color = "transparent"

            } else {
                // this.body = new Circle(this.body.x, this.body.y, this.body.radius, "black")

                // this.body.color = "black"
                // this.body.draw()
                // this.body = new Circle(this.body.x, this.body.y, this.body.radius, "black")
            }


//             for (let t = 0; t < worms.length; t++) {
//                 if (worms[t].boss == 1) {
//                     // if (this.y < -9170) {
//                     //     // 
//                     if(worms[t].gcdodge == 0){
// worms[t].draw()
// } // maybe remove this?
//                     // }
//                 } else {
//                     if (worms[t].body.x > this.body.x - (canvas.width / .66) && worms[t].body.x < this.body.x + (canvas.width / .66)) {
//                         if (worms[t].body.y > this.body.y - (canvas.height / .7) && worms[t].body.y < this.body.y + (canvas.height / .016)) {
//                             if (worms[t].layer == 1) {
//                                 if(worms[t].gcdodge == 0){
// worms[t].draw()
// }
//                             }
//                         }
//                     }
//                 }
//             }

            // this.diry = 1
            // this.body.draw()
            // this.footspot.draw()
            this.body.xmom *= .96
            if (Math.abs(this.body.xmom) < .5) {
                this.body.xmom = 0
                this.disabled = 0
            }
            // this.health.draw()
        }


    }

    let hot = 0
    let cheats = {}
    let pomao = new Pomao()
    let starttime = Date.now()


let numimgs = []
for(let t = 0;t<60;t++){
    let img = new Image()
    img.src = `a${t}.png`
    numimgs.push(img)
}
    
    class NumSqr{
        constructor(x,y, img){
            this.body = new Rectangle(x,y, 70, 70, "#FFFFFF")
            // numimgs[this.num] = numimgs[img]
            this.num = img
        }
        draw(){

            // if(keysPressed['k']){
            //     this.num++
                if(this.num > 59){
                    this.num = 59
                }
            // }
            // console.log(this.num)
            this.body.draw()
            canvas_context.drawImage(numimgs[this.num], 0,0, numimgs[this.num].width, numimgs[this.num].height, this.body.x, this.body.y, this.body.width, this.body.height)
        }
    }

    function main() {
        canvas_context.clearRect(0, 0, canvas.width, canvas.height)  // refreshes the image
        // gamepadAPI.update() //checks for button presses/stick movement on the connected controller)
        // // game code goes here
        
        let time = Date.now() //+ (60000)*24.8
        pomao.draw()
        if(Math.floor(30-(Math.abs(time-starttime)/60000)) < 0){
            starttime = Date.now()
        }
        // if(time-starttime < (60*1000*150)){
            if(time-starttime < (60*1000*25)){
                canvas_context.fillStyle = "#FFAAAA";

            canvas_context.beginPath();
            canvas_context.moveTo(75+150,25+550);
            canvas_context.quadraticCurveTo(25+150,25+550,25+150,62.5+550);
            canvas_context.quadraticCurveTo(25+150,100+550,50+150,100+550);
            canvas_context.quadraticCurveTo(50+150,120+550,30+150,125+550);
            canvas_context.quadraticCurveTo(60+150,120+550,65+150,100+550);
            canvas_context.quadraticCurveTo(125+150,100+550,125+150,62.5+550);
            canvas_context.quadraticCurveTo(125+150,25+550,75+150,25+550);
            canvas_context.lineWidth = "3";
            canvas_context.strokeStyle = "black";
            canvas_context.stroke();
            canvas_context.fill();
                let min = Math.floor(25-(Math.abs(time-starttime)/60000))%60
                let sec = Math.floor(60-((Math.abs(time-starttime)%60000)/1000))%60
                canvas_context.drawImage(numimgs[Math.max(min,0)],0,0,numimgs[Math.max(min,0)].width, numimgs[min].height, 175,585, 50,50 )
                canvas_context.drawImage(numimgs[Math.max(sec,0)],0,0,numimgs[Math.max(sec,0)].width, numimgs[sec].height, 215,585, 50,50 )
            }else{
                canvas_context.fillStyle = "#AAFFAA";
                canvas_context.beginPath();
                canvas_context.moveTo(75+150,25+550);
                canvas_context.quadraticCurveTo(25+150,25+550,25+150,62.5+550);
                canvas_context.quadraticCurveTo(25+150,100+550,50+150,100+550);
                canvas_context.quadraticCurveTo(50+150,120+550,30+150,125+550);
                canvas_context.quadraticCurveTo(60+150,120+550,65+150,100+550);
                canvas_context.quadraticCurveTo(125+150,100+550,125+150,62.5+550);
                canvas_context.quadraticCurveTo(125+150,25+550,75+150,25+550);
                canvas_context.lineWidth = "3";
                canvas_context.strokeStyle = "black";
                canvas_context.stroke();
                canvas_context.fill();
                let min = Math.floor(30-(Math.abs(time-starttime)/60000))%60
                let sec = Math.floor(60-((Math.abs(time-starttime)%60000)/1000))%60
                canvas_context.drawImage(numimgs[Math.max(min,0)],0,0,numimgs[Math.max(min,0)].width, numimgs[min].height, 175,585, 50,50 )
                canvas_context.drawImage(numimgs[Math.max(sec,0)],0,0,numimgs[Math.max(sec,0)].width, numimgs[sec].height, 215,585, 50,50 )
            
            }
        // }


    }
})
