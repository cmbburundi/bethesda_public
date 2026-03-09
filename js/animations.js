/**
 * Medical Services Hero Animations
 *
 * Lightweight, elegant canvas animations for each service page.
 * All animations use a TRANSPARENT background so they blend directly
 * into the dark-green (.sub-hero) hero section.
 *
 * Colour palette (all at low opacity against dark green):
 *   White/near-white  — rgba(255,255,255, 0.08–0.6)
 *   Mint green        — rgba(82, 183, 136, …)   brand accent
 *   Soft gold         — rgba(212, 175, 55, …)
 *   Rose              — rgba(232, 158, 175, …)   gynécologie only
 *   Sky blue          — rgba(100, 180, 220, …)   ophtalmologie / néphrologie
 */

class ServiceAnimation {
    constructor(canvasId, type) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.type = type;
        this.W = 360;
        this.H = 360;
        this.canvas.width = this.W;
        this.canvas.height = this.H;

        this.t = 0;
        this._init();
        this._loop();
    }

    /* ─── per-type setup ─── */
    _init() {
        const W = this.W, H = this.H;
        switch (this.type) {

            case 'chirurgie':
                // EKG heartbeat trail
                this.ekgX = 0;
                this.ekgTrail = [];
                // Faint radial grid lines – pre-computed angles
                this.gridSpokes = Array.from({ length: 12 }, (_, i) => i * Math.PI / 6);
                break;

            case 'pediatrie':
                // Concentric expanding rings
                this.rings = Array.from({ length: 5 }, (_, i) => ({
                    r: i * 52,          // starting radius (staggered)
                    alpha: 0.35 - i * 0.05
                }));
                // Sparkle glints
                this.sparks = Array.from({ length: 12 }, () => ({
                    x: Math.random() * W,
                    y: Math.random() * H,
                    life: Math.random() * 120,
                    maxLife: 120 + Math.random() * 80,
                    size: 1.5 + Math.random() * 2.5
                }));
                break;

            case 'gynecologie':
                // Undulating sine wave
                this.waveOff = 0;
                // Slow-rotating petal outlines
                this.petalAngle = 0;
                break;

            case 'ophtalmologie':
                // Eye iris radial spokes rotation
                this.irisAngle = 0;
                // Orbiting catch-light
                this.orbitAngle = 0;
                break;

            case 'nephrologie':
                // Three Bézier vessel curves + travelling dots
                this.vessels = [
                    { cp1x: 80, cp1y: 80, cp2x: 280, cp2y: 100, t: 0.0, speed: 0.004 },
                    { cp1x: 60, cp1y: 200, cp2x: 300, cp2y: 180, t: 0.33, speed: 0.005 },
                    { cp1x: 90, cp1y: 310, cp2x: 270, cp2y: 290, t: 0.66, speed: 0.003 },
                ];
                break;

            case 'endocrinologie':
                // Sparse molecule network
                this.nodes = Array.from({ length: 9 }, () => ({
                    x: 30 + Math.random() * (W - 60),
                    y: 30 + Math.random() * (H - 60),
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    r: 3 + Math.random() * 3,
                    phase: Math.random() * Math.PI * 2
                }));
                this.sigT = 0;
                break;
        }
    }

    /* ─── main loop ─── */
    _loop = () => {
        this.t++;
        this.ctx.clearRect(0, 0, this.W, this.H);

        switch (this.type) {
            case 'chirurgie': this._drawChirurgie(); break;
            case 'pediatrie': this._drawPediatrie(); break;
            case 'gynecologie': this._drawGynecologie(); break;
            case 'ophtalmologie': this._drawOphtalmologie(); break;
            case 'nephrologie': this._drawNephrologie(); break;
            case 'endocrinologie': this._drawEndocrinologie(); break;
        }

        requestAnimationFrame(this._loop);
    }

    /* ═══════════════════════════════════════════════
       CHIRURGIE — clean EKG sweep on a subtle grid
    ═══════════════════════════════════════════════ */
    _drawChirurgie() {
        const { ctx, W, H, t } = this;
        const cx = W / 2, cy = H / 2;

        /* faint circular grid */
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        for (let r = 40; r < 200; r += 40) {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
        }
        /* radial spokes */
        this.gridSpokes.forEach(a => {
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(a) * 185, cy + Math.sin(a) * 185);
            ctx.stroke();
        });

        /* ── EKG heartbeat line ── */
        const baseY = cy + 50;
        const speed = 2.2;

        this.ekgX += speed;
        if (this.ekgX > W) this.ekgX = 0;

        // build waveform Y for current X
        const xr = this.ekgX % W;
        let py = baseY;
        const seg = xr % 200;   // pattern repeats every 200 px
        if (seg > 60 && seg < 75) py = baseY - 14;
        else if (seg >= 75 && seg < 82) py = baseY + 28;
        else if (seg >= 82 && seg < 92) py = baseY - 68;
        else if (seg >= 92 && seg < 102) py = baseY + 18;
        else if (seg >= 102 && seg < 115) py = baseY - 8;

        this.ekgTrail.push({ x: this.ekgX, y: py });
        if (this.ekgTrail.length > 140) this.ekgTrail.shift();

        // glow under the line
        ctx.shadowColor = 'rgba(82,183,136,0.6)';
        ctx.shadowBlur = 8;

        ctx.strokeStyle = 'rgba(82,183,136,0.85)';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        this.ekgTrail.forEach(({ x, y }, i) => {
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.shadowBlur = 0;

        // erase front edge (wrap-around cleaner)
        ctx.clearRect(this.ekgX + 1, 0, 30, H);
    }

    /* ═══════════════════════════════════════════════
       PÉDIATRIE — expanding growth rings + sparkles
    ═══════════════════════════════════════════════ */
    _drawPediatrie() {
        const { ctx, W, H, t } = this;
        const cx = W / 2, cy = H / 2;
        const maxR = 185;

        /* expand rings */
        this.rings.forEach(ring => {
            ring.r += 0.35;
            if (ring.r > maxR) ring.r = 0;

            const alpha = ring.alpha * (1 - ring.r / maxR);
            ctx.strokeStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
            ctx.stroke();
        });

        /* centre soft glow dot */
        const pulse = 0.4 + Math.sin(t * 0.05) * 0.2;
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 32);
        grd.addColorStop(0, `rgba(82,183,136,${pulse})`);
        grd.addColorStop(1, 'rgba(82,183,136,0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(cx, cy, 32, 0, Math.PI * 2);
        ctx.fill();

        /* sparkle glints */
        this.sparks.forEach(s => {
            s.life += 1;
            if (s.life > s.maxLife) {
                s.life = 0;
                s.x = Math.random() * W;
                s.y = Math.random() * H;
                s.maxLife = 100 + Math.random() * 80;
            }
            const progress = s.life / s.maxLife;
            const a = Math.sin(progress * Math.PI) * 0.7;
            ctx.fillStyle = `rgba(212,175,55,${a.toFixed(3)})`;

            // four-pointed star
            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(progress * Math.PI);
            ctx.beginPath();
            for (let p = 0; p < 4; p++) {
                const angle = (p / 4) * Math.PI * 2;
                const r1 = s.size, r2 = s.size * 0.35;
                ctx.lineTo(Math.cos(angle) * r1, Math.sin(angle) * r1);
                ctx.lineTo(Math.cos(angle + Math.PI / 4) * r2, Math.sin(angle + Math.PI / 4) * r2);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        });
    }

    /* ═══════════════════════════════════════════════
       GYNÉCOLOGIE — sine wave + rotating petal outlines
    ═══════════════════════════════════════════════ */
    _drawGynecologie() {
        const { ctx, W, H, t } = this;
        const cx = W / 2, cy = H / 2;

        /* oscillating sine wave */
        this.waveOff += 0.025;
        ctx.strokeStyle = 'rgba(232,158,175,0.5)';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 2) {
            const y = cy + Math.sin((x / W) * Math.PI * 3.5 + this.waveOff) * 38
                + Math.sin((x / W) * Math.PI * 7 + this.waveOff * 1.3) * 14;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        /* second, offset wave */
        ctx.strokeStyle = 'rgba(255,255,255,0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 2) {
            const y = cy + 50 + Math.sin((x / W) * Math.PI * 2.5 + this.waveOff * 0.7) * 22;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();

        /* rotating petal outlines (stroke only) */
        this.petalAngle += 0.004;
        ctx.save();
        ctx.translate(cx, cy - 10);
        ctx.rotate(this.petalAngle);
        const numPetals = 6;
        for (let i = 0; i < numPetals; i++) {
            ctx.rotate((Math.PI * 2) / numPetals);
            ctx.strokeStyle = `rgba(232,158,175,0.18)`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(22, 18, 22, 58, 0, 72);
            ctx.bezierCurveTo(-22, 58, -22, 18, 0, 0);
            ctx.closePath();
            ctx.stroke();
        }
        ctx.restore();

        /* small centre circle */
        ctx.strokeStyle = 'rgba(232,158,175,0.45)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, cy - 10, 10 + Math.sin(t * 0.04) * 2, 0, Math.PI * 2);
        ctx.stroke();
    }

    /* ═══════════════════════════════════════════════
       OPHTALMOLOGIE — eye outline + rotating iris grid
    ═══════════════════════════════════════════════ */
    _drawOphtalmologie() {
        const { ctx, W, H, t } = this;
        const cx = W / 2, cy = H / 2;

        /* outer eye outline (stroke only) */
        const blink = Math.abs(Math.sin(t * 0.008)) * 0.9 + 0.1; // 0.1–1.0
        const ey = 75 * blink;

        ctx.strokeStyle = 'rgba(255,255,255,0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - 115, cy);
        ctx.quadraticCurveTo(cx, cy - ey, cx + 115, cy);
        ctx.quadraticCurveTo(cx, cy + ey, cx - 115, cy);
        ctx.stroke();

        /* iris radial spokes rotating */
        this.irisAngle += 0.003;
        const irisR = 52 * blink;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.irisAngle);
        ctx.strokeStyle = 'rgba(100,180,220,0.22)';
        ctx.lineWidth = 1;
        for (let i = 0; i < 18; i++) {
            const a = (i / 18) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(Math.cos(a) * 14, Math.sin(a) * 14);
            ctx.lineTo(Math.cos(a) * irisR, Math.sin(a) * irisR);
            ctx.stroke();
        }
        /* iris ring */
        ctx.strokeStyle = 'rgba(100,180,220,0.3)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 0, irisR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        /* pupil */
        const dil = 16 + Math.sin(t * 0.04) * 4;
        const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, dil);
        grd.addColorStop(0, 'rgba(15,30,25,0.95)');
        grd.addColorStop(1, 'rgba(15,30,25,0.7)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(cx, cy, dil * blink, 0, Math.PI * 2);
        ctx.fill();

        /* orbiting catch-light */
        this.orbitAngle += 0.018;
        const ox = cx + Math.cos(this.orbitAngle) * 28;
        const oy = cy + Math.sin(this.orbitAngle) * 20;
        ctx.fillStyle = 'rgba(255,255,255,0.65)';
        ctx.beginPath();
        ctx.arc(ox, oy, 3.5, 0, Math.PI * 2);
        ctx.fill();

        /* static small highlight */
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(cx - 18, cy - 18, 5, 0, Math.PI * 2);
        ctx.fill();
    }

    /* ═══════════════════════════════════════════════
       NÉPHROLOGIE — flowing Bézier vessels + dots
    ═══════════════════════════════════════════════ */
    _drawNephrologie() {
        const { ctx, W, H, t } = this;
        const cx = W / 2;

        // Vessel start/end points
        const paths = [
            { x0: 10, y0: H * 0.20, x3: W - 10, y3: H * 0.22 },
            { x0: 10, y0: H * 0.50, x3: W - 10, y3: H * 0.48 },
            { x0: 10, y0: H * 0.80, x3: W - 10, y3: H * 0.78 },
        ];

        this.vessels.forEach((v, i) => {
            const path = paths[i];
            const wave = Math.sin(t * 0.02 + i * 1.2) * 28;

            // Bézier control points (gently animate)
            const cp1x = cx - 60, cp1y = path.y0 + wave;
            const cp2x = cx + 60, cp2y = path.y3 - wave;

            /* vessel line */
            ctx.strokeStyle = 'rgba(100,180,220,0.2)';
            ctx.lineWidth = i === 1 ? 2.5 : 1.5;
            ctx.beginPath();
            ctx.moveTo(path.x0, path.y0);
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, path.x3, path.y3);
            ctx.stroke();

            /* travelling dot along the curve */
            v.t += v.speed;
            if (v.t > 1) v.t = 0;
            const bx = _bezier(path.x0, cp1x, cp2x, path.x3, v.t);
            const by = _bezier(path.y0, cp1y, cp2y, path.y3, v.t);

            const dotAlpha = 0.5 + Math.sin(v.t * Math.PI) * 0.4;
            ctx.fillStyle = `rgba(82,183,136,${dotAlpha.toFixed(2)})`;
            ctx.shadowColor = 'rgba(82,183,136,0.5)';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(bx, by, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
        });

        /* central kidney silhouette — stroke outline, very faint */
        ctx.save();
        ctx.translate(cx, H / 2);
        ctx.rotate(-0.3);
        ctx.strokeStyle = 'rgba(212,175,55,0.12)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(0, -52);
        ctx.bezierCurveTo(42, -52, 68, -18, 68, 34);
        ctx.bezierCurveTo(68, 86, 26, 104, -18, 86);
        ctx.bezierCurveTo(-52, 68, -26, 18, -34, 0);
        ctx.bezierCurveTo(-42, -18, -34, -52, 0, -52);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }

    /* ═══════════════════════════════════════════════
       ENDOCRINOLOGIE — minimal molecule network
    ═══════════════════════════════════════════════ */
    _drawEndocrinologie() {
        const { ctx, W, H, t } = this;

        /* move nodes gently */
        this.nodes.forEach(n => {
            n.x += n.vx;
            n.y += n.vy;
            n.phase += 0.025;
            if (n.x < 20 || n.x > W - 20) n.vx *= -1;
            if (n.y < 20 || n.y > H - 20) n.vy *= -1;
        });

        /* connections between nearby nodes */
        const threshold = 115;
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const dx = this.nodes[i].x - this.nodes[j].x;
                const dy = this.nodes[i].y - this.nodes[j].y;
                const d = Math.sqrt(dx * dx + dy * dy);
                if (d > threshold) continue;

                const fade = 1 - d / threshold;
                ctx.strokeStyle = `rgba(255,255,255,${(fade * 0.18).toFixed(3)})`;
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
                ctx.lineTo(this.nodes[j].x, this.nodes[j].y);
                ctx.stroke();

                /* signal dot travelling i → j */
                this.sigT += 0.003;
                const st = this.sigT % 1;
                if (i === 0 && j === 1) {
                    const sx = this.nodes[i].x + (this.nodes[j].x - this.nodes[i].x) * st;
                    const sy = this.nodes[i].y + (this.nodes[j].y - this.nodes[i].y) * st;
                    ctx.fillStyle = 'rgba(212,175,55,0.75)';
                    ctx.shadowColor = 'rgba(212,175,55,0.6)';
                    ctx.shadowBlur = 6;
                    ctx.beginPath();
                    ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            }
        }

        /* node dots */
        this.nodes.forEach(n => {
            const pulse = n.r + Math.sin(n.phase) * 1.5;

            /* outer glow */
            const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, pulse * 3.5);
            grd.addColorStop(0, `rgba(82,183,136,${(0.12 + Math.sin(n.phase) * 0.05).toFixed(3)})`);
            grd.addColorStop(1, 'rgba(82,183,136,0)');
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(n.x, n.y, pulse * 3.5, 0, Math.PI * 2);
            ctx.fill();

            /* core dot */
            ctx.fillStyle = 'rgba(255,255,255,0.55)';
            ctx.beginPath();
            ctx.arc(n.x, n.y, pulse, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

/* ─── Bézier helper ─── */
function _bezier(p0, p1, p2, p3, t) {
    const mt = 1 - t;
    return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
}

/* ─── Public init hook (called inline in each service page) ─── */
window.initServiceAnimation = (canvasId, type) => {
    new ServiceAnimation(canvasId, type);
};
