class DrawingCanvas {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.currentTool = 'pen';
        this.currentColor = '#000000';
        this.brushSize = 4;
        this.isDrawing = false;
        this.usingPencil = false;
        
        // Smoothing variables
        this.lastX = 0;
        this.lastY = 0;
        this.points = []; // Store recent points for smoothing
        
        this.resizeCanvas();
        this.setupEventListeners();
        
        // Set initial drawing styles
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = this.currentColor;
        this.ctx.lineWidth = this.brushSize;
    }

    resizeCanvas() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // Clear with white background
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.canvas.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'pen') {
                this.usingPencil = true;
                this.startDrawing(e);
            }
        });
        
        this.canvas.addEventListener('pointermove', (e) => {
            if (this.isDrawing && this.usingPencil) {
                this.draw(e);
            }
        });
        
        this.canvas.addEventListener('pointerup', (e) => {
            if (this.usingPencil) {
                this.stopDrawing();
                this.usingPencil = false;
            }
        });
        
        this.canvas.addEventListener('pointercancel', (e) => {
            if (this.usingPencil) {
                this.stopDrawing();
                this.usingPencil = false;
            }
        });
        
        this.canvas.addEventListener('touchstart', (e) => e.preventDefault());
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault());
    }

    getCanvasCoordinates(event) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        return {
            x: (event.clientX - rect.left) * scaleX,
            y: (event.clientY - rect.top) * scaleY
        };
    }

    startDrawing(event) {
        this.isDrawing = true;
        const coords = this.getCanvasCoordinates(event);
        
        // Reset points array and add first point
        this.points = [coords];
        this.lastX = coords.x;
        this.lastY = coords.y;
        
        // Draw initial dot
        this.ctx.beginPath();
        this.ctx.arc(coords.x, coords.y, this.brushSize / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = this.currentTool === 'eraser' ? 'white' : this.currentColor;
        this.ctx.fill();
    }

    draw(event) {
        if (!this.isDrawing || !this.usingPencil) return;
        
        const coords = this.getCanvasCoordinates(event);
        
        // Add new point to the array
        this.points.push(coords);
        
        // Keep only last 3 points for smoothing (reduces lag)
        if (this.points.length > 3) {
            this.points.shift();
        }
        
        // Draw smoothed line
        this.drawSmoothLine();
    }

    drawSmoothLine() {
        if (this.points.length < 2) return;
        
        const points = this.points;
        
        this.ctx.lineWidth = this.currentTool === 'eraser' ? this.brushSize * 3 : this.brushSize;
        this.ctx.strokeStyle = this.currentTool === 'eraser' ? 'white' : this.currentColor;
        
        // Use quadratic curves for smooth lines
        this.ctx.beginPath();
        
        if (points.length === 2) {
            // For just 2 points, draw a straight line
            this.ctx.moveTo(points[0].x, points[0].y);
            this.ctx.lineTo(points[1].x, points[1].y);
        } else {
            // For 3+ points, use smooth curves
            const xc = (points[1].x + points[2].x) / 2;
            const yc = (points[1].y + points[2].y) / 2;
            
            this.ctx.moveTo(points[0].x, points[0].y);
            this.ctx.quadraticCurveTo(points[1].x, points[1].y, xc, yc);
        }
        
        this.ctx.stroke();
        
        // Update last position
        this.lastX = points[points.length - 1].x;
        this.lastY = points[points.length - 1].y;
    }

    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.points = [];
            this.ctx.beginPath();
        }
    }

    clearCanvas() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    setTool(tool) {
        this.currentTool = tool;
    }

    setColor(color) {
        this.currentColor = color;
        this.ctx.strokeStyle = color;
    }

    setBrushSize(size) {
        this.brushSize = parseInt(size);
    }
}