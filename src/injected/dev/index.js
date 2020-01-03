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
        this.analysis();
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
        throw new Error(`录播姬 --> ${msg}`);
    }

    durationToTime(duration) {
        const m = String(Math.floor(duration / 60)).slice(-5);
        const s = String(duration % 60);
        return `${m.length === 1 ? `0${m}` : m}:${s.length === 1 ? `0${s}` : s}`;
    }

    mergeBlobs(blobs = []) {
        const { size } = this;
        let result = new Blob([]);

        const tasks = blobs.map(blob => () => {
            return new Promise(resolve => {
                setTimeout(() => {
                    result = new Blob([result, blob]);
                    this.$wait.textContent = `${Math.floor((result.size / size || 0) * 100)}%`;
                    resolve();
                }, 0);
            });
        });

        return new Promise(resolve => {
            (function loop() {
                const task = tasks.shift();
                if (task) {
                    task().then(loop);
                } else {
                    resolve(result);
                }
            })();
        });
    }

    createUI() {
        this.$container = document.createElement('div');
        this.$container.classList.add('record-hime');
        this.$container.innerHTML = `
            <div class="rh-states">
                <div class="rh-state rh-state-before-record rh-active">开始</div>
                <div class="rh-state rh-state-recording">停止</div>
                <div class="rh-state rh-state-after-record">下载</div>
                <div class="rh-state rh-state-wait">0%</div>
            </div>
            <div class="rh-monitors">
                <div class="rh-monitor rh-monitor-top">
                    <div class="rh-monitor-name">时长：</div>
                    <div class="rh-monitor-value rh-duration">00:00</div>
                </div>
                <div class="rh-monitor rh-monitor-bottom">
                    <div class="rh-monitor-name">大小：</div>
                    <div class="rh-monitor-value rh-size">0.00M</div>
                </div>
            </div>
        `;

        this.$states = Array.from(this.$container.querySelectorAll('.rh-state'));
        this.$beforeRecord = this.$container.querySelector('.rh-state-before-record');
        this.$recording = this.$container.querySelector('.rh-state-recording');
        this.$afterRecord = this.$container.querySelector('.rh-state-after-record');
        this.$wait = this.$container.querySelector('.rh-state-wait');
        this.$duration = this.$container.querySelector('.rh-duration');
        this.$size = this.$container.querySelector('.rh-size');
        this.$monitor = this.$container.querySelector('.rh-monitor');
        this.$container.classList.add('rh-focus');
        document.body.appendChild(this.$container);

        setTimeout(() => {
            this.$container.classList.remove('rh-focus');
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
            if (this.blobs.length) {
                this.download().then(() => {
                    this.reset();
                });
            } else {
                this.reset();
            }
        });

        let isDroging = false;
        let lastPageX = 0;
        let lastPageY = 0;
        let lastPlayerLeft = 0;
        let lastPlayerTop = 0;

        this.$monitor.addEventListener('mousedown', event => {
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

        document.addEventListener('mouseup', event => {
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
                try {
                    this.src = this.video.src;
                    this.video.crossOrigin = 'anonymous';
                    this.stream = this.video.captureStream();
                    this.changeState('recording');
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
                        this.log(`不支持录制格式：${Injected.options.mimeType}`);
                    }
                } catch (error) {
                    this.log(`录制视频流失败：${error.message.trim()}`);
                }
            } else {
                this.log('未发现视频流');
            }
        } else {
            this.log('未发现视频元素');
        }
    }

    stop() {
        clearInterval(this.timer);
        this.changeState('after-record');
        if (this.mediaRecorder) {
            this.mediaRecorder.stop();
        }
    }

    download() {
        this.changeState('wait');
        return this.mergeBlobs(this.blobs).then(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${document.title || Date.now()}.webm`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }

    reset() {
        clearInterval(this.timer);
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
            if (item.classList.contains(`rh-state-${state}`)) {
                item.classList.add('rh-active');
            } else {
                item.classList.remove('rh-active');
            }
        });
    }

    analysis() {
        // eslint-disable-next-line no-underscore-dangle
        window._hmt = window._hmt || [];
        const hm = document.createElement('script');
        hm.src = 'https://hm.baidu.com/hm.js?3c93ca28120f48d2a27889d0623cd7b7';
        const s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(hm, s);
    }
}

export default new Injected();
