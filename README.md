# Example of CodeMirror integration with an Apache Camel Language Server

This is an example of integrating CodeMirror in the browser with an Apache Camel language server, which is connected over web socket.

# How to test

- Download Camel Language Server with a version higher or equal to 1.1.0-20190925.064446-129 from [Maven repository](https://oss.sonatype.org/content/repositories/snapshots/com/github/camel-tooling/camel-lsp-server/1.1.0-SNAPSHOT/)
- Launch Camel Language server with `--websocket` parameter locally
- Launch `npm install`
- Open `index.html` in a browser
- Enjoy!
