import { H as Hls } from "./player-DrU42sTK.js";

const players = Array.from(document.querySelectorAll("[data-player]"));

players.forEach((player) => {
    const video = player.querySelector("video");
    const button = player.querySelector("[data-play-button]");

    if (!video) {
        return;
    }

    const stream = video.dataset.stream;
    let hls = null;

    if (stream) {
        if (Hls.isSupported()) {
            hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(stream);
            hls.attachMedia(video);
            hls.on(Hls.Events.ERROR, (eventName, data) => {
                if (!data || !data.fatal) {
                    return;
                }

                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    hls.destroy();
                }
            });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
        } else {
            video.src = stream;
        }
    }

    const markPlaying = () => {
        player.classList.add("is-playing");
    };

    if (button) {
        button.addEventListener("click", () => {
            markPlaying();
            const playResult = video.play();

            if (playResult && typeof playResult.catch === "function") {
                playResult.catch(() => {
                    player.classList.remove("is-playing");
                });
            }
        });
    }

    video.addEventListener("play", markPlaying);
    video.addEventListener("pause", () => {
        if (video.currentTime === 0 || video.ended) {
            player.classList.remove("is-playing");
        }
    });
});
