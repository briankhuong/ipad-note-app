class App {
    constructor() {
        this.drawingCanvas = new DrawingCanvas('noteCanvas');
        this.setupEventListeners();
        this.updateStatus('Tap with Apple Pencil to start drawing');
    }

    setupEventListeners() {
        // Tool buttons
        document.getElementById('penBtn').addEventListener('click', () => {
            this.setActiveTool('pen');
            this.drawingCanvas.setTool('pen');
            this.updateStatus('Pen tool selected - Use Apple Pencil to draw');
        });

        document.getElementById('eraserBtn').addEventListener('click', () => {
            this.setActiveTool('eraser');
            this.drawingCanvas.setTool('eraser');
            this.updateStatus('Eraser tool selected - Use Apple Pencil to erase');
        });

        document.getElementById('clearBtn').addEventListener('click', () => {
            this.drawingCanvas.clearCanvas();
            this.updateStatus('Canvas cleared - Ready for new notes');
        });

        // Color picker
        document.getElementById('colorPicker').addEventListener('input', (e) => {
            this.drawingCanvas.setColor(e.target.value);
            this.updateStatus(`Color changed to ${e.target.value}`);
        });

        // Brush size
        const brushSize = document.getElementById('brushSize');
        const brushSizeValue = document.getElementById('brushSizeValue');
        
        brushSize.addEventListener('input', (e) => {
            const size = e.target.value;
            brushSizeValue.textContent = `${size}px`;
            this.drawingCanvas.setBrushSize(parseInt(size));
            this.updateStatus(`Brush size: ${size}px`);
        });

        // Apple Pencil detection and status updates
        const canvas = document.getElementById('noteCanvas');
        
        canvas.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'pen') {
                this.updateStatus('✏️ Apple Pencil detected - Drawing...');
            } else if (e.pointerType === 'touch') {
                this.updateStatus('👆 Finger touch ignored - Use Apple Pencil to draw');
            }
        });

        canvas.addEventListener('pointerup', (e) => {
            if (e.pointerType === 'pen') {
                this.updateStatus('✏️ Apple Pencil ready - Continue drawing');
            }
        });

        // Show tool instructions
        this.showToolInstructions();
    }

    setActiveTool(tool) {
        // Remove active class from all tools
        document.querySelectorAll('.tool').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to selected tool
        document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
    }

    updateStatus(message) {
        const statusElement = document.querySelector('.status');
        statusElement.textContent = message;
        
        // Add visual feedback for important status changes
        if (message.includes('Apple Pencil detected')) {
            statusElement.style.color = '#007AFF';
            statusElement.style.fontWeight = '600';
        } else if (message.includes('ignored')) {
            statusElement.style.color = '#FF3B30';
            statusElement.style.fontWeight = '600';
        } else {
            statusElement.style.color = '#666';
            statusElement.style.fontWeight = 'normal';
        }
    }

    showToolInstructions() {
        console.log(`
🎯 Teacher Notes App - Instructions:
• Use Apple Pencil to draw (fingers are ignored)
• Change colors with the color picker
• Adjust brush size with the slider
• Use eraser for corrections
• Clear button resets the canvas
• App works best in Safari on iPad
        `);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new App();
    
    // Add helpful startup message
    console.log('🚀 Teacher Notes App Started!');
    console.log('📱 Open on iPad Safari and use Apple Pencil to draw');
});