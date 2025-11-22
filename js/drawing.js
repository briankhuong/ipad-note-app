class DrawingCanvas {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.currentTool = 'pen';
        this.currentColor = '#FFFFFF'; // White for dark background
        this.baseBrushSize = 3;
        this.brushSize = this.baseBrushSize;
        this.isDrawing = false;
        this.usingPencil = false;
        this.points = [];
        
        this.currentIndicatorId = null;
        this.currentPerformanceType = 'good'; // 'good' or 'growth'
        this.onSaveCallback = null;
        this.currentDrawingData = null;

        this.initializeCanvas();
    }

    initializeCanvas() {
        this.resizeCanvas();
        this.setupEventListeners();

        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        
        // Set initial color from color picker
        const colorPicker = document.getElementById('colorPicker');
        if (colorPicker) {
            this.currentColor = colorPicker.value;
        }
        
        this.setupPressure();
        
        // Prevent context menu on canvas
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    setupPressure() {
        if (typeof Pressure === 'undefined') {
            console.log('Pressure.js not available - using basic drawing');
            return;
        }

        try {
            Pressure.set(this.canvas, {
                change: (force, event) => {
                    if (!this.isDrawing || !this.usingPencil) return;

                    const minWidth = Math.max(1, this.baseBrushSize * 0.3);
                    const maxWidth = this.baseBrushSize * 2.2;
                    this.brushSize = minWidth + force * (maxWidth - minWidth);
                    this.brushSize = Math.max(1, this.brushSize);
                },
                end: () => {
                    this.brushSize = this.baseBrushSize;
                }
            });
        } catch (error) {
            console.log('Pressure setup failed:', error);
        }
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        // Set canvas size to match container exactly
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // Ensure canvas displays at correct size
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
        
        // Reload current drawing after resize
        if (this.currentDrawingData) {
            setTimeout(() => {
                this.loadDrawing(this.currentDrawingData);
            }, 50);
        } else {
            this.clearCanvas();
        }
    }

    setupEventListeners() {
        window.addEventListener('resize', () => {
            setTimeout(() => this.resizeCanvas(), 100);
        });

        // Pointer events with better hand rejection
        this.canvas.addEventListener('pointerdown', this.handlePointerDown.bind(this));
        this.canvas.addEventListener('pointermove', this.handlePointerMove.bind(this));
        this.canvas.addEventListener('pointerup', this.handlePointerUp.bind(this));
        this.canvas.addEventListener('pointercancel', this.handlePointerUp.bind(this));
        this.canvas.addEventListener('pointerleave', this.handlePointerUp.bind(this));
        
        // Color picker event listener
        const colorPicker = document.getElementById('colorPicker');
        if (colorPicker) {
            colorPicker.addEventListener('input', (e) => {
                this.setColor(e.target.value);
            });
        }
        
        // Touch prevention
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                e.preventDefault();
            } else if (e.touches.length > 1) {
                e.preventDefault();
            }
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1 && this.isDrawing) {
                e.preventDefault();
            }
        });
    }

    handlePointerDown(event) {
        // ONLY allow Apple Pencil, reject everything else
        if (event.pointerType === 'pen') {
            this.usingPencil = true;
            this.startDrawing(event);
            event.preventDefault();
            return;
        }
        
        // Explicitly reject fingers, mouse, etc.
        event.preventDefault();
    }

    handlePointerMove(event) {
        if (this.isDrawing && this.usingPencil) {
            this.draw(event);
            event.preventDefault();
        }
    }

    handlePointerUp(event) {
        if (this.usingPencil) {
            this.stopDrawing();
            this.usingPencil = false;
            this.brushSize = this.baseBrushSize;
            this.saveDrawing();
            event.preventDefault();
        }
    }

    setOnSaveCallback(callback) {
        this.onSaveCallback = callback;
    }

    setCurrentIndicator(indicatorId, indicatorData, performanceType = 'good') {
        console.log('Switching to indicator:', indicatorId, 'Performance type:', performanceType);
        
        // Save current drawing before switching
        if (this.currentIndicatorId && this.currentIndicatorId !== indicatorId) {
            this.saveDrawing();
        }
        
        this.currentIndicatorId = indicatorId;
        this.currentPerformanceType = performanceType || 'good';
        
        // Clear current drawing data until we load the new one
        this.currentDrawingData = null;
        
        // Force resize to ensure clean canvas
        setTimeout(() => {
            this.resizeCanvas();
        }, 10);
    }

    saveDrawing() {
        if (this.currentIndicatorId && this.onSaveCallback) {
            try {
                this.currentDrawingData = this.canvas.toDataURL();
                this.onSaveCallback(this.currentIndicatorId, this.currentDrawingData, this.currentPerformanceType);
                console.log('✅ Drawing saved for:', this.currentIndicatorId, 'Type:', this.currentPerformanceType);
            } catch (error) {
                console.error('❌ Error saving drawing:', error);
            }
        }
    }

    loadDrawing(drawingData) {
        if (drawingData) {
            this.currentDrawingData = drawingData;
            const img = new Image();
            img.onload = () => {
                // Clear and redraw on transparent background
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
                console.log('✅ Drawing loaded for:', this.currentIndicatorId);
            };
            img.onerror = () => {
                console.error('❌ Failed to load drawing image');
                this.currentDrawingData = null;
                this.clearCanvas();
            };
            img.src = drawingData;
        } else {
            this.currentDrawingData = null;
            this.clearCanvas();
        }
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
        this.points = [coords];

        // Draw initial dot - use current color (white) on dark background
        this.ctx.beginPath();
        this.ctx.arc(coords.x, coords.y, this.brushSize / 2, 0, Math.PI * 2);
        this.ctx.fillStyle = this.currentTool === 'eraser' ? 'transparent' : this.currentColor;
        this.ctx.fill();
    }

    draw(event) {
        if (!this.isDrawing || !this.usingPencil) return;
        
        const coords = this.getCanvasCoordinates(event);
        this.points.push(coords);
        
        if (this.points.length > 4) {
            this.points.shift();
        }
        
        this.drawSmoothLine();
    }

    drawSmoothLine() {
        if (this.points.length < 2) return;
        
        const p = this.points;
        
        this.ctx.lineWidth = this.currentTool === 'eraser' 
            ? this.brushSize * 1.5
            : this.brushSize;
            
        this.ctx.strokeStyle = this.currentTool === 'eraser' ? 'transparent' : this.currentColor;
        
        this.ctx.beginPath();
        
        if (p.length === 2) {
            this.ctx.moveTo(p[0].x, p[0].y);
            this.ctx.lineTo(p[1].x, p[1].y);
        } else {
            const xc = (p[1].x + p[2].x) / 2;
            const yc = (p[1].y + p[2].y) / 2;
            
            this.ctx.moveTo(p[0].x, p[0].y);
            this.ctx.quadraticCurveTo(p[1].x, p[1].y, xc, yc);
        }
        
        this.ctx.stroke();
    }

    stopDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.points = [];
            this.ctx.beginPath();
            this.brushSize = this.baseBrushSize;
        }
    }

    clearCanvas() {
        // For dot grid background, we don't fill with white
        // Instead, we clear by drawing a transparent rectangle
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.currentDrawingData = null;
        
        // Trigger save to clear the stored drawing
        if (this.currentIndicatorId && this.onSaveCallback) {
            this.onSaveCallback(this.currentIndicatorId, null, this.currentPerformanceType);
        }
    }

    setTool(tool) {
        this.currentTool = tool;
    }

    setColor(color) {
        this.currentColor = color;
        // Also update the color picker element if it exists
        const colorPicker = document.getElementById('colorPicker');
        if (colorPicker && colorPicker.value !== color) {
            colorPicker.value = color;
        }
    }

    setBrushSize(size) {
        this.baseBrushSize = Math.max(1, parseInt(size));
        this.brushSize = this.baseBrushSize;
    }

    setPerformanceType(performanceType) {
        this.currentPerformanceType = performanceType;
        console.log('Performance type set to:', performanceType);
        
        // Update the drawing context if needed
        if (performanceType === 'growth') {
            // You could change brush color or style for growth areas
            this.ctx.globalAlpha = 0.8;
        } else {
            this.ctx.globalAlpha = 1.0;
        }
    }

    // New method to export drawing as image
    exportDrawing() {
        return this.canvas.toDataURL('image/png');
    }

    // New method to set custom brush properties
    setBrushProperties(size, color, opacity = 1) {
        this.baseBrushSize = Math.max(1, parseInt(size));
        this.brushSize = this.baseBrushSize;
        this.currentColor = color;
        this.ctx.globalAlpha = opacity;
    }

    // New method to reset brush to default
    resetBrush() {
        this.baseBrushSize = 3;
        this.brushSize = this.baseBrushSize;
        this.currentColor = '#FFFFFF';
        this.ctx.globalAlpha = 1;
    }

    // New method to get current drawing state
    getDrawingState() {
        return {
            tool: this.currentTool,
            color: this.currentColor,
            brushSize: this.brushSize,
            performanceType: this.currentPerformanceType,
            hasDrawing: this.currentDrawingData !== null,
            indicatorId: this.currentIndicatorId
        };
    }

    // New method to check if canvas has any drawing
    hasDrawing() {
        // Create a temporary canvas to check if there's any non-transparent content
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = this.canvas.width;
        tempCanvas.height = this.canvas.height;
        
        // Draw the current canvas onto temp canvas
        tempCtx.drawImage(this.canvas, 0, 0);
        
        // Get image data and check for non-transparent pixels
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] !== 0) { // Check alpha channel
                return true;
            }
        }
        
        return false;
    }

    // New method to undo last stroke (basic implementation)
    undo() {
        // This is a basic implementation - for full undo/redo you'd need a more complex system
        this.clearCanvas();
        this.currentDrawingData = null;
        
        if (this.currentIndicatorId && this.onSaveCallback) {
            this.onSaveCallback(this.currentIndicatorId, null, this.currentPerformanceType);
        }
    }

    // New method to add text comment to canvas
    addCommentToCanvas(commentText, x = 50, y = 50) {
        this.ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        this.ctx.fillStyle = this.currentColor;
        this.ctx.fillText(commentText, x, y);
        this.saveDrawing();
    }
}