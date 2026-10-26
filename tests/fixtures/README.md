# Silent video fixture

`silent.webm` is the first two seconds of the repository's fictional practice
video, with its audio removed. It tests that frame-only analysis never claims
speech was checked. A committed clip avoids depending on headless Chromium's
canvas recorder, which can emit a WebM header without any frames.

Regenerate with FFmpeg (not needed to run tests):

```sh
ffmpeg -i web/assets/sample-video.webm -an -t 2 -c:v copy tests/fixtures/silent.webm
```
