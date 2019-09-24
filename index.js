import CodeMirror from 'codemirror';
import 'codemirror/mode/groovy/groovy';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/properties/properties';
import 'codemirror/mode/yaml/yaml';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/idea.css';
// This addon is required to be installed by the caller
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/hint/show-hint';

import 'lsp-editor-adapter/lib/codemirror-lsp.css';
import { LspWsConnection, CodeMirrorAdapter } from 'lsp-editor-adapter';

let sampleXml = 
`<camelContext id="example-context" xmlns="http://camel.apache.org/schema/blueprint">
        <route id="direct-input">
            <from id="_from1" uri="file:work/input"/>
            <to id="_processing" uri="direct:processing"/>
        </route>
    </camelContext>
`;

let sampleJava = 
`import org.apache.camel.builder.RouteBuilder;

/**
 * A Camel Java DSL Router
 */
public class MyRouteBuilder extends RouteBuilder {

    /**
     * Let's configure the Camel routing rules using Java code...
     */
    public void configure() {

        // here is a sample which processes the input files
        // (leaving them in place - see the 'noop' flag)
        // then performs content based routing on the message using XPath
        from("file:src/data?noop=true&antExclude=aa&antFilterCaseSensitive=true&runLoggingLevel=OFF")
            .choice()
                .when(xpath("/person/city = 'London'"))
                    .to("file:target/messages/uk")
                .otherwise()
                    .to("file:target/messages/others");
    }

}
`;

let sampleKotlin = 
`from("timer:kotlin?period=1s")
  .routeId("kotlin")
  .setBody()
    .constant("Hello Camel K!")
  .process().message {
    it.headers["RandomValue"] = rnd.nextInt()
    }
  .to("log:info?showAll=true&multiline=true")
`;

let sampleJavascript = 
`from('timer:js?period=1s')
  .routeId('js')
  .setBody()
    .simple('Hello Camel K from CodeMirror')
  .to('log:info?multiline=true')`;
let sampleGroovy = 
`from('direct:greeting-api')
  .to('log:api?showAll=true&multiline=true') 
  .setBody()
    .simple('Hello from CodeMirror')`;
let sampleYaml = 
`- id: "rest"
  group: "routes"
  rest:
    verb: "post"
    uri: "/api/route"
    accepts: "text/plain"
    binding-mode: "off"
    steps:
      - convert-body:
          type: "java.lang.String"
      - to:
          uri: "log:in"`;
let sampleKafkaConnectProperties = 
`name=CamelAWSS3SourceConnector
connector.class=org.apache.camel.kafkaconnector.CamelSourceConnector
key.converter=org.apache.kafka.connect.storage.StringConverter
value.converter=org.apache.camel.kafkaconnector.converters.S3ObjectConverter
camel.source.maxPollDuration=10000

camel.source.kafka.topic=mytopic1

camel.source.url=aws-s3://bucket?autocloseBody=false

camel.component.aws-s3.configuration.access-key=<youraccesskey>
camel.component.aws-s3.configuration.secret-key=<yoursecretkey>
camel.component.aws-s3.configuration.region=<yourregion>`;

let modes = {
  xml: 'xml',
  java: 'java',
  yaml: 'yaml',
  kotlin: 'kotlin',
  javascript: 'javascript',
  properties: 'properties',
  groovy: 'groovy'
};

let documents = {
  xml: 'camel.xml',
  java: 'CamelRoute.java',
  yaml: 'file.camelk.yaml',
  kotlin: 'file.camelk.kts',
  javascript: 'file.camelk.js',
  properties: 'camelKafkaConnect.properties',
  groovy: 'file.camelk.groovy'
};

let editor = CodeMirror(document.querySelector('.editor'), {
  theme: 'idea',
  lineNumbers: true,
  value: sampleXml,
  gutters: ['CodeMirror-lsp'],
});

document.querySelector('select').addEventListener('change', () => {
  switchSources();
});

let connection;
let adapter;

function switchSources() {
  if (connection) {
    connection.close();
  }
  if (adapter) {
    adapter.remove();
  }

  let value = document.querySelector('select').value.toLowerCase();

  editor.setOption('mode', modes[value]);
  if(value === "xml") {
    editor.setValue(sampleXml);
  } else if(value === "java") {
    editor.setValue(sampleJava);
  } else if(value === "groovy") {
    editor.setValue(sampleGroovy);
  } else if(value === "javascript") {
    editor.setValue(sampleJavascript);
  } else if(value === "properties") {
    editor.setValue(sampleKafkaConnectProperties);
  } else if(value === "kotlin") {
    editor.setValue(sampleKotlin);
  } else if(value === "yaml") {
    editor.setValue(sampleYaml);
  }

  connection = new LspWsConnection({
    serverUri: 'ws://localhost:8025/camel-language-server',
    languageId: "Apache Camel",
    rootUri: 'file:///usr/src/app/sources',
    documentUri: 'file:///usr/src/app/sources/' + documents[value],
    documentText: () => editor.getValue(),
  }).connect(new WebSocket('ws://localhost:8025/camel-language-server'));

  adapter = new CodeMirrorAdapter(connection, {
    quickSuggestionsDelay: 10,
  }, editor);
}

switchSources();
