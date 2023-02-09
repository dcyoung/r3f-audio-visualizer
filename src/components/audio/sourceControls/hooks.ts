import { useEffect, useMemo, useState } from 'react';
import { iOS } from './common';

const events = ['mousedown', 'touchstart'];

export function useInteraction() {
    const [ready, setReady] = useState(false);

    const listener = () => {
        if (ready === false) {
            setReady(true);
        }
    };

    useEffect(() => {
        events.forEach((event) => {
            document.addEventListener(event, listener);
        });

        return () => {
            events.forEach((event) => {
                document.removeEventListener(event, listener);
            });
        };
    }, []);

    return ready;
}


export function useAudio() {
    console.log("Creating audio..");
    const audio = useMemo(() => {
        const node = new Audio();
        node.crossOrigin = "anonymous";
        return node;
    }, []);

    useEffect(() => {
        return () => {
            console.log("Removing audio.");
            audio.pause();
            audio.remove();
        };
    }, [audio]);

    return { audio };
}

const webAudioTouchUnlock = (context: AudioContext) => {
    return new Promise(function (resolve, reject) {
        if (context.state === 'suspended' && 'ontouchstart' in window) {
            var unlock = function () {
                context.resume().then(function () {
                    document.body.removeEventListener('touchstart', unlock);
                    document.body.removeEventListener('touchend', unlock);

                    resolve(true);
                },
                    function (reason) {
                        reject(reason);
                    });
            };

            document.body.addEventListener('touchstart', unlock, false);
            document.body.addEventListener('touchend', unlock, false);
        }
        else {
            resolve(false);
        }
    });
}

export function useAudioContext() {
    const audioCtx = useMemo(() => {
        return new window.AudioContext();
    }, []);

    useEffect(() => {
        if (iOS()) {
            console.log("Attempting to unlock AudioContext");
            webAudioTouchUnlock(audioCtx).then(function (unlocked) {
                if (unlocked) {
                    // AudioContext was unlocked from an explicit user action,
                    // sound should work now
                    console.log("Successfully unlocked AudioContext!");
                }
                else {
                    // There was no need for unlocking, devices other than iOS
                    console.log("No need to unlock AudioContext.");
                }
            },
                function (reason) {
                    console.error(reason);
                });
        }
        return () => {
            // console.log("Closing audio context.");
            // audioCtx.close()
            //     .then(() => console.log("Successfully closed AudioContext"))
            //     .catch(e => console.error(e));
        }
    }, [audioCtx])
    return { audioCtx }
}