"""Small local HTTP server with byte-range support for CIRO research videos."""

from __future__ import annotations

import argparse
import os
import re
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class RangeRequestHandler(SimpleHTTPRequestHandler):
    range_re = re.compile(r"bytes=(\d*)-(\d*)$")

    def send_head(self):
        self._range = None
        path = self.translate_path(self.path)
        if os.path.isdir(path):
            return super().send_head()

        try:
            file = open(path, "rb")
        except OSError:
            self.send_error(404, "File not found")
            return None

        stat = os.fstat(file.fileno())
        size = stat.st_size
        start, end = 0, size - 1
        range_header = self.headers.get("Range")

        if range_header:
            match = self.range_re.fullmatch(range_header.strip())
            if not match:
                file.close()
                self.send_error(416, "Invalid byte range")
                return None

            first, last = match.groups()
            if first:
                start = int(first)
                end = min(int(last), size - 1) if last else size - 1
            elif last:
                length = min(int(last), size)
                start = size - length

            if start >= size or start > end:
                file.close()
                self.send_response(416)
                self.send_header("Content-Range", f"bytes */{size}")
                self.end_headers()
                return None

            self.send_response(206)
            self.send_header("Content-Range", f"bytes {start}-{end}/{size}")
            self.send_header("Content-Length", str(end - start + 1))
            self._range = (start, end)
        else:
            self.send_response(200)
            self.send_header("Content-Length", str(size))
            self._range = None

        self.send_header("Content-Type", self.guess_type(path))
        self.send_header("Accept-Ranges", "bytes")
        self.send_header("Last-Modified", self.date_time_string(stat.st_mtime))
        self.end_headers()
        file.seek(start)
        return file

    def copyfile(self, source, outputfile):
        if self._range is None:
            return super().copyfile(source, outputfile)

        start, end = self._range
        remaining = end - start + 1
        while remaining:
            chunk = source.read(min(64 * 1024, remaining))
            if not chunk:
                break
            outputfile.write(chunk)
            remaining -= len(chunk)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("port", nargs="?", type=int, default=8000)
    parser.add_argument("--bind", default="127.0.0.1")
    parser.add_argument("--directory", default=os.getcwd())
    args = parser.parse_args()
    directory = os.path.abspath(args.directory)

    handler = lambda *handler_args, **kwargs: RangeRequestHandler(
        *handler_args, directory=directory, **kwargs
    )
    ThreadingHTTPServer((args.bind, args.port), handler).serve_forever()


if __name__ == "__main__":
    main()
