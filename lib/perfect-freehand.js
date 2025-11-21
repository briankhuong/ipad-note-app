(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.perfectFreehand = {}));
})(this, (function (exports) {
  'use strict';

  function getStroke(points, options = {}) {
    const {
      size = 16,
      thinning = 0.5,
      smoothing = 0.5,
      streamline = 0.5,
      simulatePressure = true,
      last = false
    } = options;

    if (points.length === 0) return [];
    if (points.length === 1) points.push({ ...points[0], pressure: points[0].pressure || 0.5 });

    const pts = points.map((point, i) => {
      const next = points[i + 1];
      const prev = points[i - 1];
      const pressure = point.pressure || (simulatePressure && prev && next ? getPressure(i, points, simulatePressure) : 0.5);
      return { ...point, pressure, vector: prev ? [point.x - prev.x, point.y - prev.y] : [0, 0] };
    });

    const stroke = [];
    const totalLength = pts.length - 1;

    for (let i = 0; i < totalLength; i++) {
      const point = pts[i];
      const next = pts[i + 1];

      const step = Math.min(getStepSize(point, next), 1);
      const steps = Math.ceil(1 / step);

      for (let t = 0; t < 1; t += step) {
        const currentPoint = interpolate(point, next, t);
        const adjustedSize = getStrokeSize(currentPoint.pressure, size, thinning);
        
        if (stroke.length > 0) {
          const prevPoint = stroke[stroke.length - 1];
          const distance = Math.hypot(currentPoint.x - prevPoint.x, currentPoint.y - prevPoint.y);
          
          if (distance < adjustedSize / 4) continue;
        }

        stroke.push({
          x: currentPoint.x,
          y: currentPoint.y,
          pressure: currentPoint.pressure,
          size: adjustedSize
        });
      }
    }

    if (last && pts.length > 1) {
      const lastPoint = pts[pts.length - 1];
      const adjustedSize = getStrokeSize(lastPoint.pressure, size, thinning);
      stroke.push({
        x: lastPoint.x,
        y: lastPoint.y,
        pressure: lastPoint.pressure,
        size: adjustedSize
      });
    }

    return stroke.length > 1 ? smoothStroke(stroke, smoothing, streamline) : stroke;
  }

  function getPressure(i, points, simulatePressure) {
    const point = points[i];
    const prev = points[i - 1];
    const next = points[i + 1];
    
    if (!prev || !next) return 0.5;
    
    const distance = Math.hypot(next.x - prev.x, next.y - prev.y);
    const pressure = Math.min(distance / 10, 1);
    
    return Math.max(0.25, pressure);
  }

  function getStepSize(current, next) {
    const distance = Math.hypot(next.x - current.x, next.y - current.y);
    return Math.min(0.5, 1 / (distance + 1));
  }

  function interpolate(a, b, t) {
    return {
      x: a.x + (b.x - a.x) * t,
      y: a.y + (b.y - a.y) * t,
      pressure: a.pressure + (b.pressure - a.pressure) * t
    };
  }

  function getStrokeSize(pressure, size, thinning) {
    return Math.max(0.5, size * (1 - thinning * (1 - pressure)));
  }

  function smoothStroke(points, smoothing, streamline) {
    if (points.length < 3) return points;

    const smoothed = [points[0]];
    
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const current = points[i];
      const next = points[i + 1];
      
      const smoothedPoint = {
        x: (prev.x + current.x + next.x) / 3,
        y: (prev.y + current.y + next.y) / 3,
        pressure: current.pressure,
        size: current.size
      };
      
      smoothed.push(smoothedPoint);
    }
    
    smoothed.push(points[points.length - 1]);
    return smoothed;
  }

  function strokeToSVG(stroke) {
    if (stroke.length === 0) return '';
    
    const d = stroke.map((point, i) => {
      return `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
    }).join(' ');
    
    return d;
  }

  exports.getStroke = getStroke;
  exports.strokeToSVG = strokeToSVG;

  Object.defineProperty(exports, '__esModule', { value: true });

}));