import './index.scss';

class Injected {
    constructor() {
        this.blobs = [];
        this.src = '';
        this.timer = null;
        this.video = null;
        this.stream = null;
        this.mediaRecorder = null;
        this.createUI();
        this.bindEvent();
    }

    static get options() {
        return {
            audioBitsPerSecond: 128000,
            videoBitsPerSecond: 5000000,
            mimeType: 'video/webm; codecs="vp8, opus"',
        };
    }

    get size() {
        return this.blobs.reduce((size, item) => size + item.size, 0);
    }

    log(msg) {
        throw new Error('录播姬 --> ' + msg);
    }

    durationToTime(duration) {
        const m = String(Math.floor(duration / 60)).slice(-5);
        const s = String(duration % 60);
        return `${m.length === 1 ? `0${m}` : m}:${s.length === 1 ? `0${s}` : s}`;
    }

    mergeBlobs(blobs = []) {
        const size = this.size;
        return new Promise(resolve => {
            const result = blobs.reduce((result, item) => {
                const blob = new Blob([result, item], {
                    type: 'video/webm',
                });
                this.$wait.textContent = `${Math.floor((blob.size / size || 0) * 100)}%`;
                return blob;
            }, new Blob([]));
            resolve(result);
        });
    }

    createUI() {
        this.$container = document.createElement('div');
        this.$container.classList.add('video-recorder');
        this.$container.innerHTML = `
            <div class="vr-states">
                <div class="vr-state vr-state-before-record vr-active">开始</div>
                <div class="vr-state vr-state-recording">停止</div>
                <div class="vr-state vr-state-after-record">下载</div>
                <div class="vr-state vr-state-wait">0%</div>
            </div>
            <div class="vr-monitors">
                <div class="vr-monitor vr-monitor-top">
                    <div class="vr-monitor-name">时长：</div>
                    <div class="vr-monitor-value vr-duration">00:00</div>
                </div>
                <div class="vr-monitor vr-monitor-bottom">
                    <div class="vr-monitor-name">大小：</div>
                    <div class="vr-monitor-value vr-size">0.00M</div>
                </div>
            </div>
        `;

        this.$states = Array.from(this.$container.querySelectorAll('.vr-state'));
        this.$beforeRecord = this.$container.querySelector('.vr-state-before-record');
        this.$recording = this.$container.querySelector('.vr-state-recording');
        this.$afterRecord = this.$container.querySelector('.vr-state-after-record');
        this.$wait = this.$container.querySelector('.vr-state-wait');
        this.$duration = this.$container.querySelector('.vr-duration');
        this.$size = this.$container.querySelector('.vr-size');
        this.$monitor = this.$container.querySelector('.vr-monitor');
        this.$container.classList.add('vr-focus');
        document.body.appendChild(this.$container);

        setTimeout(() => {
            this.$container.classList.remove('vr-focus');
        }, 10000);
    }

    bindEvent() {
        this.$beforeRecord.addEventListener('click', () => {
            this.start();
        });

        this.$recording.addEventListener('click', () => {
            this.stop();
        });

        this.$afterRecord.addEventListener('click', () => {
            this.download().then(() => {
                this.reset();
            });
        });

        let isDroging = false;
        let lastPageX = 0;
        let lastPageY = 0;
        let lastPlayerLeft = 0;
        let lastPlayerTop = 0;

        this.$monitor.addEventListener('mousedown', () => {
            isDroging = true;
            lastPageX = event.pageX;
            lastPageY = event.pageY;
            lastPlayerLeft = this.$container.offsetLeft;
            lastPlayerTop = this.$container.offsetTop;
        });

        document.addEventListener('mousemove', event => {
            if (isDroging) {
                const x = event.pageX - lastPageX;
                const y = event.pageY - lastPageY;
                this.$container.style.transform = `translate(${x}px, ${y}px)`;
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDroging) {
                isDroging = false;
                this.$container.style.transform = 'translate(0, 0)';
                const x = lastPlayerLeft + event.pageX - lastPageX;
                const y = lastPlayerTop + event.pageY - lastPageY;
                this.$container.style.left = `${x}px`;
                this.$container.style.top = `${y}px`;
            }
        });
    }

    start() {
        const videos = Array.from(document.querySelectorAll('video'));
        if (videos.length) {
            this.video = videos.find(item => item.captureStream);
            if (this.video) {
                this.src = this.video.src;
                this.changeState('recording');
                this.stream = this.video.captureStream();
                if (MediaRecorder && MediaRecorder.isTypeSupported(Injected.options.mimeType)) {
                    this.mediaRecorder = new MediaRecorder(this.stream, Injected.options);
                    this.mediaRecorder.ondataavailable = event => {
                        this.blobs.push(event.data);
                        const size = this.size / 1024 / 1024;
                        this.$size.textContent = `${size.toFixed(2).slice(-8)}M`;
                        this.$duration.textContent = this.durationToTime(
                            this.blobs.filter(item => item.size > 1024).length,
                        );
                    };
                    this.mediaRecorder.start(1000);
                    this.timer = setInterval(() => {
                        if (this.src !== this.video.src) {
                            this.stop();
                        }
                    }, 1000);
                } else {
                    this.log('不支持录制格式：' + Injected.options.mimeType);
                }
            } else {
                this.log('未发现视频流');
            }
        } else {
            this.log('未发现视频元素');
        }
    }

    stop() {
        this.changeState('after-record');
        this.mediaRecorder.stop();
        clearInterval(this.timer);
    }

    download() {
        this.changeState('wait');
        return this.mergeBlobs(this.blobs).then(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${Date.now()}.webm`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    reset() {
        this.changeState('before-record');
        this.blobs = [];
        this.src = '';
        this.timer = null;
        this.video = null;
        this.stream = null;
        this.mediaRecorder = null;
        this.$duration.textContent = '00:00';
        this.$size.textContent = '0.00M';
        this.$wait.textContent = '0%';
    }

    changeState(state) {
        this.$states.forEach(item => {
            if (item.classList.contains(`vr-state-${state}`)) {
                item.classList.add('vr-active');
            } else {
                item.classList.remove('vr-active');
            }
        });
    }
}

export default new Injected();